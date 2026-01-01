import { sendChatMessageSync } from './api';

export interface ConsultantReport {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    action_plan: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        estimated_effort: string;
    }>;
    budget_estimate: {
        total: number;
        items: Array<{
            description: string;
            price: number;
        }>;
    };
}

export class AIConsultantService {
    private static instance: AIConsultantService;

    private constructor() { }

    static getInstance(): AIConsultantService {
        if (!AIConsultantService.instance) {
            AIConsultantService.instance = new AIConsultantService();
        }
        return AIConsultantService.instance;
    }

    async analyzeSite(url: string): Promise<ConsultantReport> {
        const prompt = `
            Tu es un Consultant Expert en Stratégie Digitale et Refonte de Site Web chez TrendStudio.
            Analyse le site suivant (simule l'analyse de structure, SEO et UX basée sur l'URL) : ${url}
            
            Génère un rapport détaillé au format JSON suivant :
            {
                "score": 0-100,
                "summary": "Résumé de l'état actuel",
                "strengths": ["point fort 1", ...],
                "weaknesses": ["point faible 1", ...],
                "action_plan": [
                    { "title": "Action 1", "description": "Détails", "priority": "high", "estimated_effort": "2 jours" }
                ],
                "budget_estimate": {
                    "total": 1500,
                    "items": [
                        { "description": "Refonte UI/UX", "price": 800 },
                        { "description": "Optimisation SEO", "price": 700 }
                    ]
                }
            }
            
            Réponds UNIQUEMENT avec le JSON. Sois professionnel et réaliste dans tes estimations.
        `;

        try {
            const response = await sendChatMessageSync([
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]);

            const content = response.candidates[0].content.parts[0].text;
            const jsonStr = content.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('AI Consultant analysis failed:', error);
            throw new Error('Échec de l\'analyse par l\'IA Consultant');
        }
    }
}

export const aiConsultant = AIConsultantService.getInstance();
