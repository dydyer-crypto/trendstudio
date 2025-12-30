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

### 2.11 Statistiques de Performance des Contenus
- Tableau de bord analytique affichant les métriques de performance pour chaque contenu publié
- Suivi des indicateurs clés : vues, likes, partages, commentaires, taux d'engagement
- Graphiques d'évolution des performances dans le temps
- Comparaison des performances entre différents contenus
- Analyse par plateforme (YouTube, TikTok, Instagram, Facebook)
- Identification des contenus les plus performants
- Rapports exportables en PDF ou CSV
- Suggestions d'amélioration basées sur les données de performance

### 2.12 Système de Tutoriels Interactifs
\n#### 2.12.1 Objectif Principal
- Réduire la courbe d'apprentissage des nouveaux utilisateurs
- Augmenter le taux d'activation en offrant une prise en main intuitive et valorisante
- Guider les utilisateurs novices sans nécessiter de support externe

#### 2.12.2 Structure des Tutoriels
- Modules courts et indépendants, chacun centré sur une tâche spécifique
- Chaque module suit trois étapes :
  1. Contextualisation Brève : Expliquer l'utilité de la fonctionnalité
  2. Interaction Guidée : L'utilisateur effectue l'action avec indications visuelles (surlignages, flèches, numéros)
  3. Confirmation et Suivi : Validation de la réussite et proposition d'enchaînement logique

#### 2.12.3 Tutoriels Critiques (3-5 premiers modules)
- Tutoriel 1 : Créer votre première vidéo AI
- Tutoriel 2 : Générer votre première image AI
- Tutoriel 3 : Utiliser l'assistant AI Chat pour écrire un script
- Tutoriel 4 : Transformer un script en vidéo complète
- Tutoriel 5 : Publier et planifier votre contenu

#### 2.12.4 Éléments Interactifs\n- Surbrillances et zones cliquables très visibles pour guider les actions
- Microrécompenses : badges, messages de félicitations, barres de progression
- Conseils proactifs contextuels
- Chemin personnalisable : possibilité de sauter un tutoriel et y revenir plus tard\n- Liste complète des guides disponibles accessible à tout moment
\n#### 2.12.5 Contenu et Ton\n- Langage simple, clair et bienveillant\n- Ton encourageant et positif
- Instructions concises placées à proximité immédiate des éléments d'interface\n- Éviter le jargon technique

#### 2.12.6 Spécifications Techniques
- Intégration non intrusive dans l'interface existante
- Système de gestion pour désactiver les tutoriels après complétion
- Option de réactivation dans les paramètres
- Adaptation parfaite aux appareils mobiles avec support des gestes tactiles
- Sauvegarde de la progression de l'utilisateur

## 3. General Requirements

### 3.1 User Interface
- Simple, fast, and creator-friendly UI
- Modern design with dark/light mode support\n
### 3.2 Language Support
- English and French language support

### 3.3 Access Type
- Public app (open for everyone)

### 3.4 User Experience
- Designed for both beginners and professional creators
- Focus on ease of use and efficiency

## 4. Design Style
\n### 4.1 Color Scheme
- Primary colors: Deep purple (#6C5CE7) and electric blue (#0984E3) for a modern, creative tech feel
- Dark mode: Dark gray background (#1E1E2E) with vibrant accent colors\n- Light mode: Clean white background (#FFFFFF) with soft gray elements (#F5F6FA)

### 4.2 Visual Details
- Rounded corners (8-12px) for cards and buttons to create a friendly, modern look
- Subtle shadows and depth layers for visual hierarchy
- Gradient accents on primary action buttons
- Smooth transitions and micro-animations for interactions
- Icon style: Line-based with consistent stroke width

### 4.3 Layout
- Card-based layout for feature modules
- Sidebar navigation for main sections (Video Generator, Image Generator, AI Chat, Editor, Affiliate Program, Publication Calendar, Trend Analysis, Performance Statistics, Interactive Tutorials)
- Responsive grid system for content display
- Timeline-based interface for video editing section
- Clean spacing with focus on content creation area