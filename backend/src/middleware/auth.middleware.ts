import { Context } from "oak";
import { verifyJWT } from "../utils/jwt.ts";
import { Errors } from "./error.middleware.ts";

export interface AuthenticatedContext extends Context {
  state: {
    user: {
      userId: string;
      email: string;
    };
  };
}

export async function authMiddleware(ctx: AuthenticatedContext, next: () => Promise<unknown>) {
  const authHeader = ctx.request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Errors.UNAUTHORIZED;
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyJWT(token);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    throw Errors.UNAUTHORIZED;
  }
}

export function requireAuth(handler: (ctx: AuthenticatedContext) => Promise<void>) {
  return async (ctx: AuthenticatedContext) => {
    await authMiddleware(ctx, async () => {
      await handler(ctx);
    });
  };
}
