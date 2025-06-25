# 💰 BudgetWise - AI Powered Personal Finance Management System

<div align="center">

![BudgetWise Logo](https://img.shields.io/badge/BudgetWise-Personal%20Finance-green?style=for-the-badge&logo=money-bill&logoColor=white)

**A modern, full-stack personal finance management application built with SvelteKit, Node.js, PostgreSQL, and Firebase Authentication.**

[![Docker](https://img.shields.io/badge/Docker-Supported-blue?style=flat-square&logo=docker)](https://www.docker.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-Frontend-red?style=flat-square&logo=svelte)](https://kit.svelte.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat-square&logo=node.js)](https://nodejs.org/)

</div>

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Docker Setup](#docker-setup)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

BudgetWise is a comprehensive personal finance management system that helps users track their income, expenses, manage budgets, monitor debts, and achieve savings goals. Built with modern web technologies, it provides a seamless and secure experience for managing personal finances.

### 🎨 Live Demo
- **Production**: http://budgetwis.me
- **Frontend (Local)**: `http://localhost:3000`
- **Backend API (Local)**: `http://localhost:5000/api`
- **Admin Panel**: Available for admin users

## ✨ Features

### 💳 Transaction Management
- ✅ Add, edit, and delete income/expense transactions
- ✅ Categorize transactions with custom categories
- ✅ Real-time transaction tracking
- ✅ Transaction history with filtering

### 📊 Budget Planning
- ✅ Create and manage monthly/yearly budgets
- ✅ Budget vs actual spending analysis
- ✅ Budget alerts and notifications
- ✅ Category-wise budget allocation

### 🎯 Savings Goals
- ✅ Set and track savings goals
- ✅ Progress visualization
- ✅ Goal deadline management
- ✅ Achievement notifications

### 📈 Debt Management
- ✅ Track multiple debts
- ✅ Payment schedules
- ✅ Interest calculations
- ✅ Payoff strategies

### 📊 Analytics & Reports
- ✅ Interactive financial charts
- ✅ Spending patterns analysis
- ✅ Monthly/yearly reports
- ✅ Export capabilities

### 👤 User Management
- ✅ Firebase Authentication (Email/Google)
- ✅ User profiles and preferences
- ✅ Role-based access control
- ✅ Secure session management

### 🎨 Modern UI/UX
- ✅ Responsive design for all devices
- ✅ Dark/Light theme support
- ✅ Intuitive navigation
- ✅ Real-time updates

## 🛠 Tech Stack

### Frontend
- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Modern web framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [Bits UI](https://bits-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Charts**: Custom chart components
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime
- **Framework**: [Express.js](https://expressjs.com/) - Web framework
- **Database ORM**: [Sequelize](https://sequelize.org/) - SQL ORM
- **Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Database
- **Primary DB**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **Hosting**: Docker containerized

### Authentication & Security
- **Auth Provider**: [Firebase Authentication](https://firebase.google.com/products/auth)
- **Security**: JWT tokens, Firebase ID tokens
- **Password**: bcryptjs for hashing

### DevOps & Deployment
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
- **Web Server**: [Nginx](https://nginx.org/) - Reverse proxy
- **CI/CD**: GitHub Actions
- **Cloud**: Azure VM deployment

### Development Tools
- **Language**: JavaScript/TypeScript
- **Linting**: ESLint + Prettier
- **Testing**: Playwright (E2E)
- **Version Control**: Git + GitHub

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   SvelteKit     │◄──►│    Nginx        │◄──►│   Express.js    │
│   Frontend      │    │  Reverse Proxy  │    │    Backend      │
│   (Port 3000)   │    │   (Port 80)     │    │   (Port 5000)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│                 │                            │                 │
│ Firebase Auth   │                            │   PostgreSQL    │
│   (Google)      │                            │   Database      │
│                 │                            │   (Port 5432)   │
└─────────────────┘                            └─────────────────┘
```

### 🔄 Data Flow
1. **User Authentication**: Firebase handles auth, backend syncs user data
2. **API Requests**: Frontend communicates with backend via REST API
3. **Database Operations**: Backend interacts with PostgreSQL using Sequelize
4. **Real-time Updates**: State management ensures UI reactivity

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20 or higher)
- **Docker** & Docker Compose
- **Git**
- **Firebase Project** (for authentication)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BudgetWise.git
   cd BudgetWise
   ```

2. **Set up environment variables**
   
   **Backend (.env)**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env`:
   ```env
   # Database
   POSTGRES_DB=***
   POSTGRES_USER=***
   POSTGRES_PASSWORD=***
   POSTGRES_HOST=***
   
   # Firebase
   FIREBASE_SERVICE_ACCOUNT=***
   ADMIN_EMAIL=***
   
   # Server
   NODE_ENV=***
   PORT=***
   CORS_ORIGIN=***
   ```
   
   **Frontend (.env)**:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   
   Edit `frontend/.env`:
   ```env
   PUBLIC_FIREBASE_API_KEY=***
   PUBLIC_FIREBASE_AUTH_DOMAIN=***
   PUBLIC_FIREBASE_PROJECT_ID=***
   PUBLIC_FIREBASE_STORAGE_BUCKET=***
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
   PUBLIC_FIREBASE_APP_ID=***
   PUBLIC_BACKEND_API_URL=***
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker compose up --build
   ```

4. **Or run locally**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev
   
   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - **Production**: https://budgetwis.me
   - **Local Frontend**: http://localhost:3000
   - **Local Backend API**: http://localhost:5000/api

## 🔧 Development

### 📁 Project Structure

```
BudgetWise/
├── 📂 backend/                 # Node.js Express backend
│   ├── 📂 src/
│   │   ├── 📂 config/         # Database & Firebase config
│   │   ├── 📂 controllers/    # Route controllers
│   │   ├── 📂 middlewares/    # Auth & validation middleware
│   │   ├── 📂 models/         # Sequelize models
│   │   ├── 📂 routes/         # API routes
│   │   └── 📄 app.js          # Express app entry
│   ├── 📄 package.json
│   └── 📄 Dockerfile
│
├── 📂 frontend/               # SvelteKit frontend
│   ├── 📂 src/
│   │   ├── 📂 lib/           # Reusable components & utilities
│   │   │   ├── 📂 components/ # UI components
│   │   │   ├── 📂 services/   # API services
│   │   │   ├── 📂 stores/     # Svelte stores
│   │   │   └── 📂 utils/      # Helper functions
│   │   ├── 📂 routes/        # SvelteKit routes
│   │   └── 📄 app.html       # App template
│   ├── 📄 package.json
│   └── 📄 Dockerfile
│
├── 📂 nginx/                 # Nginx configuration
├── 📂 e2e/                   # End-to-end tests
├── 📂 .github/workflows/     # CI/CD pipelines
├── 📄 docker-compose.yml     # Development setup
├── 📄 docker-compose.deploy.yml # Production setup
└── 📄 README.md
```

### 🎯 Development Commands

**Backend**:
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

**Frontend**:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run check    # Type checking
npm run lint     # Lint code
```

**Docker**:
```bash
docker compose up              # Start all services
docker compose up --build     # Rebuild and start
docker compose down           # Stop all services
docker compose logs frontend  # View frontend logs
```

### 🧪 Testing

**E2E Tests**:
```bash
cd e2e
npm install
npm test
```

**Manual Testing**:
- Use the provided test user accounts
- Test all CRUD operations
- Verify authentication flows
- Check responsive design

## 🚀 Deployment

### 🐳 Docker Deployment

**Production with Docker Compose**:
```bash
docker compose -f docker-compose.deploy.yml up --build
```

### ☁️ Cloud Deployment (Azure VM)

The project includes GitHub Actions for automated deployment to Azure VM:

1. **Set up GitHub Secrets**:
   ```
   AZURE_VM_HOST=***
   AZURE_VM_USER=***
   AZURE_VM_SSH_PRIVATE_KEY=***
   # All environment variables for backend/frontend
   ```

2. **Deploy**:
   ```bash
   git push origin deployment  # Triggers GitHub Actions
   ```

3. **Manual deployment**:
   ```bash
   # On your Azure VM
   git clone https://github.com/yourusername/BudgetWise.git
   cd BudgetWise
   docker compose -f docker-compose.deploy.yml up -d
   ```

### 🌐 Environment Setup

**Development**: `docker-compose.yml`
**Production**: `docker-compose.deploy.yml`

Key differences:
- Production uses built images
- Environment-specific configurations
- Production includes Nginx reverse proxy
- Health checks and restart policies

## 📡 API Documentation

### 🔑 Authentication Endpoints

```http
POST /api/auth/firebase    # Sync Firebase user with backend
GET  /api/auth/me          # Get current user profile
```

### 💳 Transaction Endpoints

```http
GET    /api/transactions                    # Get user transactions
POST   /api/transactions                    # Create transaction
PUT    /api/transactions/:id               # Update transaction
DELETE /api/transactions/:id               # Delete transaction
```

### 📝 Category Endpoints

```http
GET    /api/categories                      # Get all categories
POST   /api/categories                      # Create category
PUT    /api/categories/:id                 # Update category
DELETE /api/categories/:id                 # Delete category
```

### 👤 User Endpoints

```http
GET    /api/users/profile                   # Get user profile
PUT    /api/users/profile                   # Update user profile
GET    /api/users                          # Get all users (admin)
```

### 📊 Analytics Endpoints

```http
GET    /api/analytics/spending-by-category  # Category spending analysis
GET    /api/analytics/monthly-summary       # Monthly financial summary
GET    /api/analytics/budget-vs-actual      # Budget comparison
```

### 🔍 Request/Response Examples

**Create Transaction**:
```http
POST /api/transactions
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "user_id": "***",
  "amount": 50.00,
  "description": "Grocery shopping",
  "type": "expense",
  "category_id": "***",
  "date": "2025-01-15"
}
```

**Response**:
```json
{
  "message": "Transaction created successfully",
  "data": {
    "id": "***",
    "user_id": "***",
    "amount": 50.00,
    "description": "Grocery shopping",
    "type": "expense",
    "category_id": "***",
    "date": "2025-01-15",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

## 🗄 Database Schema

### 👤 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 💳 Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  category_id UUID REFERENCES categories(id),
  date DATE DEFAULT CURRENT_DATE,
  event_id UUID REFERENCES events(id),
  recurrence BOOLEAN DEFAULT false,
  confirmed BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 📂 Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 📊 Full Schema
For complete database schema, see: [`backend/src/config/schema.sql`](backend/src/config/schema.sql)

## 🔐 Authentication

### 🔥 Firebase Authentication

BudgetWise uses Firebase Authentication for secure user management:

**Supported Methods**:
- ✅ Email/Password
- ✅ Google OAuth
- ✅ Custom tokens

**Authentication Flow**:
1. User signs in via Firebase
2. Frontend receives Firebase ID token
3. Backend verifies token with Firebase Admin SDK
4. Backend creates/syncs user in PostgreSQL
5. Subsequent requests include Firebase token in headers

**Security Features**:
- JWT token validation
- Role-based access control
- Protected routes
- Session management
- Automatic token refresh

### 🛡 Backend Security

```javascript
// Middleware example
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 🔒 Frontend Protection

```javascript
// Route protection
$: if (!$loading && isProtectedRoute && !$firebaseUser) {
  alert("You must log in first to access this page");
  goto('/signin');
}
```

## 🐳 Docker Setup

### 📋 Services

**Development** (`docker-compose.yml`):
- `frontend`: SvelteKit dev server (port 3000)
- `backend`: Express.js with nodemon (port 5000)
- `postgres`: PostgreSQL database (port 5432)

**Production** (`docker-compose.deploy.yml`):
- `frontend`: Built SvelteKit app
- `backend`: Production Express.js server
- `nginx`: Reverse proxy (port 80)
- `postgres`: PostgreSQL database

### 🔧 Container Configuration

**Frontend Dockerfile**:
- Multi-stage build (development, build, production)
- SvelteKit optimized build
- Node.js runtime

**Backend Dockerfile**:
- Development with nodemon
- Production with optimized dependencies
- Health checks included

**Nginx Configuration**:
- Reverse proxy setup
- Static file serving
- Load balancing ready

### 🚀 Quick Start Commands

```bash
# Development
docker compose up --build

# Production
docker compose -f docker-compose.deploy.yml up --build

# View logs
docker compose logs -f frontend
docker compose logs -f backend

# Shell access
docker compose exec frontend sh
docker compose exec backend sh

# Database access
docker compose exec postgres psql -U postgres -d budgetwise
```

## 🤝 Contributing

### 🎯 How to Contribute

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### 📋 Development Guidelines

- Follow existing code style (ESLint + Prettier)
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds work

### 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

### 💡 Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Describe the problem you're solving
- Explain your proposed solution
- Consider implementation complexity

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Amazing web framework
- [Firebase](https://firebase.google.com/) - Authentication & hosting
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Docker](https://www.docker.com/) - Containerization
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

## 🆘 Support

- 🌐 **Live App**: [https://budgetwis.me](https://budgetwis.me)
- 📧 **Email**: support@budgetwise.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/BudgetWise/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/BudgetWise/discussions)
- 📖 **Wiki**: [Project Wiki](https://github.com/yourusername/BudgetWise/wiki)

---

<div align="center">

**Built with ❤️ by the BudgetWise Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/BudgetWise?style=social)](https://github.com/yourusername/BudgetWise)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/BudgetWise?style=social)](https://github.com/yourusername/BudgetWise)

</div>