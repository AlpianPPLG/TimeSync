# Getting Started

Welcome to the Attendance Management System! This guide will help you set up the project on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [MySQL](https://www.mysql.com/) (v8.0 or later)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/attendance-system.git
   cd attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Update the following variables in `.env.local`:
     ```env
     DATABASE_URL="mysql://username:password@localhost:3306/attendance_system"
     NEXTAUTH_SECRET=your-secret-key
     NEXTAUTH_URL=http://localhost:3000
     ```
   - Replace `username`, `password`, and `attendance_system` with your MySQL credentials
   - Generate a secure random string for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)

4. **Set up the database**
   ```bash
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed the database with initial data (optional)
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
attendance-system/
├── .next/                 # Next.js build output
├── public/                # Static files
├── src/
│   ├── app/               # App Router
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility functions and configurations
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── .env.local            # Environment variables
└── package.json          # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` or `yarn dev` - Start the development server
- `npm run build` or `yarn build` - Create a production build
- `npm start` or `yarn start` - Start the production server
- `npm run lint` or `yarn lint` - Run ESLint
- `npm run type-check` or `yarn type-check` - Run TypeScript type checking

## Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Verify your database credentials in `.env.local`
- Check if the database exists and is accessible

### Installation Issues
- Delete `node_modules` and `package-lock.json` (or `yarn.lock`) and reinstall dependencies
- Ensure you're using the correct Node.js version (v18+)

### Development Server Issues
- Make sure no other application is using port 3000
- Check the browser's developer console for errors

## Next Steps

- [Learn about the features →](./../features/)
- [Explore the API documentation →](./../api/)
- [Deployment guide →](./../deployment/)
