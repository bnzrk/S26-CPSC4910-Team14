# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack web application for CPSC 4910/4911 capstone (Team 14). This is a **Good Driver Incentive Program** for the trucking industry — a rewards platform where sponsor companies award points to truck drivers for good driving behavior, and drivers redeem those points for products from a sponsor-managed catalog.

### Domain Concepts

- **Drivers**: Affiliated with one sponsor company. Earn points for good driving, spend points on catalog products. Must apply to a sponsor (application can be accepted/rejected).
- **Sponsors**: Companies that manage drivers, set point values (default $0.01/point), maintain a product catalog, and add/deduct points with a required reason.
- **Admins**: System administrators (our team). Can manage all users and impersonate any role. Generate invoicing/sales reports.
- **Points**: The currency of the system. Sponsors award/deduct points; drivers spend them on catalog items.
- **Product Catalog**: Per-sponsor, sourced from a public API (e.g., eBay, Etsy, Overstock). Prices and availability update in real-time via the API. Products must be G/PG rated.

### User Roles & Key Capabilities

| Role         | Key Actions                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Driver       | Browse sponsor catalog, purchase with points, view point history, manage profile, receive alerts                |
| Sponsor User | Manage drivers & applications, manage catalog, add/deduct points, generate sponsor reports, impersonate drivers |
| Admin        | Manage all users/sponsors, generate sales/invoice/audit reports, impersonate any role                           |

### Alerts (Driver)

- **Dropped by sponsor/admin** — always sent, cannot be disabled
- **Points added/removed** — toggleable
- **Order placed** — toggleable

### Audit Logging

All significant state changes must be logged:

- Driver applications (date, sponsor, driver, status, reason)
- Point changes (date, sponsor, driver, points, reason)
- Password changes (date, user, type)
- Login attempts (date, username, success/failure)

### Reports

- **Sponsor Reports**: Driver point tracking (filterable by driver & date range), audit log (restricted to sponsor's drivers)
- **Admin Reports**: Sales by sponsor, sales by driver, invoice per sponsor (summarizes purchases & fees), audit log (filterable by sponsor, date range, category)
- All reports must be visually appealing and downloadable as CSV

### Security Requirements

- Password complexity enforcement
- Passwords encrypted at rest
- Private data encrypted
- SQL injection protection (use parameterized queries / EF Core)
- Secure password reset flow
- **Never commit credentials, keys, or secrets to the repo**

### General Constraints

- Responsive UI (adapts to user's display size)
- Single login page — user type must NOT be selected to log in
- No computer-generated IDs exposed in the UI
- About page pulls from database: Team #, Version/Sprint #, Release Date, Product Name, Product Description
- Deployed to AWS (public URL), with automatic deployment pipeline and AWS-hosted database

## Development Commands

### Local Database (required first)

```bash
# Start MySQL container (from repo root)
docker compose -f local_db/my_sql/compose.yaml up -d
```

Connection: `Server=127.0.0.1;Port=3306;Database=appdb;User ID=appuser;Password=apppass;`

### Backend (ASP.NET Core 10, C#)

```bash
cd backend/WebApi
dotnet restore
dotnet build
dotnet run              # Starts API on http://localhost:5228
```

EF Core migrations:

```bash
cd backend/WebApi
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

Swagger docs available at `/swagger` in development.

### Frontend (React 19 + Vite)

```bash
cd frontend
npm install
npm run dev             # Starts dev server on http://localhost:5173
npm run build           # Production build
npm run lint            # ESLint
```

## Architecture

### Backend (`backend/WebApi/`)

- **Feature-based folder structure**: Each feature lives under `Features/<FeatureName>/` with its own controller and models
- **Data layer**: `Data/AppDbContext.cs` for EF Core context, `Data/Entities/` for database entities
- **Migrations**: `Migrations/` contains EF Core migration files
- **Configuration**: `Program.cs` sets up CORS, DbContext (MySQL), Swagger, and controller mapping
- **CORS**: Two policies — `LocalCors` (localhost:5173 for dev) and `FrontendCors` (team14.cpsc4911.com for production)

### Frontend (`frontend/src/`)

- **React Query** (`@tanstack/react-query`) for all server state/data fetching
- **SCSS** for styling (not plain CSS)
- **Config**: `config.js` reads `VITE_API_BASE_URL` from environment variables (set in `.env.development`)
- **Vite** for build tooling

### Data Flow

Frontend (React Query fetch) → ASP.NET Core API (Controllers) → EF Core → MySQL

## Coding Guidelines

- Use EF Core parameterized queries — never concatenate user input into SQL
- All new API endpoints should include appropriate role-based authorization
- Audit log entries should be created for all state changes listed above
- External catalog API calls should handle errors gracefully (timeouts, unavailable items)
- Keep credentials out of source code; use environment variables or user secrets
