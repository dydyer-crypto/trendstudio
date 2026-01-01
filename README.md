# TrendStudio - AI Content Creation Studio

TrendStudio is a professional, all-in-one platform for content creators, agencies, and businesses. It unifies AI-powered content generation, project management, and web development into a single, seamless experience.

## 🚀 Key Features

### 🎨 Content Generation
- **AI Video Generator**: Create videos up to 4 minutes (16:9, 9:16, 1:1).
- **AI Image Generator**: High-quality text-to-image creation.
- **AI Chat Assistant**: Intelligent assistant for scripting and ideas.
- **Script to Video**: Automated scene breakdown and video creation.
- **AIO Generator**: All-in-one generator for blog posts, pages, and product descriptions with SEO optimization.

### 🌐 Website & SEO
- **Site Builder**: No-code website builder with professional templates.
- **Site Redesign**: Analyze existing sites and get AI-powered migration plans.
- **SEO Analysis**: Complete audit tools (On-page, keywords, backlinks).

### 💼 Business & Management
- **Project Management**: Centralized dashboard for all your creative projects.
- **Ideas Lab**: AI-driven brainstorming and trend analysis.
- **AI Quotes**: Generate commercial quotes instantly based on project needs.
- **Agency Mode**: Manage multiple clients, team members, and credit allocations.
- **Integrations**: Connect third-party APIs (OpenAI, etc.) and configure webhooks.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, RLS, Edge Functions)
- **State Management**: React Context / Hooks
- **Routing**: React Router DOM
- **I18n**: react-i18next (English & French support)

## 📁 Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── projects/       # Project management components
│   ├── ideas/          # Ideas Lab components
│   ├── sites/          # Site Builder components
│   ├── seo/            # SEO tools components
│   ├── aio/            # AIO Generator components
│   ├── redesign/       # Site Redesign components
│   ├── quotes/         # Quote generation components
│   ├── agency/         # Agency mode components
│   ├── settings/       # Integration settings
│   └── auth/           # Authentication forms
├── pages/              # Application pages
├── db/                 # Supabase configuration
├── contexts/           # Auth and global contexts
├── locales/            # Translation files
└── routes.tsx          # Route definitions
```

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file with your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

We recommend a comprehensive testing strategy covering:
- **Unit Tests**: For utility functions and complex hook logic.
- **Component Tests**: Using React Testing Library for critical UI components.
- **E2E Tests**: Using Playwright/Cypress for User Flows (Login -> Create Project -> Generate Content).

See `TESTING.md` for detailed test scenarios.

## 📝 License
Proprietary software. All rights reserved.
