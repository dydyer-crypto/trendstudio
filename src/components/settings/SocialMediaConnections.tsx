import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { socialAuth, type PlatformCredential, type SocialPlatform } from '@/services/socialAuth';
import { toast } from 'sonner';
import {
    Youtube,
    Instagram,
    Music,
    Twitter,
    Facebook,
    Linkedin,
    Plus,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';

const PLATFORM_CONFIG = {
    youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    tiktok: { name: 'TikTok', icon: Music, color: 'text-black' },
    twitter: { name: 'Twitter/X', icon: Twitter, color: 'text-blue-500' },
    facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
};

export function SocialMediaConnections() {
    const [connections, setConnections] = useState<PlatformCredential[]>([]);
    const [loading, setLoading] = useState<Record<SocialPlatform, boolean>>({} as any);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadConnections();
        }
    }, [user]);

    const loadConnections = async () => {
        if (!user) return;

        try {
            const creds = await socialAuth.getCredentials(user.id);
            setConnections(creds);
        } catch (error) {
            console.error('Failed to load connections:', error);
            toast.error('Erreur lors du chargement des connexions');
        }
    };

    const handleConnect = async (platform: SocialPlatform) => {
        if (!user) return;

        setLoading(prev => ({ ...prev, [platform]: true }));

        try {
            const authUrl = socialAuth.generateAuthUrl(platform);

            // Open OAuth popup
            const popup = window.open(
                authUrl,
                `connect-${platform}`,
                'width=600,height=700,scrollbars=yes,resizable=yes'
            );

            if (!popup) {
                toast.error('Impossible d\'ouvrir la fenêtre de connexion. Vérifiez votre bloqueur de popups.');
                setLoading(prev => ({ ...prev, [platform]: false }));
                return;
            }

            // Listen for popup messages
            const messageHandler = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'OAUTH_CALLBACK' && event.data.platform === platform) {
                    window.removeEventListener('message', messageHandler);
                    popup.close();

                    try {
                        // Exchange code for token
                        const tokenData = await socialAuth.exchangeCodeForToken(platform, event.data.code);

                        // Store credentials
                        await socialAuth.storeCredentials({
                            user_id: user.id,
                            platform,
                            account_name: tokenData.account_name || `Account ${Date.now()}`,
                            account_id: tokenData.account_id || tokenData.id || '',
                            access_token: tokenData.access_token,
                            refresh_token: tokenData.refresh_token,
                            token_expires_at: tokenData.expires_in
                                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                                : undefined,
                            scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
                            metadata: {},
                            is_active: true,
                        });

                        toast.success(`Connexion ${PLATFORM_CONFIG[platform].name} réussie !`);
                        await loadConnections();
                    } catch (error) {
                        console.error('OAuth callback error:', error);
                        toast.error('Erreur lors de la connexion au compte');
                    }

                    setLoading(prev => ({ ...prev, [platform]: false }));
                }
            };

            window.addEventListener('message', messageHandler);

            // Check if popup is closed without completing OAuth
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                    setLoading(prev => ({ ...prev, [platform]: false }));
                }
            }, 1000);

        } catch (error) {
            console.error('Connect error:', error);
            toast.error('Erreur lors de la connexion');
            setLoading(prev => ({ ...prev, [platform]: false }));
        }
    };

    const handleDisconnect = async (connection: PlatformCredential) => {
        if (!user) return;

        try {
            await socialAuth.removeCredentials(user.id, connection.platform, connection.account_id);
            toast.success(`Déconnexion de ${PLATFORM_CONFIG[connection.platform].name} réussie`);
            await loadConnections();
        } catch (error) {
            console.error('Disconnect error:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const isConnected = (platform: SocialPlatform) => {
        return connections.some(conn => conn.platform === platform && conn.is_active);
    };

    const getConnectionForPlatform = (platform: SocialPlatform) => {
        return connections.find(conn => conn.platform === platform && conn.is_active);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((platform) => {
                    const config = PLATFORM_CONFIG[platform];
                    const Icon = config.icon;
                    const connected = isConnected(platform);
                    const connection = getConnectionForPlatform(platform);
                    const isLoading = loading[platform];

                    return (
                        <Card key={platform} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                        <CardTitle className="text-lg">{config.name}</CardTitle>
                                    </div>
                                    {connected ? (
                                        <Badge variant="secondary" className="flex items-center space-x-1">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            <span>Connecté</span>
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="flex items-center space-x-1">
                                            <XCircle className="h-3 w-3 text-gray-400" />
                                            <span>Non connecté</span>
                                        </Badge>
                                    )}
                                </div>
                                {connected && connection && (
                                    <CardDescription>
                                        {connection.account_name}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {connected ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDisconnect(connection!)}
                                        className="w-full"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Déconnecter
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleConnect(platform)}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {isLoading ? 'Connexion...' : 'Connecter'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-sm text-muted-foreground">
                <p>
                    Connectez vos comptes de réseaux sociaux pour permettre la publication automatique
                    de vos contenus programmés dans le calendrier.
                </p>
            </div>
        </div>
    );
}