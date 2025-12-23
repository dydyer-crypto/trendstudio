import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Video, 
  Image as ImageIcon, 
  MessageSquare, 
  FileText, 
  Scissors, 
  Menu,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
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
              <span className="text-2xl font-bold gradient-text">VIRALIX</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavContent />
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-4 border-t border-border">
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
              <span className="text-xl font-bold gradient-text">VIRALIX</span>
            </Link>

            <div className="flex items-center gap-2">
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
                        <span className="text-2xl font-bold gradient-text">VIRALIX</span>
                      </Link>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                      <NavContent />
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
