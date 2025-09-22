# 🚀 Quick Startup Guide

## How to Start Your RBAC Task Management System

### Option 1: Using Batch Files (Recommended)
1. **Double-click** `start-backend.bat` to start the backend server
2. **Double-click** `start-frontend.bat` to start the frontend server
3. **Wait** for both servers to fully load (you'll see "Server running" messages)
4. **Open** http://localhost:4200 in your browser

### Option 2: Manual Terminal Commands

#### Start Backend:
```bash
cd simple-task-management/backend
npm run start:dev
```

#### Start Frontend (in a new terminal):
```bash
cd simple-task-management/frontend
npm start
```

### 🔍 Troubleshooting

#### If Backend Won't Start:
1. Make sure you're in the `backend` directory
2. Run `npm install` to install dependencies
3. Run `npm run build` to check for compilation errors

#### If Frontend Won't Start:
1. Make sure you're in the `frontend` directory
2. Run `npm install` to install dependencies
3. Check if port 4200 is already in use

#### If Nothing Displays in Browser:
1. Make sure both servers are running
2. Check browser console for errors (F12)
3. Try refreshing the page (Ctrl+F5)
4. Make sure you're going to http://localhost:4200

### 📱 Access URLs
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

### 🎯 Testing the System
1. **Register** a new account with any role (Owner, Admin, Viewer)
2. **Login** with your credentials
3. **Create tasks** and test RBAC permissions
4. **Try different roles** to see permission differences

### 🔐 RBAC Roles
- **Owner**: Full system access
- **Admin**: Full access within organization
- **Viewer**: Read-only access

---
**Your production-ready RBAC system is ready to use!** 🎉

