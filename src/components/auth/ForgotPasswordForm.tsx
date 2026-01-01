
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSubmitted(true);
            toast.success("Email envoyé ! Vérifiez votre boîte de réception.");
        } catch (error: any) {
            toast.error(error.message || "Impossible d'envoyer l'email");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Email envoyé</CardTitle>
                    <CardDescription>
                        Si un compte existe pour {email}, vous recevrez un lien de réinitialisation.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                        Retour à la connexion
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Mot de passe oublié ?</CardTitle>
                <CardDescription>
                    Entrez votre email pour recevoir un lien de réinitialisation.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Envoyer le lien"}
                    </Button>
                    <Button variant="ghost" className="w-full" type="button" onClick={() => navigate('/login')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
