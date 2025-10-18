import { Context } from "oak";

export async function loggerMiddleware(ctx: Context, next: () => Promise<unknown>) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  const logMessage = `${ctx.request.method} ${ctx.request.url.pathname} - ${ctx.response.status} - ${ms}ms`;
  
  if (ctx.response.status >= 400) {
    console.warn(`⚠️  ${logMessage}`);
  } else {
    console.log(`✅ ${logMessage}`);
  }
}
