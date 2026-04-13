# Team 14 Web App
# Drive Points - Good Driver Incentive Platform

## Overview
DrivePoints is a full-stack web application built for a incentive program for a trucking industry. It enables sponsor companies to reward truck drivers for safe and efficient driving behaviors using a point-based system. Drivers can redeem points for products through a sponsor-managed catalog.

This project was developed as part of a CPSC4910 capstone project at Clemson University.

## Core Concept
The platform connects 3 primary user roles:
1. Drivers - earn and redeem points
2. Sponsors - manage drivers, assign points, and control rewards
3. Admins - oversee the system and report management

## Tech Stack
Frontend
- React (Vite)
- React Router
- TanStack React Query
- SCSS Modules
- Recharts for data visualization

Backend
- ASP.NET Core Web API
- Entity Framework Core

Other
- Docker for local database setup

## Project Structure
root/
  frontend/           React frontend application
  backend/WebApi/     ASP.NET backend API
  local_db/           Local database setup
  docs/               Design and planning documents
  README.md

The frontend uses a component-based architecture, context API for global state, layouts based on roles, and modular SCSS styling.

The backend features RESTful API design, multiple DbContexts, and Entity Framework Migrations.

## Features
Drivers
- View and manage points
- Browse sponsor catalog
- Redeem rewards
- Track activity and delivery performance

Sponsors
- Manage drivers and driver applications
- Add and remove points with an audit trail
- Maintain a points catalog
- Monitor performance of drivers in the fleet
- Bulk actions

Admin
- Full system access
- Manage all users and organizations
- Generate audit logs and reports
- Impersonate users for debugging and support

## Installation and Setup
Necessary Prerequisites
- Node.js
- .NET SDK
- Docker (for database)

Steps
1. Clone repository through GitHub or "git clone <github url>" then "cd <repository>"
2. Setup backend
     cd backend/WebApi
     dotnet restore
     dotnet build
     dotnet ef database update
     dotnet run
3. Setup frontend
     cd frontend
     npm install
     npm run dev

## Development Notes
- Multiple DbContexts are used, specify when running migrations if needed
- API calls are centralized in /frontend/src/api

## Security & Permissions
- Role-based route protection
- API requests are authenticated
- Controlled admin impersonation capabilities

## Deployment
Frontend
- Build using "npm run build" and deploy via static hosting
Backend
- Deploy ASP.NET API to Azure App Service, AWS, Docker container
Database
- Use cloud hosted SQL or Docker-based local

## License
This project is for educational purposes.
