
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function MigrationWizard() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            toast.success("Migration terminée ! Redirection vers l'éditeur...");
            navigate("/site-builder"); // Redirect to builder for demo
        }
    };

    return (
        <Card className="max-w-2xl mx-auto mt-8 border-2 border-primary/20">
            <CardHeader>
                <CardTitle>Assistant de Migration</CardTitle>
                <div className="flex gap-2 mt-4">
                    <StepIndicator number={1} current={step} label="Structure" />
                    <div className="h-0.5 w-8 bg-muted self-center" />
                    <StepIndicator number={2} current={step} label="Contenu" />
                    <div className="h-0.5 w-8 bg-muted self-center" />
                    <StepIndicator number={3} current={step} label="Design" />
                </div>
            </CardHeader>
            <CardContent className="py-8 min-h-[200px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Analyse de la structure</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-green-600"><Check size={16} /> 5 pages détectées</li>
                            <li className="flex items-center gap-2 text-green-600"><Check size={16} /> Structure de navigation récupérée</li>
                            <li className="flex items-center gap-2 text-muted-foreground"><Loader size={16} /> Génération du sitemap...</li>
                        </ul>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Import du contenu</h3>
                        <p className="text-muted-foreground">Nous extrayons les textes et images de votre site actuel.</p>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 animate-pulse" />
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Adaptation du design</h3>
                        <p className="text-muted-foreground">Application du nouveau thème moderne tout en conservant votre identité.</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="h-20 bg-muted rounded border-2 border-primary" />
                            <div className="h-20 bg-muted rounded" />
                            <div className="h-20 bg-muted rounded" />
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleNext}>
                    {step === 3 ? "Terminer la migration" : "Continuer"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

function StepIndicator({ number, current, label }: any) {
    const isActive = current >= number;
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {isActive && current > number ? <Check size={14} /> : number}
            </div>
            <span className={`text-xs ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
        </div>
    );
}

function Loader(props: any) {
    return <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" {...props} />
}
