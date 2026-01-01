import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Real Dashboard Component */}
      <AnalyticsDashboard />

      {/* Info Card */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            À propos des Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Suivez la performance de votre contenu sur toutes les plateformes pour comprendre ce qui résonne avec votre audience.
          </p>
          <p>
            Utilisez ces insights pour optimiser votre stratégie de contenu et créer des posts plus engageants.
          </p>
          <p className="text-xs italic">
            Note : Les données sont récupérées directement depuis vos comptes connectés. Assurez-vous d'avoir connecté vos comptes dans les paramètres API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
