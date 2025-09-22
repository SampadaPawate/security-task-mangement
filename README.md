# Secure Task Management System

A production-ready, full-stack task management system with role-based access control (RBAC), built with NestJS and Angular.

## 🏗️ Architecture Overview

This system implements a secure, scalable task management solution with the following architecture:

```
simple-task-management/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication & RBAC
│   │   ├── tasks/          # Task management
│   │   ├── organizations/  # Organization management
│   │   ├── audit/          # Audit logging
│   │   └── entities/       # Database models
│   └── database.sqlite     # SQLite database
├── frontend/               # Angular SPA
│   ├── src/app/
│   │   ├── login/          # Authentication UI
│   │   ├── dashboard/      # Task management UI
│   │   └── services/       # API services
└── README.md
```

## 🔐 Security Features

### Role-Based Access Control (RBAC)
- **Owner**: Full system access, can manage all organizations and users
- **Admin**: Full access within their organization, can manage users and tasks
- **Viewer**: Read-only access to tasks within their organization

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Permission-based route guards
- Organization-level data isolation
- Audit logging for security events

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd simple-task-management/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd simple-task-management/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

## 📊 Data Model

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'viewer',
  organizationId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table (2-level hierarchy)
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  description TEXT,
  parentId INTEGER, -- NULL for root organizations
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'todo',
  priority INTEGER DEFAULT 1,
  dueDate DATETIME,
  assignedToId INTEGER,
  createdById INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  resourceId INTEGER,
  oldValues TEXT,
  newValues TEXT,
  userId INTEGER,
  ipAddress VARCHAR,
  userAgent VARCHAR,
  details VARCHAR,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Entity Relationships

```
Organizations (1) ──→ (N) Users
Organizations (1) ──→ (N) Organizations (parent-child)
Users (1) ──→ (N) Tasks (created)
Users (1) ──→ (N) Tasks (assigned)
Users (1) ──→ (N) AuditLogs
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Tasks (RBAC Protected)
- `POST /tasks` - Create task (requires CREATE_TASK permission)
- `GET /tasks` - List accessible tasks (requires READ_TASK permission)
- `GET /tasks/:id` - Get specific task (requires READ_TASK permission)
- `PATCH /tasks/:id` - Update task (requires UPDATE_TASK permission)
- `DELETE /tasks/:id` - Delete task (requires DELETE_TASK permission)

### Organizations (RBAC Protected)
- `POST /organizations` - Create organization (requires CREATE_ORGANIZATION permission)
- `GET /organizations` - List organizations (requires READ_ORGANIZATION permission)
- `GET /organizations/:id` - Get organization (requires READ_ORGANIZATION permission)
- `PATCH /organizations/:id` - Update organization (requires UPDATE_ORGANIZATION permission)
- `DELETE /organizations/:id` - Delete organization (requires DELETE_ORGANIZATION permission)

### Audit Logs (Owner/Admin Only)
- `GET /audit-log` - View access logs (requires READ_AUDIT_LOG permission)

### Sample Requests

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### Create Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "priority": 3
  }'
```

## 🛡️ Access Control Implementation

### Permission Matrix

| Role | Users | Organizations | Tasks | Audit Logs |
|------|-------|---------------|-------|------------|
| **Owner** | CRUD | CRUD | CRUD | Read |
| **Admin** | CRUD | Read | CRUD | - |
| **Viewer** | Read | Read | Read | - |

### Role Inheritance Logic
- **Owners** can access all organizations and their child organizations
- **Admins** can access their organization and child organizations
- **Viewers** can only access their own organization

### Permission Guards
- `@UseGuards(JwtAuthGuard)` - Ensures user is authenticated
- `@UseGuards(PermissionsGuard)` - Checks user permissions
- `@Permissions(Permission.CREATE_TASK)` - Requires specific permission

### Task Access Control
- Users can only see tasks from their organization
- Admins can see tasks from their organization + child organizations
- Owners can see all tasks across all organizations

## 🎨 Frontend Features

### Authentication UI
- Clean, responsive login/registration forms
- Role selection during registration
- Secure JWT token management
- Automatic token refresh handling

### Task Management Dashboard
- **Kanban Board**: Drag-and-drop task management with visual columns
- **Advanced Filtering**: Search, filter by status/priority, and sort options
- **Real-time Statistics**: Live task counts and completion rates
- **Task Visualization**: Progress charts and priority distribution
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Quick navigation (Ctrl+N, Ctrl+K, Ctrl+D)
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### User Experience
- Modern, intuitive interface with TailwindCSS
- Role-based UI elements
- Error handling and user feedback
- Loading states and animations

## 🧪 Testing

### Backend Testing
- **Jest** framework for unit testing
- **RBAC Service Tests**: Comprehensive permission testing for all roles
- **Authentication Tests**: Login, registration, and JWT validation
- **Controller Tests**: API endpoint testing with mocked services
- **Coverage**: Tests cover all critical RBAC and authentication logic

```bash
cd backend
npm test           # Unit tests
npm run test:watch # Watch mode
npm run test:cov   # Coverage report
```

### Frontend Testing
- **Jest/Karma** framework for component testing
- **Service Tests**: AuthService and TaskService with HTTP mocking
- **Component Tests**: Dashboard and Login components with full interaction testing
- **Coverage**: Tests cover user interactions, form validation, and API integration

```bash
cd frontend
npm test           # Unit tests
npm run test:watch # Watch mode
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Database Configuration
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a production database (PostgreSQL recommended)
3. Set secure JWT secrets
4. Enable HTTPS
5. Configure proper CORS settings

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist/` folder with a web server
3. Configure API base URL for production

## 🔮 Future Considerations

### Security Enhancements
- JWT refresh token implementation
- CSRF protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention

### Performance Optimizations
- Database query optimization
- RBAC permission caching
- API response caching
- Frontend lazy loading

### Advanced Features
- Role delegation
- Advanced audit logging
- Real-time notifications
- File attachments for tasks
- Team collaboration features

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ using NestJS and Angular**#   s e c u r i t y - t a s k - m a n g e m e n t  
 