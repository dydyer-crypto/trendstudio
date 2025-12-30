import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Image as ImageIcon, 
  MessageSquare, 
  FileText, 
  Scissors, 
  Menu,
  Moon,
  Sun,
  Sparkles,
  CreditCard,
  ShoppingBag,
  LogOut,
  User,
  LogIn
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

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'AI Video Generator', path: '/video-generator', icon: <Video className="w-5 h-5" /> },
  { name: 'AI Image Generator', path: '/image-generator', icon: <ImageIcon className="w-5 h-5" /> },
  { name: 'AI Chat Assistant', path: '/chat-assistant', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Script to Video', path: '/script-to-video', icon: <FileText className="w-5 h-5" /> },
  { name: 'Video Editor', path: '/video-editor', icon: <Scissors className="w-5 h-5" /> },
  { name: 'Pricing', path: '/pricing', icon: <CreditCard className="w-5 h-5" /> },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
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
            <span className="font-medium">{item.name}</span>
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
          <span>Sign In</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <User className="w-4 h-4" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{profile?.username || 'User'}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {profile?.credits || 0} credits
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/pricing')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Buy Credits
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/orders')}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Order History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">TrendStudio</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavContent />
          </div>

          {/* User Menu & Dark Mode Toggle */}
          <div className="p-4 border-t border-border space-y-2">
            <UserMenu />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="w-full justify-start gap-2"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TrendStudio</span>
            </Link>

            <div className="flex items-center gap-2">
              {user && profile && (
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {profile.credits}
                </Badge>
              )}
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
                      <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">TrendStudio</span>
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
