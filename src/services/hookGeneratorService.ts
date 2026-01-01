import { supabase } from '@/db/supabase';
import { hookLibraryService } from './hookLibraryService';

export interface HookCategory {
    id: string;
    name: string;
    displayName: string;
    description: string;
    psychologicalPrinciple: string;
    color: string;
    icon: string;
    successRate: number;
    usageCount: number;
    examples: string[];
}

export interface HookGenerationRequest {
    topic: string;
    targetAudience?: string;
    platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin';
    category?: string; // Optional: generate for specific category only
    count?: number; // Number of hooks per category (default: 10)
}

export interface GeneratedHook {
    id: string;
    text: string;
    category: string;
    categoryName: string;
    platform: string;
    confidence: number; // AI confidence score
    psychologicalTrigger: string;
    estimatedEngagement: number; // Estimated engagement rate
    characterCount: number;
    readabilityScore: number; // Flesch reading ease score
}

export interface HookGenerationResult {
    id: string;
    topic: string;
    platform: string;
    targetAudience?: string;
    generatedHooks: GeneratedHook[];
    promptUsed: string;
    aiModel: string;
    generationTime: number;
    createdAt: string;
}

export class HookGeneratorService {
    private categories: HookCategory[] = [];

    constructor() {
        this.loadCategories();
    }

    /**
     * Load hook categories from database
     */
    private async loadCategories(): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('hook_categories')
                .select('*')
                .eq('is_active', true)
                .order('usage_count', { ascending: false });

            if (error) throw error;

            this.categories = data?.map(cat => ({
                id: cat.id,
                name: cat.name,
                displayName: cat.display_name,
                description: cat.description,
                psychologicalPrinciple: cat.psychological_principle,
                color: cat.color,
                icon: cat.icon,
                successRate: cat.success_rate,
                usageCount: cat.usage_count,
                examples: cat.examples || []
            })) || [];
        } catch (error) {
            console.error('Failed to load hook categories:', error);
            // Fallback to hardcoded categories
            this.categories = this.getFallbackCategories();
        }
    }

    /**
     * Generate hooks for a given topic and platform
     */
    async generateHooks(request: HookGenerationRequest): Promise<HookGenerationResult> {
        const startTime = Date.now();
        const hookCount = request.count || 10;

        // Determine which categories to use
        const targetCategories = request.category
            ? this.categories.filter(cat => cat.name === request.category)
            : this.categories;

        const allGeneratedHooks: GeneratedHook[] = [];
        const promptsUsed: string[] = [];

        // Generate hooks for each category
        for (const category of targetCategories) {
            const categoryHooks = await this.generateHooksForCategory(
                request.topic,
                request.targetAudience,
                request.platform,
                category,
                Math.ceil(hookCount / targetCategories.length)
            );

            allGeneratedHooks.push(...categoryHooks);
            promptsUsed.push(`Generated ${categoryHooks.length} hooks for ${category.displayName}`);
        }

        // Create result record in database
        const result: Omit<HookGenerationResult, 'id'> = {
            topic: request.topic,
            platform: request.platform,
            targetAudience: request.targetAudience,
            generatedHooks: allGeneratedHooks,
            promptUsed: promptsUsed.join('; '),
            aiModel: 'gemini-pro',
            generationTime: Date.now() - startTime,
            createdAt: new Date().toISOString()
        };

        // Save to database (optional - only if user wants to save)
        // const savedResult = await this.saveHookGeneration(result);

        return {
            ...result,
            id: `temp_${Date.now()}`, // Temporary ID for unsaved generations
        };
    }

    /**
     * Generate hooks for a specific category
     */
    private async generateHooksForCategory(
        topic: string,
        targetAudience: string | undefined,
        platform: string,
        category: HookCategory,
        count: number
    ): Promise<GeneratedHook[]> {
        const platformAdaptations = this.getPlatformAdaptations(platform);

        const prompt = this.buildHookPrompt(
            topic,
            targetAudience,
            category,
            platformAdaptations,
            count
        );

        try {
            // Call AI service to generate hooks
            const aiResponse = await this.callAIService(prompt);

            // Parse and structure the response
            const hooks = this.parseAIResponse(aiResponse, category, platform);

            // Add metadata to each hook
            return hooks.map((hook, index) => ({
                ...hook,
                category: category.name,
                categoryName: category.displayName,
                platform,
                confidence: this.calculateConfidence(hook.text),
                psychologicalTrigger: category.psychologicalPrinciple,
                estimatedEngagement: this.estimateEngagement(hook.text, category, platform),
                characterCount: hook.text.length,
                readabilityScore: this.calculateReadability(hook.text),
            }));

        } catch (error) {
            console.error(`Failed to generate hooks for category ${category.name}:`, error);

            // Return fallback hooks based on category examples
            return category.examples.slice(0, count).map((example, index) => ({
                id: `${category.name}_${index}`,
                text: example,
                category: category.name,
                categoryName: category.displayName,
                platform,
                confidence: 0.5,
                psychologicalTrigger: category.psychologicalPrinciple,
                estimatedEngagement: category.successRate,
                characterCount: example.length,
                readabilityScore: 60,
            }));
        }
    }

    /**
     * Build optimized prompt for hook generation
     */
    private buildHookPrompt(
        topic: string,
        targetAudience: string | undefined,
        category: HookCategory,
        platformAdaptations: any,
        count: number
    ): string {
        const audienceContext = targetAudience ? `pour une audience ${targetAudience}` : '';
        const platformContext = platformAdaptations.description;

        return `Tu es un expert en copywriting pour le contenu ${platformAdaptations.name}.
Génère ${count} accroches (hooks) ultra-impactantes pour le sujet "${topic}" ${audienceContext}.

STYLE: ${category.displayName} - ${category.psychologicalPrinciple}
OBJECTIF: Attirer l'attention maximale dès les 3 premières secondes

CONTRAINTES ${platformAdaptations.name}:
- Longueur: ${platformAdaptations.maxLength} caractères max
- Ton: ${platformAdaptations.tone}
- Style: ${platformAdaptations.style}

EXEMPLES de ce style:
${category.examples.slice(0, 3).map(ex => `- "${ex}"`).join('\n')}

INSTRUCTIONS:
1. Chaque hook doit utiliser le principe psychologique: ${category.psychologicalPrinciple}
2. Adaptez le langage au contexte ${platformAdaptations.name}
3. Rendez chaque hook unique et impactant
4. Numérotez les hooks de 1 à ${count}

Génère ${count} hooks originaux:`;
    }

    /**
     * Get platform-specific adaptations
     */
    private getPlatformAdaptations(platform: string): any {
        const adaptations = {
            youtube: {
                name: 'YouTube',
                description: 'vidéos longues (8-15 min)',
                maxLength: 100,
                tone: 'conversationnel et engageant',
                style: 'questions rhétoriques, teasers, promesses de valeur'
            },
            tiktok: {
                name: 'TikTok',
                description: 'vidéos ultra-courtes (15-60 sec)',
                maxLength: 80,
                tone: 'énergique et direct',
                style: 'chocs visuels, questions, contrastes extrêmes'
            },
            instagram: {
                name: 'Instagram',
                description: 'contenu visuel et lifestyle',
                maxLength: 90,
                tone: 'inspirant et relatable',
                style: 'émotions, storytelling, communauté'
            },
            linkedin: {
                name: 'LinkedIn',
                description: 'contenu professionnel B2B',
                maxLength: 120,
                tone: 'expert et crédible',
                style: 'autorité, insights, networking'
            }
        };

        return adaptations[platform as keyof typeof adaptations] || adaptations.youtube;
    }

    /**
     * Call AI service (placeholder - would integrate with actual AI API)
     */
    private async callAIService(prompt: string): Promise<string> {
        // This would normally call your AI service (OpenAI, Anthropic, etc.)
        // For now, return mock responses based on the prompt

        const categoryMatch = prompt.match(/STYLE: (.+?) -/);
        const category = categoryMatch ? categoryMatch[1] : 'Curiosité';

        // Generate mock hooks based on category
        const mockHooks = this.generateMockHooks(category, 5);

        return mockHooks.map((hook, i) => `${i + 1}. ${hook}`).join('\n');
    }

    /**
     * Parse AI response into structured hooks
     */
    private parseAIResponse(response: string, category: HookCategory, platform: string): Array<{ id: string, text: string, promptUsed: string }> {
        const lines = response.split('\n').filter(line => line.trim());
        const hooks: Array<{ id: string, text: string, promptUsed: string }> = [];

        lines.forEach((line, index) => {
            const match = line.match(/^\d+\.\s*(.+)$/);
            if (match) {
                hooks.push({
                    id: `${category.name}_${platform}_${index}`,
                    text: match[1].trim(),
                    promptUsed: 'AI generated hook'
                });
            }
        });

        return hooks;
    }

    /**
     * Generate mock hooks for demo purposes
     */
    private generateMockHooks(category: string, count: number): string[] {
        const hooksByCategory: Record<string, string[]> = {
            'Curiosité': [
                'Ce secret va révolutionner votre façon de créer du contenu',
                'Vous ne croirez jamais ce que j\'ai découvert sur les algorithmes',
                'La technique cachée que personne ne veut que vous connaissiez',
                'Ce que YouTube ne vous dit pas sur les vues',
                'L\'erreur que font 99% des créateurs débutants'
            ],
            'Peur': [
                'Si vous ne changez pas maintenant, votre chaîne va mourir',
                'Le risque invisible qui détruit vos vidéos',
                'Pourquoi vos concurrents vous dépassent sans effort',
                'L\'erreur coûteuse que vous faites tous les jours',
                'Ce qui va tuer votre créativité pour toujours'
            ],
            'Gain': [
                'Gagnez 10x plus de vues avec cette méthode simple',
                'Comment atteindre 100k abonnés en 90 jours',
                'La stratégie qui a multiplié mes revenus par 5',
                'Devenez viral avec cette technique prouvée',
                'Le secret pour monétiser votre passion'
            ],
            'Autorité': [
                'En tant qu\'expert avec 500k abonnés, voici la vérité',
                'Après avoir analysé 10,000 vidéos, j\'ai trouvé ça',
                'Ce que 7 ans d\'expérience m\'ont appris',
                'L\'expertise que personne d\'autre ne peut vous donner',
                'Les insights d\'un pro avec 1M d\'heures vues'
            ],
            'Preuve Sociale': [
                'Comment j\'ai aidé 10k créateurs à exploser leur audience',
                'Ce que font tous les top créateurs pour réussir',
                'La méthode utilisée par les influenceurs millionnaires',
                'Pourquoi 85% des créateurs qui suivent ça réussissent',
                'L\'approche qui a fait passer mes vidéos de 1k à 1M vues'
            ]
        };

        return hooksByCategory[category] || hooksByCategory['Curiosité'];
    }

    /**
     * Calculate confidence score for a hook (0-1)
     */
    private calculateConfidence(hookText: string): number {
        let score = 0.5; // Base score

        // Length optimization
        if (hookText.length > 20 && hookText.length < 100) score += 0.2;

        // Question marks (engagement)
        if (hookText.includes('?')) score += 0.1;

        // Numbers (specificity)
        if (/\d+/.test(hookText)) score += 0.1;

        // Emotional words
        const emotionalWords = ['secret', 'vérité', 'erreur', 'révolution', 'exploser', 'mourir', 'tuer'];
        if (emotionalWords.some(word => hookText.toLowerCase().includes(word))) score += 0.1;

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Estimate engagement rate for a hook
     */
    private estimateEngagement(hookText: string, category: HookCategory, platform: string): number {
        let baseRate = category.successRate || 2.5; // Base 2.5% engagement

        // Platform multipliers
        const platformMultiplier = {
            tiktok: 1.5, // TikTok has higher engagement
            instagram: 1.3,
            youtube: 1.0,
            linkedin: 0.8
        };

        return baseRate * (platformMultiplier[platform as keyof typeof platformMultiplier] || 1.0);
    }

    /**
     * Calculate readability score (simplified)
     */
    private calculateReadability(text: string): number {
        const words = text.split(' ').length;
        const sentences = text.split(/[.!?]+/).length;
        const avgWordsPerSentence = words / sentences;

        // Simplified Flesch score approximation
        let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (words / 100));

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get fallback categories if database fails
     */
    private getFallbackCategories(): HookCategory[] {
        return [
            {
                id: 'curiosity',
                name: 'curiosity',
                displayName: 'Curiosité',
                description: 'Éveille la curiosité naturelle',
                psychologicalPrinciple: 'Principe de curiosité informationnelle',
                color: '#8B5CF6',
                icon: 'Eye',
                successRate: 3.2,
                usageCount: 0,
                examples: ['Ce secret va changer votre façon de créer']
            },
            // Add other categories...
        ];
    }

    /**
     * Save hook generation to database
     */
    async saveHookGeneration(result: HookGenerationResult, userId: string): Promise<HookGenerationResult> {
        const { data, error } = await supabase
            .from('content_hooks')
            .insert({
                user_id: userId,
                topic: result.topic,
                target_audience: result.targetAudience,
                platform: result.platform,
                generated_hooks: result.generatedHooks,
                prompt_used: result.promptUsed,
                ai_model: result.aiModel,
                is_saved: true
            })
            .select()
            .single();

        if (error) throw error;

        return { ...result, id: data.id };
    }

    /**
     * Get hook categories for UI
     */
    async getCategories(): Promise<HookCategory[]> {
        if (this.categories.length === 0) {
            await this.loadCategories();
        }
        return this.categories;
    }

    /**
     * Save a generated hook to the user's library
     */
    async saveHookToLibrary(
        hookText: string,
        topic?: string,
        platform?: string,
        categoryId?: string,
        tags?: string[]
    ) {
        try {
            const savedHook = await hookLibraryService.addHook({
                hookText,
                topic,
                platform,
                categoryId,
                tags: tags || [],
                performanceScore: 0 // Will be updated based on usage
            });
            return savedHook;
        } catch (error) {
            console.error('Failed to save hook to library:', error);
            throw error;
        }
    }

    /**
     * Save multiple generated hooks to library
     */
    async saveMultipleHooksToLibrary(
        hooks: Array<{
            text: string;
            category?: string;
            platform?: string;
        }>,
        topic?: string,
        platform?: string
    ) {
        const savedHooks = [];
        for (const hook of hooks) {
            try {
                const category = this.categories.find(c => c.name === hook.category);
                const savedHook = await this.saveHookToLibrary(
                    hook.text,
                    topic,
                    hook.platform || platform,
                    category?.id
                );
                savedHooks.push(savedHook);
            } catch (error) {
                console.error('Failed to save hook:', hook.text, error);
                // Continue with other hooks
            }
        }
        return savedHooks;
    }
}

export const hookGeneratorService = new HookGeneratorService();