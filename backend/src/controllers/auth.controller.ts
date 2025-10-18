import { Router } from "oak";
import { z } from "zod";
import { query } from "../config/database.ts";
import {
  AuthenticatedContext,
  requireAuth,
} from "../middleware/auth.middleware.ts";
import { AppError, Errors } from "../middleware/error.middleware.ts";
import {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
  RefreshTokenRequest,
} from "../types/user.types.ts";
import {
  createJWT,
  createRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.ts";
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from "../utils/password.ts";

const authRouter = new Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Register endpoint
authRouter.post("/api/auth/register", async (ctx) => {
  let body: CreateUserRequest;

  try {
    body = await ctx.request.body().value;
    registerSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  // Validate password strength
  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.valid) {
    throw new AppError("VALIDATION_ERROR", passwordValidation.message!);
  }

  // Check if user already exists
  const existingUser = await query("SELECT id FROM users WHERE email = $1", [
    body.email,
  ]);

  if (existingUser.rows.length > 0) {
    throw new AppError(
      "DUPLICATE_ENTRY",
      "User with this email already exists",
      409
    );
  }

  // Hash password
  const passwordHash = await hashPassword(body.password);

  // Create user
  const result = await query(
    `INSERT INTO users (email, name, phone_number, password_hash) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, email, name, phone_number as "phoneNumber", biometric_enabled as "biometricEnabled", created_at as "createdAt", updated_at as "updatedAt"`,
    [body.email, body.name, body.phoneNumber, passwordHash]
  );

  const user = result.rows[0];

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = await createJWT(tokenPayload);
  const refreshToken = await createRefreshToken(tokenPayload);

  const response: AuthResponse = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      biometricEnabled: user.biometricEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };

  ctx.response.status = 201;
  ctx.response.body = response;
});

// Login endpoint
authRouter.post("/api/auth/login", async (ctx) => {
  let body: LoginRequest;

  try {
    body = await ctx.request.body().value;
    loginSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  // Find user
  const result = await query(
    `SELECT id, email, name, phone_number as "phoneNumber", password_hash as "passwordHash", 
            biometric_enabled as "biometricEnabled", created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE email = '${body.email}'`
  );

  if (result.rows.length === 0) {
    throw Errors.INVALID_CREDENTIALS;
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await verifyPassword(
    body.password,
    user.passwordHash
  );
  if (!isValidPassword) {
    throw Errors.INVALID_CREDENTIALS;
  }

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = await createJWT(tokenPayload);
  const refreshToken = await createRefreshToken(tokenPayload);

  const response: AuthResponse = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      biometricEnabled: user.biometricEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };

  ctx.response.body = response;
});

// Refresh token endpoint
authRouter.post("/api/auth/refresh", async (ctx) => {
  let body: RefreshTokenRequest;

  try {
    body = await ctx.request.body().value;

    refreshSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError("VALIDATION_ERROR", error.errors[0].message);
    }
    throw Errors.VALIDATION_ERROR;
  }

  try {
    // Verify refresh token
    const payload = await verifyRefreshToken(body.refreshToken);

    // Generate new tokens
    const accessToken = await createJWT(payload);
    const refreshToken = await createRefreshToken(payload);

    ctx.response.body = {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw Errors.UNAUTHORIZED;
  }
});

// Get current user endpoint
authRouter.get(
  "/api/auth/me",
  requireAuth(async (ctx: AuthenticatedContext) => {
    const userId = ctx.state.user.userId;
    try {
      // Get user from database
      const result = await query(
        `SELECT id, email, name, phone_number as "phoneNumber", 
              biometric_enabled as "biometricEnabled", 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE id = '${userId}'`
      );

      if (result.rows.length === 0) {
        throw Errors.UNAUTHORIZED;
      }

      const user = result.rows[0];

      ctx.response.body = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          biometricEnabled: user.biometricEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      throw Errors.UNAUTHORIZED;
    }
  })
);

// Update biometric enabled endpoint
authRouter.patch(
  "/api/auth/biometric",
  requireAuth(async (ctx: AuthenticatedContext) => {
    const userId = ctx.state.user.userId;

    let body: { biometricEnabled: boolean };

    try {
      body = await ctx.request.body().value;

      // Validate request body
      if (typeof body.biometricEnabled !== "boolean") {
        throw new AppError(
          "VALIDATION_ERROR",
          "biometricEnabled must be a boolean"
        );
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError("VALIDATION_ERROR", error.errors[0].message);
      }
      throw Errors.VALIDATION_ERROR;
    }

    try {
      // Update user biometric setting
      const result = await query(
        `UPDATE users 
       SET biometric_enabled = '${body.biometricEnabled}', updated_at = CURRENT_TIMESTAMP
       WHERE id = '${userId}'
       RETURNING id, email, name, phone_number as "phoneNumber", 
                 biometric_enabled as "biometricEnabled", 
                 created_at as "createdAt", updated_at as "updatedAt"`
      );

      if (result.rows.length === 0) {
        throw Errors.UNAUTHORIZED;
      }

      const user = result.rows[0];

      ctx.response.body = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          biometricEnabled: user.biometricEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      throw Errors.UNAUTHORIZED;
    }
  })
);

// Logout endpoint (client-side token invalidation)
authRouter.post("/api/auth/logout", async (ctx) => {
  ctx.response.body = { message: "Logged out successfully" };
});

export { authRouter };

