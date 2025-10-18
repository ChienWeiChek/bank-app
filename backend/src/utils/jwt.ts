import { config } from "../config/environment.ts";
import { TokenPayload } from "../types/user.types.ts";

// Create JWT token using Web Crypto API
export async function createJWT(payload: TokenPayload): Promise<string> {
  if (!config.jwtSecret) {
    throw new Error("JWT secret is not configured");
  }
  
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    exp: now + parseJWTExpiry(config.jwtExpiresIn),
    iat: now
  };
  
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadBase64 = btoa(JSON.stringify(claims)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const data = `${headerBase64}.${payloadBase64}`;
  const signature = await signData(data, config.jwtSecret);
  
  return `${data}.${signature}`;
}

// Create refresh token
export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  if (!config.jwtRefreshSecret) {
    throw new Error("JWT refresh secret is not configured");
  }
  
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    exp: now + parseJWTExpiry(config.jwtRefreshExpiresIn),
    iat: now
  };
  
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadBase64 = btoa(JSON.stringify(claims)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const data = `${headerBase64}.${payloadBase64}`;
  const signature = await signData(data, config.jwtRefreshSecret);
  
  return `${data}.${signature}`;
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<TokenPayload> {
  try {
    if (!config.jwtSecret) {
      throw new Error("JWT secret is not configured");
    }
    
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    const [headerBase64, payloadBase64, signature] = parts;
    const data = `${headerBase64}.${payloadBase64}`;
    
    // Verify signature
    const expectedSignature = await signData(data, config.jwtSecret);
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }
    
    // Parse payload
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }
    
    return payload as TokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    if (!config.jwtRefreshSecret) {
      throw new Error("JWT refresh secret is not configured");
    }
    
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    const [headerBase64, payloadBase64, signature] = parts;
    const data = `${headerBase64}.${payloadBase64}`;
    
    // Verify signature
    const expectedSignature = await signData(data, config.jwtRefreshSecret);
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }
    
    // Parse payload
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }
    
    return payload as TokenPayload;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}

// Sign data using HMAC-SHA256
async function signData(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  
  // Convert ArrayBuffer to base64url using proper base64 encoding
  const signatureBytes = new Uint8Array(signature);
  
  // Use btoa with proper base64 encoding
  let binary = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  
  const base64 = btoa(binary);
  
  // Convert to base64url
  return base64
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// Parse JWT expiry string (e.g., "15m", "7d")
function parseJWTExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1));

  switch (unit) {
    case 's': return value; // seconds
    case 'm': return value * 60; // minutes
    case 'h': return value * 60 * 60; // hours
    case 'd': return value * 24 * 60 * 60; // days
    default: return 15 * 60; // default 15 minutes
  }
}
