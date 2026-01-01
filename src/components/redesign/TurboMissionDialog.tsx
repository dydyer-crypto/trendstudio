
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Zap, CheckCircle2, Loader2, Globe, Share2, Calendar, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TurboMissionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (url: string) => Promise<void>;
    isProcessing: boolean;
}

export function TurboMissionDialog({ isOpen, onClose, onStart, isProcessing }: TurboMissionDialogProps) {
    const [url, setUrl] = useState("");
    const [step, setStep] = useState(0); // 0: input, 1: processing
    const [currentStep, setCurrentStep] = useState(1); // 1: Audit, 2: Social, 3: Calendar

    const handleStart = async () => {
        if (!url) return;
        setStep(1);
        try {
            // We'll manage internal step highlights based on overall progress if possible, 
            // but since handleTurboMission is one big async call, we'll use intervals for visual effect
            // or pass progress updates if we refactored. For now, visual simulation of progress.
            await onStart(url);
        } catch (error) {
            setStep(0);
        }
    };

    // Simulated progress steps for the UI
    useEffect(() => {
        if (isProcessing) {
            const timer1 = setTimeout(() => setCurrentStep(2), 5000);
            const timer2 = setTimeout(() => setCurrentStep(3), 12000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
            setCurrentStep(1);
        }
    }, [isProcessing]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && onClose()}>
            <DialogContent className="sm:max-w-xl overflow-hidden border-none shadow-2xl p-0">
                <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/5 p-6 md:p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-extrabold flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <Zap className="text-white fill-white w-7 h-7" />
                            </div>
                            Mission IA Turbo
                        </DialogTitle>
                        <DialogDescription className="text-lg">
                            Générez un écosystème digital complet en 60 secondes.
                        </DialogDescription>
                    </DialogHeader>

                    {step === 0 ? (
                        <div className="space-y-6 py-4">
                            <div className="space-y-4">
                                <Label htmlFor="url" className="text-sm font-bold uppercase tracking-widest opacity-70">URL du site cible</Label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                    <Input
                                        id="url"
                                        placeholder="https://mon-client.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="h-14 pl-12 text-lg border-2 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <FeatureMiniCard icon={Rocket} label="Audit IA" />
                                <FeatureMiniCard icon={Share2} label="Stratégie" />
                                <FeatureMiniCard icon={Calendar} label="Planning" />
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-bold gradient-primary shadow-xl hover:scale-[1.02] transition-transform"
                                onClick={handleStart}
                                disabled={!url}
                            >
                                Lancer la Super-Génération <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8 py-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold uppercase tracking-widest mb-2">
                                    <span className="text-primary italic">Intelligence en action...</span>
                                    <span>{currentStep === 1 ? '30%' : currentStep === 2 ? '65%' : '95%'}</span>
                                </div>
                                <Progress value={currentStep === 1 ? 30 : currentStep === 2 ? 65 : 95} className="h-3 bg-primary/10" />
                            </div>

                            <div className="space-y-4">
                                <ProcessStep
                                    icon={Rocket}
                                    label="Analyse Stratégique & Refonte"
                                    status={currentStep > 1 ? 'done' : 'active'}
                                />
                                <ProcessStep
                                    icon={Share2}
                                    label="Élaboration de la Stratégie Sociale"
                                    status={currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : 'pending'}
                                />
                                <ProcessStep
                                    icon={Calendar}
                                    label="Génération du Planning 30 Jours"
                                    status={currentStep === 3 ? 'active' : 'pending'}
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-sm italic items-center">
                                <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                                <p>L'IA Consultant TrendStudio orchestre vos données pour une efficacité maximale.</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function FeatureMiniCard({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
            <Icon size={18} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
    );
}

function ProcessStep({ icon: Icon, label, status }: { icon: any, label: string, status: 'pending' | 'active' | 'done' }) {
    return (
        <div className={cn(
            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500",
            status === 'done' ? "bg-green-500/5 border-green-500/20 opacity-70" :
                status === 'active' ? "bg-primary/5 border-primary/30 shadow-md scale-[1.02]" :
                    "bg-muted/20 border-transparent opacity-40"
        )}>
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                status === 'done' ? "bg-green-500 text-white" :
                    status === 'active' ? "bg-primary text-white animate-pulse" :
                        "bg-muted text-muted-foreground"
            )}>
                {status === 'done' ? <CheckCircle2 size={20} /> : <Icon size={20} />}
            </div>
            <span className={cn(
                "font-bold text-sm",
                status === 'active' ? "text-primary" : "text-foreground"
            )}>{label}</span>
        </div>
    );
}
