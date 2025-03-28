# Chronos Backend

**Chronos** is a full-stack time management application designed to help users organize meetings, track tasks, and manage events efficiently. The backend provides a robust API that handles user authentication, calendar management, event creation, and sharing functionalities. This project follows modern development practices and is built using Nest.js with a focus on scalability and maintainability.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Requirements and Dependencies](#requirements-and-dependencies)
- [Setup Instructions](#setup-instructions)
- [API Architecture](#api-architecture)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Calendar Integration](#calendar-integration)
- [Email Notifications](#email-notifications)

## Overview
The **Chronos Backend** provides a comprehensive API for time management, enabling users to create and manage multiple calendars, events, tasks, and reminders. It supports collaboration features through calendar sharing and implements robust authentication to ensure data security. The backend is designed to be easily integrated with the Chronos frontend or other applications through its RESTful API.

## Features
- **User Management**: Registration, authentication, and profile management
- **Calendar Management**: Multiple calendars per user with customizable settings
- **Event Handling**: Support for different event types (arrangements, reminders, tasks)
- **Collaboration**: Calendar sharing with configurable permissions
- **Email Integration**: Notifications and event invitations
- **Holiday Calendar**: Integration with public holiday APIs based on user region
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: JWT-based authentication and proper error management

## Requirements and Dependencies
- **Nest.js** (v11.0.12 recommended)
- **MySQL** (v8+ recommended)
- **NPM** (v10+ recommended)

## Setup Instructions

To run this project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone [repository-url]
   cd ucode-connect-Connect-FullStack-chronos-PlanQ-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=3000
   APP_NAME=PlanQ
   APP_PORT=3000
   APP_HOST=localhost
   APP_PROTOCOL=http
   APP_GLOBAL_PREFIX=api
   APP_PASSWORD_BCRYPT_SALT_ROUNDS=10
   APP_FRONTEND_PORT=5173
   APP_FRONTEND_HOST=localhost
   APP_FRONTEND_PROTOCOL=http
   APP_NODE_ENV=development
   APP_AVATAR_ALLOWED_TYPES=jpg|jpeg|png
   APP_LOGO_PATH=./public/uploads/logo
   APP_LOGO_FILENAME=logo.png

   # CORS Configuration
   APP_CORS_METHODS=GET,POST,PUT,DELETE,PATCH
   APP_CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-CSRF-TOKEN
   APP_CORS_CREDENTIALS=true

    # CSRF Configuration
   APP_CSRF_COOKIE_KEY=X-CSRF-TOKEN
   APP_CSRF_COOKIE_HTTP_ONLY=false
   APP_CSRF_COOKIE_SAME_SITE=strict
   APP_CSRF_IGNORE_METHODS=GET,HEAD,OPTIONS

   # Scheduler Configuration
   SCHEDULER_CLEAN_REFRESH_TOKENS_FROM_DB_TIME=EVERY_DAY_AT_10AM
   SCHEDULER_CALENDAR_NOTIFICATION=EVERY_MINUTE
   SCHEDULER_UNACTIVATED_ACCOUNT_NOTIFICATION=EVERY_30_MINUTES
   SCHEDULER_UPDATE_COUNTRIES=EVERY_DAY_AT_10AM

   # Country API
   COUNTRY_API_URL=https://restcountries.com/v3.1/all?fields=name,cca2,flags

   # Database Root Configuration (for local dev use only)
   DB_ROOT_HOST=localhost
   DB_ROOT_PORT=3306
   DB_ROOT_USER=[your-root-user]
   DB_ROOT_PASSWORD=[your-root-password]
   DB_ROOT_CONNECTION_LIMIT=10

   # Database App Configuration
   DB_APP_HOST=localhost
   DB_APP_PORT=3306
   DB_APP_USER=[your-db-user]
   DB_APP_PASSWORD=[your-db-password]
   DB_APP_DATABASE=[your-db-name]
   DB_APP_CONNECTION_LIMIT=10

   # JWT Configuration
   JWT_ACCESS_SECRET=[your-access-secret]
   JWT_REFRESH_SECRET=[your-refresh-secret]
   JWT_CONFIRM_EMAIL_SECRET=[your-email-confirm-secret]
   JWT_RESET_PASSWORD_SECRET=[your-reset-password-secret]
   JWT_CONFIRM_CALENDAR_SECRET=[your-calendar-confirm-secret]
   JWT_CONFIRM_ARRANGEMENT_SECRET=[your-arrangement-confirm-secret]
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_CONFIRM_EMAIL_EXPIRES_IN=24h
   JWT_RESET_PASSWORD_EXPIRES_IN=1h
   JWT_CONFIRM_CALENDAR_EXPIRES_IN=24h
   JWT_CONFIRM_ARRANGEMENT_EXPIRES_IN=24h
   JWT_ISSUER=/api/auth
   JWT_CALENDAR_ISSUER=/api/calendars
   JWT_EVENT_ISSUER=/api/events
    
   GOOGLE_CLIENT_ID=[your-google-client-id]
   GOOGLE_CLIENT_SECRET=[your-google-client-secret]
   GOOGLE_PLAYGROUND_REDIRECT_URI=[your-google-playground-redirect-uri]
   GOOGLE_CALENDAR_API_REFRESH_TOKEN=[your-calendar-api-refresh-token]
   GOOGLE_GMAIL_API_REFRESH_TOKEN=[your-gmail-api-refresh-token]
   GOOGLE_GMAIL_USER=[your-gmail-user]
   GOOGLE_CALENDAR_API_MAX_RESULTS=2000
   GOOGLE_CALENDAR_API_HOLIDAY_CALENDARS_DATA_FILE_PATH=data/country.holiday-calendar.json

   CALENDAR_DEFAULT_MAIN_NAME='Main Calendar'
   CALENDAR_DEFAULT_MAIN_DESCRIPTION='This is the main calendar.'
   CALENDAR_DEFAULT_MAIN_COLOR='#4285F4'

   CALENDAR_DEFAULT_HOLIDAY_NAME='Holiday Calendar'
   CALENDAR_DEFAULT_HOLIDAY_DESCRIPTION='This is the holiday calendar.'
   CALENDAR_DEFAULT_HOLIDAY_COLOR='#FF0000'
   ```

4. **Configure Database Credentials:**

   - Open .env and provide admin-level database credentials (DB_ROOT user and password) that will be used to create the database.
   - In .env, specify the credentials (DB_APP user and password) the application will use for ongoing interactions with the database. This user can be the same as in DB_ROOT-config, but may differ based on your access preferences.

5. **Initialize the Database**:
   ```bash
   npm run setup-database
   ```

6. **Start the Development Server**:
   ```bash
   npm run start:dev
   ```

## API Architecture
The backend follows the MVC (Model-View-Controller) architecture:

- **Models**: Define data structures for users, calendars, events, and permissions
- **Controllers**: Handle business logic and API request processing
- **Routes**: Define API endpoints and connect them to appropriate controllers
- **Middleware**: Handle authentication, validation, and error processing

## Database Schema

The project uses a relational database with the following main tables:

- **users** - stores user data (name, email, password, country, photo, etc.).
- **refresh_token_nonces** - nonce-values for protection during token refresh
- **calendars** - custom calendars with description
- **calendar_members** - calendar members with roles (`owner`, `editor`, `viewer`), colors and types (`main`, `holiday`, `additional`)
- **events** - events such as appointments, reminders and tasks (`home`/`work` categories)
- **event_tasks** - tasks related to events (priority, execution status)
- **event_participations** - user participation in events with response options (`accepted`, `declined`, etc.)

Relations between tables are implemented via foreign keys with cascading deletion, which ensures data integrity when deleting linked records.

## Authentication
- JWT-based authentication system
- Token generation upon login
- Token verification for protected routes
- Password encryption for user security
- Nonces
- X-CSRF-Token

## Calendar Integration
The API integrates with public calendar services to:
- Import national holidays based on user's region

## Email Notifications
The notification system supports:
- Event reminders
- Calendar sharing invitations
- Task assignments