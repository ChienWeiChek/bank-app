import { Context } from "oak";

export async function errorMiddleware(ctx: Context, next: () => Promise<unknown>) {
  try {
    await next();
  } catch (err) {
    console.error("Error caught by middleware:", err);

    // Default error response
    let status = 500;
    let message = "Internal Server Error";
    let code = "INTERNAL_ERROR";

    // Handle different error types
    if (err instanceof Error) {
      message = err.message;

      // Database errors
      if (err.message.includes("duplicate key")) {
        status = 409;
        code = "DUPLICATE_ENTRY";
        message = "Resource already exists";
      } else if (err.message.includes("violates foreign key")) {
        status = 400;
        code = "INVALID_REFERENCE";
        message = "Invalid reference to another resource";
      } else if (err.message.includes("invalid input")) {
        status = 400;
        code = "INVALID_INPUT";
        message = "Invalid input data";
      }
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      status = 401;
      code = "INVALID_TOKEN";
      message = "Invalid authentication token";
    } else if (err.name === "TokenExpiredError") {
      status = 401;
      code = "TOKEN_EXPIRED";
      message = "Authentication token expired";
    }

    ctx.response.status = status;
    ctx.response.body = {
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    };
  }
}

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Common error types
export const Errors = {
  // Authentication errors
  INVALID_CREDENTIALS: new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401),
  UNAUTHORIZED: new AppError("UNAUTHORIZED", "Authentication required", 401),
  FORBIDDEN: new AppError("FORBIDDEN", "Access denied", 403),

  // Account errors
  ACCOUNT_NOT_FOUND: new AppError("ACCOUNT_NOT_FOUND", "Account not found", 404),
  INSUFFICIENT_FUNDS: new AppError("INSUFFICIENT_FUNDS", "Insufficient funds", 400),
  INVALID_ACCOUNT_TYPE: new AppError("INVALID_ACCOUNT_TYPE", "Invalid account type", 400),

  // Transaction errors
  TRANSACTION_FAILED: new AppError("TRANSACTION_FAILED", "Transaction failed", 400),
  INVALID_AMOUNT: new AppError("INVALID_AMOUNT", "Invalid transaction amount", 400),

  // Contact errors
  CONTACT_NOT_FOUND: new AppError("CONTACT_NOT_FOUND", "Contact not found", 404),
  DUPLICATE_CONTACT: new AppError("DUPLICATE_CONTACT", "Contact already exists", 409),

  // Validation errors
  VALIDATION_ERROR: new AppError("VALIDATION_ERROR", "Validation failed", 400),
};
