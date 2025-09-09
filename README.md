# FinTrack Backend API

A powerful, enterprise-level financial tracking backend built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Features

### Authentication & Security
- **User Registration** with email verification via OTP
- **Secure Login** with JWT tokens and refresh tokens
- **OTP Verification** with expiry and resend functionality
- **Password Security** with bcrypt hashing and strong validation
- **Rate Limiting** to prevent abuse
- **CORS Protection** and security headers

### Financial Management
- **Account Management** - Multiple bank accounts and credit cards
- **Transaction Tracking** - Income, expenses, and transfers
- **Dashboard Analytics** - Financial summaries and trends
- **Category Management** - Organized expense categorization
- **Balance Tracking** - Real-time account balances

### Project Management (Kanban)
- **Project Creation** with client management
- **Task Management** with priority and status tracking
- **Kanban Board** - Visual task organization
- **Progress Tracking** - Completion rates and time estimates
- **Team Assignment** - Task assignment to team members

### Email Services
- **OTP Verification** emails with beautiful templates
- **Welcome Emails** for new users
- **Password Reset** functionality
- **Email Confirmation** notifications

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Email**: Nodemailer with Handlebars templates
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator
- **Security**: Helmet, bcrypt, rate limiting

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinanceTrackBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=fintrack_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   JWT_REFRESH_EXPIRES_IN=30d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@fintrack.com

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # Application Configuration
   NODE_ENV=development
   PORT=3000
   API_PREFIX=api/v1

   # Rate Limiting
   THROTTLE_TTL=60
   THROTTLE_LIMIT=10

   # OTP Configuration
   OTP_EXPIRY_MINUTES=10
   OTP_LENGTH=6

   # Security
   BCRYPT_ROUNDS=12
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb fintrack_db

   # Run migrations (if any)
   npm run migration:run
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Start the application**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:3000/api/v1/docs`

## 🔐 Authentication Flow

### 1. User Registration
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "address": "123 Main St, New York, NY 10001",
  "state": "NY",
  "postalCode": "10001",
  "dateOfBirth": "1990-01-01",
  "ssn": "1234"
}
```

### 2. Verify OTP
```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### 3. Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify email OTP
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/change-password` - Change password
- `GET /users/stats` - Get user statistics
- `PUT /users/deactivate` - Deactivate account
- `DELETE /users/account` - Delete account

### Dashboard
- `GET /dashboard` - Get dashboard data
- `GET /dashboard/accounts` - Get account summary

### Projects
- `POST /projects` - Create project
- `GET /projects` - Get all projects
- `GET /projects/kanban` - Get Kanban board
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/stats` - Get project statistics

### Tasks
- `POST /projects/tasks` - Create task
- `GET /projects/tasks/:id` - Get task by ID
- `PUT /projects/tasks/:id` - Update task
- `PUT /projects/tasks/:id/move` - Move task status
- `DELETE /projects/tasks/:id` - Delete task

### Accounts
- `POST /accounts` - Create account
- `GET /accounts` - Get all accounts
- `GET /accounts/summary` - Get account summary
- `GET /accounts/:id` - Get account by ID
- `GET /accounts/:id/transactions` - Get account transactions
- `PUT /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Transactions
- `POST /transactions` - Create transaction
- `GET /transactions` - Get all transactions
- `GET /transactions/stats` - Get transaction statistics
- `GET /transactions/recent` - Get recent transactions
- `GET /transactions/:id` - Get transaction by ID
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

## 🏗️ Project Structure

```
src/
├── common/                 # Shared utilities and services
│   ├── services/          # Common services (Utils, Redis)
│   └── common.module.ts
├── database/              # Database configuration and entities
│   ├── entities/          # TypeORM entities
│   └── data-source.ts
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── user/             # User management module
│   ├── email/            # Email service module
│   ├── dashboard/        # Dashboard module
│   ├── project/          # Project management module
│   ├── account/          # Account management module
│   └── transaction/      # Transaction management module
├── app.module.ts         # Root module
└── main.ts              # Application entry point
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** using class-validator
- **SQL Injection Protection** via TypeORM
- **XSS Protection** with helmet
- **OTP Expiry** and attempt limiting

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t fintrack-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables for Production
Make sure to set these environment variables in production:
- Strong JWT secrets
- Secure database credentials
- Production email configuration
- Redis configuration
- CORS origins

## 📈 Performance Considerations

- **Database Indexing** on frequently queried fields
- **Redis Caching** for session management and rate limiting
- **Connection Pooling** for database connections
- **Pagination** for large data sets
- **Lazy Loading** for related entities

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@fintrack.com or create an issue in the repository.

---

**Built with ❤️ using NestJS and TypeScript**
