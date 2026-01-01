# VIRALIX Requirements Document

## 1. Application Overview

### 1.1 Application Name
VIRALIX

### 1.2 Application Description
VIRALIX is an all-in-one professional AI studio designed for content creators to generate, write, animate, and edit AI images and videos in one place. It aims to replace multiple AI tools with one powerful, easy-to-use AI creation platform for images, videos, scripts, and animation, focusing on viral content and social media growth.

### 1.3 Target Users
Both beginners and professional content creators who need to produce viral content for social media platforms.

## 2. Core Features

### 2.1 AI Video Generator\n- Generate AI videos with flexible duration options:
  - 1 minute (free)
  - 2 minutes (free)
  - 3 minutes (free)\n  - 4 minutes (free)
- Special mode for YouTube Shorts (up to 60 seconds, vertical 9:16 aspect ratio)
- Video aspect ratio options:
  - 9:16 (Shorts / Reels / TikTok)
  - 16:9 (YouTube long videos)
- High-quality cinematic output with smooth AI motion and animation

### 2.2 AI Image Generator\n- Text-to-image generation
- Image-to-image generation (optional image upload)
- Advanced prompt input supporting 2000+ characters
- Image size presets:
  - 1:1
  - 9:16
  - 16:9
  - 4:5
- High-resolution, realistic, cinematic image output
\n### 2.3 Built-in AI Chat Assistant
- Professional ChatGPT-style AI chat integrated within the app
- Assists users with:
  - Writing video scripts
  - Creating viral content ideas
  - Improving prompts
  - Generating image prompts
  - Generating video prompts
  - Suggesting animations and scenes
- Direct conversion of chat scripts into:\n  - Image prompts
  - Video prompts
  - Animated scenes

### 2.4 Script to Video Workflow
- User writes or generates a script using AI chat\n- AI automatically breaks the script into scenes
- Each scene includes:\n  - Image prompt
  - Video prompt
  - Motion/animation instructions
- One-click generation of full video from script\n
### 2.5 Prompt Enhancement Tools
- Improve prompt button
- Expand short ideas into professional prompts\n- Optimize prompts for viral content creation

### 2.6 Editing & Creator Tools
- Simple professional editor\n- Timeline-based preview (basic)
- Easy regeneration per scene
- Download and share final content

### 2.7 Payment Integration
- Stripe payment gateway integration
- Connect Stripe account functionality for payment processing\n- Support for subscription plans and one-time purchases
- Secure payment processing for premium features
\n### 2.8 Affiliate Program
- Referral system allowing users to earn commissions by promoting VIRALIX
- Unique affiliate links for each user\n- Commission tracking dashboard
- Automated payout system
- Marketing materials and resources for affiliates\n
### 2.9 Publication Calendar
- Schedule and plan content publication across multiple social media platforms
- Calendar view displaying scheduled posts by date and time
- Drag-and-drop functionality to reschedule posts
- Multi-platform support (YouTube, TikTok, Instagram, Facebook)
- Post preview before scheduling
- Automatic publishing at scheduled times
- Status tracking (draft, scheduled, published)
- Bulk scheduling for multiple posts

### 2.10 Real-Time Trend Analysis
- Monitor trending topics and hashtags across social media platforms in real-time
- Display trending content categories and viral themes
- Suggest content ideas based on current trends\n- Track performance metrics of trending content
- Filter trends by platform, region, and content type
- Provide insights on optimal posting times based on trend data

### 2.11 Content Performance Statistics
- Analytics dashboard displaying performance metrics for each published content
- Track key indicators: views, likes, shares, comments, engagement rate
- Performance evolution graphs over time
- Performance comparison between different contents
- Analysis by platform (YouTube, TikTok, Instagram, Facebook)
- Identification of top-performing content
- Exportable reports in PDF or CSV format
- Improvement suggestions based on performance data

### 2.12 Interactive Tutorial System
\n#### 2.12.1 Main Objective
- Reduce the learning curve for new users\n- Increase activation rate by offering an intuitive and rewarding onboarding experience
- Guide novice users without requiring external support
\n#### 2.12.2 Tutorial Structure
- Short and independent modules, each focused on a specific task
- Each module follows three steps:
  1. Brief Contextualization: Explain the usefulness of the feature
  2. Guided Interaction: User performs the action with visual indicators (highlights, arrows, numbers)
  3. Confirmation and Follow-up: Validation of success and logical next step suggestion

#### 2.12.3 Critical Tutorials (First 3-5 modules)\n- Tutorial 1: Create your first AI video
- Tutorial 2: Generate your first AI image\n- Tutorial 3: Use the AI Chat assistant to write a script\n- Tutorial 4: Transform a script into a complete video
- Tutorial 5: Publish and schedule your content

#### 2.12.4 Interactive Elements
- Highly visible highlights and clickable areas to guide actions
- Micro-rewards: badges, congratulatory messages, progress bars\n- Proactive contextual tips
- Customizable path: ability to skip a tutorial and return to it later
- Complete list of available guides accessible at any time

#### 2.12.5 Content and Tone
- Simple, clear, and supportive language
- Encouraging and positive tone
- Concise instructions placed in immediate proximity to interface elements\n- Avoid technical jargon

#### 2.12.6 Technical Specifications\n- Non-intrusive integration into existing interface
- Management system to disable tutorials after completion
- Reactivation option in settings
- Perfect adaptation to mobile devices with touch gesture support
- User progress saving

### 2.13 My Projects
- Main dashboard providing overview and management of different projects
- Project listing with status, creation date, and last modification\n- Quick access to project editing and settings
- Project search and filtering capabilities
\n### 2.14 Ideas Laboratory
- Content idea research and generation tool
- Niche discovery and exploration features
- AI-powered content suggestions based on trends and user preferences
- Save and organize ideas for future projects

### 2.15 Site Builder
- Interface for creating and configuring new websites
- Template selection and customization\n- Drag-and-drop page builder
- Domain and hosting configuration
\n### 2.16 Editorial Calendar
- Planning, organization, and tracking of content production
- Visual calendar view with drag-and-drop scheduling
- Content status tracking (draft, in progress, scheduled, published)
- Team collaboration features for content assignments
- Integration with content generation tools

### 2.17 SEO Analysis
- SEO audit and performance analysis tools for websites
- Keyword research and ranking tracking
- On-page SEO recommendations
- Backlink analysis\n- Competitor SEO comparison
- Technical SEO health checks

### 2.18 AIO Generator
- AI-assisted content creation module for articles, pages, and other content types
- Multiple content format support\n- SEO-optimized content generation
- Bulk content generation capabilities
- Content customization and editing tools

### 2.19 Site Redesign
- Tools dedicated to migration, analysis, and redesign of existing sites
- Site audit and performance analysis
- Migration planning and execution
- Content transfer and optimization
- Design modernization suggestions

### 2.20 AI Quote Generator
- Automatic generation of commercial quotes based on AI analysis
- Project scope analysis and pricing calculation
- Customizable quote templates
- Client information management
- Quote history and tracking

### 2.21 Agency / Credits Management
- Agency mode management\n- Credit allocation and purchase system
- Usage tracking and reporting
- Multi-user credit distribution
- Credit balance notifications

### 2.22 Billing\n- Subscription management\n- Payment history and invoicing
- Plan comparison and upgrades
- Stripe payment integration
- Automatic billing and renewal

### 2.23 Settings
- Global configuration management
- API key management (OpenAI, Anthropic, etc.)
- Webhook configuration
- CRM integration (Djaboo)
- User preferences and notifications
- Security settings

## 3. Authentication & System

### 3.1 Authentication System
- User registration and login (Supabase integration)
- Session management\n- Multi-factor authentication support
- Social login options\n\n### 3.2 Account Recovery
- Forgot password workflow
- Password reset functionality
- Email verification system
\n### 3.3 API Management
- AI model selector\n- User API key security and encryption
- API usage monitoring
- Rate limiting and quota management

## 4. General Requirements

### 4.1 User Interface
- Simple, fast, and creator-friendly UI
- Modern design with dark/light mode support
\n### 4.2 Language Support
- Bilingual interface with English and French language options
- Clear language selection mechanism allowing users to choose their preferred language
- Language switcher prominently displayed and easily accessible
- Complete translation of all interface elements, labels, buttons, and content in both languages
- Each language version maintains distinct and accurate translations without mixing languages on the same page
- User language preference saved and applied consistently across all sessions

### 4.3 Access Type
- Public app (open for everyone)\n
### 4.4 User Experience
- Designed for both beginners and professional creators\n- Focus on ease of use and efficiency

## 5. Design Style

### 5.1 Color Scheme
- Primary colors: Deep purple (#6C5CE7) and electric blue (#0984E3) for a modern, creative tech feel\n- Dark mode: Dark gray background (#1E1E2E) with vibrant accent colors
- Light mode: Clean white background (#FFFFFF) with soft gray elements (#F5F6FA)

### 5.2 Visual Details
- Rounded corners (8-12px) for cards and buttons to create a friendly, modern look\n- Subtle shadows and depth layers for visual hierarchy
- Gradient accents on primary action buttons
- Smooth transitions and micro-animations for interactions
- Icon style: Line-based with consistent stroke width\n
### 5.3 Layout
- Card-based layout for feature modules
- Sidebar navigation for main sections (My Projects, Ideas Laboratory, Site Builder, Editorial Calendar, SEO Analysis, AIO Generator, Site Redesign, AI Quote Generator, Video Generator, Image Generator, AI Chat, Editor, Agency/Credits, Billing, Affiliate Program, Publication Calendar, Trend Analysis, Performance Statistics, Interactive Tutorials, Settings)
- Responsive grid system for content display
- Timeline-based interface for video editing section
- Clean spacing with focus on content creation area