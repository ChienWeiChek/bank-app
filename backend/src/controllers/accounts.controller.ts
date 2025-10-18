import { Router } from "oak";
import { requireAuth, AuthenticatedContext } from "../middleware/auth.middleware.ts";
import { query } from "../config/database.ts";
import { Errors } from "../middleware/error.middleware.ts";
import { AccountResponse, BalanceResponse } from "../types/account.types.ts";

const accountsRouter = new Router();

// Get all accounts for authenticated user
accountsRouter.get("/api/accounts", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;

  const result = await query(
    `SELECT id, type, name, number, balance, currency, created_at as "createdAt"
     FROM accounts 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );

  const accounts: AccountResponse[] = result.rows.map(account => ({
    id: account.id,
    type: account.type,
    name: account.name,
    number: account.number,
    balance: parseFloat(account.balance),
    currency: account.currency,
  }));

  ctx.response.body = { accounts };
}));

// Get specific account balance
accountsRouter.get("/api/accounts/:id/balance", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  const accountId = ctx.params.id;

  // Verify account belongs to user
  const accountResult = await query(
    `SELECT id, balance, currency 
     FROM accounts 
     WHERE id = $1 AND user_id = $2`,
    [accountId, userId]
  );

  if (accountResult.rows.length === 0) {
    throw Errors.ACCOUNT_NOT_FOUND;
  }

  const account = accountResult.rows[0];
  
  const balanceResponse: BalanceResponse = {
    balance: parseFloat(account.balance),
    currency: account.currency,
  };

  ctx.response.body = balanceResponse;
}));

// Get account details
accountsRouter.get("/api/accounts/:id", requireAuth(async (ctx: AuthenticatedContext) => {
  const userId = ctx.state.user.userId;
  const accountId = ctx.params.id;

  const result = await query(
    `SELECT id, type, name, number, balance, currency, created_at as "createdAt"
     FROM accounts 
     WHERE id = $1 AND user_id = $2`,
    [accountId, userId]
  );

  if (result.rows.length === 0) {
    throw Errors.ACCOUNT_NOT_FOUND;
  }

  const account = result.rows[0];
  
  const accountResponse: AccountResponse = {
    id: account.id,
    type: account.type,
    name: account.name,
    number: account.number,
    balance: parseFloat(account.balance),
    currency: account.currency,
  };

  ctx.response.body = { account: accountResponse };
}));

export { accountsRouter };
