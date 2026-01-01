
import { ClientList } from "@/components/agency/ClientList";
import { TeamManager } from "@/components/agency/TeamManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AgencyPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Fetch clients
                const { data: clientsData, error: clientsError } = await supabase
                    .from('agency_clients')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (clientsError) throw clientsError;
                setClients(clientsData || []);

                // Fetch team
                const { data: teamData, error: teamError } = await supabase
                    .from('agency_team')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (teamError) throw teamError;
                setTeam(teamData || []);

            } catch (error) {
                console.error("Error fetching agency data:", error);
                toast.error("Erreur lors du chargement des données agence");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const stats = [
        { title: "Total Clients", value: clients.length, icon: Users, desc: "+2 ce mois-ci" },
        { title: "Projets Actifs", value: 12, icon: Briefcase, desc: "En cours de production" }, // Mocked
        { title: "Crédits Utilisés", value: "2,450", icon: CreditCard, desc: "Sur 5,000 alloués" }, // Mocked
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mode Agence</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos clients, votre équipe et votre facturation centralisée.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.desc}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Tabs defaultValue="clients" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="team">Équipe</TabsTrigger>
                    <TabsTrigger value="billing">Facturation</TabsTrigger>
                </TabsList>
                <TabsContent value="clients" className="space-y-4">
                    <ClientList clients={clients} />
                </TabsContent>
                <TabsContent value="team" className="space-y-4">
                    <TeamManager team={team} />
                </TabsContent>
                <TabsContent value="billing">
                    <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">Module de facturation groupée à venir.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
