import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, ChevronLeft, Lightbulb, Award, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Tutorial, TutorialStep } from '@/types';

interface TutorialOverlayProps {
  tutorial: Tutorial;
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function TutorialOverlay({ tutorial, onComplete, onSkip, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = tutorial.steps[currentStep];
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;
  const isLastStep = currentStep === tutorial.steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // Highlight target element if specified
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1001';
      }
    } else {
      setHighlightedElement(null);
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.zIndex = '';
      }
    };
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (isLastStep) {
      // Tutorial completed
      toast.success('🎉 Tutoriel terminé !', {
        description: tutorial.badge ? `Vous avez gagné le badge "${tutorial.badge.name}"` : undefined,
      });
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    toast.info('Tutoriel ignoré', {
      description: 'Vous pouvez le reprendre à tout moment depuis les paramètres.',
    });
  };

  // Calculate position for the tutorial card
  const getCardPosition = () => {
    if (!step.target || !highlightedElement) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const cardWidth = 400;
    const cardHeight = 300;
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - cardHeight - padding;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.left - cardWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.right + padding;
        break;
      default:
        top = window.innerHeight / 2 - cardHeight / 2;
        left = window.innerWidth / 2 - cardWidth / 2;
    }

    // Ensure card stays within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - cardHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" onClick={onClose} />

      {/* Highlight ring around target element */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-[1001]"
          style={{
            top: `${highlightedElement.getBoundingClientRect().top - 4}px`,
            left: `${highlightedElement.getBoundingClientRect().left - 4}px`,
            width: `${highlightedElement.getBoundingClientRect().width + 8}px`,
            height: `${highlightedElement.getBoundingClientRect().height + 8}px`,
            border: '3px solid hsl(var(--primary))',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {/* Tutorial card */}
      <Card className="w-full max-w-md z-[1002]" style={getCardPosition()}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  Étape {currentStep + 1}/{tutorial.steps.length}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tutorial.category}
                </Badge>
              </div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {step.description}
          </CardDescription>

          {step.tip && (
            <div className="flex gap-3 p-3 rounded-lg bg-accent/50 border border-primary/20">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{step.tip}</p>
            </div>
          )}

          {isLastStep && tutorial.badge && (
            <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Badge débloqué !</p>
                <p className="text-xs text-muted-foreground">{tutorial.badge.description}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Ignorer
          </Button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-2">
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
