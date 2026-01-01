import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, Plus, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Keyword {
    id: string;
    keyword: string;
    position: number;
    search_volume: number;
    difficulty: number;
    change: number;
}

interface KeywordTrackerProps {
    suggestions?: Array<{
        keyword: string;
        volume: number;
        difficulty: number;
        relevance: number;
    }>;
}

export function KeywordTracker({ suggestions = [] }: KeywordTrackerProps) {
    const [newKeyword, setNewKeyword] = useState("");
    const [keywords, setKeywords] = useState<Keyword[]>([
        { id: "1", keyword: "création site web", position: 4, search_volume: 1200, difficulty: 45, change: 2 },
        { id: "2", keyword: "agence seo paris", position: 12, search_volume: 450, difficulty: 80, change: -1 },
    ]);

    const handleAdd = (keyword: string, volume?: number, difficulty?: number) => {
        const k = keyword || newKeyword;
        if (!k.trim()) return;

        setKeywords([{
            id: Math.random().toString(),
            keyword: k,
            position: Math.floor(Math.random() * 100) + 1,
            search_volume: volume || Math.floor(Math.random() * 1000),
            difficulty: difficulty || Math.floor(Math.random() * 100),
            change: 0
        }, ...keywords]);
        setNewKeyword("");
    };

    return (
        <div className="space-y-8">
            {suggestions.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="text-primary h-5 w-5" /> Mots-clés suggérés par l'IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, idx) => (
                                <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-white transition-colors gap-2"
                                    onClick={() => handleAdd(s.keyword, s.volume, s.difficulty)}
                                >
                                    {s.keyword}
                                    <span className="text-[10px] opacity-70">Vol: {s.volume}</span>
                                    <Plus size={10} />
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" /> Vos positions
                        </h3>
                        <p className="text-sm text-muted-foreground">Suivez l'évolution de vos mots-clés stratégiques.</p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nouveau mot-clé..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="max-w-sm h-10"
                        />
                        <Button onClick={() => handleAdd("")} size="sm" className="h-10">
                            Ajouter
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Mot-clé</TableHead>
                                <TableHead className="text-right">Position</TableHead>
                                <TableHead className="text-right">Volume</TableHead>
                                <TableHead className="text-right">Difficulté</TableHead>
                                <TableHead className="text-right">Évolution 7j</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keywords.map((k) => (
                                <TableRow key={k.id} className="hover:bg-muted/30">
                                    <TableCell className="font-semibold">{k.keyword}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-block px-2 py-1 rounded bg-muted font-bold ${k.position <= 3 ? 'text-yellow-600' : k.position <= 10 ? 'text-primary' : ''}`}>
                                            {k.position}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{k.search_volume}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={k.difficulty > 70 ? "destructive" : k.difficulty > 40 ? "secondary" : "outline"}>
                                            {k.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {k.change > 0 && <ArrowUp className="h-4 w-4 text-green-500" />}
                                            {k.change < 0 && <ArrowDown className="h-4 w-4 text-red-500" />}
                                            {k.change === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                                            <span className={`text-sm font-medium ${k.change > 0 ? "text-green-500" : k.change < 0 ? "text-red-500" : ""}`}>
                                                {Math.abs(k.change)}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
