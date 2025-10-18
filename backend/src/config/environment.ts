// Environment configuration - Deno automatically loads .env file

export const config = {
  // Database
  databaseUrl: Deno.env.get("DATABASE_URL") || "postgresql://user:password@localhost:5432/bank_app",
  
  // JWT
  jwtSecret: Deno.env.get("JWT_SECRET") || "fallback_jwt_secret",
  jwtRefreshSecret: Deno.env.get("JWT_REFRESH_SECRET") || "fallback_refresh_secret",
  jwtExpiresIn: Deno.env.get("JWT_EXPIRES_IN") || "15m",
  jwtRefreshExpiresIn: Deno.env.get("JWT_REFRESH_EXPIRES_IN") || "7d",
  
  // Application
  port: parseInt(Deno.env.get("PORT") || "8000"),
  nodeEnv: Deno.env.get("NODE_ENV") || "development",
  corsOrigin: Deno.env.get("CORS_ORIGIN") || "http://localhost:3000",
  
  // Security
  bcryptRounds: parseInt(Deno.env.get("BCRYPT_ROUNDS") || "12"),
  
  // Logging
  logLevel: Deno.env.get("LOG_LEVEL") || "info",
};

// Validate required environment variables
if (!config.jwtSecret || config.jwtSecret.includes("change_in_production")) {
  console.warn("⚠️  WARNING: Using default JWT secret. Change JWT_SECRET in production!");
}

if (!config.jwtRefreshSecret || config.jwtRefreshSecret.includes("change_in_production")) {
  console.warn("⚠️  WARNING: Using default JWT refresh secret. Change JWT_REFRESH_SECRET in production!");
}
