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
        const secondaryColor = [31, 41, 55]; // Gray-800

        // --- Header Block ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('TRENDSTUDIO', 20, 28);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Agence de Stratégie Digitale & IA', 20, 36);

        // Company Contact Info (Right Aligned)
        doc.setFontSize(9);
        doc.text('128 Rue de la Boétie, 75008 Paris', 190, 20, { align: 'right' });
        doc.text('contact@trendstudio.ai', 190, 26, { align: 'right' });
        doc.text('+33 1 23 45 67 89', 190, 32, { align: 'right' });
        doc.text('www.trendstudio.ai', 190, 38, { align: 'right' });

        // --- Document Title & Client Info ---
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROPOSITION COMMERCIALE DE REFONTE', 20, 65);

        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.line(20, 68, 80, 68);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Destinataire :', 20, 80);
        doc.setFont('helvetica', 'normal');
        doc.text(`Analyse du site : ${report.url}`, 20, 86);

        // Meta Data (Box)
        doc.setFillColor(249, 250, 251);
        doc.rect(140, 75, 50, 25, 'F');
        doc.setFontSize(9);
        doc.text(`Devis N° : TS-${Math.floor(Math.random() * 10000)}`, 145, 82);
        doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 145, 88);
        doc.text(`Validité : 30 jours`, 145, 94);

        // --- Content Section ---
        let yPos = 110;

        // Summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('1. RÉSUMÉ DE LA STRATÉGIE IA', 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        const summaryLines = doc.splitTextToSize(report.summary, 170);
        doc.text(summaryLines, 20, yPos);

        yPos += (summaryLines.length * 5) + 15;

        // Redesign Variants
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('2. VARIANTES STRATÉGIQUES PROPOSÉES', 20, yPos);
        yPos += 8;

        report.redesign_variants.forEach((v, idx) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(`${v.title} (${v.type})`, 25, yPos);
            yPos += 5;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const variantLines = doc.splitTextToSize(`Focus: ${v.focus} - ${v.description}`, 160);
            doc.text(variantLines, 25, yPos);
            yPos += (variantLines.length * 4) + 5;

            if (yPos > 260) {
                doc.addPage();
                yPos = 30;
            }
        });

        yPos += 5;

        // Action Plan
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('3. PLAN D\'ACTION PRÉCONISÉ', 20, yPos);
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
            theme: 'striped',
            styles: { fontSize: 9 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Check if we need a new page for budget
        if (yPos > 220) {
            doc.addPage();
            yPos = 30;
        }

        // Budget
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('3. DÉTAIL DE L\'INVESTISSEMENT', 20, yPos);
        yPos += 5;

        (doc as any).autoTable({
            startY: yPos,
            head: [['Description des services', 'Prix HT (EUR)']],
            body: [
                ...report.budget_estimate.items.map(i => [i.description, `${i.price.toLocaleString()} €`]),
                [{ content: 'TOTAL ESTIMÉ (HT)', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                { content: `${report.budget_estimate.total.toLocaleString()} €`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
            ],
            headStyles: { fillColor: primaryColor },
            margin: { left: 20, right: 20 },
            theme: 'grid',
            styles: { fontSize: 9 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 20;

        // --- Legal & footer ---
        if (yPos > 240) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('CONDITIONS & MENTIONS LÉGALES', 20, yPos);
        yPos += 8;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const legalNotices = [
            "- Paiement : Acompte de 30% à la validation, le solde à la livraison.",
            "- Délais : Les délais sont donnés à titre indicatif et courent à partir de la réception du contenu.",
            "- Inclus : Maintenance corrective pendant 3 mois après mise en ligne.",
            "- Propriété : Le client devient propriétaire du code et du design après paiement intégral.",
            "- TrendStudio est une marque déposée. SIRET : 123 456 789 00012 - RCS Paris."
        ];
        legalNotices.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 5;
        });

        // Footer for all pages
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `TrendStudio AI Consultant - Devis TS-CONFIDENTIAL - Page ${i}/${pageCount}`,
                105,
                290,
                { align: 'center' }
            );
        }

        doc.save(`Devis_Refonte_${report.url.replace(/https?:\/\/|\/|www\./g, '')}.pdf`);
    }
}

export const pdfService = PDFService.getInstance();
