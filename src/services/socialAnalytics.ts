import { supabase } from '@/db/supabase';
import { socialAuth, type SocialPlatform, type PlatformCredential } from './socialAuth';
import { YouTubeAPIClient } from './social/platforms/youtube';

export interface PlatformStats {
    platform: SocialPlatform;
    followerCount: number;
    viewCount: number;
    engagementRate: number;
    lastUpdated: string;
}

export class SocialAnalyticsService {
    private static instance: SocialAnalyticsService;

    private constructor() { }

    static getInstance(): SocialAnalyticsService {
        if (!SocialAnalyticsService.instance) {
            SocialAnalyticsService.instance = new SocialAnalyticsService();
        }
        return SocialAnalyticsService.instance;
    }

    /**
     * Fetch the latest stats for all connected accounts of a user
     */
    async refreshAllStats(userId: string): Promise<PlatformStats[]> {
        const credentials = await socialAuth.getCredentials(userId);
        const results: PlatformStats[] = [];

        for (const cred of credentials) {
            try {
                const validCred = await socialAuth.ensureValidToken(cred);
                const stats = await this.fetchPlatformStats(validCred);

                if (stats) {
                    await this.persistSnapshot(userId, cred.id, cred.platform, stats);
                    results.push({
                        platform: cred.platform,
                        followerCount: stats.followerCount,
                        viewCount: stats.viewCount,
                        engagementRate: stats.engagementRate || 0,
                        lastUpdated: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error(`Failed to refresh stats for ${cred.platform}:`, error);
            }
        }

        return results;
    }

    /**
     * Fetch stats from a specific platform API
     */
    private async fetchPlatformStats(credential: PlatformCredential): Promise<any> {
        switch (credential.platform) {
            case 'youtube':
                const ytClient = new YouTubeAPIClient(credential);
                return await ytClient.getChannelStats();

            // Other platforms to be added as APIs are fully integrated
            default:
                console.warn(`Stats fetching not implemented for ${credential.platform}`);
                return null;
        }
    }

    /**
     * Save stats to the database
     */
    private async persistSnapshot(userId: string, credentialId: string, platform: SocialPlatform, stats: any) {
        const { error } = await supabase
            .from('social_analytics_snapshots')
            .upsert({
                user_id: userId,
                credential_id: credentialId,
                platform,
                follower_count: stats.followerCount,
                total_views_30d: stats.viewCount,
                snapshot_date: new Date().toISOString().split('T')[0],
                metadata: stats
            }, {
                onConflict: 'credential_id,snapshot_date'
            });

        if (error) {
            console.error('Error persisting analytics snapshot:', error);
        }
    }

    /**
     * Get historical analytics for a user
     */
    async getHistory(userId: string, days: number = 30): Promise<any[]> {
        const { data, error } = await supabase
            .from('social_analytics_snapshots')
            .select('*')
            .eq('user_id', userId)
            .order('snapshot_date', { ascending: true })
            .limit(days * 6); // Max 6 platforms

        if (error) throw error;
        return data || [];
    }
}

export const socialAnalytics = SocialAnalyticsService.getInstance();
