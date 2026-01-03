
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { pdfService } from "@/services/pdfService";
import type { BrandKit } from "@/services/brandKitService";

interface AIOEditorProps {
    content: string;
    onChange: (content: string) => void;
    onSave: () => void;
    isGenerating: boolean;
    brandKit?: BrandKit | null;
    contentType?: string;
    topic?: string;
}

export function AIOEditor({ content, onChange, onSave, isGenerating, brandKit, contentType, topic }: AIOEditorProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success("Contenu copié dans le presse-papier");
    };

    const handleExportPDF = async () => {
        if (!content.trim() || !topic || !contentType) {
            toast.error("Contenu insuffisant pour l'export PDF");
            return;
        }

        try {
            toast.info("Génération du PDF en cours...");
            await pdfService.generateAIOContentPDF(
                content,
                topic,
                contentType,
                brandKit
            );
            toast.success("PDF exporté avec succès !");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Erreur lors de l'export PDF");
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Contenu Généré</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content}>
                        <Copy className="mr-2 h-4 w-4" /> Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!content}>
                        <FileText className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button size="sm" onClick={onSave} disabled={!content || isGenerating}>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer
                    </Button>
                </div>
            </div>

            <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={isGenerating ? "L'IA rédige votre contenu..." : "Le contenu généré apparaîtra ici."}
                className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed p-4 resize-none focus-visible:ring-1"
            />

            <div className="flex justify-between items-center text-xs text-muted-foreground p-2 border-t">
                <span>{content.split(/\s+/).filter(Boolean).length} mots</span>
                <span>{content.length} caractères</span>
            </div>
        </div>
    );
}
