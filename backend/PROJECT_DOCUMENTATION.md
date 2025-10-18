# Bank App API - Project Documentation

## Project Overview

This is a Deno.js banking API designed to serve as the backend for a React Native mobile banking application. The API provides secure banking functionalities including user authentication, account management, money transfers, transaction history, and contact management.

### Key Features
- **User Authentication**: Secure registration, login, and JWT-based session management
- **Account Management**: Multiple account types (checking, savings, credit) with balance tracking
- **Transaction Processing**: Secure money transfers with validation and history
- **Contact Management**: Contact-based transfers and recipient management
- **Security**: Biometric authentication support, password hashing, and secure API communication

## Technology Stack

### Core Technologies
- **Runtime**: Deno.js (latest stable version)
- **Framework**: Oak (Deno web framework)
- **Database**: PostgreSQL (containerized)
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT tokens with refresh support
- **Validation**: Zod schema validation
- **Security**: bcrypt password hashing, CORS configuration

### Dependencies
```json
{
  "oak": "Web framework for Deno",
  "postgres": "PostgreSQL driver for Deno",
  "bcrypt": "Password hashing",
  "djwt": "JWT token management",
  "zod": "Schema validation",
  "cors": "CORS middleware"
}
```

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │◄──►│   Deno.js API   │◄──►│  PostgreSQL DB  │
│  (React Native) │    │   (Container)   │    │   (Container)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
backend/
├── docker/
│   ├── Dockerfile              # Deno application container
│   └── init-db.sql            # Database initialization
├── src/
│   ├── main.ts                # Application entry point
│   ├── config/
│   │   ├── database.ts        # Database configuration
│   │   ├── environment.ts     # Environment variables
│   │   └── constants.ts       # Application constants
│   ├── controllers/           # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── accounts.controller.ts
│   │   ├── transactions.controller.ts
│   │   └── contacts.controller.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/                # Database models
│   │   ├── user.model.ts
│   │   ├── account.model.ts
│   │   ├── transaction.model.ts
│   │   └── contact.model.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   └── contact.service.ts
│   ├── utils/                 # Utilities
│   │   ├── password.ts
│   │   ├── jwt.ts
│   │   └── validation.ts
│   └── types/                 # TypeScript types
│       ├── user.types.ts
│       ├── account.types.ts
│       ├── transaction.types.ts
│       └── contact.types.ts
├── database/
│   └── migrations/            # Database migrations
├── tests/                     # Test files
├── docker-compose.yml         # Multi-container orchestration
├── deno.json                  # Deno configuration
├── .env.example               # Environment template
└── README.md                  # Quick start guide
```

## API Specifications

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /api/auth/login
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register endpoint.

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Account Endpoints

#### GET /api/accounts
Get all accounts for authenticated user.

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "type": "checking",
      "name": "Main Checking",
      "number": "****1234",
      "balance": 12500.75,
      "currency": "USD"
    }
  ]
}
```

#### GET /api/accounts/:id/balance
Get specific account balance.

**Response:**
```json
{
  "balance": 12500.75,
  "currency": "USD"
}
```

### Transaction Endpoints

#### POST /api/transactions/transfer
Initiate a money transfer.

**Request Body:**
```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 250.00,
  "description": "Transfer to John Doe",
  "recipientName": "John Doe"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "transfer",
    "amount": -250.00,
    "description": "Transfer to John Doe",
    "date": "2025-10-17T14:30:00Z",
    "status": "completed",
    "fromAccount": "uuid",
    "toAccount": "uuid",
    "recipientName": "John Doe"
  }
}
```

#### GET /api/transactions/history
Get transaction history with filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by transaction type
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

### Contact Endpoints

#### GET /api/contacts
Get all contacts for authenticated user.

#### POST /api/contacts
Add a new contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phoneNumber": "+0987654321",
  "email": "jane.smith@email.com"
}
```

## Database Schema

### PostgreSQL Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Accounts Table
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('checking', 'savings', 'credit')) NOT NULL,
  name VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) CHECK (type IN ('transfer', 'payment', 'deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('completed', 'pending', 'failed')) NOT NULL,
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  recipient_name VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
```

## Docker Configuration

### Docker Compose Setup

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/bank_app
      - JWT_SECRET=your_jwt_secret_here
      - NODE_ENV=development
    depends_on:
      - db
    volumes:
      - ./src:/app/src
      - ./deno.json:/app/deno.json
    command: deno run --allow-net --allow-read --allow-write --allow-env --watch src/main.ts

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=bank_app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql

volumes:
  postgres_data:
```

### Dockerfile
```dockerfile
FROM denoland/deno:latest

WORKDIR /app

# Copy dependency files
COPY deno.json deno.lock ./

# Cache dependencies
RUN deno cache deno.json

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 8000

# Start application
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "src/main.ts"]
```

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Deno (for local development without Docker)

### Quick Start
1. Clone the repository
2. Copy `.env.example` to `.env` and configure variables
3. Run `docker-compose up --build`
4. API will be available at `http://localhost:8000`

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@db:5432/bank_app

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret

# Application
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Development Commands
```bash
# Start development environment
docker-compose up --build

# Run tests
docker-compose exec api deno test --allow-net --allow-read --allow-write --allow-env

# Run migrations
docker-compose exec api deno run --allow-net src/database/migrate.ts

# View logs
docker-compose logs -f api

# Stop environment
docker-compose down
```

## Testing Strategy

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user flow testing

### Test Structure
```
tests/
├── unit/
│   ├── auth.test.ts
│   ├── accounts.test.ts
│   └── transactions.test.ts
├── integration/
│   ├── auth.integration.test.ts
│   └── transactions.integration.test.ts
└── e2e/
    └── banking-flow.e2e.test.ts
```

### Running Tests
```bash
# Run all tests
deno test --allow-net --allow-read --allow-write --allow-env

# Run specific test type
deno test tests/unit/
deno test tests/integration/
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with short expiration
- Refresh token rotation
- Password hashing with bcrypt
- Biometric authentication support

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- CORS configuration for mobile app domains
- Environment variable protection

### Transaction Security
- Balance validation before transfers
- Transaction status tracking
- Audit logging for sensitive operations
- Rate limiting for transfer endpoints

## Deployment

### Production Deployment
1. Build production Docker images
2. Configure production environment variables
3. Set up PostgreSQL with proper backups
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

### Environment Configuration
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_password@prod-db:5432/bank_app_prod
JWT_SECRET=production_jwt_secret
```

## API Integration with Mobile App

### Integration Points
The mobile app (React Native) should integrate with these API endpoints:

1. **Authentication Flow**
   - Register → POST /api/auth/register
   - Login → POST /api/auth/login
   - Logout → POST /api/auth/logout
   - Token Refresh → POST /api/auth/refresh

2. **Account Management**
   - Get Accounts → GET /api/accounts
   - Get Account Balance → GET /api/accounts/:id/balance

3. **Transactions**
   - Transfer Money → POST /api/transactions/transfer
   - Get History → GET /api/transactions/history

4. **Contacts**
   - Get Contacts → GET /api/contacts
   - Add Contact → POST /api/contacts

### Error Handling
The API returns standardized error responses:
```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds for transfer",
    "details": {}
  }
}
```

## Maintenance & Monitoring

### Logging
- Request/response logging
- Error logging with stack traces
- Transaction audit logs
- Performance metrics

### Health Checks
- Database connectivity checks
- API endpoint health monitoring
- Memory and CPU usage monitoring

### Backup Strategy
- Automated database backups
- Transaction log archiving
- Environment configuration backups

---

**Last Updated**: October 17, 2025  
**Maintainer**: Development Team  
**Status**: Active Development
