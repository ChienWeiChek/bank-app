import { Router } from "oak";
import { z } from "zod";
import { pool, query } from "../config/database.ts";
import {
  AuthenticatedContext,
  requireAuth,
} from "../middleware/auth.middleware.ts";
import { AppError, Errors } from "../middleware/error.middleware.ts";
import {
  TransactionHistoryResponse,
  TransactionResponse,
  TransferRequest,
} from "../types/transaction.types.ts";

const transactionsRouter = new Router();

// Validation schemas
const transferSchema = z.object({
  fromAccountId: z.string().uuid("Invalid from account ID"),
  toAccountId: z.string({ message: "Invalid to account ID" }),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  recipientName: z.string().optional(),
});

const historySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.enum(["transfer", "payment", "deposit", "withdrawal"]).optional(),
  status: z.enum(["completed", "pending", "failed"]).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Transfer money between accounts
transactionsRouter.post(
  "/api/transactions/transfer",
  requireAuth(async (ctx: AuthenticatedContext) => {
    const userId = ctx.state.user.userId;
    let body: TransferRequest;

    try {
      body = await ctx.request.body().value;

      transferSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError("VALIDATION_ERROR", error.errors[0].message);
      }
      throw Errors.VALIDATION_ERROR;
    }

    // Validate amount
    if (body.amount <= 0) {
      throw Errors.INVALID_AMOUNT;
    }

    const client = await pool.connect();
    console.log("🚀 ~ userId:", userId);

    let toAccountId = body.toAccountId;
    try {
      await client.queryObject("BEGIN");

      // Verify from account belongs to user and has sufficient funds
      const fromAccountResult = await client.queryObject(
        `SELECT id, balance FROM accounts WHERE id = '${body.fromAccountId}' AND user_id = '${userId}' FOR UPDATE`
      );

      if (fromAccountResult.rows.length === 0) {
        throw Errors.ACCOUNT_NOT_FOUND;
      }

      const fromAccount = fromAccountResult.rows[0];
      if (parseFloat(fromAccount.balance) < body.amount) {
        throw Errors.INSUFFICIENT_FUNDS;
      }

      // Verify to account exists
      // const toAccountResult = await client.queryObject(
      //   `SELECT id FROM accounts WHERE id = '${toAccountId}'`
      // );
      //skip verify account on db
      //should check form third party api
      // if (toAccountResult.rows.length === 0) {
      //   throw new AppError(
      //     "ACCOUNT_NOT_FOUND",
      //     "Recipient account not found",
      //     404
      //   );
      // }

      // Update account balances
      await client.queryObject(
        `UPDATE accounts SET balance = balance - '${body.amount}', updated_at = NOW() WHERE id = '${body.fromAccountId}'`
      );
      //if account found in db then update the account balance
      // if (toAccountResult.rows.length)
      //   await client.queryObject(
      //     `UPDATE accounts SET balance = balance + '${body.amount}', updated_at = NOW() WHERE id = '${toAccountId}'`
      //   );
      // else {
      //   //for demo number transfer
      //   toAccountId = "44444444-4444-4444-4444-444444444444";
      // }
      // Create transaction record
      const transactionResult = await client.queryObject(
        `INSERT INTO transactions (
        type, 
        amount, 
        description, 
        status, 
        from_account_id, 
        to_account_id, 
        recipient_name, 
        user_id)
        VALUES (
        'transfer', 
        '${-body.amount}', 
        '${body.description}', 
        'completed', 
        '${body.fromAccountId}', 
        '${toAccountId}', 
        '${body.recipientName}',
        '${userId}'
        )
       RETURNING id, type, amount, description, date, status, from_account_id as "fromAccountId", to_account_id as "toAccountId", recipient_name as "recipientName"`
      );

      await client.queryObject("COMMIT");

      const transaction = transactionResult.rows[0];

      const transactionResponse: TransactionResponse = {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        date: transaction.date.toISOString(),
        status: transaction.status,
        fromAccount: transaction.fromAccountId,
        toAccount: transaction.toAccountId,
        recipientName: transaction.recipientName,
      };

      ctx.response.body = { transaction: transactionResponse };
    } catch (error) {
      console.log("🚀 ~ error:", error);
      await client.queryObject("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

// Get transaction history
transactionsRouter.get(
  "/api/transactions/history",
  requireAuth(async (ctx: AuthenticatedContext) => {
    const userId = ctx.state.user.userId;

    // Parse query parameters
    const queryParams = {
      page: parseInt(ctx.request.url.searchParams.get("page") || "1"),
      limit: parseInt(ctx.request.url.searchParams.get("limit") || "20"),
      type: ctx.request.url.searchParams.get("type") || undefined,
      status: ctx.request.url.searchParams.get("status") || undefined,
      search: ctx.request.url.searchParams.get("search") || undefined,
      startDate: ctx.request.url.searchParams.get("startDate") || undefined,
      endDate: ctx.request.url.searchParams.get("endDate") || undefined,
    };

    try {
      const validatedParams = historySchema.parse(queryParams);

      const offset = (validatedParams.page - 1) * validatedParams.limit;

      // Build WHERE clause
      let whereClause = `WHERE user_id = '${userId}'`;
      const params: any[] = [];

      if (validatedParams.type) {
        whereClause += ` AND type = '${validatedParams.type}'`;
      }

      if (validatedParams.status) {
        whereClause += ` AND status = '${validatedParams.status}'`;
      }

      if (validatedParams.search) {
        whereClause += ` AND (description ILIKE '%${validatedParams.search}%' OR recipient_name ILIKE '%${validatedParams.search}%')`;
      }

      if (validatedParams.startDate) {
        whereClause += ` AND date >= '${validatedParams.startDate}'`;
      }

      if (validatedParams.endDate) {
        whereClause += ` AND date <= '${validatedParams.endDate}'`;
      }

      // Get transactions
      const transactionsResult = await query(
        `SELECT id, type, amount, description, date, status, from_account_id as "fromAccountId", to_account_id as "toAccountId", recipient_name as "recipientName"
       FROM transactions 
       ${whereClause}
       ORDER BY date DESC
       LIMIT ${validatedParams.limit} OFFSET ${offset}`
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM transactions ${whereClause}`
      );

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / validatedParams.limit);

      const transactions: TransactionResponse[] = transactionsResult.rows.map(
        (transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: parseFloat(transaction.amount),
          description: transaction.description,
          date: transaction.date.toISOString(),
          status: transaction.status,
          fromAccount: transaction.fromAccountId,
          toAccount: transaction.toAccountId,
          recipientName: transaction.recipientName,
        })
      );

      const response: TransactionHistoryResponse = {
        transactions,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
        },
      };

      ctx.response.body = response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError("VALIDATION_ERROR", error.errors[0].message);
      }
      throw Errors.VALIDATION_ERROR;
    }
  })
);

export { transactionsRouter };

