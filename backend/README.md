# Bank App API

A Deno.js banking API designed to serve as the backend for a React Native mobile banking application. This API provides secure banking functionalities including user authentication, account management, money transfers, transaction history, and contact management.

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Development Setup

1. **Clone and setup environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update .env with your configuration
   # Edit DATABASE_URL, JWT_SECRET, etc.
   ```

2. **Start the development environment**
   ```bash
   docker-compose up --build
   ```

3. **Access the API**
   - API: http://localhost:8000
   - PostgreSQL: localhost:5432

4. **Add more transaction history dummy data**(optional)
   run the file on /docker/dummy-data.sql on postgreql
   ```bash
      docker exec -it bank-app-api-db-1 psql -U user -d bank_app -f /dummy-data.sql
   ```
### Development Commands

```bash
# Start development environment
docker-compose up --build

# Run tests
docker-compose exec api deno test --allow-net --allow-read --allow-write --allow-env

# View logs
docker-compose logs -f api

# Stop environment
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Accounts
- `GET /api/accounts` - Get user accounts
- `GET /api/accounts/:id/balance` - Get account balance

### Transactions
- `POST /api/transactions/transfer` - Transfer money
- `GET /api/transactions/history` - Get transaction history


## Sample Data

The database comes pre-loaded with sample data for testing:

**Demo User:**
- Email: `demo@bankapp.com`
- Password: `SecurePassword123!`

**Sample Accounts:**
- Main Checking: $12,500.75
- Emergency Fund: $8,500.25  
- Credit Card: -$1,250.50

## Project Structure

```
backend/
├── src/                    # Source code
├── docker/                 # Docker configuration
├── database/              # Database migrations
├── tests/                 # Test files
├── docker-compose.yml     # Multi-container setup
├── deno.json             # Deno configuration
└── README.md             # This file
```

## Documentation

For detailed documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) which includes:
- Complete API specifications
- Database schema
- Security considerations
- Deployment guide
- Testing strategy

## Technology Stack

- **Runtime**: Deno.js
- **Framework**: Oak
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT tokens
- **Validation**: Zod schemas

## Development

### Local Development (without Docker)
```bash
# Install Deno (if not using Docker)
# See: https://deno.land/

# Run locally
deno task dev
```

### Environment Variables
See [.env.example](./.env.example) for all available environment variables.

## Contributing

1. Follow the project structure and coding standards
2. Write tests for new features
3. Update documentation accordingly
4. Ensure all tests pass before submitting

## License

This project is for educational/demonstration purposes.
