
import { APIKeyManager } from "@/components/settings/APIKeyManager";
import { WebhookConfig } from "@/components/settings/WebhookConfig";
import { SocialMediaConnections } from "@/components/settings/SocialMediaConnections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function APISettingsPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const { data: keysData } = await supabase.from('api_keys').select('*');
            setKeys(keysData || []);

            const { data: hooksData } = await supabase.from('webhooks').select('*');
            setWebhooks(hooksData || []);
        };
        fetchData();
    }, [user]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API & Intégrations</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos connexions aux services tiers et configurez vos webhooks.
                </p>
            </div>

            {/* Djaboo Affiliate Connection Promo */}
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Rocket size={80} className="rotate-12" />
                </div>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary text-primary-foreground font-bold italic">RECOMMANDÉ</Badge>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Partenaire CRM de TrendStudio</span>
                    </div>
                    <CardTitle className="text-2xl font-extrabold">Boostez votre CRM avec Djaboo</CardTitle>
                    <CardDescription className="text-base max-w-2xl">
                        TrendStudio est nativement optimisé pour Djaboo. Automatisez l'envoi de vos devis, la gestion client et le suivi des projets en un clic.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <Button
                        asChild
                        className="gradient-primary h-12 px-8 text-lg font-bold shadow-lg shadow-primary/20"
                    >
                        <a href="https://auth.djaboo.app/register?aff=Ca4mJWLQeatr" target="_blank" rel="noopener noreferrer">
                            Connecter mon compte Djaboo <ExternalLink className="ml-2 h-5 w-5" />
                        </a>
                    </Button>
                    <p className="text-sm text-muted-foreground italic">
                        Pas encore de compte ? Profitez de l'offre partenaire exclusive en passant par TrendStudio.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Clés API</CardTitle>
                    <CardDescription>
                        Connectez vos comptes OpenAI, Anthropic, etc. pour activer les fonctionnalités IA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <APIKeyManager keys={keys} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>
                        Recevez des notifications HTTP lorsque des événements se produisent (ex: nouveau devis).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <WebhookConfig webhooks={webhooks} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comptes Réseaux Sociaux</CardTitle>
                    <CardDescription>
                        Connectez vos comptes YouTube, Instagram, TikTok, etc. pour la publication automatique.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SocialMediaConnections />
                </CardContent>
            </Card>
        </div>
    );
}
