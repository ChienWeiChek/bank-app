import { Application } from "oak";
import { oakCors } from "cors";
import { config } from "./config/environment.ts";
import { errorMiddleware } from "./middleware/error.middleware.ts";
import { loggerMiddleware } from "./middleware/logger.middleware.ts";
import { authRouter } from "./controllers/auth.controller.ts";
import { accountsRouter } from "./controllers/accounts.controller.ts";
import { transactionsRouter } from "./controllers/transactions.controller.ts";
import { contactsRouter } from "./controllers/contacts.controller.ts";

// Create Oak application
const app = new Application();

// Global middleware
app.use(oakCors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(loggerMiddleware);
app.use(errorMiddleware);

// API routes
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(accountsRouter.routes());
app.use(accountsRouter.allowedMethods());
app.use(transactionsRouter.routes());
app.use(transactionsRouter.allowedMethods());
app.use(contactsRouter.routes());
app.use(contactsRouter.allowedMethods());

// Root endpoint
app.use((ctx: any) => {
  if (ctx.request.url.pathname === "/") {
    ctx.response.body = {
      message: "Bank App API",
      version: "1.0.0",
      documentation: "/api/docs",
      health: "/health"
    };
    return;
  }
});

// Health check endpoint
app.use((ctx: any) => {
  if (ctx.request.url.pathname === "/health") {
    ctx.response.body = { status: "ok", timestamp: new Date().toISOString() };
    return;
  }
  ctx.response.status = 404;
  ctx.response.body = { error: "Not Found" };
});

console.log(`🚀 Bank App API server running on port ${config.port}`);
console.log(`📚 Environment: ${config.nodeEnv}`);
console.log(`🌐 CORS Origin: ${config.corsOrigin}`);

await app.listen({ port: config.port });
