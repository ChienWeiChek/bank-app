import { Context } from "oak";

export async function loggerMiddleware(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  const timestamp = new Date().toISOString();

  // Build full URL path with query string if any
  const { pathname, search } = ctx.request.url;
  const fullPath = search ? `${pathname}${search}` : pathname;

  const logMessage = `[${timestamp}] ${ctx.request.method} ${fullPath} - ${ctx.response.status} - ${ms}ms`;

  if (ctx.response.status >= 400) {
    console.warn(`⚠️  ${logMessage}`);
  } else {
    console.log(`✅ ${logMessage}`);
  }
}
