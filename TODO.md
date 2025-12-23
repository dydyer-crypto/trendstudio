# Task: Build VIRALIX - AI Content Creation Studio

## Analysis Summary

### APIs Identified:
1. **Large language Model** - AI Chat Assistant (ChatGPT-style)
2. **Create/Query text-to-video** - Video generation from text
3. **Create/Query image-to-video** - Video generation from images
4. **Nano Banana Image Generation** - Text-to-image and image-to-image generation

### Requirements:
- **Login**: Not required (public app)
- **Payment**: Not required (all features free)
- **Image Upload**: Required (for image-to-image and image-to-video features)
- **Supabase**: Required for image storage bucket

## Plan

- [x] Step 1: Design System Setup
  - [x] Update index.css with purple/blue color scheme
  - [x] Update tailwind.config.js with custom colors
  - [x] Add gradient utilities and animations

- [x] Step 2: Core Layout & Navigation
  - [x] Create AppLayout component with sidebar navigation
  - [x] Implement dark/light mode toggle
  - [x] Create responsive mobile menu
  - [x] Set up routing structure for all pages

- [x] Step 3: Supabase Setup for Image Storage
  - [x] Initialize Supabase
  - [x] Create image storage bucket
  - [x] Set up public access policies
  - [x] Create image upload utility with compression

- [x] Step 4: AI Video Generator Page
  - [x] Create VideoGenerator page component
  - [x] Implement text-to-video form (duration, aspect ratio, prompt)
  - [x] Add YouTube Shorts mode toggle
  - [x] Integrate video generation API
  - [x] Add task polling for video status
  - [x] Display generated video with download option

- [x] Step 5: AI Image Generator Page
  - [x] Create ImageGenerator page component
  - [x] Implement text-to-image form
  - [x] Add image-to-image with upload functionality
  - [x] Implement size presets (1:1, 9:16, 16:9, 4:5)
  - [x] Integrate Nano Banana API
  - [x] Display generated images with download

- [x] Step 6: AI Chat Assistant Page
  - [x] Create ChatAssistant page component
  - [x] Implement chat interface with message history
  - [x] Integrate Large Language Model API with streaming
  - [x] Add prompt templates for scripts/ideas
  - [x] Add "Convert to Video/Image Prompt" buttons
  - [x] Implement markdown rendering with streamdown

- [x] Step 7: Script to Video Workflow
  - [x] Create ScriptToVideo page component
  - [x] Implement script input/generation
  - [x] Add scene breakdown UI
  - [x] Allow editing of individual scenes
  - [x] Generate video from all scenes
  - [x] Show progress for multi-scene generation

- [x] Step 8: Editor & Preview Tools
  - [x] Create VideoEditor page component
  - [x] Implement basic timeline preview
  - [x] Add regeneration per scene option
  - [x] Implement download and share functionality

- [x] Step 9: Shared Components & Utilities
  - [x] Create API service layer
  - [x] Build reusable prompt enhancement component
  - [x] Create loading states and skeletons
  - [x] Add error handling and toast notifications
  - [x] Implement language switcher (Arabic/English)

- [x] Step 10: Testing & Polish
  - [x] Run npm run lint and fix all issues
  - [x] Test all features end-to-end
  - [x] Verify responsive design on all breakpoints
  - [x] Check dark/light mode consistency
  - [x] Verify API integrations

## Notes
- Primary colors: Deep purple (#6C5CE7) and electric blue (#0984E3)
- Dark mode: Dark gray (#1E1E2E) with vibrant accents
- Light mode: Clean white (#FFFFFF) with soft gray (#F5F6FA)
- Rounded corners: 8-12px
- All features are free and public (no login required)
- Image uploads require Supabase storage with 1MB limit and auto-compression
- Video generation can take up to 10 minutes (async polling required)
- Image generation can take 30+ seconds (set 300s timeout)
- Chat uses streaming responses with EventSource
