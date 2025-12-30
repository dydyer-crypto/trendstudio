import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { toast } from 'sonner';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    toast.success(t('settings.languageChanged'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          <span className="mr-2">🇫🇷</span>
          {t('settings.french')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <span className="mr-2">🇬🇧</span>
          {t('settings.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
