# Testing Strategy for TrendStudio

This document outlines the testing strategy for verifying the functionality of the TrendStudio application, covering all newly implemented modules.

## 1. Test Key User Flows (E2E Candidates)

These flows should be tested manually or automated via E2E tools (e.g., Playwright).

### Authentication & Account
- **Login**: Verify successful login with valid credentials.
- **Forgot Password**: Verify email submission and UI feedback.
- **Reset Password**: Verify password update flow.

### Project Management ("Mes Projets")
- Create a new project (Status: Draft).
- Edit project details.
- Delete a project.
- Verify "Project Stats" update correctly.

### Ideas Lab ("Laboratoire d'Idées")
- Generate ideas using the AI mock.
- Save an idea to favorites.
- Filter ideas by category.

### Site Builder ("Constructeur de Site")
- complete the creation wizard.
- Select a template.
- Verify the site appears in the list.

### SEO & Redesign
- **SEO Analysis**: Enter a URL and verify audit scoring visualization.
- **Site Redesign**: Run an analysis and check the "Migration Wizard" steps.

### AIO & Content
- **AIO Generator**: Generate a "Blog Post" and copy the content.
- **Video Generator**: Ensure the mock generation triggers and completes.

### Business Features
- **Quotes**: Generate a quote using the AI magic wand. Check items and total calculation.
- **Agency**: Add a new client and assign credits.

## 2. Component Testing (Unit/Integration)

Focus on complex logical components:

- `QuoteGenerator`: Verify distinct pricing logic based on 'Project Type'.
- `ProjectGrid`: Verify empty states vs populated states.
- `AIOEditor`: Test copy-to-clipboard functionality.

## 3. Database & RLS Verification

Ensure data security by testing access control:

- **Security**: Attempt to access `/projects` or `/agency` without being logged in (should redirect to login).
- **Isolation**: Ensure User A cannot see User B's projects or quotes.

## 4. Manual Verification Checklist

- [ ] All navigation links work (Sidebar & User Menu).
- [ ] Language switcher toggles between FR and EN correctly.
- [ ] Dark/Light mode toggle is persistent.
- [ ] API Key settings save/delete correctly (mock).
