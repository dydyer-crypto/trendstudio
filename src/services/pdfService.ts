import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { ConsultantReport } from './aiConsultant';

export class PDFService {
    private static instance: PDFService;

    private constructor() { }

    static getInstance(): PDFService {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }

    async generateQuotePDF(report: ConsultantReport & { url: string }): Promise<void> {
        const doc = new jsPDF();
        const primaryColor = [79, 70, 229]; // Indigo-600

        // Header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('TRENDSTUDIO', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('STRATÉGIE DE REFONTE IA', 20, 32);

        // Client Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROPOSITION COMMERCIALE', 20, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Site Web : ${report.url}`, 20, 62);
        doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 20, 67);
        doc.text(`Validité : 30 jours`, 20, 72);

        // Summary
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSUMÉ STRATÉGIQUE', 20, 85);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(report.summary, 170);
        doc.text(summaryLines, 20, 92);

        let yPos = 92 + (summaryLines.length * 5) + 10;

        // Action Plan Table
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PRÉCONISÉ', 20, yPos);
        yPos += 5;

        (doc as any).autoTable({
            startY: yPos,
            head: [['Action', 'Priorité', 'Effort Estime']],
            body: report.action_plan.map(a => [
                a.title,
                a.priority.toUpperCase(),
                a.estimated_effort
            ]),
            headStyles: { fillColor: primaryColor },
            margin: { left: 20, right: 20 },
            theme: 'striped'
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Budget Table
        doc.setFont('helvetica', 'bold');
        doc.text('DÉTAIL DE L\'INVESTISSEMENT', 20, yPos);
        yPos += 5;

        (doc as any).autoTable({
            startY: yPos,
            head: [['Description', 'Prix (EUR)']],
            body: [
                ...report.budget_estimate.items.map(i => [i.description, `${i.price.toLocaleString()} €`]),
                [{ content: 'TOTAL ESTIMÉ', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                { content: `${report.budget_estimate.total.toLocaleString()} €`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
            ],
            headStyles: { fillColor: primaryColor },
            margin: { left: 20, right: 20 },
            theme: 'grid'
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                'Propulsé par TrendStudio AI Consultant - Document confidentiel destiné au client.',
                105,
                285,
                { align: 'center' }
            );
        }

        doc.save(`Devis_TrendStudio_${report.url.replace(/https?:\/\/|\/|www\./g, '')}.pdf`);
    }
}

export const pdfService = PDFService.getInstance();
