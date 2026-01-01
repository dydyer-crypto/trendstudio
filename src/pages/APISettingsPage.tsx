
import { APIKeyManager } from "@/components/settings/APIKeyManager";
import { WebhookConfig } from "@/components/settings/WebhookConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
        </div>
    );
}
