// API service for TrendStudio AI integrations
const APP_ID = import.meta.env.VITE_APP_ID || 'app-8mth6gdsxz40';

// Common headers for all API requests
const getHeaders = (contentType = 'application/json') => ({
  'Content-Type': contentType,
  'X-App-Id': APP_ID,
});

// ============================================
// Large Language Model API (AI Chat Assistant)
// ============================================

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface ChatRequest {
  contents: ChatMessage[];
}

export interface ChatResponse {
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{ text: string }>;
    };
    finishReason: string;
    index: number;
    safetyRatings: unknown[];
  }>;
}

/**
 * Send chat message to Large Language Model (streaming)
 * Returns EventSource for streaming responses
 */
export const sendChatMessage = (messages: ChatMessage[]): EventSource => {
  const url = 'https://api-integrations.appmedo.com/app-8mth6gdsxz40/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';
  
  const eventSource = new EventSource(url);
  
  // Send the request via POST (EventSource doesn't support POST directly, so we need a workaround)
  fetch(url.replace('?alt=sse', ''), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ contents: messages }),
  }).catch(error => {
    console.error('Chat API error:', error);
  });
  
  return eventSource;
};

/**
 * Send chat message to Large Language Model (non-streaming)
 */
export const sendChatMessageSync = async (messages: ChatMessage[]): Promise<ChatResponse> => {
  const url = 'https://api-integrations.appmedo.com/app-8mth6gdsxz40/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ contents: messages }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.status === 999) {
      throw new Error(errorData.msg || 'API request failed');
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// ============================================
// Text-to-Video API
// ============================================

export interface TextToVideoRequest {
  model_name?: 'kling-v1' | 'kling-v1-6' | 'kling-v2-master' | 'kling-v2-1-master' | 'kling-v2-5-turbo';
  prompt: string;
  negative_prompt?: string;
  cfg_scale?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  duration?: '5' | '10';
  callback_url?: string;
  external_task_id?: string;
}

export interface VideoTaskResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
    task_status_msg?: string;
    task_info?: {
      external_task_id?: string;
    };
    created_at: number;
    updated_at: number;
    task_result?: {
      videos: Array<{
        id: string;
        url: string;
        duration: string;
      }>;
    };
  };
}

/**
 * Create a text-to-video generation task
 */
export const createTextToVideo = async (request: TextToVideoRequest): Promise<VideoTaskResponse> => {
  const url = 'https://api-integrations.appmedo.com/app-8mth6gdsxz40/api-DY8MX5oBQDGa/v1/videos/text2video';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.status === 999) {
      throw new Error(errorData.msg || 'Video generation failed');
    }
    throw new Error(`Video generation failed: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Query text-to-video generation task status
 */
export const queryTextToVideo = async (taskId: string): Promise<VideoTaskResponse> => {
  const url = `https://api-integrations.appmedo.com/app-8fsm78964c1t/api-Q9KW2qRywm89/v1/videos/text2video/${taskId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.status === 999) {
      throw new Error(errorData.msg || 'Failed to query video status');
    }
    throw new Error(`Failed to query video status: ${response.statusText}`);
  }
  
  return response.json();
};

// ============================================
// Image-to-Video API
// ============================================

export interface ImageToVideoRequest {
  model_name?: 'kling-v1' | 'kling-v1-5' | 'kling-v1-6' | 'kling-v2-master' | 'kling-v2-1' | 'kling-v2-1-master' | 'kling-v2-5-turbo';
  image: string; // Base64 or URL
  prompt?: string;
  duration?: '5' | '10';
}

/**
 * Create an image-to-video generation task
 */
export const createImageToVideo = async (request: ImageToVideoRequest): Promise<VideoTaskResponse> => {
  const url = 'https://api-integrations.appmedo.com/app-8mth6gdsxz40/api-6LeB8Qe4rWGY/v1/videos/image2video';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.status === 999) {
      throw new Error(errorData.msg || 'Image-to-video generation failed');
    }
    throw new Error(`Image-to-video generation failed: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Query image-to-video generation task status
 */
export const queryImageToVideo = async (taskId: string): Promise<VideoTaskResponse> => {
  const url = `https://api-integrations.appmedo.com/app-8fsm78964c1t/api-o9wN7X5E3nga/v1/videos/image2video/${taskId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.status === 999) {
      throw new Error(errorData.msg || 'Failed to query image-to-video status');
    }
    throw new Error(`Failed to query image-to-video status: ${response.statusText}`);
  }
  
  return response.json();
};

// ============================================
// Nano Banana Image Generation API
// ============================================

export interface ImageGenerationRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: 'image/png' | 'image/jpeg' | 'image/webp';
        data: string; // Base64 without prefix
      };
    }>;
  }>;
}

export interface ImageGenerationResponse {
  status: number;
  msg: string;
  candidates: Array<{
    content: {
      role: string;
      parts: Array<{
        text: string; // Contains markdown with base64 image
      }>;
    };
    finishReason: string;
    safetyRatings: unknown[];
  }>;
}

/**
 * Generate image from text or image+text
 * Timeout should be set to 300s
 */
export const generateImage = async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  const url = 'https://api-integrations.appmedo.com/app-8mth6gdsxz40/api-Xa6JZ58oPMEa/v1beta/models/gemini-3-pro-image-preview:generateContent';
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s timeout
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.status === 999) {
        throw new Error(errorData.msg || 'Image generation failed');
      }
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Image generation timed out after 5 minutes');
    }
    throw error;
  }
};

/**
 * Extract base64 image from markdown response
 */
export const extractImageFromMarkdown = (markdown: string): string | null => {
  const match = markdown.match(/!\[image\]\(data:image\/[^;]+;base64,([^)]+)\)/);
  return match ? match[1] : null;
};

/**
 * Convert base64 to blob URL for display
 */
export const base64ToBlob = (base64: string, mimeType = 'image/png'): string => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
};
