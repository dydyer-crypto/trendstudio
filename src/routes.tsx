import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import IdeasLabPage from './pages/IdeasLabPage';
import SiteBuilderPage from './pages/SiteBuilderPage';
import SiteEditorPage from './pages/SiteEditorPage';
import SEOAnalysisPage from './pages/SEOAnalysisPage';
import AIOPage from './pages/AIOPage';
import SiteRedesignPage from './pages/SiteRedesignPage';
import QuotesPage from './pages/QuotesPage';
import AgencyPage from './pages/AgencyPage';
import APISettingsPage from './pages/APISettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
import TrendsPage from './pages/TrendsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TutorialsPage from './pages/TutorialsPage';
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
    name: 'Mes Projets',
    path: '/projects',
    element: <ProjectsPage />
  },
  {
    name: "Laboratoire d'Idées",
    path: '/ideas-lab',
    element: <IdeasLabPage />
  },
  {
    name: 'Constructeur de Site',
    path: '/site-builder',
    element: <SiteBuilderPage />
  },
  {
    path: '/site-editor/:id',
    element: <SiteEditorPage />
  },
  {
    name: 'Analyse SEO',
    path: '/seo-analysis',
    element: <SEOAnalysisPage />
  },
  {
    name: 'Générateur AIO',
    path: '/generator-aio',
    element: <AIOPage />
  },
  {
    name: 'Refonte de Site',
    path: '/site-redesign',
    element: <SiteRedesignPage />
  },
  {
    name: 'Devis IA',
    path: '/quotes',
    element: <QuotesPage />
  },
  {
    name: 'Mode Agence',
    path: '/agency',
    element: <AgencyPage />
  },
  {
    name: 'Integrations',
    path: '/settings/api',
    element: <APISettingsPage />
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
    name: 'Tendances',
    path: '/trends',
    element: <TrendsPage />
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <AnalyticsPage />
  },
  {
    name: 'Tutoriels',
    path: '/tutorials',
    element: <TutorialsPage />
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    visible: false
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
    visible: false
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
