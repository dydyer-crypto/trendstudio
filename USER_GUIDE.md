# VIRALIX User Guide

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_APP_ID=your_app_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm run dev
```

## Features Guide

### 1. AI Video Generator

**How to use:**
1. Navigate to "Video Generator" from the sidebar
2. Enter your video prompt (describe what you want to see)
3. Select video duration (5s or 10s)
4. Choose aspect ratio:
   - 16:9 for YouTube videos
   - 9:16 for TikTok/Reels/Shorts
   - 1:1 for Instagram posts
5. (Optional) Add negative prompt to exclude unwanted elements
6. Click "Generate Video"
7. Wait for the video to be generated (this may take several minutes)
8. Preview and download your video

**YouTube Shorts Mode:**
- Toggle "YouTube Shorts Mode" for optimized vertical videos
- Automatically sets duration to 60 seconds max
- Sets aspect ratio to 9:16

### 2. AI Image Generator

**Text-to-Image:**
1. Navigate to "Image Generator"
2. Select "Text to Image" mode
3. Enter your image prompt (up to 2000 characters)
4. Choose image size preset (1:1, 9:16, 16:9, 4:5)
5. Click "Generate Image"
6. Download your generated image

**Image-to-Image:**
1. Select "Image to Image" mode
2. Upload a reference image (max 1MB, auto-compressed)
3. Enter your transformation prompt
4. Choose image size preset
5. Click "Generate Image"
6. Download your transformed image

### 3. AI Chat Assistant

**How to use:**
1. Navigate to "Chat Assistant"
2. Type your message or select a quick template:
   - Video Script
   - Viral Content Ideas
   - Image Prompt
   - Video Prompt
3. Send your message
4. AI will respond with helpful suggestions
5. Copy responses using the copy button
6. Use the suggestions in Video or Image Generator

**Tips:**
- Ask for script ideas for your videos
- Request prompt improvements
- Get viral content suggestions
- Generate scene descriptions

### 4. Script to Video

**How to use:**
1. Navigate to "Script to Video"
2. Write or paste your script (each line becomes a scene)
3. Click "Break Down into Scenes"
4. Review the generated scenes
5. Edit individual scene prompts if needed (click edit icon)
6. Generate videos for individual scenes or all at once
7. Monitor progress for each scene
8. Preview and download completed videos

**Scene Management:**
- Add new scenes with the "Add Scene" button
- Delete unwanted scenes
- Edit prompts for better results
- Regenerate failed scenes

### 5. Video Editor

**How to use:**
1. Navigate to "Video Editor"
2. Upload a video file or load a generated video
3. Preview your video
4. Download the video
5. Replace with a different video if needed

**Features:**
- Video preview
- Download functionality
- Video information display
- Quick actions panel

## Tips for Best Results

### Video Generation
- Be specific and descriptive in your prompts
- Include details about:
  - Scene setting (location, time of day)
  - Actions and movements
  - Camera angles and shots
  - Mood and atmosphere
- Use negative prompts to exclude unwanted elements
- Shorter videos (5s) generate faster than longer ones

### Image Generation
- Use detailed, descriptive prompts
- Specify style (realistic, cinematic, artistic, etc.)
- Include lighting and color preferences
- For image-to-image, choose images with clear subjects
- Experiment with different aspect ratios for different platforms

### Chat Assistant
- Ask specific questions
- Request multiple variations
- Use the templates as starting points
- Copy and refine AI suggestions
- Ask for prompt improvements

### Script to Video
- Write clear, concise scene descriptions
- Each line should describe one complete scene
- Keep scenes focused on single actions
- Review and edit generated prompts before generating
- Generate scenes individually to test before batch generation

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Send message in Chat Assistant
- **Esc**: Close dialogs and modals

## Troubleshooting

### Video generation is slow
- Video generation can take 5-10 minutes depending on duration
- Shorter videos (5s) are faster than longer ones
- Be patient and don't refresh the page

### Image upload fails
- Ensure image is under 1MB (auto-compression will help)
- Supported formats: JPG, PNG, WEBP
- Try a different image if issues persist

### Generation fails
- Check your prompt for clarity
- Try simplifying complex prompts
- Ensure you have a stable internet connection
- Try again after a few moments

## Support

For issues or questions:
1. Check this guide first
2. Review the error messages
3. Try the troubleshooting steps
4. Contact support if issues persist

## Best Practices

1. **Start Simple**: Begin with simple prompts and gradually add detail
2. **Iterate**: Use the chat assistant to refine your prompts
3. **Save Your Work**: Download generated content immediately
4. **Experiment**: Try different settings and styles
5. **Plan Ahead**: Use Script to Video for complex multi-scene projects

## Platform-Specific Tips

### For TikTok/Reels
- Use 9:16 aspect ratio
- Keep videos short (5-10 seconds)
- Focus on eye-catching visuals
- Use trending topics in prompts

### For YouTube
- Use 16:9 aspect ratio
- Longer videos work well
- Include clear narrative in script
- Use Script to Video for multi-scene content

### For Instagram
- Use 1:1 or 4:5 for posts
- Use 9:16 for Stories and Reels
- Focus on aesthetic and visual appeal
- High-quality images work best

Enjoy creating viral content with VIRALIX! 🚀
