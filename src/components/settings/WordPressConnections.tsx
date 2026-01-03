import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { wordpressService, type WordPressSite } from '@/services/wordpressService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Plus,
    Globe,
    Settings,
    Trash2,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Key,
    Link as LinkIcon
} from 'lucide-react';

interface WordPressConnectionFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

function WordPressConnectionForm({ onSuccess, onClose }: WordPressConnectionFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        site_name: '',
        site_url: '',
        username: '',
        application_password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // Construct API URL from site URL
            const apiUrl = formData.site_url.replace(/\/$/, '') + '/wp-json/wp/v2/';

            const siteData = {
                user_id: user.id,
                site_name: formData.site_name,
                site_url: formData.site_url,
                api_url: apiUrl,
                username: formData.username,
                application_password: formData.application_password,
                is_active: true
            };

            await wordpressService.connectSite(siteData);

            toast.success('Site WordPress connecté avec succès !');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la connexion WordPress');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="site_name">Nom du site</Label>
                    <Input
                        id="site_name"
                        placeholder="Mon Blog WordPress"
                        value={formData.site_name}
                        onChange={(e) => handleInputChange('site_name', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="site_url">URL du site WordPress</Label>
                    <Input
                        id="site_url"
                        type="url"
                        placeholder="https://monsite.com"
                        value={formData.site_url}
                        onChange={(e) => handleInputChange('site_url', e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        L'URL complète de votre site WordPress (avec https://)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur WordPress</Label>
                    <Input
                        id="username"
                        placeholder="admin"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="application_password">Mot de passe d'application</Label>
                    <Input
                        id="application_password"
                        type="password"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={formData.application_password}
                        onChange={(e) => handleInputChange('application_password', e.target.value)}
                        required
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>Créez un mot de passe d'application dans WordPress :</p>
                        <p>1. Allez dans Utilisateurs → Profil</p>
                        <p>2. Descendez à "Mots de passe d'application"</p>
                        <p>3. Nommez-le "TrendStudio" et générez</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Annuler
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Connexion...' : 'Connecter le site'}
                </Button>
            </div>
        </form>
    );
}

export function WordPressConnections() {
    const { user } = useAuth();
    const [sites, setSites] = useState<WordPressSite[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadSites();
        }
    }, [user]);

    const loadSites = async () => {
        try {
            setLoading(true);
            const userSites = await wordpressService.getUserSites(user!.id);
            setSites(userSites);
        } catch (error) {
            console.error('Error loading WordPress sites:', error);
            toast.error('Erreur lors du chargement des sites WordPress');
        } finally {
            setLoading(false);
        }
    };

    const handleSiteDelete = async (siteId: string) => {
        try {
            await wordpressService.deleteSite(siteId);
            setSites(prev => prev.filter(site => site.id !== siteId));
            toast.success('Site WordPress supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression du site');
        }
    };

    const handleTestConnection = async (site: WordPressSite) => {
        try {
            const isValid = await wordpressService.testConnection(
                site.api_url,
                site.username,
                site.application_password!
            );

            if (isValid) {
                toast.success('Connexion réussie !');
            } else {
                toast.error('Connexion échouée');
            }
        } catch (error) {
            toast.error('Erreur lors du test de connexion');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-muted rounded-lg"></div>
                    <div className="h-20 bg-muted rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Connection Guide */}
            <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                    <strong>Comment connecter WordPress :</strong> Créez un mot de passe d'application
                    dans WordPress (Utilisateurs → Profil → Mots de passe d'application).
                    Cela permet une connexion sécurisée sans utiliser votre mot de passe principal.
                </AlertDescription>
            </Alert>

            {/* Connected Sites */}
            <div className="space-y-4">
                {sites.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                            <h3 className="font-semibold">Aucun site WordPress connecté</h3>
                            <p className="text-sm text-muted-foreground">
                                Connectez votre site WordPress pour exporter vos contenus directement.
                            </p>
                        </div>
                    </div>
                ) : (
                    sites.map((site) => (
                        <Card key={site.id} className="border-2">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Globe className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{site.site_name}</h3>
                                            <p className="text-sm text-muted-foreground">{site.site_url}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {site.username}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Connecté
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTestConnection(site)}
                                        >
                                            <LinkIcon className="h-4 w-4 mr-2" />
                                            Tester
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(site.site_url, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Visiter
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSiteDelete(site.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add New Site */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full h-12">
                        <Plus className="h-5 w-5 mr-2" />
                        Connecter un site WordPress
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Connecter WordPress</DialogTitle>
                        <DialogDescription>
                            Connectez votre site WordPress pour exporter vos contenus TrendStudio.
                        </DialogDescription>
                    </DialogHeader>
                    <WordPressConnectionForm
                        onSuccess={loadSites}
                        onClose={() => setDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Export Instructions */}
            <Card className="border-dashed">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Settings className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Export vers WordPress</h4>
                            <p className="text-sm text-muted-foreground">
                                Une fois connecté, vous pourrez exporter vos :
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                <li>• Articles de blog générés par AIO</li>
                                <li>• Contenus avec hooks optimisés</li>
                                <li>• Pages avec charte graphique</li>
                                <li>• Templates SEO-ready</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}