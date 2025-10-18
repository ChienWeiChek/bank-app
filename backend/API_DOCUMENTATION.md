# Bank App API Documentation

## Overview

This is a comprehensive Deno.js banking API that provides secure backend services for a React Native mobile banking application. The API handles user authentication, account management, money transfers, transaction history, and contact management.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints except `/api/auth/*` require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123!"
}
```
- **Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "biometricEnabled": false,
    "createdAt": "2025-10-17T14:30:00Z",
    "updatedAt": "2025-10-17T14:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and return tokens
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Response**: Same as register response

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Description**: Refresh access token using refresh token
- **Request Body**:
```json
{
  "refreshToken": "refresh_token"
}
```
- **Response**:
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

### Accounts

#### Get User Accounts
- **GET** `/api/accounts`
- **Description**: Get all accounts for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
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

#### Get Account Balance
- **GET** `/api/accounts/:id/balance`
- **Description**: Get specific account balance
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "balance": 12500.75,
  "currency": "USD"
}
```

#### Get Account Details
- **GET** `/api/accounts/:id`
- **Description**: Get specific account details
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "account": {
    "id": "uuid",
    "type": "checking",
    "name": "Main Checking",
    "number": "****1234",
    "balance": 12500.75,
    "currency": "USD"
  }
}
```

### Transactions

#### Transfer Money
- **POST** `/api/transactions/transfer`
- **Description**: Transfer money between accounts
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 250.00,
  "description": "Transfer to John Doe",
  "recipientName": "John Doe"
}
```
- **Response**:
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

#### Get Transaction History
- **GET** `/api/transactions/history`
- **Description**: Get transaction history with filtering and pagination
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20, max: 100)
  - `type` (optional): Filter by transaction type
  - `startDate` (optional): Filter by start date (ISO format)
  - `endDate` (optional): Filter by end date (ISO format)
- **Response**:
```json
{
  "transactions": [
    {
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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Contacts

#### Get Contacts
- **GET** `/api/contacts`
- **Description**: Get all contacts for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "email": "john.doe@email.com"
    }
  ]
}
```

#### Get Contact
- **GET** `/api/contacts/:id`
- **Description**: Get specific contact details
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "contact": {
    "id": "uuid",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john.doe@email.com"
  }
}
```

#### Create Contact
- **POST** `/api/contacts`
- **Description**: Create a new contact
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "phoneNumber": "+0987654321",
  "email": "jane.smith@email.com"
}
```
- **Response**:
```json
{
  "contact": {
    "id": "uuid",
    "name": "Jane Smith",
    "phoneNumber": "+0987654321",
    "email": "jane.smith@email.com"
  }
}
```

#### Update Contact
- **PUT** `/api/contacts/:id`
- **Description**: Update existing contact
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Jane Smith Updated",
  "phoneNumber": "+0987654321",
  "email": "jane.updated@email.com"
}
```
- **Response**:
```json
{
  "contact": {
    "id": "uuid",
    "name": "Jane Smith Updated",
    "phoneNumber": "+0987654321",
    "email": "jane.updated@email.com"
  }
}
```

#### Delete Contact
- **DELETE** `/api/contacts/:id`
- **Description**: Delete a contact
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Contact deleted successfully"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `INVALID_CREDENTIALS` - Invalid email or password
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `ACCOUNT_NOT_FOUND` - Account not found
- `INSUFFICIENT_FUNDS` - Insufficient funds for transfer
- `CONTACT_NOT_FOUND` - Contact not found
- `DUPLICATE_CONTACT` - Contact already exists
- `INTERNAL_ERROR` - Internal server error

## Sample Data

The development environment includes sample data:

**Demo User:**
- Email: `demo@bankapp.com`
- Password: `password123`

**Sample Accounts:**
- Main Checking: $12,500.75
- Emergency Fund: $8,500.25
- Credit Card: -$1,250.50

**Sample Contacts:**
- John Doe (+1234567890)
- Jane Smith (+0987654321)
- Bob Johnson (+1122334455)

## Development

### Quick Start

1. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start services**
   ```bash
   docker-compose up --build
   ```

3. **Test API**
   ```bash
   # Health check
   curl http://localhost:8000/health

   # Register user
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","phoneNumber":"+1234567890","password":"Test123!"}'
   ```

### Testing

Run tests with:
```bash
docker-compose exec api deno test --allow-net --allow-read --allow-write --allow-env
```

## Security

- JWT tokens with 15-minute expiration
- Refresh tokens with 7-day expiration
- Password hashing with bcrypt
- Input validation with Zod schemas
- SQL injection prevention
- CORS configuration for mobile app

## Database Schema

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for complete database schema details.

---

**Last Updated**: October 17, 2025  
**API Version**: 1.0.0
