import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Users, DollarSign, TrendingUp, Gift, Share2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import type { Referral } from '@/types';

export default function AffiliatePage() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}/login?ref=${profile.referral_code}`
    : '';

  useEffect(() => {
    loadReferrals();
  }, [profile]);

  const loadReferrals = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des parrainages:', error);
      toast.error('Impossible de charger les parrainages');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Lien de parrainage copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: referrals.length,
    completed: referrals.filter(r => r.status === 'credited').length,
    pending: referrals.filter(r => r.status === 'pending').length,
    earnings: profile?.referral_earnings || 0,
  };

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl xl:text-4xl font-bold">Programme d'affiliation</h1>
        <p className="text-muted-foreground text-base xl:text-lg">
          Parrainez vos amis et gagnez des crédits gratuits
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total parrainages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Personnes invitées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages réussis</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Inscriptions confirmées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Inscriptions en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédits gagnés</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earnings}</div>
            <p className="text-xs text-muted-foreground">
              Crédits de parrainage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Votre lien de parrainage
          </CardTitle>
          <CardDescription>
            Partagez ce lien avec vos amis. Vous recevrez 50 crédits pour chaque inscription réussie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyReferralLink} className="gap-2 shrink-0">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Comment ça marche ?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Partagez votre lien de parrainage unique</li>
                  <li>2. Vos amis s'inscrivent en utilisant votre lien</li>
                  <li>3. Vous recevez 50 crédits gratuits pour chaque inscription</li>
                  <li>4. Vos amis reçoivent également 100 crédits de bienvenue</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des parrainages</CardTitle>
          <CardDescription>
            Liste de toutes vos invitations et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun parrainage pour le moment</p>
              <p className="text-sm mt-2">Commencez à partager votre lien pour gagner des crédits !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Utilisateur invité</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {referral.status === 'credited' && (
                      <span className="text-sm font-medium text-primary">
                        +{referral.reward_amount} crédits
                      </span>
                    )}
                    <Badge
                      variant={
                        referral.status === 'credited'
                          ? 'default'
                          : referral.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {referral.status === 'credited'
                        ? 'Crédité'
                        : referral.status === 'completed'
                        ? 'Complété'
                        : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
