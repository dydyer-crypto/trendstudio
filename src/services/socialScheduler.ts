import { supabase } from '@/db/supabase';
import { socialAuth, type SocialPlatform } from './socialAuth';

export interface SchedulingSuggestion {
    platform: SocialPlatform;
    suggestedTime: Date;
    confidence: number; // 0-100
    reasoning: string;
    expectedReach: number;
    bestPractices: string[];
}

export interface PostTiming {
    platform: SocialPlatform;
    optimalHour: number; // 0-23
    optimalDay: number; // 0-6 (Sunday-Saturday)
    confidence: number;
    historicalEngagement: number;
}

export class SocialScheduler {
    /**
     * Get intelligent scheduling suggestions for a post
     */
    async getSchedulingSuggestions(
        platforms: SocialPlatform[],
        userId: string
    ): Promise<SchedulingSuggestion[]> {
        const suggestions: SchedulingSuggestion[] = [];

        for (const platform of platforms) {
            const timing = await this.analyzeBestTiming(platform, userId);
            if (timing) {
                const suggestedTime = this.calculateNextOptimalTime(timing);

                suggestions.push({
                    platform,
                    suggestedTime,
                    confidence: timing.confidence,
                    reasoning: this.generateReasoning(timing),
                    expectedReach: this.estimateReach(platform, timing),
                    bestPractices: this.getBestPractices(platform, timing),
                });
            }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Analyze historical data to find best posting times
     */
    private async analyzeBestTiming(
        platform: SocialPlatform,
        userId: string
    ): Promise<PostTiming | null> {
        try {
            // Fetch last 90 days of posts for this platform
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const { data: posts, error } = await supabase
                .from('scheduled_posts')
                .select('published_date, platform_metadata')
                .eq('user_id', userId)
                .eq('platform', platform)
                .eq('status', 'published')
                .gte('published_date', ninetyDaysAgo.toISOString())
                .order('published_date', { ascending: false });

            if (error || !posts || posts.length < 5) {
                // Not enough data, use platform defaults
                return this.getDefaultTiming(platform);
            }

            // Analyze engagement by hour and day
            const hourlyEngagement = new Array(24).fill(0);
            const dailyEngagement = new Array(7).fill(0);
            const hourlyCounts = new Array(24).fill(0);
            const dailyCounts = new Array(7).fill(0);

            posts.forEach(post => {
                if (post.published_date) {
                    const date = new Date(post.published_date);
                    const hour = date.getHours();
                    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

                    // Extract engagement metrics (simplified - in real app, would use actual API data)
                    const engagement = post.platform_metadata?.engagement ||
                        post.platform_metadata?.likes ||
                        Math.floor(Math.random() * 100) + 10; // Mock data

                    hourlyEngagement[hour] += engagement;
                    dailyEngagement[day] += engagement;
                    hourlyCounts[hour] += 1;
                    dailyCounts[day] += 1;
                }
            });

            // Calculate average engagement per hour/day
            const avgHourlyEngagement = hourlyEngagement.map((total, hour) =>
                hourlyCounts[hour] > 0 ? total / hourlyCounts[hour] : 0
            );

            const avgDailyEngagement = dailyEngagement.map((total, day) =>
                dailyCounts[day] > 0 ? total / dailyCounts[day] : 0
            );

            // Find optimal hour and day
            const optimalHour = avgHourlyEngagement.indexOf(Math.max(...avgHourlyEngagement));
            const optimalDay = avgDailyEngagement.indexOf(Math.max(...avgDailyEngagement));

            // Calculate confidence based on data quality
            const totalPosts = posts.length;
            const confidence = Math.min(100, totalPosts * 10); // More posts = higher confidence

            return {
                platform,
                optimalHour,
                optimalDay,
                confidence,
                historicalEngagement: Math.max(...avgHourlyEngagement),
            };

        } catch (error) {
            console.error(`Failed to analyze timing for ${platform}:`, error);
            return this.getDefaultTiming(platform);
        }
    }

    /**
     * Get default timing when no historical data is available
     */
    private getDefaultTiming(platform: SocialPlatform): PostTiming {
        const defaults = {
            youtube: { hour: 14, day: 2 }, // Tuesday 2 PM
            instagram: { hour: 11, day: 1 }, // Monday 11 AM
            tiktok: { hour: 19, day: 4 }, // Thursday 7 PM
            twitter: { hour: 9, day: 2 }, // Tuesday 9 AM
            facebook: { hour: 13, day: 3 }, // Wednesday 1 PM
            linkedin: { hour: 8, day: 1 }, // Monday 8 AM
        };

        const defaultForPlatform = defaults[platform] || { hour: 12, day: 1 };

        return {
            platform,
            optimalHour: defaultForPlatform.hour,
            optimalDay: defaultForPlatform.day,
            confidence: 60, // Lower confidence for defaults
            historicalEngagement: 50,
        };
    }

    /**
     * Calculate the next optimal posting time
     */
    private calculateNextOptimalTime(timing: PostTiming): Date {
        const now = new Date();
        const nextOptimal = new Date(now);

        // Set to optimal hour
        nextOptimal.setHours(timing.optimalHour, 0, 0, 0);

        // If we already passed the optimal time today, move to next occurrence
        if (nextOptimal <= now) {
            // Find next occurrence of optimal day
            const daysUntilOptimal = (timing.optimalDay - now.getDay() + 7) % 7;
            if (daysUntilOptimal === 0) {
                // Same day but already passed, move to next week
                nextOptimal.setDate(nextOptimal.getDate() + 7);
            } else {
                nextOptimal.setDate(nextOptimal.getDate() + daysUntilOptimal);
            }
        } else {
            // Check if today is the optimal day
            if (now.getDay() !== timing.optimalDay) {
                const daysUntilOptimal = (timing.optimalDay - now.getDay() + 7) % 7;
                nextOptimal.setDate(nextOptimal.getDate() + daysUntilOptimal);
            }
        }

        return nextOptimal;
    }

    /**
     * Generate reasoning for the scheduling suggestion
     */
    private generateReasoning(timing: PostTiming): string {
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const confidence = timing.confidence > 80 ? 'très fiable' :
            timing.confidence > 60 ? 'fiable' : 'basée sur les tendances générales';

        return `Analyse ${confidence} basée sur vos publications passées. ` +
            `Le ${dayNames[timing.optimalDay]} à ${timing.optimalHour}h ` +
            `montre historiquement le meilleur taux d'engagement pour ${timing.platform}.`;
    }

    /**
     * Estimate expected reach for the suggested time
     */
    private estimateReach(platform: SocialPlatform, timing: PostTiming): number {
        const baseReach = {
            youtube: 5000,
            instagram: 2000,
            tiktok: 8000,
            twitter: 1500,
            facebook: 3000,
            linkedin: 1000,
        };

        const platformBase = baseReach[platform] || 1000;
        const multiplier = 1 + (timing.confidence / 100) * 0.5; // Up to 50% boost based on confidence

        return Math.round(platformBase * multiplier);
    }

    /**
     * Get best practices for the platform and timing
     */
    private getBestPractices(platform: SocialPlatform, timing: PostTiming): string[] {
        const commonPractices = [
            'Utilisez des hashtags pertinents',
            'Créez du contenu de qualité visuelle',
            'Engagez-vous avec votre audience',
        ];

        const platformPractices = {
            youtube: [
                'Optimisez le titre et la description SEO',
                'Ajoutez des thumbnails accrocheuses',
                'Publiez des vidéos de 8-15 minutes pour plus d\'engagement',
            ],
            instagram: [
                'Utilisez des Stories pour booster l\'engagement',
                'Publiez du contenu authentique et relatable',
                'Utilisez Reels pour plus de visibilité',
            ],
            tiktok: [
                'Créez du contenu court et dynamique',
                'Utilisez les tendances musicales actuelles',
                'Encouragez le duvet et les réactions',
            ],
            twitter: [
                'Posez des questions pour encourager les réponses',
                'Utilisez des threads pour les longs contenus',
                'Participez aux conversations trending',
            ],
            facebook: [
                'Créez des publications qui encouragent les commentaires',
                'Utilisez des images ou vidéos attrayantes',
                'Programmez plusieurs publications par semaine',
            ],
            linkedin: [
                'Partagez du contenu professionnel et éducatif',
                'Utilisez des hashtags B2B pertinents',
                'Commentez et partagez les publications d\'autres',
            ],
        };

        return [...commonPractices, ...(platformPractices[platform] || [])];
    }

    /**
     * Schedule a post with intelligent timing
     */
    async schedulePostIntelligently(
        postData: {
            title: string;
            description: string;
            platforms: SocialPlatform[];
            content_url?: string;
            thumbnail_url?: string;
        },
        userId: string
    ): Promise<any[]> {
        const suggestions = await this.getSchedulingSuggestions(postData.platforms, userId);
        const scheduledPosts = [];

        for (const suggestion of suggestions) {
            try {
                const { data, error } = await supabase
                    .from('scheduled_posts')
                    .insert({
                        user_id: userId,
                        title: postData.title,
                        description: postData.description,
                        platform: suggestion.platform,
                        status: 'scheduled',
                        scheduled_date: suggestion.suggestedTime.toISOString(),
                        content_url: postData.content_url,
                        thumbnail_url: postData.thumbnail_url,
                        scheduling_metadata: {
                            confidence: suggestion.confidence,
                            expected_reach: suggestion.expectedReach,
                            reasoning: suggestion.reasoning,
                        },
                    })
                    .select()
                    .single();

                if (error) throw error;

                scheduledPosts.push({
                    ...data,
                    suggestion,
                });
            } catch (error) {
                console.error(`Failed to schedule post for ${suggestion.platform}:`, error);
            }
        }

        return scheduledPosts;
    }
}

export const socialScheduler = new SocialScheduler();