import { Router } from "oak";
import { z } from "zod";
import { requireAuth, AuthenticatedContext } from "../middleware/auth.middleware.ts";
import { query } from "../config/database.ts";
import { Errors, AppError } from "../middleware/error.middleware.ts";
import { TransferRequest, TransactionHistoryRequest, TransactionHistoryResponse, TransactionResponse } from "../types/transaction.types.ts";

const transactionsRouter = new Router();

// Validation schemas
const transferSchema = z.object({
  fromAccountId: z.string().uuid("Invalid account ID"),
  toAccountId: z.string().uuid("Invalid account ID"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  recipientName: z.string().optional(),
});

const historySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.enum(['transfer', 'payment', 'deposit', 'withdrawal']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Transfer money between accounts
transactionsRouter.post("/api/transactions/transfer", requireAuth(async (ctx: AuthenticatedContext) => {
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

  const client = await query.pool.connect();
  
  try {
    await client.queryObject("BEGIN");

    // Verify from account belongs to user and has sufficient funds
    const fromAccountResult = await client.queryObject(
      `SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [body.fromAccountId, userId]
    );

    if (fromAccountResult.rows.length === 0) {
      throw Errors.ACCOUNT_NOT_FOUND;
    }

    const fromAccount = fromAccountResult.rows[0];
    if (parseFloat(fromAccount.balance) < body.amount) {
      throw Errors.INSUFFICIENT_FUNDS;
    }

    // Verify to account exists
    const toAccountResult = await client.queryObject(
      "SELECT id FROM accounts WHERE id = $1",
      [body.toAccountId]
    );

    if (toAccountResult.rows.length === 0) {
      throw new AppError("ACCOUNT_NOT_FOUND", "Recipient account not found", 404);
    }

    // Update account balances
    await client.queryObject(
      "UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2",
      [body.amount, body.fromAccountId]
    );

    await client.queryObject(
      "UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2",
      [body.amount, body.toAccountId]
    );

    // Create transaction record
    const transactionResult = await client.queryObject(
      `INSERT INTO transactions (type, amount, description, status, from_account_id, to_account_id, recipient_name, user_id)
       VALUES ('transfer', $1, $2, 'completed', $3, $4, $5, $6)
       RETURNING id, type, amount, description, date, status, from_account_id as "fromAccountId", to_account_id as "toAccountId", recipient_name as "recipientName"`,
      [
        -body.amount, // Negative amount for outgoing transfer
        body.description || `Transfer to ${body.recipientName || 'recipient'}`,
        body.fromAccountId,
        body.toAccountId,
        body.recipientName,
        userId
      ]
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
    await client.queryObject("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}));

// Get transaction history
transactionsRouter.get("/api/transactions/history", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  
  // Parse query parameters
  const queryParams: TransactionHistoryRequest = {
    page: parseInt(ctx.request.url.searchParams.get("page") || "1"),
    limit: parseInt(ctx.request.url.searchParams.get("limit") || "20"),
    type: ctx.request.url.searchParams.get("type") as any || undefined,
    startDate: ctx.request.url.searchParams.get("startDate") || undefined,
    endDate: ctx.request.url.searchParams.get("endDate") || undefined,
  };

  try {
    historySchema.parse(queryParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  const offset = (queryParams.page - 1) * queryParams.limit;

  // Build WHERE clause
  let whereClause = "WHERE user_id = $1";
  const params: any[] = [userId];
  let paramCount = 1;

  if (queryParams.type) {
    paramCount++;
    whereClause += ` AND type = $${paramCount}`;
    params.push(queryParams.type);
  }

  if (queryParams.startDate) {
    paramCount++;
    whereClause += ` AND date >= $${paramCount}`;
    params.push(queryParams.startDate);
  }

  if (queryParams.endDate) {
    paramCount++;
    whereClause += ` AND date <= $${paramCount}`;
    params.push(queryParams.endDate);
  }

  // Get transactions
  const transactionsResult = await query(
    `SELECT id, type, amount, description, date, status, from_account_id as "fromAccountId", to_account_id as "toAccountId", recipient_name as "recipientName"
     FROM transactions 
     ${whereClause}
     ORDER BY date DESC
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...params, queryParams.limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM transactions ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / queryParams.limit);

  const transactions: TransactionResponse[] = transactionsResult.rows.map(transaction => ({
    id: transaction.id,
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    description: transaction.description,
    date: transaction.date.toISOString(),
    status: transaction.status,
    fromAccount: transaction.fromAccountId,
    toAccount: transaction.toAccountId,
    recipientName: transaction.recipientName,
  }));

  const response: TransactionHistoryResponse = {
    transactions,
    pagination: {
      page: queryParams.page,
      limit: queryParams.limit,
      total,
      totalPages,
    },
  };

  ctx.response.body = response;
}));

export { transactionsRouter };
