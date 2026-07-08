# 🎓 Cloud-Based School Management System

![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET%20Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Status](https://img.shields.io/badge/Status-Under%20Development-orange?style=for-the-badge)

A modern full-stack web application designed to automate and digitize school academic and administrative operations through a secure cloud-based platform.

---

## 📖 Project Overview

The **Cloud-Based School Management System** helps schools manage students, teachers, attendance, marks, grades, requests, announcements, reports, and analytics from one centralized online system.

This project is developed as an internship project using **React.js**, **ASP.NET Core Web API**, **MySQL**, and **JWT authentication**.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 👨‍🎓 Student Management | Add, update, view, and manage student information |
| 👨‍🏫 Teacher Management | Manage teacher profiles, schedules, and assigned subjects |
| 🕒 Attendance Tracking | Mark and monitor student attendance records |
| 📊 Marks & Grades | Enter marks and view student performance |
| 🔐 JWT Authentication | Secure login using JSON Web Tokens |
| 🛡️ Role-Based Access | Separate permissions for Admin, Teacher, and Student users |
| 📝 Academic Requests | Students can submit academic-related requests |
| 📢 Announcements | Admin can publish important notices |
| 📈 Dashboard Analytics | View academic and administrative summaries |
| ☁️ Cloud Deployment | Planned deployment using Vercel, VPS/Render, and AWS RDS |

---

## 👥 User Modules

### 👨‍💼 Admin Module

- Manage students
- Manage teachers
- Manage subjects and classes
- Publish announcements
- Generate reports
- View dashboard analytics

### 👨‍🏫 Teacher Module

- Mark student attendance
- Enter student marks
- View weekly schedules
- Manage student requests

### 👨‍🎓 Student Module

- View attendance
- View marks and performance
- Access weekly schedules
- Submit academic requests

---

## 🔐 Security Features

- JWT authentication
- Role-based authorization
- Protected REST APIs
- Password encryption using BCrypt
- Secure HTTPS communication

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| 🎨 Frontend | React.js + Vite |
| ⚙️ Backend | ASP.NET Core Web API |
| 🗄️ Database | MySQL |
| 🔑 Authentication | JWT |
| 🔒 Password Security | BCrypt |
| 🧪 Testing Tools | Swagger, Postman, Browser Developer Tools |
| ☁️ Deployment | Vercel, VPS/Render, AWS RDS |

---

## 🏗️ System Architecture

```text
React Frontend
      ↓
ASP.NET Core Web API
      ↓
MySQL Database
```

---

## 📂 Project Structure

```text
school-management-system
│
├── frontend
│   ├── public
│   ├── src
│   ├── components
│   ├── pages
│   └── services
│
├── backend
│   ├── Controllers
│   ├── Models
│   ├── Services
│   ├── Repositories
│   ├── DTOs
│   └── Authentication
│
└── database
```

---

## ⚡ Frontend Setup

### 1. Navigate to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## ⚙️ Backend Setup

### 1. Navigate to the backend folder

```bash
cd backend
```

### 2. Restore packages

```bash
dotnet restore
```

### 3. Run the backend

```bash
dotnet run
```

Backend URL:

```text
https://localhost:5001
```

---

## 🗄️ Database Setup

### 1. Create the database

```sql
CREATE DATABASE school_management;
```

### 2. Configure the connection string

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=school_management;user=root;password=yourpassword"
  }
}
```

### 3. Run database migration

```bash
Add-Migration InitialCreate
Update-Database
```

---

## 🔑 Authentication Flow

```text
User Login
    ↓
Validate User Credentials
    ↓
Generate JWT Token
    ↓
Store Token on Client
    ↓
Access Protected APIs
```

---

## 📊 Current Progress

| Module | Status |
|---|---|
| Frontend Setup | ✅ Completed |
| Backend Setup | ✅ Completed |
| Database Setup | ✅ Completed |
| Authentication | 🔄 In Progress |
| Student Module | 🔄 In Progress |
| Attendance Module | ⏳ Pending |
| Deployment | ⏳ Pending |

---

## 🧪 Testing Tools

- Swagger
- Postman
- Browser Developer Tools

---

## ☁️ Deployment Plan

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | VPS / Render |
| Database | AWS RDS |

---

## 🔮 Future Enhancements

- 📱 Mobile application
- 👨‍👩‍👧 Parent portal
- 🤖 AI-based performance analysis
- 📩 SMS notifications
- 📝 Online examination system
- 💬 Real-time chat

---

## 🎯 Expected Benefits

- Reduced paperwork
- Faster academic operations
- Improved communication
- Better accessibility
- Secure academic records
- Cloud-based school management

---

## 👨‍💻 Author

**Duranda Abeysinghe**  
Internship Project — School Management System

---

## ⭐ Project Status

🚧 **Currently Under Development**

---

## 📜 License

This project is developed for educational and internship purposes.
