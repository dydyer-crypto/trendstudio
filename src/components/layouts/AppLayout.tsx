import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Video,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Scissors,
  Building,
  Settings,
  Menu,
  Moon,
  Sun,
  Sparkles,
  CreditCard,
  ShoppingBag,
  LogOut,
  User,
  LogIn,
  Calendar,
  TrendingUp,
  BarChart3,
  GraduationCap,
  Users,
  Folder,
  Lightbulb,
  Layout,
  Search,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  nameKey: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItems = (t: any): NavItem[] => [
  { nameKey: 'nav.projects', path: '/projects', icon: <Folder className="w-5 h-5" /> },
  { nameKey: 'nav.ideasLab', path: '/ideas-lab', icon: <Lightbulb className="w-5 h-5" /> },
  { nameKey: 'nav.siteBuilder', path: '/site-builder', icon: <Layout className="w-5 h-5" /> },
  { nameKey: 'nav.seoAnalysis', path: '/seo-analysis', icon: <Search className="w-5 h-5" /> },
  { nameKey: 'nav.siteRedesign', path: '/site-redesign', icon: <RefreshCw className="w-5 h-5" /> },
  { nameKey: 'nav.aioGenerator', path: '/generator-aio', icon: <Wand2 className="w-5 h-5" /> },
  { nameKey: 'nav.videoGenerator', path: '/video-generator', icon: <Video className="w-5 h-5" /> },
  { nameKey: 'nav.imageGenerator', path: '/image-generator', icon: <ImageIcon className="w-5 h-5" /> },
  { nameKey: 'nav.chatAssistant', path: '/chat-assistant', icon: <MessageSquare className="w-5 h-5" /> },
  { nameKey: 'nav.scriptToVideo', path: '/script-to-video', icon: <FileText className="w-5 h-5" /> },
  { nameKey: 'nav.videoEditor', path: '/video-editor', icon: <Scissors className="w-5 h-5" /> },
  { nameKey: 'nav.calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
  { nameKey: 'nav.trends', path: '/trends', icon: <TrendingUp className="w-5 h-5" /> },
  { nameKey: 'nav.analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { nameKey: 'nav.tutorials', path: '/tutorials', icon: <GraduationCap className="w-5 h-5" /> },
  { nameKey: 'nav.affiliate', path: '/affiliate', icon: <Users className="w-5 h-5" /> },
  { nameKey: 'nav.quotes', path: '/quotes', icon: <FileText className="w-5 h-5" /> },
  { nameKey: 'nav.agency', path: '/agency', icon: <Building className="w-5 h-5" /> },
  { nameKey: 'nav.pricing', path: '/pricing', icon: <CreditCard className="w-5 h-5" /> },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = getNavItems(t);

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {item.icon}
            <span className="font-medium">{t(item.nameKey)}</span>
          </Link>
        );
      })}
    </nav>
  );

  const UserMenu = () => {
    if (!user) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/login')}
          className="w-full justify-start gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('auth.signIn')}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <User className="w-4 h-4" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{profile?.username || t('nav.profile')}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {profile?.credits || 0} {t('common.credits')}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t('nav.profile')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/pricing')}>
            <CreditCard className="w-4 h-4 mr-2" />
            {t('nav.pricing')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/orders')}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('nav.orderHistory')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings/api')}>
            <Settings className="w-4 h-4 mr-2" />
            {t('nav.integrations')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {t('auth.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text">{t('common.appName')}</span>
                <span className="text-xs text-muted-foreground">{t('common.tagline')}</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavContent />
          </div>

          {/* Menu utilisateur & Basculer mode sombre */}
          <div className="p-4 border-t border-border space-y-2">
            <UserMenu />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="flex-1 justify-start gap-2"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>{t('settings.light')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>{t('settings.dark')}</span>
                  </>
                )}
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text">{t('common.appName')}</span>
                <span className="text-[10px] text-muted-foreground leading-none">{t('common.tagline')}</span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user && profile && (
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {profile.credits}
                </Badge>
              )}
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                      <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                          <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold gradient-text">{t('common.appName')}</span>
                          <span className="text-xs text-muted-foreground">{t('common.tagline')}</span>
                        </div>
                      </Link>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                      <NavContent />
                    </div>
                    <div className="p-4 border-t border-border">
                      <UserMenu />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
