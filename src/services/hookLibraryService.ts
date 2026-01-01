import { supabase } from '@/db/supabase';

export interface HookLibraryItem {
    id: string;
    userId: string;
    hookText: string;
    categoryId?: string;
    topic?: string;
    platform?: string;
    performanceScore: number;
    tags: string[];
    isFavorite: boolean;
    usageCount: number;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
    // Additional computed fields
    category?: {
        id: string;
        name: string;
        displayName: string;
        color: string;
        icon: string;
    };
}

export interface HookLibraryFilters {
    search?: string;
    category?: string;
    platform?: string;
    isFavorite?: boolean;
    minPerformanceScore?: number;
    maxPerformanceScore?: number;
    minUsageCount?: number;
    tags?: string[];
    sortBy?: 'performance_score' | 'usage_count' | 'last_used_at' | 'created_at' | 'hook_text';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface HookLibraryStats {
    totalHooks: number;
    favoriteHooks: number;
    totalUsage: number;
    averagePerformance: number;
    topCategories: Array<{
        categoryId: string;
        categoryName: string;
        count: number;
        averagePerformance: number;
    }>;
    topPlatforms: Array<{
        platform: string;
        count: number;
        averagePerformance: number;
    }>;
    recentUsage: Array<{
        date: string;
        count: number;
    }>;
}

export class HookLibraryService {
    /**
     * Add a hook to the user's library
     */
    async addHook(hookData: {
        hookText: string;
        categoryId?: string;
        topic?: string;
        platform?: string;
        tags?: string[];
        performanceScore?: number;
    }): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('hook_library')
            .insert({
                user_id: user.id,
                hook_text: hookData.hookText,
                category_id: hookData.categoryId,
                topic: hookData.topic,
                platform: hookData.platform,
                tags: hookData.tags || [],
                performance_score: hookData.performanceScore || 0,
                is_favorite: false,
                usage_count: 0
            })
            .select(`
                *,
                hook_categories (
                    id,
                    name,
                    display_name,
                    color,
                    icon
                )
            `)
            .single();

        if (error) throw error;

        return this.transformHookLibraryItem(data);
    }

    /**
     * Get hooks from user's library with advanced filtering
     */
    async getHooks(filters: HookLibraryFilters = {}): Promise<{
        hooks: HookLibraryItem[];
        total: number;
        hasMore: boolean;
    }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        let query = supabase
            .from('hook_library')
            .select(`
                *,
                hook_categories (
                    id,
                    name,
                    display_name,
                    color,
                    icon
                )
            `, { count: 'exact' })
            .eq('user_id', user.id);

        // Apply filters
        if (filters.search) {
            query = query.or(`hook_text.ilike.%${filters.search}%,topic.ilike.%${filters.search}%`);
        }

        if (filters.category) {
            query = query.eq('category_id', filters.category);
        }

        if (filters.platform) {
            query = query.eq('platform', filters.platform);
        }

        if (filters.isFavorite !== undefined) {
            query = query.eq('is_favorite', filters.isFavorite);
        }

        if (filters.minPerformanceScore !== undefined) {
            query = query.gte('performance_score', filters.minPerformanceScore);
        }

        if (filters.maxPerformanceScore !== undefined) {
            query = query.lte('performance_score', filters.maxPerformanceScore);
        }

        if (filters.minUsageCount !== undefined) {
            query = query.gte('usage_count', filters.minUsageCount);
        }

        if (filters.tags && filters.tags.length > 0) {
            query = query.overlaps('tags', filters.tags);
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        const dbSortField = this.mapSortField(sortBy);
        query = query.order(dbSortField, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const hooks = data?.map(item => this.transformHookLibraryItem(item)) || [];
        const total = count || 0;
        const hasMore = total > offset + hooks.length;

        return { hooks, total, hasMore };
    }

    /**
     * Update a hook in the library
     */
    async updateHook(hookId: string, updates: Partial<{
        hookText: string;
        categoryId: string;
        topic: string;
        platform: string;
        tags: string[];
        performanceScore: number;
        isFavorite: boolean;
    }>): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (updates.hookText !== undefined) updateData.hook_text = updates.hookText;
        if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
        if (updates.topic !== undefined) updateData.topic = updates.topic;
        if (updates.platform !== undefined) updateData.platform = updates.platform;
        if (updates.tags !== undefined) updateData.tags = updates.tags;
        if (updates.performanceScore !== undefined) updateData.performance_score = updates.performanceScore;
        if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

        const { data, error } = await supabase
            .from('hook_library')
            .update(updateData)
            .eq('id', hookId)
            .eq('user_id', user.id)
            .select(`
                *,
                hook_categories (
                    id,
                    name,
                    display_name,
                    color,
                    icon
                )
            `)
            .single();

        if (error) throw error;

        return this.transformHookLibraryItem(data);
    }

    /**
     * Delete a hook from the library
     */
    async deleteHook(hookId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('hook_library')
            .delete()
            .eq('id', hookId)
            .eq('user_id', user.id);

        if (error) throw error;
    }

    /**
     * Toggle favorite status of a hook
     */
    async toggleFavorite(hookId: string): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get current favorite status
        const { data: currentHook, error: fetchError } = await supabase
            .from('hook_library')
            .select('is_favorite')
            .eq('id', hookId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) throw fetchError;

        // Toggle favorite status
        const newFavoriteStatus = !currentHook.is_favorite;

        return this.updateHook(hookId, { isFavorite: newFavoriteStatus });
    }

    /**
     * Increment usage count and update last used timestamp
     */
    async recordUsage(hookId: string): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // First get current usage count
        const { data: current, error: fetchError } = await supabase
            .from('hook_library')
            .select('usage_count')
            .eq('id', hookId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('hook_library')
            .update({
                usage_count: (current.usage_count || 0) + 1,
                last_used_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', hookId)
            .eq('user_id', user.id)
            .select(`
                *,
                hook_categories (
                    id,
                    name,
                    display_name,
                    color,
                    icon
                )
            `)
            .single();

        if (error) throw error;

        return this.transformHookLibraryItem(data);
    }

    /**
     * Update performance score based on actual results
     */
    async updatePerformanceScore(hookId: string, newScore: number): Promise<HookLibraryItem> {
        return this.updateHook(hookId, { performanceScore: newScore });
    }

    /**
     * Add tags to a hook
     */
    async addTags(hookId: string, tags: string[]): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get current tags
        const { data: currentHook, error: fetchError } = await supabase
            .from('hook_library')
            .select('tags')
            .eq('id', hookId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) throw fetchError;

        const currentTags = currentHook.tags || [];
        const updatedTags = [...new Set([...currentTags, ...tags])];

        return this.updateHook(hookId, { tags: updatedTags });
    }

    /**
     * Remove tags from a hook
     */
    async removeTags(hookId: string, tags: string[]): Promise<HookLibraryItem> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get current tags
        const { data: currentHook, error: fetchError } = await supabase
            .from('hook_library')
            .select('tags')
            .eq('id', hookId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) throw fetchError;

        const currentTags = currentHook.tags || [];
        const updatedTags = currentTags.filter((tag: string) => !tags.includes(tag));

        return this.updateHook(hookId, { tags: updatedTags });
    }

    /**
     * Get library statistics
     */
    async getStats(): Promise<HookLibraryStats> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get basic stats
        const { data: basicStats, error: basicError } = await supabase
            .from('hook_library')
            .select('performance_score, usage_count, is_favorite, category_id, platform')
            .eq('user_id', user.id);

        if (basicError) throw basicError;

        const totalHooks = basicStats?.length || 0;
        const favoriteHooks = basicStats?.filter(h => h.is_favorite).length || 0;
        const totalUsage = basicStats?.reduce((sum, h) => sum + h.usage_count, 0) || 0;
        const averagePerformance = totalHooks > 0
            ? basicStats?.reduce((sum, h) => sum + h.performance_score, 0) / totalHooks || 0
            : 0;

        // Get top categories
        const { data: categoryStats, error: categoryError } = await supabase
            .from('hook_library')
            .select(`
                category_id,
                performance_score,
                hook_categories (
                    name,
                    display_name
                )
            `)
            .eq('user_id', user.id)
            .not('category_id', 'is', null);

        if (categoryError) throw categoryError;

        const categoryMap = new Map<string, { name: string; displayName: string; count: number; totalPerformance: number }>();

        categoryStats?.forEach(item => {
            const catId = item.category_id;
            const cat = item.hook_categories as any;
            const existing = categoryMap.get(catId) || {
                name: cat.name,
                displayName: cat.display_name,
                count: 0,
                totalPerformance: 0
            };
            existing.count++;
            existing.totalPerformance += item.performance_score;
            categoryMap.set(catId, existing);
        });

        const topCategories = Array.from(categoryMap.entries())
            .map(([id, data]) => ({
                categoryId: id,
                categoryName: data.displayName,
                count: data.count,
                averagePerformance: data.totalPerformance / data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get top platforms
        const platformMap = new Map<string, { count: number; totalPerformance: number }>();

        basicStats?.forEach(item => {
            if (item.platform) {
                const existing = platformMap.get(item.platform) || { count: 0, totalPerformance: 0 };
                existing.count++;
                existing.totalPerformance += item.performance_score;
                platformMap.set(item.platform, existing);
            }
        });

        const topPlatforms = Array.from(platformMap.entries())
            .map(([platform, data]) => ({
                platform,
                count: data.count,
                averagePerformance: data.totalPerformance / data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get recent usage (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: usageData, error: usageError } = await supabase
            .from('hook_library')
            .select('last_used_at')
            .eq('user_id', user.id)
            .not('last_used_at', 'is', null)
            .gte('last_used_at', thirtyDaysAgo.toISOString());

        if (usageError) throw usageError;

        const usageMap = new Map<string, number>();
        usageData?.forEach(item => {
            const date = new Date(item.last_used_at!).toISOString().split('T')[0];
            usageMap.set(date, (usageMap.get(date) || 0) + 1);
        });

        const recentUsage = Array.from(usageMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalHooks,
            favoriteHooks,
            totalUsage,
            averagePerformance,
            topCategories,
            topPlatforms,
            recentUsage
        };
    }

    /**
     * Save a generated hook to library
     */
    async saveGeneratedHook(generatedHook: any, topic?: string): Promise<HookLibraryItem> {
        return this.addHook({
            hookText: generatedHook.text,
            categoryId: generatedHook.category ? undefined : undefined, // Will be resolved by category name
            topic: topic,
            platform: generatedHook.platform,
            tags: [],
            performanceScore: generatedHook.estimatedEngagement || 0
        });
    }

    /**
     * Search hooks by text content
     */
    async searchHooks(query: string, filters: Omit<HookLibraryFilters, 'search'> = {}): Promise<HookLibraryItem[]> {
        const result = await this.getHooks({ ...filters, search: query });
        return result.hooks;
    }

    /**
     * Get favorite hooks
     */
    async getFavoriteHooks(limit = 10): Promise<HookLibraryItem[]> {
        const result = await this.getHooks({
            isFavorite: true,
            sortBy: 'last_used_at',
            sortOrder: 'desc',
            limit
        });
        return result.hooks;
    }

    /**
     * Get most used hooks
     */
    async getMostUsedHooks(limit = 10): Promise<HookLibraryItem[]> {
        const result = await this.getHooks({
            sortBy: 'usage_count',
            sortOrder: 'desc',
            limit
        });
        return result.hooks;
    }

    /**
     * Get top performing hooks
     */
    async getTopPerformingHooks(limit = 10): Promise<HookLibraryItem[]> {
        const result = await this.getHooks({
            sortBy: 'performance_score',
            sortOrder: 'desc',
            limit
        });
        return result.hooks;
    }

    /**
     * Transform database row to HookLibraryItem
     */
    private transformHookLibraryItem(data: any): HookLibraryItem {
        return {
            id: data.id,
            userId: data.user_id,
            hookText: data.hook_text,
            categoryId: data.category_id,
            topic: data.topic,
            platform: data.platform,
            performanceScore: data.performance_score,
            tags: data.tags || [],
            isFavorite: data.is_favorite,
            usageCount: data.usage_count,
            lastUsedAt: data.last_used_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            category: data.hook_categories ? {
                id: data.hook_categories.id,
                name: data.hook_categories.name,
                displayName: data.hook_categories.display_name,
                color: data.hook_categories.color,
                icon: data.hook_categories.icon
            } : undefined
        };
    }

    /**
     * Map sort field to database column
     */
    private mapSortField(sortBy: string): string {
        const fieldMap: Record<string, string> = {
            'performance_score': 'performance_score',
            'usage_count': 'usage_count',
            'last_used_at': 'last_used_at',
            'created_at': 'created_at',
            'hook_text': 'hook_text'
        };
        return fieldMap[sortBy] || 'created_at';
    }
}

export const hookLibraryService = new HookLibraryService();