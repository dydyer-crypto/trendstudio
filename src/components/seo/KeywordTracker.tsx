
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export interface Keyword {
    id: string;
    keyword: string;
    position: number;
    search_volume: number;
    difficulty: number;
    change: number; // positive for up, negative for down
}

export function KeywordTracker() {
    const [newKeyword, setNewKeyword] = useState("");
    // Mock data
    const [keywords, setKeywords] = useState<Keyword[]>([
        { id: "1", keyword: "création site web", position: 4, search_volume: 1200, difficulty: 45, change: 2 },
        { id: "2", keyword: "agence seo paris", position: 12, search_volume: 450, difficulty: 80, change: -1 },
        { id: "3", keyword: "marketing content ai", position: 1, search_volume: 80, difficulty: 25, change: 0 },
    ]);

    const handleAdd = () => {
        if (!newKeyword.trim()) return;
        setKeywords([...keywords, {
            id: Math.random().toString(),
            keyword: newKeyword,
            position: Math.floor(Math.random() * 100) + 1,
            search_volume: Math.floor(Math.random() * 1000),
            difficulty: Math.floor(Math.random() * 100),
            change: 0
        }]);
        setNewKeyword("");
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Ajouter un mot-clé à suivre..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={handleAdd} size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
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
                            <TableRow key={k.id}>
                                <TableCell className="font-medium">{k.keyword}</TableCell>
                                <TableCell className="text-right font-bold">{k.position}</TableCell>
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
                                        <span className={k.change > 0 ? "text-green-500" : k.change < 0 ? "text-red-500" : ""}>
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
    );
}
