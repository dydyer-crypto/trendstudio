import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SocialCallbackPage() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Determine platform from URL path or state
        const path = window.location.pathname;
        let platform = '';
        if (path.includes('youtube')) platform = 'youtube';
        else if (path.includes('instagram')) platform = 'instagram';
        else if (path.includes('tiktok')) platform = 'tiktok';
        else if (path.includes('facebook')) platform = 'facebook';
        else if (path.includes('twitter')) platform = 'twitter';
        else if (path.includes('linkedin')) platform = 'linkedin';

        if (window.opener) {
            if (error) {
                window.opener.postMessage({ type: 'OAUTH_ERROR', error, platform }, window.location.origin);
            } else if (code) {
                window.opener.postMessage({ type: 'OAUTH_CALLBACK', code, state, platform }, window.location.origin);
            }
        }

        // Close window after a short delay if not closed by opener
        const timer = setTimeout(() => {
            window.close();
        }, 3000);

        return () => clearTimeout(timer);
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle>Authentification en cours</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground text-center">
                        Connexion à votre compte en cours... Cette fenêtre se fermera automatiquement.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
