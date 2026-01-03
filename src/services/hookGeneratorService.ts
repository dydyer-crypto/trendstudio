import { supabase } from '@/db/supabase';
import { aiService } from './aiService';
import { brandKitService } from './brandKitService';

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
    brandKit?: any; // Brand kit for personalized hooks
    userId?: string; // User ID to fetch brand kit if not provided
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
        // Get brand kit if not provided but userId is available
        let brandKit = request.brandKit;
        if (!brandKit && request.userId) {
            try {
                brandKit = await brandKitService.getActiveBrandKit(request.userId);
            } catch (error) {
                console.warn('Could not fetch brand kit:', error);
            }
        }

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
                    hooksPerCategory,
                    request,
                    brandKit
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
        count: number,
        request: HookGenerationRequest,
        brandKit?: any
    ): Promise<GeneratedHook[]> {
        try {
            // Call AI service to generate hooks
            const aiResponse = await this.callAIGeneration(this.buildHookPrompt(topic, targetAudience, platform, category, brandKit), count);

            return aiResponse.hooks.map((hookText: string, index: number) => {
                const topicAnalysis = this.analyzeTopic(request.topic);
                const baseScore = this.calculateHookScore(hookText, categoryName, platform, topicAnalysis);

                return {
                    id: `${categoryName}_${Date.now()}_${index}`,
                    text: hookText,
                    category: categoryName,
                    category_name: category.display_name,
                    score: baseScore,
                    platform_specific: platform !== 'youtube',
                    psychological_impact: category.psychological_principle
                };
            });
        } catch (error) {
            console.error('AI generation error:', error);
            // Fallback to template-based generation
            return this.generateFallbackHooks(topic, targetAudience, platform, categoryName, category, count);
        }
    }

    /**
     * Build enhanced AI prompt for hook generation with contextual analysis
     */
    private buildHookPrompt(
        topic: string,
        targetAudience: string | undefined,
        platform: string,
        category: any,
        brandKit?: any
    ): string {
        const topicAnalysis = this.analyzeTopic(topic);
        const audience = targetAudience ? ` pour ${targetAudience}` : '';
        const platformSpecs = this.getPlatformSpecifications(platform);

        // Brand kit integration
        const brandContext = brandKit ? this.buildBrandContext(brandKit) : '';

        return `Tu es un expert en copywriting viral avec 10 ans d'expérience. Génère des hooks ultra-performants.

CONTEXTE :
- Sujet : "${topic}"
- Analyse du sujet : ${topicAnalysis.description}
- Audience cible : ${targetAudience || 'Générale (18-45 ans)'}
- Plateforme : ${platformSpecs.name} (${platformSpecs.format})
- Longueur optimale : ${platformSpecs.hookLength} mots
- Style de plateforme : ${platformSpecs.style}
${brandContext}

CATÉGORIE PSYCHOLOGIQUE : ${category.display_name}
Principe fondamental : ${category.psychological_principle}

TECHNIQUES SPÉCIFIQUES pour ${category.name} :
${this.getCategoryTechniques(category.name, topicAnalysis)}

EXEMPLES RÉUSSIS :
${category.examples.slice(0, 3).map((ex: string) => `- "${ex}"`).join('\n')}

RÈGLES DE GÉNÉRATION :
✅ 8-12 mots maximum (idéal pour rétention)
✅ Commence par un déclencheur psychologique fort
✅ Crée FOMO (peur de manquer) immédiat
✅ Optimisé pour ${platform} (rythme et style)
✅ Ton : ${this.getCategoryTone(category.name)}
✅ Utilise : ${topicAnalysis.powerWords.join(', ')}
${platformSpecs.constraints}

Génère 3 accroches exceptionnelles classées par potentiel viral :`;
    }

    /**
     * Analyze topic to extract key elements and power words
     */
    private analyzeTopic(topic: string): { description: string, powerWords: string[], category: string } {
        const lowerTopic = topic.toLowerCase();

        // Analyze topic type and extract power words
        const analysis = {
            powerWords: [] as string[],
            description: '',
            category: 'general'
        };

        // Extract numbers and metrics
        const numbers = topic.match(/\d+/g);
        if (numbers) {
            analysis.powerWords.push(...numbers.map(n => n + '%'), 'résultats', 'preuves');
        }

        // Category-specific analysis
        if (lowerTopic.includes('ia') || lowerTopic.includes('intelligence artificielle')) {
            analysis.category = 'tech';
            analysis.powerWords.push('révolutionnaire', 'futur', 'automatisé', 'intelligent');
            analysis.description = 'Sujet technologique innovant sur l\'IA';
        } else if (lowerTopic.includes('argent') || lowerTopic.includes('revenus') || lowerTopic.includes('business')) {
            analysis.category = 'business';
            analysis.powerWords.push('riche', 'liberté', 'passif', 'échelle', 'stratégie');
            analysis.description = 'Sujet business et monétisation';
        } else if (lowerTopic.includes('santé') || lowerTopic.includes('fitness') || lowerTopic.includes('corps')) {
            analysis.category = 'health';
            analysis.powerWords.push('transformation', 'santé', 'énergie', 'corps', 'vie');
            analysis.description = 'Sujet bien-être et santé';
        } else {
            analysis.powerWords.push('secret', 'méthode', 'technique', 'astuce', 'erreur');
            analysis.description = 'Sujet général à fort potentiel viral';
        }

        return analysis;
    }

    /**
     * Get platform-specific specifications
     */
    private getPlatformSpecifications(platform: string) {
        const specs = {
            youtube: {
                name: 'YouTube',
                format: 'Vidéo 8-15 secondes d\'intro',
                hookLength: '8-12',
                style: 'Narratif, visuel fort',
                constraints: '✅ Doit inciter au clic "Learn More"'
            },
            tiktok: {
                name: 'TikTok',
                format: 'Vidéo verticale 3-5 secondes',
                hookLength: '6-10',
                style: 'Rapide, punchy, musical',
                constraints: '✅ Doit créer curiosité immédiate'
            },
            instagram: {
                name: 'Instagram',
                format: 'Post/Reel 3-8 secondes',
                hookLength: '7-11',
                style: 'Visuel, émotionnel',
                constraints: '✅ Doit inciter au swipe up ou save'
            },
            linkedin: {
                name: 'LinkedIn',
                format: 'Publication professionnelle',
                hookLength: '10-15',
                style: 'Expertise, valeur ajoutée',
                constraints: '✅ Doit démontrer autorité'
            }
        };

        return specs[platform as keyof typeof specs] || specs.youtube;
    }

    /**
     * Get specific techniques for each psychological category
     */
    private getCategoryTechniques(categoryName: string, topicAnalysis: any): string {
        const techniques = {
            curiosity: `• Pose une question mystère : "Savez-vous pourquoi...?"
• Promesse de révélation : "Je vais vous montrer..."
• Format "Ce que personne ne dit" : "La vérité cachée sur..."
• Hook scientifique : "Selon une étude récente..."`,

            fear: `• FOMO immédiat : "Si vous ne faites pas ça maintenant..."
• Risque identifié : "Le danger que vous ignorez"
• Urgence temporelle : "Il vous reste X jours pour..."
• Conséquence grave : "Sans ça, vous risquez de..."`,

            gain: `• Bénéfice quantifiable : "Gagnez X% en Y temps"
• Transformation promise : "Passez de A à Z"
• Économie réalisée : "Économisez X€ par mois"
• Avantage concurrentiel : "Ce que les autres n'ont pas"`,

            authority: `• Expertise démontrée : "Avec 10 ans d'expérience..."
• Résultats concrets : "J'ai aidé X personnes à..."
• Méthode exclusive : "Ma méthode unique"
• Validation externe : "Recommandé par des experts"`,

            social_proof: `• Chiffres impressionnants : "X personnes ont déjà..."
• Témoignages : "Voici ce qu'ils disent"
• Comparaison sociale : "Pourquoi eux réussissent et pas vous"
• Communauté : "Rejoignez les X qui ont réussi"`,

            contrast: `• Avant/après : "Avant : pauvre → Après : riche"
• Erreur/correction : "Erreur courante vs Solution"
• Lent/rapide : "Méthode lente vs Ma méthode rapide"
• Médiocre/excellent : "Ce que font les autres vs Ce que je fais"`,

            question: `• Question douleur : "Êtes-vous fatigué de...?"
• Question aspiration : "Rêvez-vous de...?"
• Question curiosité : "Savez-vous comment...?"
• Question urgence : "Pourquoi attendre plus longtemps?"`,

            storytelling: `• Héros ordinaire : "J'étais comme vous..."
• Problème universel : "Tout le monde vit ça"
• Découverte étonnante : "Et puis j'ai découvert..."
• Résolution heureuse : "Maintenant je vis ça"`
        };

        return techniques[categoryName as keyof typeof techniques] || techniques.curiosity;
    }

    /**
     * Get appropriate tone for each category
     */
    private getCategoryTone(categoryName: string): string {
        const tones = {
            curiosity: 'Mystérieux et intrigant',
            fear: 'Urgent et alarmant',
            gain: 'Enthousiaste et motivant',
            authority: 'Confiance et expertise',
            social_proof: 'Social et inclusif',
            contrast: 'Révolutionnaire et disruptif',
            question: 'Empathique et engageant',
            storytelling: 'Authentique et relatable'
        };

        return tones[categoryName as keyof typeof tones] || 'Engageant et viral';
    }

    /**
     * Build brand context for personalized hooks
     */
    private buildBrandContext(brandKit: any): string {
        if (!brandKit) return '';

        const brandElements = [];

        if (brandKit.name) {
            brandElements.push(`- Marque : ${brandKit.name}`);
        }

        if (brandKit.brand_voice?.tone?.length > 0) {
            brandElements.push(`- Ton de voix : ${brandKit.brand_voice.tone.join(', ')}`);
        }

        if (brandKit.brand_voice?.style?.length > 0) {
            brandElements.push(`- Style : ${brandKit.brand_voice.style.join(', ')}`);
        }

        if (brandKit.brand_voice?.keywords?.length > 0) {
            brandElements.push(`- Mots-clés de marque : ${brandKit.brand_voice.keywords.join(', ')}`);
        }

        if (brandElements.length === 0) return '';

        return `\nCONTEXTE DE MARQUE :\n${brandElements.join('\n')}\n- Adaptez le ton et le style des hooks à cette identité de marque`;
    }

    /**
     * Call AI service for hook generation
     */
    private async callAIGeneration(prompt: string, count: number): Promise<{ hooks: string[] }> {
        try {
            const response = await aiService.generateText({
                prompt: `${prompt}\n\nGénère exactement ${count} accroches séparées par des sauts de ligne. Chaque accroche doit être concise et percutante.`,
                model: 'deepseek-chat',
                temperature: 0.8,
                maxTokens: 500,
                systemPrompt: 'Tu es un expert en copywriting viral spécialisé dans la création de hooks pour les réseaux sociaux. Tu génères des accroches qui captent l\'attention en 3 secondes.'
            });

            // Parse the response to extract individual hooks
            const hooks = response.text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 10 && !line.startsWith('-') && !line.startsWith('*'))
                .slice(0, count);

            return { hooks };
        } catch (error) {
            console.error('AI generation failed, using fallback:', error);
            // Fallback to template-based generation
            return this.generateFallbackHooksArray(prompt, count);
        }
    }

    /**
     * Generate fallback hooks array when AI fails
     */
    private generateFallbackHooksArray(prompt: string, count: number): { hooks: string[] } {
        const fallbackHooks = [
            "Ce secret va révolutionner votre façon de créer",
            "Vous ne croirez jamais ce qui s'est passé",
            "Si vous ne changez pas maintenant, il sera trop tard",
            "Le danger que vous prenez sans le savoir",
            "Gagnez 10x plus de vues en seulement 30 jours",
            "Le secret pour doubler vos revenus cette année",
            "En tant qu'expert avec 500k abonnés, voici la vérité",
            "Après 10 ans dans l'industrie, ce que j'ai découvert"
        ];

        return {
            hooks: fallbackHooks.slice(0, count)
        };
    }

    /**
     * Calculate enhanced performance score for a hook
     */
    private calculateHookScore(hookText: string, category: string, platform: string, topicAnalysis?: any): number {
        let score = 50; // Base score

        // Length scoring optimized per platform
        const wordCount = hookText.split(/\s+/).length;
        const platformSpecs = this.getPlatformSpecifications(platform);

        if (platform === 'tiktok' && wordCount <= 8) score += 20;
        else if (platform === 'youtube' && wordCount >= 8 && wordCount <= 12) score += 15;
        else if (platform === 'instagram' && wordCount >= 7 && wordCount <= 11) score += 15;
        else if (platform === 'linkedin' && wordCount >= 10 && wordCount <= 15) score += 15;
        else if (wordCount >= 8 && wordCount <= 15) score += 10;
        else score -= 5;

        // Psychological triggers scoring
        const triggers = {
            curiosity: ['secret', 'mystère', 'saviez-vous', 'incroyable', 'jamais'],
            fear: ['attention', 'danger', 'risque', 'avant qu\'il ne soit', 'dernier'],
            gain: ['gagnez', 'découvrez', 'apprenez', 'maîtrisez', 'devenez'],
            authority: ['expert', 'années', 'prouvé', 'méthode', 'scientifique'],
            social_proof: ['personnes', 'déjà', 'recommandent', 'succès', 'résultats'],
            contrast: ['avant', 'après', 'différence', 'erreur', 'solution'],
            question: ['êtes-vous', 'savez-vous', 'pourquoi', 'comment', 'quand'],
            storytelling: ['histoire', 'vraie', 'comme vous', 'découvert', 'changé']
        };

        const categoryTriggers = triggers[category as keyof typeof triggers] || [];
        let triggerCount = 0;
        categoryTriggers.forEach(trigger => {
            if (hookText.toLowerCase().includes(trigger)) triggerCount++;
        });

        if (triggerCount >= 2) score += 15;
        else if (triggerCount === 1) score += 8;

        // Power words from topic analysis
        if (topicAnalysis?.powerWords) {
            const powerWordMatches = topicAnalysis.powerWords.filter((word: string) =>
                hookText.toLowerCase().includes(word.toLowerCase())
            ).length;
            score += powerWordMatches * 3;
        }

        // Question marks for engagement
        if (hookText.includes('?')) score += 12;

        // Numbers and metrics
        if (/\d+/.test(hookText)) score += 8;

        // Emotional punctuation
        if (hookText.includes('!')) score += 5;

        // Category-specific performance bonuses
        const performanceMultipliers = {
            curiosity: 1.2,    // Highest performing
            fear: 1.15,        // Very effective
            gain: 1.1,         // Good performer
            social_proof: 1.08, // Consistent
            authority: 1.05,   // Steady
            contrast: 1.03,    // Decent
            question: 1.02,    // Basic
            storytelling: 1.0  // Baseline
        };

        score *= performanceMultipliers[category as keyof typeof performanceMultipliers] || 1.0;

        // Platform-specific bonuses
        if (platform === 'tiktok' && triggerCount >= 1) score += 8;
        if (platform === 'youtube' && wordCount <= 12) score += 5;
        if (platform === 'linkedin' && category === 'authority') score += 10;

        return Math.min(100, Math.max(0, Math.round(score)));
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

    /**
     * Get top performing hooks from user's library for learning
     */
    async getTopPerformingHooks(userId: string, category?: string, platform?: string, limit = 10) {
        let query = supabase
            .from('hook_library')
            .select(`
                *,
                hook_categories (
                    name,
                    display_name,
                    psychological_principle
                )
            `)
            .eq('user_id', userId)
            .eq('is_favorite', true)
            .order('performance_score', { ascending: false })
            .order('usage_count', { ascending: false })
            .limit(limit);

        if (category) {
            query = query.eq('category_id', category);
        }

        if (platform) {
            query = query.eq('platform', platform);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching top hooks:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Get category performance statistics
     */
    async getCategoryPerformanceStats(userId: string) {
        const { data, error } = await supabase
            .from('content_hooks')
            .select(`
                category_id,
                generated_hooks,
                hook_categories (
                    name,
                    display_name
                )
            `)
            .eq('user_id', userId)
            .not('generated_hooks', 'is', null);

        if (error) {
            console.error('Error fetching performance stats:', error);
            return {};
        }

        // Calculate average scores per category
        const stats: Record<string, { total: number, count: number, average: number }> = {};

        data?.forEach(hook => {
            const categoryId = hook.category_id;
            const hooks = hook.generated_hooks || [];

            hooks.forEach((h: GeneratedHook) => {
                if (!stats[categoryId]) {
                    stats[categoryId] = { total: 0, count: 0, average: 0 };
                }
                stats[categoryId].total += h.score;
                stats[categoryId].count += 1;
            });
        });

        // Calculate averages
        Object.keys(stats).forEach(categoryId => {
            stats[categoryId].average = stats[categoryId].total / stats[categoryId].count;
        });

        return stats;
    }

    /**
     * Learn from successful hooks and improve future generations
     */
    async learnFromSuccessfulHooks(userId: string): Promise<Record<string, any>> {
        const topHooks = await this.getTopPerformingHooks(userId, undefined, undefined, 20);
        const categoryStats = await this.getCategoryPerformanceStats(userId);

        // Extract patterns from successful hooks
        const patterns = {
            successfulWords: [] as string[],
            successfulStructures: [] as string[],
            categoryPreferences: categoryStats,
            platformPerformance: {} as Record<string, number>
        };

        // Analyze successful hooks for patterns
        topHooks.forEach(hook => {
            const words = hook.hook_text.toLowerCase().split(/\s+/);
            patterns.successfulWords.push(...words.filter((word: string) => word.length > 3));

            // Analyze structure patterns
            if (hook.hook_text.includes('?')) {
                patterns.successfulStructures.push('question');
            }
            if (/\d+/.test(hook.hook_text)) {
                patterns.successfulStructures.push('numbers');
            }
            if (hook.hook_text.includes('!')) {
                patterns.successfulStructures.push('exclamation');
            }
        });

        // Remove duplicates and sort by frequency
        const wordFreq = patterns.successfulWords.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        patterns.successfulWords = Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);

        return patterns;
    }

    /**
     * Save hook to user's personal library
     */
    async saveHookToLibrary(
        userId: string,
        hook: GeneratedHook,
        topic: string,
        tags: string[] = []
    ) {
        const { data, error } = await supabase
            .from('hook_library')
            .insert({
                user_id: userId,
                hook_text: hook.text,
                category_id: null, // We'll need to get this from the hook category
                topic: topic,
                platform: null, // We'll add this later
                tags: tags,
                performance_score: hook.score
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving hook to library:', error);
            throw new Error('Failed to save hook to library');
        }

        return data;
    }

    /**
     * Export hooks as formatted text or JSON
     */
    exportHooks(hooks: GeneratedHook[], format: 'text' | 'json' | 'csv' = 'text') {
        switch (format) {
            case 'json':
                return JSON.stringify(hooks, null, 2);

            case 'csv':
                const headers = ['Category', 'Hook Text', 'Score', 'Platform Specific'];
                const rows = hooks.map(hook => [
                    hook.category_name,
                    `"${hook.text}"`,
                    hook.score,
                    hook.platform_specific ? 'Yes' : 'No'
                ]);
                return [headers, ...rows].map(row => row.join(',')).join('\n');

            case 'text':
            default:
                return hooks
                    .sort((a, b) => b.score - a.score)
                    .map((hook, index) =>
                        `${index + 1}. [${hook.category_name}] "${hook.text}" (Score: ${hook.score}/100)${hook.platform_specific ? ' - Plateforme spécifique' : ''}`
                    )
                    .join('\n\n');
        }
    }
}

export const hookGeneratorService = HookGeneratorService.getInstance();