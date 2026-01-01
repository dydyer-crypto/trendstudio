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
    redesign_variants: Array<{
        type: string;
        title: string;
        description: string;
        pros: string[];
        focus: string;
    }>;
}

export interface SEOReport {
    scores: {
        global: number;
        on_page: number;
        technical: number;
        content: number;
    };
    keywords: Array<{
        keyword: string;
        volume: number;
        difficulty: number;
        relevance: number;
    }>;
    technical_issues: string[];
    semantic_strategy: string;
}

export interface SocialMediaReport {
    audit: {
        current_state: string;
        strengths: string[];
        weaknesses: string[];
    };
    strategy: {
        target_audience: string;
        tone_of_voice: string;
        content_pillars: Array<{
            name: string;
            description: string;
            frequency: string;
        }>;
    };
    best_platforms: Array<{
        name: string;
        reason: string;
        estimated_growth: string;
    }>;
    viral_hooks: string[];
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
                },
                "redesign_variants": [
                    {
                        "type": "Performance/UX/SEO/Branding",
                        "title": "Nom de la variante",
                        "description": "Explication de l'approche",
                        "pros": ["avantage 1", "avantage 2"],
                        "focus": "L'accent principal (ex: Vitesse, Conversion, Design)"
                    }
                ]
            }
            
            IMPORTANT: Propose AU MOINS 4 variantes distinctes (ex: 1. Full Brand Refresh, 2. Conversion Machine, 3. SEO Authority, 4. Tech Performance).
            
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

    async analyzeSEO(url: string): Promise<SEOReport> {
        const prompt = `
            Tu es un Expert SEO Consultant Sénior chez TrendStudio.
            Analyse le SEO du site suivant : ${url}
            
            Génère un rapport d'audit SEO complet au format JSON suivant :
            {
                "scores": {
                    "global": 0-100,
                    "on_page": 0-100,
                    "technical": 0-100,
                    "content": 0-100
                },
                "keywords": [
                    { "keyword": "mot clé 1", "volume": 1200, "difficulty": 45, "relevance": 95 },
                    ... (ajoute 5-8 mots-clés pertinents)
                ],
                "technical_issues": ["problème technique 1", ...],
                "opportunities": ["opportunité 1", ...],
                "semantic_strategy": "Description d'une stratégie de cocon sémantique efficace pour ce site"
            }
            
            Réponds UNIQUEMENT avec le JSON. Sois précis et technique.
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
            console.error('AI SEO analysis failed:', error);
            throw new Error('Échec de l\'analyse SEO par l\'IA Consultant');
        }
    }

    async analyzeSocial(query: string, currentContext?: string): Promise<SocialMediaReport> {
        const prompt = `
            Tu es un Social Media Manager Expert chez TrendStudio.
            Ton objectif est de créer une stratégie d'influence virale et professionnelle.
            
            Sujet/Profil à analyser : ${query}
            Contexte additionnel : ${currentContext || 'Pas de contexte spécifique'}
            
            Génère un rapport de stratégie Social Media complet au format JSON suivant :
            {
                "audit": {
                    "current_state": "Résumé de l'analyse du sujet",
                    "strengths": ["point fort 1", ...],
                    "weaknesses": ["point faible 1", ...]
                },
                "strategy": {
                    "target_audience": "Description de l'audience cible",
                    "tone_of_voice": "Détails sur l'identité verbale",
                    "content_pillars": [
                        { "name": "Pilier 1", "description": "...", "frequency": "X fois par semaine" },
                        ...
                    ]
                },
                "best_platforms": [
                    { "name": "Instagram/TikTok/...", "reason": "...", "estimated_growth": "+30%/mois" },
                    ...
                ],
                "viral_hooks": ["Accroche 1", "Accroche 2", ...]
            }
            
            Réponds UNIQUEMENT avec le JSON. Sois ultra-créatif et axé sur la viralité (Shorts/Reels/TikTok).
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
            console.error('AI Social analysis failed:', error);
            throw new Error('Échec de l\'analyse Social Media par l\'IA Consultant');
        }
    }

    async generateAIOContent(options: {
        type: string;
        topic: string;
        keywords?: string;
        tone?: string;
        language?: string;
    }): Promise<string> {
        const prompt = `
            Tu es un Rédacteur Web Expert & Spécialiste SEO AIO chez TrendStudio.
            Ta mission est de rédiger un contenu de haute qualité, optimisé pour les moteurs de recherche et engageant pour les lecteurs.
            
            TYPE DE CONTENU : ${options.type}
            SUJET : ${options.topic}
            MOTS-CLÉS À INTÉGRER : ${options.keywords || 'Sélectionne les plus pertinents pour le sujet'}
            TON : ${options.tone || 'Équilibré (Professionnel mais accessible)'}
            LANGUE : ${options.language || 'Français'}
            
            DIRECTIVES RÉDACTIONNELLES :
            1. Structure le texte avec des titres (H1, H2, H3) clairs et captivants.
            2. Utilise des paragraphes courts pour une meilleure lisibilité.
            3. Intégre naturellement les mots-clés sans "keyword stuffing".
            4. Ajoute une introduction accrocheuse et une conclusion avec un "Call to Action" (CTA).
            5. Si c'est un article, ajoute une section "FAQ" à la fin.
            6. Si c'est une description produit, mets en avant les bénéfices avant les caractéristiques.
            
            Formatte le résultat en Markdown propre.
        `;

        try {
            const response = await sendChatMessageSync([
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]);

            return response.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('AI AIO Generation failed:', error);
            throw new Error('Échec de la génération de contenu AIO');
        }
    }
}

export const aiConsultant = AIConsultantService.getInstance();
