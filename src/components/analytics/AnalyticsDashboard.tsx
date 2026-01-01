import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { socialAnalytics } from '@/services/socialAnalytics';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    Eye,
    MessageSquare,
    Share2,
    RefreshCw,
    Youtube,
    Instagram,
    Music,
    Twitter,
    Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AnalyticsDashboard() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadAnalytics();
        }
    }, [user]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const history = await socialAnalytics.getHistory(user!.id);
            setData(history);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            toast.error('Erreur lors du chargement des données analytiques');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await socialAnalytics.refreshAllStats(user!.id);
            toast.success('Données actualisées');
            await loadAnalytics();
        } catch (error) {
            toast.error('Échec de l\'actualisation');
        } finally {
            setRefreshing(false);
        }
    };

    const getLatestStats = () => {
        if (data.length === 0) return { followers: 0, views: 0 };
        // Simplified: take the sum of latest for each platform
        const latestByPlatform: Record<string, any> = {};
        data.forEach(d => {
            latestByPlatform[d.platform] = d;
        });

        return Object.values(latestByPlatform).reduce((acc, curr) => ({
            followers: acc.followers + (curr.follower_count || 0),
            views: acc.views + (curr.total_views_30d || 0)
        }), { followers: 0, views: 0 });
    };

    const stats = getLatestStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">Performance globale de vos réseaux sociaux.</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Abonnés</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.followers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +2.5% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vues (30j)</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +12.1% par rapport au mois dernier
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taux d'engagement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8%</div>
                        <p className="text-xs text-muted-foreground">
                            Stable
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Partages</CardTitle>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">842</div>
                        <p className="text-xs text-muted-foreground">
                            +18% cette semaine
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Croissance de l'Audience</CardTitle>
                    <CardDescription>Évolution du nombre d'abonnés cumulés sur 30 jours.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="snapshot_date"
                                tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            />
                            <YAxis />
                            <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString('fr-FR')} />
                            <Area
                                type="monotone"
                                dataKey="follower_count"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorFollowers)"
                                name="Abonnés"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Activité par Plateforme</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="snapshot_date" hide />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="total_views_30d" stroke="#10b981" name="Vues" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Plateformes</CardTitle>
                        <CardDescription>Répartition de votre audience par réseau.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(
                                data.reduce((acc, curr) => {
                                    if (!acc[curr.platform]) acc[curr.platform] = 0;
                                    acc[curr.platform] = Math.max(acc[curr.platform], curr.follower_count || 0);
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([platform, followers]) => {
                                const total = Object.values(data.reduce((acc, curr) => {
                                    if (!acc[curr.platform]) acc[curr.platform] = 0;
                                    acc[curr.platform] = Math.max(acc[curr.platform], curr.follower_count || 0);
                                    return acc;
                                }, {} as Record<string, number>)).reduce((a, b) => a + b, 0);

                                const percentage = total > 0 ? Math.round((followers / total) * 100) : 0;

                                const PlatformIcon = {
                                    youtube: Youtube,
                                    instagram: Instagram,
                                    tiktok: Music,
                                    twitter: Twitter,
                                    linkedin: Linkedin
                                }[platform as string] || TrendingUp;

                                const color = {
                                    youtube: 'text-red-500',
                                    instagram: 'text-pink-500',
                                    tiktok: 'text-black',
                                    twitter: 'text-blue-400',
                                    linkedin: 'text-blue-700'
                                }[platform as string] || 'text-primary';

                                const bgColor = {
                                    youtube: 'bg-red-500',
                                    instagram: 'bg-pink-500',
                                    tiktok: 'bg-black',
                                    twitter: 'bg-blue-400',
                                    linkedin: 'bg-blue-700'
                                }[platform as string] || 'bg-primary';

                                return (
                                    <div key={platform} className="flex items-center gap-4">
                                        <PlatformIcon className={`h-4 w-4 ${color}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none capitalize">{platform}</p>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full transition-all" style={{ width: `${percentage}%`, backgroundColor: bgColor.replace('bg-', '') }} />
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium">{percentage}%</div>
                                    </div>
                                );
                            })}
                            {data.length === 0 && (
                                <p className="text-center text-muted-foreground text-sm py-8">
                                    Aucune donnée par plateforme disponible.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
