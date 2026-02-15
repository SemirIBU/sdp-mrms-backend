# MRMS Backend

Medical Records Management System - Backend API

## About
This project was developed as part of my Bachelor's thesis at IBU Sarajevo.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- SendGrid for email
- bcrypt for password hashing

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/mrms
   JWT_SECRET=your_secret_key
   SENDGRID_API_KEY=your_api_key
   EMAIL_FROM=noreply@example.com
   FRONTEND_URL=http://localhost:3000
   ```
4. Start MongoDB
5. Run seed script: `npm run seed`
6. Start server: `npm run dev`

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm run backup` - Backup database

## API Endpoints

- `/api/auth` - Authentication (login, register, forgot password)
- `/api/users` - User management
- `/api/patients` - Patient records
- `/api/doctors` - Doctor records
- `/api/appointments` - Appointments
- `/api/records` - Medical records

## Features

- JWT-based authentication with role-based access
- File upload for medical records
- Email notifications
- Database seeding and backup

## Deployment

Ensure environment variables are set. Use PM2 or similar for production.
