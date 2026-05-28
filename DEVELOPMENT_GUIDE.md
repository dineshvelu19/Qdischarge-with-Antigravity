# Qdischarge Development Guide

## 🎯 Project Overview

**Qdischarge with Antigravity** is an AI-driven discharge summary automation system for Indian healthcare facilities. It addresses clinical documentation inefficiencies by automating the generation of accurate, compliant discharge summaries.

### Key Pain Points Being Solved
- **Time Burden**: Physicians spend 25-30% of shift on discharge paperwork
- **Documentation Overhead**: ~2 hours of EHR time per 1 hour of patient care
- **Fragmented Systems**: Data scattered across EMR, HIS, Lab, Imaging systems
- **Error-Prone Manual Process**: Critical compliance and medico-legal implications
- **Physician Burnout**: Documentation cited as top burnout driver

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16.2.6, React 19.2.4, TypeScript 5 |
| **UI Framework** | Tailwind CSS 4, shadcn/ui |
| **Forms & Validation** | React Hook Form 7.76.1, Zod 4.4.3 |
| **State Management** | Zustand 5.0.13, React Query 5.100.14 |
| **Backend** | Supabase (PostgreSQL), Supabase Auth |
| **Database** | PostgreSQL (via Supabase) |
| **Deployment** | Vercel |
| **Linting** | ESLint 9 |
| **Build Tool** | Next.js |

---

## 📦 Project Structure

```
Qdischarge-with-Antigravity/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── discharge/           # Discharge summary endpoints
│   │   └── health/              # Health check endpoints
│   └── dashboard/               # Dashboard routes
│
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout components
│   └── common/                   # Reusable components
│
├── lib/                          # Utility Functions
│   ├── supabase.ts              # Supabase client
│   ├── utils.ts                 # Helper utilities
│   └── constants.ts             # App constants
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useDischarge.ts          # Discharge data hook
│   └── useQuery.ts              # Query hooks
│
├── types/                        # TypeScript Types
│   ├── database.ts              # Database types
│   ├── api.ts                   # API response types
│   └── index.ts                 # Exported types
│
├── utils/                        # Shared Utilities
│   ├── validation.ts            # Validation helpers
│   ├── formatting.ts            # Data formatting
│   └── helpers.ts               # Generic helpers
│
├── supabase/                     # Supabase Config
│   ├── migrations/              # Database migrations
│   └── seed.sql                 # Seed data
│
├── public/                       # Static Assets
│   ├── images/
│   └── icons/
│
├── middleware.ts                 # Next.js Middleware
├── next.config.ts               # Next.js Config
├── tailwind.config.ts           # Tailwind Config
├── tsconfig.json                # TypeScript Config
├── package.json                 # Dependencies
└── DEVELOPMENT_GUIDE.md         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- A Supabase account (free tier available)
- A Vercel account (for deployment)

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone https://github.com/dineshvelu19/Qdischarge-with-Antigravity.git
   cd Qdischarge-with-Antigravity
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other secrets.

4. **Run Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Run Linting**
   ```bash
   npm run lint
   ```

---

## 💾 Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy credentials to `.env.local`

2. **Run Migrations**
   ```bash
   # Apply database schema
   npx supabase migration up
   ```

3. **Key Tables Structure**
   - `users` - User profiles
   - `hospitals` - Hospital information
   - `patients` - Patient data
   - `admissions` - Admission records
   - `discharge_summaries` - Generated summaries
   - `medical_records` - Clinical documentation

---

## 📝 Feature Development Areas

### 1. **Authentication & Authorization** 🔐
- Supabase Auth integration
- Role-based access control (Admin, Doctor, Staff)
- Multi-hospital support
- Session management

**Key Files**: `lib/supabase.ts`, `hooks/useAuth.ts`, `app/api/auth/`

### 2. **Discharge Summary Generation** 📄
- Form-based data input
- AI-assisted content generation
- Template management
- Version control & editing

**Key Files**: `components/forms/DischargeForm.tsx`, `hooks/useDischarge.ts`

### 3. **Patient Data Management** 👥
- Patient admission tracking
- Medical history integration
- Lab & imaging data linking
- Vital signs management

**Key Files**: `types/database.ts`, `app/api/patients/`

### 4. **Hospital Integration** 🏥
- Multi-hospital support
- EMR/HIS integration APIs
- Data synchronization
- API token management

**Key Files**: `app/api/hospitals/`, `lib/integration/`

### 5. **Dashboard & Analytics** 📊
- Summary generation statistics
- Physician productivity metrics
- Compliance tracking
- Hospital performance insights

**Key Files**: `app/dashboard/`, `components/charts/`

### 6. **Quality Assurance** ✅
- Summary validation rules
- Compliance checking
- Audit logging
- Error tracking

**Key Files**: `utils/validation.ts`, `lib/qa/`

### 7. **User Management** 👨‍💼
- User registration
- Profile management
- Permission settings
- Activity logs

**Key Files**: `app/api/users/`, `components/UserManagement/`

### 8. **Reporting & Export** 📋
- PDF generation
- DOCX export
- Compliance reporting
- Audit trails

**Key Files**: `utils/export/`, `app/api/reports/`

---

## 🔄 Development Workflow

### Branch Naming Convention
```
main                    # Production branch
staging                 # Staging/QA branch
dev/feature-name        # Feature branches
fix/bug-name           # Bug fix branches
docs/description       # Documentation updates
```

### Commit Message Format
```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
refactor: Refactor code section
test: Add tests
chore: Update dependencies
```

### Code Style Guidelines

1. **TypeScript**
   - Use strict mode
   - Define explicit types
   - Avoid `any` type

2. **React**
   - Use functional components
   - Use custom hooks for logic
   - Memoize expensive components

3. **Styling**
   - Use Tailwind classes
   - Use CSS variables for theming
   - Mobile-first approach

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Database
npm run db:push         # Push schema to Supabase
npm run db:pull         # Pull schema from Supabase
npm run db:reset        # Reset database (CAUTION!)

# Testing (add when ready)
npm run test            # Run tests
npm run test:watch      # Watch mode
```

---

## 🧪 Testing Strategy

```bash
# Unit Tests
npm run test -- --testPathPattern=utils

# Integration Tests
npm run test -- --testPathPattern=api

# E2E Tests (when implemented)
npm run test:e2e
```

**Recommended**: Jest + React Testing Library for testing

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
npm i -g vercel
vercel

# Option 2: GitHub Integration
# Push to main branch, Vercel deploys automatically
```

### Environment Variables on Vercel
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add all variables from `.env.local`

### Database Backups
- Supabase provides automatic daily backups
- Access via Supabase Dashboard → Backups

---

## 🔐 Security Checklist

- [ ] Environment variables not committed
- [ ] Supabase Row Level Security (RLS) policies enabled
- [ ] API rate limiting implemented
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Sensitive data encrypted
- [ ] Regular security audits scheduled

---

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Zod**: https://zod.dev
- **React Hook Form**: https://react-hook-form.com

---

## 🐛 Common Issues & Solutions

### Port 3000 Already in Use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

### Supabase Connection Issues
```bash
# Verify credentials in .env.local
# Check Supabase project is active
# Verify IP whitelist if applicable
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

---

## 📞 Support & Contribution

- **Issues**: Report via GitHub Issues
- **Discussions**: Use GitHub Discussions
- **Pull Requests**: Follow branch naming & commit conventions

---

## 📄 License

[Add your license information]

---

**Last Updated**: May 2026  
**Status**: In Active Development
