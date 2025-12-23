import HomePage from './pages/HomePage';
import VideoGeneratorPage from './pages/VideoGeneratorPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import ChatAssistantPage from './pages/ChatAssistantPage';
import ScriptToVideoPage from './pages/ScriptToVideoPage';
import VideoEditorPage from './pages/VideoEditorPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Video Generator',
    path: '/video-generator',
    element: <VideoGeneratorPage />
  },
  {
    name: 'Image Generator',
    path: '/image-generator',
    element: <ImageGeneratorPage />
  },
  {
    name: 'Chat Assistant',
    path: '/chat-assistant',
    element: <ChatAssistantPage />
  },
  {
    name: 'Script to Video',
    path: '/script-to-video',
    element: <ScriptToVideoPage />
  },
  {
    name: 'Video Editor',
    path: '/video-editor',
    element: <VideoEditorPage />
  }
];

export default routes;
