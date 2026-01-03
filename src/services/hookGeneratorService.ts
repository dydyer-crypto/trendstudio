import { supabase } from '@/db/supabase';

export interface HookCategory {
    id: string;
    name: string;
    display_name: string;
    description: string;
    psychological_principle: string;
    color: string;
    icon: string;
    success_rate: number;
    usage_count: number;
    examples: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ContentHooks {
    id: string;
    user_id: string;
    topic: string;
    target_audience?: string;
    platform: string;
    category_id?: string;
    generated_hooks: GeneratedHook[];
    best_performing_hook?: string;
    performance_data: Record<string, any>;
    prompt_used?: string;
    ai_model: string;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
}

export interface GeneratedHook {
    id: string;
    text: string;
    category: string;
    category_name: string;
    score: number; // 0-100 based on expected performance
    platform_specific: boolean;
    psychological_impact: string;
}

export interface HookGenerationRequest {
    topic: string;
    target_audience?: string;
    platform: string;
    category?: string; // Specific category or 'all'
    count?: number; // Number of hooks to generate per category
}

export class HookGeneratorService {
    private static instance: HookGeneratorService;

    private constructor() { }

    static getInstance(): HookGeneratorService {
        if (!HookGeneratorService.instance) {
            HookGeneratorService.instance = new HookGeneratorService();
        }
        return HookGeneratorService.instance;
    }

    /**
     * Get all active hook categories
     */
    async getHookCategories(): Promise<HookCategory[]> {
        const { data, error } = await supabase
            .from('hook_categories')
            .select('*')
            .eq('is_active', true)
            .order('usage_count', { ascending: false });

        if (error) {
            console.error('Error fetching hook categories:', error);
            throw new Error('Failed to fetch hook categories');
        }

        return data || [];
    }

    /**
     * Generate hooks for a given topic
     */
    async generateHooks(request: HookGenerationRequest): Promise<GeneratedHook[]> {
        const categories = request.category && request.category !== 'all'
            ? [request.category]
            : ['curiosity', 'fear', 'gain', 'authority', 'social_proof', 'contrast', 'question', 'storytelling'];

        const hooks: GeneratedHook[] = [];
        const hooksPerCategory = request.count || 2;

        // Get category details for prompts
        const { data: categoryData } = await supabase
            .from('hook_categories')
            .select('name, display_name, psychological_principle, examples')
            .in('name', categories);

        const categoryMap = new Map(
            categoryData?.map(cat => [cat.name, cat]) || []
        );

        // Generate hooks for each category
        for (const categoryName of categories) {
            const category = categoryMap.get(categoryName);
            if (!category) continue;

            try {
                const categoryHooks = await this.generateCategoryHooks(
                    request.topic,
                    request.target_audience,
                    request.platform,
                    categoryName,
                    category,
                    hooksPerCategory
                );
                hooks.push(...categoryHooks);
            } catch (error) {
                console.error(`Error generating hooks for category ${categoryName}:`, error);
                // Continue with other categories
            }
        }

        // Sort by expected performance score
        return hooks.sort((a, b) => b.score - a.score);
    }

    /**
     * Generate hooks for a specific category using AI
     */
    private async generateCategoryHooks(
        topic: string,
        targetAudience: string | undefined,
        platform: string,
        categoryName: string,
        category: any,
        count: number
    ): Promise<GeneratedHook[]> {
        const prompt = this.buildHookPrompt(topic, targetAudience, platform, category);

        try {
            // Call AI service to generate hooks
            const aiResponse = await this.callAIGeneration(prompt, count);

            return aiResponse.hooks.map((hookText: string, index: number) => ({
                id: `${categoryName}_${Date.now()}_${index}`,
                text: hookText,
                category: categoryName,
                category_name: category.display_name,
                score: this.calculateHookScore(hookText, categoryName, platform),
                platform_specific: platform !== 'youtube',
                psychological_impact: category.psychological_principle
            }));
        } catch (error) {
            console.error('AI generation error:', error);
            // Fallback to template-based generation
            return this.generateFallbackHooks(topic, targetAudience, platform, categoryName, category, count);
        }
    }

    /**
     * Build AI prompt for hook generation
     */
    private buildHookPrompt(
        topic: string,
        targetAudience: string | undefined,
        platform: string,
        category: any
    ): string {
        const audience = targetAudience ? ` pour ${targetAudience}` : '';

        let platformContext = '';
        switch (platform) {
            case 'youtube':
                platformContext = 'vidéo YouTube de 8-15 secondes';
                break;
            case 'tiktok':
                platformContext = 'vidéo TikTok verticale de 15-60 secondes';
                break;
            case 'instagram':
                platformContext = 'post Instagram (photo/vidéo courte)';
                break;
            case 'linkedin':
                platformContext = 'publication LinkedIn professionnelle';
                break;
            default:
                platformContext = 'contenu digital';
        }

        return `En tant qu'expert en marketing de contenu, génère des accroches (hooks) pour une ${platformContext} sur le sujet "${topic}"${audience}.

Catégorie psychologique : ${category.display_name}
Principe : ${category.psychological_principle}

Exemples de cette catégorie :
${category.examples.slice(0, 2).map((ex: string) => `- "${ex}"`).join('\n')}

RÈGLES IMPORTANTES :
- Chaque accroche doit faire 8-15 mots maximum
- Doit commencer par la technique psychologique appropriée
- Optimisée pour ${platformContext}
- Doit créer un besoin immédiat de continuer à regarder/lire
- Utilise des chiffres, questions, ou comparaisons quand approprié
- Ton : Engageant, mystérieux, ou urgent selon la catégorie

Génère 2 accroches parfaites :`;
    }

    /**
     * Call AI service for hook generation
     */
    private async callAIGeneration(prompt: string, count: number): Promise<{ hooks: string[] }> {
        // TODO: Integrate with actual AI service (Gemini, OpenAI, etc.)
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        // Mock AI response based on category
        const mockResponses = {
            curiosity: [
                "Ce secret va révolutionner votre façon de créer",
                "Vous ne croirez jamais cette découverte incroyable"
            ],
            fear: [
                "Si vous ne changez pas maintenant, il sera trop tard",
                "Le risque que vous prenez sans le savoir"
            ],
            gain: [
                "Gagnez 10x plus de vues en seulement 30 jours",
                "Le secret pour doubler vos revenus cette année"
            ],
            authority: [
                "En tant qu'expert avec 500k abonnés, voici la vérité",
                "Après 10 ans dans l'industrie, ce que j'ai découvert"
            ],
            social_proof: [
                "Comment j'ai aidé 10k créateurs à exploser leur audience",
                "Ce que font tous les top créateurs que personne ne dit"
            ],
            contrast: [
                "Avant : 100 vues. Après : 10k vues. Voici comment",
                "La différence entre amateur et professionnel"
            ],
            question: [
                "Pourquoi 99% des créateurs échouent-ils ?",
                "Savez-vous vraiment optimiser vos contenus ?"
            ],
            storytelling: [
                "Il était une fois un créateur comme vous...",
                "L'histoire vraie qui a changé ma carrière pour toujours"
            ]
        };

        return {
            hooks: mockResponses.curiosity // Default fallback
        };
    }

    /**
     * Calculate expected performance score for a hook
     */
    private calculateHookScore(hookText: string, category: string, platform: string): number {
        let score = 50; // Base score

        // Length scoring (8-15 words is ideal)
        const wordCount = hookText.split(/\s+/).length;
        if (wordCount >= 8 && wordCount <= 15) score += 15;
        else if (wordCount < 8) score -= 10;

        // Question marks for engagement
        if (hookText.includes('?')) score += 10;

        // Numbers for specificity
        if (/\d+/.test(hookText)) score += 5;

        // Platform-specific optimizations
        if (platform === 'tiktok' && hookText.length < 50) score += 5;
        if (platform === 'youtube' && wordCount <= 12) score += 5;

        // Category-specific bonuses
        const highPerformingCategories = ['curiosity', 'fear', 'gain'];
        if (highPerformingCategories.includes(category)) score += 10;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Fallback hook generation using templates
     */
    private generateFallbackHooks(
        topic: string,
        targetAudience: string | undefined,
        platform: string,
        categoryName: string,
        category: any,
        count: number
    ): GeneratedHook[] {
        const templates = this.getHookTemplates(categoryName);
        const hooks: GeneratedHook[] = [];

        for (let i = 0; i < Math.min(count, templates.length); i++) {
            const template = templates[i];
            let hookText = template.replace('{topic}', topic);

            if (targetAudience) {
                hookText = hookText.replace('{audience}', targetAudience);
            }

            hooks.push({
                id: `${categoryName}_fallback_${Date.now()}_${i}`,
                text: hookText,
                category: categoryName,
                category_name: category.display_name,
                score: 60 + Math.random() * 20, // Random score between 60-80
                platform_specific: false,
                psychological_impact: category.psychological_principle
            });
        }

        return hooks;
    }

    /**
     * Get hook templates for fallback generation
     */
    private getHookTemplates(category: string): string[] {
        const templates = {
            curiosity: [
                "Ce secret sur {topic} va tout changer",
                "Vous ne croirez jamais ce que j'ai découvert sur {topic}"
            ],
            fear: [
                "Si vous ignorez {topic}, vous regretterez",
                "Le danger de {topic} que personne ne voit"
            ],
            gain: [
                "Comment {topic} peut vous rapporter 10x plus",
                "Le secret de {topic} pour réussir rapidement"
            ],
            authority: [
                "En tant qu'expert, voici la vérité sur {topic}",
                "Après des années, ce que j'ai appris sur {topic}"
            ],
            social_proof: [
                "Comment {topic} a transformé la carrière de milliers",
                "Ce que tous les experts utilisent pour {topic}"
            ],
            contrast: [
                "Avant et après {topic} : la différence incroyable",
                "Pourquoi {topic} fonctionne quand rien d'autre ne marche"
            ],
            question: [
                "Pourquoi {topic} est-il si important ?",
                "Connaissez-vous vraiment les secrets de {topic} ?"
            ],
            storytelling: [
                "L'histoire incroyable derrière {topic}",
                "Il était une fois {topic} qui a changé ma vie"
            ]
        };

        return templates[category as keyof typeof templates] || templates.curiosity;
    }

    /**
     * Save generated hooks to database
     */
    async saveGeneratedHooks(
        userId: string,
        request: HookGenerationRequest,
        hooks: GeneratedHook[],
        prompt: string
    ): Promise<ContentHooks> {
        const { data, error } = await supabase
            .from('content_hooks')
            .insert({
                user_id: userId,
                topic: request.topic,
                target_audience: request.target_audience,
                platform: request.platform,
                generated_hooks: hooks,
                prompt_used: prompt,
                is_saved: true
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving hooks:', error);
            throw new Error('Failed to save generated hooks');
        }

        return data;
    }

    /**
     * Get user's hook history
     */
    async getUserHooks(userId: string, limit = 20): Promise<ContentHooks[]> {
        const { data, error } = await supabase
            .from('content_hooks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching user hooks:', error);
            throw new Error('Failed to fetch user hooks');
        }

        return data || [];
    }
}

export const hookGeneratorService = HookGeneratorService.getInstance();