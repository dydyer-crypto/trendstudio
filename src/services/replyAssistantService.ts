import { supabase } from '@/db/supabase';
import { aiService } from './aiService';

export interface SocialComment {
    id: string;
    user_id: string;
    platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin';
    platform_post_id: string;
    comment_id: string;
    author_username?: string;
    author_profile_url?: string;
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint' | 'spam';
    sentiment_score: number; // -1 to 1
    sentiment_confidence: number; // 0 to 1
    reply_suggested?: string;
    reply_sent: boolean;
    reply_timestamp?: string;
    engagement_score: number;
    priority_score: number;
    tags: string[];
    is_processed: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReplyTemplate {
    id: string;
    user_id: string;
    template_name: string;
    template_type: 'positive' | 'question' | 'complaint' | 'spam' | 'neutral' | 'celebration' | 'gratitude';
    template_text: string;
    platform_specific: boolean;
    target_platforms: string[];
    is_active: boolean;
    usage_count: number;
    success_rate: number;
    avg_response_time: number;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface ReplyHistory {
    id: string;
    user_id: string;
    comment_id: string;
    reply_text: string;
    platform: string;
    sent_at: string;
    response_time_seconds?: number;
    engagement_metrics: Record<string, any>;
    ai_generated: boolean;
    template_used?: string;
    performance_score: number;
    user_feedback?: string;
    created_at: string;
}

export interface CommentAnalysis {
    sentiment: SocialComment['sentiment'];
    score: number;
    confidence: number;
    keywords: string[];
    suggested_action: 'reply' | 'ignore' | 'moderate' | 'escalate';
    priority: 'high' | 'medium' | 'low';
}

export interface ReplySuggestion {
    text: string;
    template_used?: string;
    confidence: number;
    tone: 'friendly' | 'professional' | 'empathetic' | 'enthusiastic' | 'neutral';
    estimated_engagement: number;
}

export class ReplyAssistantService {
    private static instance: ReplyAssistantService;

    private constructor() { }

    static getInstance(): ReplyAssistantService {
        if (!ReplyAssistantService.instance) {
            ReplyAssistantService.instance = new ReplyAssistantService();
        }
        return ReplyAssistantService.instance;
    }

    /**
     * Fetch comments from social media platforms
     */
    async fetchComments(userId: string, platforms: string[] = [], limit = 50): Promise<SocialComment[]> {
        let query = supabase
            .from('social_comments')
            .select('*')
            .eq('user_id', userId)
            .eq('is_processed', false)
            .order('priority_score', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (platforms.length > 0) {
            query = query.in('platform', platforms);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching comments:', error);
            throw new Error('Failed to fetch comments');
        }

        return data || [];
    }

    /**
     * Analyze comment sentiment and generate metadata
     */
    async analyzeComment(content: string): Promise<CommentAnalysis> {
        // Use AI service for advanced sentiment analysis
        try {
            const aiAnalysis = await aiService.analyzeSentiment(content);
            const analysis = {
                sentiment: aiAnalysis.sentiment as SocialComment['sentiment'],
                score: aiAnalysis.score,
                confidence: aiAnalysis.confidence,
                keywords: [] // Will be extracted from AI response
            };

            // Determine suggested action based on sentiment and content
            const suggested_action = this.determineSuggestedAction(analysis.sentiment, content);

            // Calculate priority
            const priority = this.calculatePriority(analysis.sentiment, analysis.confidence);

            return {
                ...analysis,
                suggested_action,
                priority
            };
        } catch (error) {
            console.error('AI sentiment analysis failed, using fallback:', error);
            // Fallback to basic keyword analysis
            const analysis = this.performSentimentAnalysis(content);

            // Determine suggested action based on sentiment and content
            const suggested_action = this.determineSuggestedAction(analysis.sentiment, content);

            // Calculate priority
            const priority = this.calculatePriority(analysis.sentiment, analysis.confidence);

            return {
                ...analysis,
                suggested_action,
                priority
            };
        }
    }

    /**
     * Generate AI-powered reply suggestions
     */
    async generateReplySuggestions(
        comment: SocialComment,
        brandKit?: any,
        templates: ReplyTemplate[] = []
    ): Promise<ReplySuggestion[]> {
        const suggestions: ReplySuggestion[] = [];

        // Get relevant templates for this sentiment
        const relevantTemplates = templates.filter(t =>
            t.is_active &&
            (t.template_type === comment.sentiment ||
                t.template_type === this.mapSentimentToTemplateType(comment.sentiment))
        );

        // Generate AI suggestions based on comment analysis
        const aiSuggestions = await this.generateAISuggestions(comment, brandKit);

        // Combine AI suggestions with templates
        suggestions.push(...aiSuggestions);

        // Add template-based suggestions
        for (const template of relevantTemplates.slice(0, 2)) {
            suggestions.push({
                text: this.personalizeTemplate(template.template_text, comment),
                template_used: template.id,
                confidence: template.success_rate / 100,
                tone: this.inferToneFromTemplate(template.template_type),
                estimated_engagement: template.success_rate * 0.8
            });
        }

        return suggestions.slice(0, 5); // Return top 5 suggestions
    }

    /**
     * Save comment to database
     */
    async saveComment(comment: Omit<SocialComment, 'id' | 'created_at' | 'updated_at'>): Promise<SocialComment> {
        const { data, error } = await supabase
            .from('social_comments')
            .insert({
                ...comment,
                is_processed: true,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving comment:', error);
            throw new Error('Failed to save comment');
        }

        return data;
    }

    /**
     * Send reply and track performance
     */
    async sendReply(
        commentId: string,
        replyText: string,
        templateUsed?: string,
        aiGenerated = true
    ): Promise<void> {
        const now = new Date().toISOString();

        // Update comment status
        await supabase
            .from('social_comments')
            .update({
                reply_sent: true,
                reply_timestamp: now,
                reply_suggested: replyText,
                updated_at: now
            })
            .eq('id', commentId);

        // Record reply in history
        await supabase
            .from('reply_history')
            .insert({
                comment_id: commentId,
                reply_text: replyText,
                platform: 'mock_platform', // Will be filled by actual platform integration
                ai_generated: aiGenerated,
                template_used: templateUsed
            });
    }

    /**
     * Get reply templates for user
     */
    async getReplyTemplates(userId: string): Promise<ReplyTemplate[]> {
        const { data, error } = await supabase
            .from('reply_templates')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('success_rate', { ascending: false });

        if (error) {
            console.error('Error fetching reply templates:', error);
            throw new Error('Failed to fetch reply templates');
        }

        return data || [];
    }

    /**
     * Create or update reply template
     */
    async saveReplyTemplate(template: Omit<ReplyTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReplyTemplate> {
        const { data, error } = await supabase
            .from('reply_templates')
            .upsert(template)
            .select()
            .single();

        if (error) {
            console.error('Error saving reply template:', error);
            throw new Error('Failed to save reply template');
        }

        return data;
    }

    /**
     * Get performance analytics
     */
    async getPerformanceAnalytics(userId: string, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: history, error } = await supabase
            .from('reply_history')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching performance analytics:', error);
            return {
                totalReplies: 0,
                avgResponseTime: 0,
                avgEngagement: 0,
                sentimentDistribution: {},
                platformPerformance: {}
            };
        }

        const analytics = {
            totalReplies: history?.length || 0,
            avgResponseTime: history?.reduce((sum, h) => sum + (h.response_time_seconds || 0), 0) / (history?.length || 1),
            avgEngagement: history?.reduce((sum, h) => sum + h.performance_score, 0) / (history?.length || 1),
            sentimentDistribution: this.calculateSentimentDistribution(history || []),
            platformPerformance: this.calculatePlatformPerformance(history || [])
        };

        return analytics;
    }

    // Private helper methods

    private performSentimentAnalysis(content: string): Omit<CommentAnalysis, 'suggested_action' | 'priority'> {
        const lowerContent = content.toLowerCase();

        // Positive indicators
        const positiveWords = ['super', 'génial', 'excellent', 'merci', 'bravo', 'top', 'incroyable', 'fantastique', 'parfait', 'love', '❤️', '👍'];
        const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;

        // Negative indicators
        const negativeWords = ['nul', 'mauvais', 'horrible', 'déçu', 'échec', 'problème', 'bug', 'cassé', 'ne marche pas', 'hate', '👎', '😠'];
        const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

        // Question indicators
        const questionWords = ['?', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quoi', 'est-ce que', 'peux-tu'];
        const hasQuestion = questionWords.some(word => lowerContent.includes(word)) || lowerContent.includes('?');

        // Determine sentiment
        let sentiment: SocialComment['sentiment'] = 'neutral';
        let score = 0;

        if (hasQuestion) {
            sentiment = 'question';
            score = 0.3;
        } else if (negativeCount > positiveCount) {
            sentiment = negativeCount > 1 ? 'complaint' : 'negative';
            score = -0.5 - (negativeCount * 0.1);
        } else if (positiveCount > negativeCount) {
            sentiment = 'positive';
            score = 0.5 + (positiveCount * 0.1);
        }

        // Extract keywords
        const allWords = [...positiveWords, ...negativeWords, ...questionWords];
        const keywords = allWords.filter(word => lowerContent.includes(word));

        const confidence = Math.min(1, (positiveCount + negativeCount + (hasQuestion ? 1 : 0)) / 3);

        return {
            sentiment,
            score: Math.max(-1, Math.min(1, score)),
            confidence,
            keywords: [...new Set(keywords)]
        };
    }

    private determineSuggestedAction(sentiment: SocialComment['sentiment'], content: string): CommentAnalysis['suggested_action'] {
        const lowerContent = content.toLowerCase();

        // Check for spam
        const spamIndicators = ['http', 'www', 'bit.ly', 'free money', 'click here'];
        if (spamIndicators.some(indicator => lowerContent.includes(indicator))) {
            return 'moderate';
        }

        // High priority sentiments
        if (sentiment === 'complaint' || sentiment === 'negative') {
            return 'reply';
        }

        // Questions should be answered
        if (sentiment === 'question') {
            return 'reply';
        }

        // Positive comments can be acknowledged
        if (sentiment === 'positive') {
            return 'reply';
        }

        // Low engagement neutral comments can be ignored
        return 'ignore';
    }

    private calculatePriority(sentiment: SocialComment['sentiment'], confidence: number): CommentAnalysis['priority'] {
        const basePriority = {
            complaint: 'high',
            negative: 'high',
            question: 'medium',
            positive: 'medium',
            neutral: 'low',
            spam: 'low'
        } as const;

        // Boost priority for high confidence
        if (confidence > 0.8 && basePriority[sentiment] === 'medium') {
            return 'high';
        }

        return basePriority[sentiment] || 'low';
    }

    private async generateAISuggestions(comment: SocialComment, brandKit?: any): Promise<ReplySuggestion[]> {
        try {
            const prompt = `Génère 3 réponses appropriées pour ce commentaire sur ${comment.platform}:

Commentaire: "${comment.content}"
Sentiment: ${comment.sentiment}

Contexte de la marque: ${brandKit?.name || 'Contenu générique'}
Ton de marque: ${brandKit?.brand_voice?.tone?.join(', ') || 'Professionnel, amical'}

Génère des réponses:
1. Empathique et engageante
2. Informatif et utile
3. Créative et mémorable

Chaque réponse doit être concise (max 200 caractères) et adaptée à la plateforme ${comment.platform}.`;

            const response = await aiService.generateText({
                prompt,
                model: 'deepseek-chat',
                temperature: 0.7,
                maxTokens: 300,
                systemPrompt: 'Tu es un expert en community management. Génère des réponses authentiques et engageantes pour les réseaux sociaux.'
            });

            // Parse the response to extract suggestions
            const suggestions = response.text
                .split('\n')
                .filter(line => line.trim().length > 10 && /^\d+\./.test(line.trim()))
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 3);

            return suggestions.map(suggestion => ({
                text: suggestion,
                confidence: 0.85,
                tone: this.inferToneFromSentiment(comment.sentiment),
                estimated_engagement: Math.random() * 0.3 + 0.5 // 0.5-0.8 range
            }));
        } catch (error) {
            console.error('AI reply generation failed, using fallback:', error);
            // Fallback to template-based suggestions
            const suggestions = this.getMockSuggestions(comment.sentiment, brandKit);
            return suggestions.map(suggestion => ({
                text: suggestion,
                confidence: 0.7,
                tone: this.inferToneFromSentiment(comment.sentiment),
                estimated_engagement: Math.random() * 0.3 + 0.4 // 0.4-0.7 range
            }));
        }
    }

    private getMockSuggestions(sentiment: SocialComment['sentiment'], brandKit?: any): string[] {
        const brandName = brandKit?.name || 'notre contenu';

        const suggestionMap = {
            positive: [
                `Merci beaucoup pour ce retour positif ! 😊 Ravi que ${brandName} vous plaise.`,
                `Super d'entendre ça ! Continuez à nous suivre pour plus de contenu.`,
                `Votre soutien compte beaucoup pour nous ! 🙏 Merci d'aimer ${brandName}.`
            ],
            negative: [
                `Désolé d'apprendre que vous n'avez pas aimé... On va s'améliorer !`,
                `Merci pour votre feedback. On prend note pour faire mieux.`,
                `On est désolés pour cette mauvaise expérience. Dites-nous comment améliorer.`
            ],
            question: [
                `Bonne question ! On prépare une réponse détaillée dans les commentaires.`,
                `Merci pour votre question. La réponse arrive bientôt !`,
                `Intéressante question... On va y répondre en détail.`
            ],
            complaint: [
                `On est vraiment désolés pour ce problème. On va le résoudre rapidement.`,
                `Merci de nous signaler ce problème. On s'en occupe immédiatement.`,
                `Désolés pour cette expérience négative. Contactez-nous en privé pour résoudre ça.`
            ],
            neutral: [
                `Merci pour votre commentaire ! On apprécie vos retours.`,
                `Content de vous voir ici ! N'hésitez pas à partager vos pensées.`,
                `Merci d'avoir pris le temps de commenter. Ça compte pour nous.`
            ]
        };

        return suggestionMap[sentiment as keyof typeof suggestionMap] || suggestionMap.neutral;
    }

    private mapSentimentToTemplateType(sentiment: SocialComment['sentiment']): ReplyTemplate['template_type'] {
        const mapping = {
            positive: 'celebration' as const,
            negative: 'complaint' as const,
            question: 'question' as const,
            complaint: 'complaint' as const,
            neutral: 'neutral' as const,
            spam: 'spam' as const
        };

        return mapping[sentiment] || 'neutral';
    }

    private inferToneFromSentiment(sentiment: SocialComment['sentiment']): ReplySuggestion['tone'] {
        const toneMap = {
            positive: 'enthusiastic' as const,
            negative: 'empathetic' as const,
            question: 'professional' as const,
            complaint: 'empathetic' as const,
            neutral: 'friendly' as const,
            spam: 'neutral' as const
        };

        return toneMap[sentiment] || 'friendly';
    }

    private inferToneFromTemplate(templateType: ReplyTemplate['template_type']): ReplySuggestion['tone'] {
        const toneMap = {
            positive: 'friendly' as const,
            question: 'professional' as const,
            complaint: 'empathetic' as const,
            spam: 'neutral' as const,
            neutral: 'friendly' as const,
            celebration: 'enthusiastic' as const,
            gratitude: 'friendly' as const
        };

        return toneMap[templateType] || 'friendly';
    }

    private personalizeTemplate(template: string, comment: SocialComment): string {
        // Basic personalization - in a real app, this would be more sophisticated
        let personalized = template;

        if (comment.author_username) {
            personalized = personalized.replace(/{username}/g, `@${comment.author_username}`);
            personalized = personalized.replace(/{name}/g, comment.author_username);
        }

        return personalized;
    }

    private calculateSentimentDistribution(history: ReplyHistory[]) {
        const distribution: Record<string, number> = {};

        // This would need to be joined with social_comments table in a real implementation
        // For now, return mock data
        return {
            positive: 45,
            neutral: 30,
            question: 15,
            negative: 8,
            complaint: 2
        };
    }

    private calculatePlatformPerformance(history: ReplyHistory[]) {
        // Mock platform performance data
        return {
            youtube: { avgEngagement: 0.8, totalReplies: 25 },
            instagram: { avgEngagement: 0.6, totalReplies: 18 },
            tiktok: { avgEngagement: 0.9, totalReplies: 32 }
        };
    }
}

export const replyAssistantService = ReplyAssistantService.getInstance();