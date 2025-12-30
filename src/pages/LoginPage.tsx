import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Gift } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Veuillez entrer votre nom d\'utilisateur et mot de passe');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
      return;
    }

    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Échec de la connexion');
    } else {
      toast.success('Connexion réussie !');
      navigate(from, { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Veuillez entrer votre nom d\'utilisateur et mot de passe');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { error } = await signUp(username, password, referralCode || undefined);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Échec de l\'inscription');
    } else {
      if (referralCode) {
        toast.success('Inscription réussie ! Vous avez reçu des crédits bonus de parrainage !');
      } else {
        toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      }
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 xl:h-8 xl:w-8 text-primary" />
            <CardTitle className="text-2xl xl:text-3xl font-bold gradient-text">TrendStudio</CardTitle>
          </div>
          <CardDescription className="text-sm xl:text-base">
            Connectez-vous pour accéder à votre studio de création de contenu IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralCode && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Bonus de parrainage activé !</p>
                  <p className="text-xs text-muted-foreground">
                    Inscrivez-vous maintenant et recevez 100 crédits gratuits + bonus de parrainage
                  </p>
                </div>
              </div>
            </div>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-sm">Nom d'utilisateur</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                    className="text-sm xl:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="text-sm xl:text-base"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-sm">Nom d'utilisateur</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choisissez un nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                    className="text-sm xl:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Seuls les lettres, chiffres et underscores sont autorisés
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Choisissez un mot de passe (min 6 caractères)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="text-sm xl:text-base"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Création du compte...' : 'Créer un compte'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs xl:text-sm text-muted-foreground">
          <p>Obtenez 100 crédits gratuits lors de votre inscription !</p>
        </CardFooter>
      </Card>
    </div>
  );
}
