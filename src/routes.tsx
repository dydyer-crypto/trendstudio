import HomePage from './pages/HomePage';
import VideoGeneratorPage from './pages/VideoGeneratorPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import ChatAssistantPage from './pages/ChatAssistantPage';
import ScriptToVideoPage from './pages/ScriptToVideoPage';
import VideoEditorPage from './pages/VideoEditorPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AffiliatePage from './pages/AffiliatePage';
import CalendarPage from './pages/CalendarPage';
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
  },
  {
    name: 'Pricing',
    path: '/pricing',
    element: <PricingPage />
  },
  {
    name: 'Affiliation',
    path: '/affiliate',
    element: <AffiliatePage />
  },
  {
    name: 'Calendrier',
    path: '/calendar',
    element: <CalendarPage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false
  },
  {
    name: 'Payment Success',
    path: '/payment-success',
    element: <PaymentSuccessPage />,
    visible: false
  },
  {
    name: 'Orders',
    path: '/orders',
    element: <OrderHistoryPage />,
    visible: false
  }
];

export default routes;
