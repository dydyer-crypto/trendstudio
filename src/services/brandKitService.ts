import { supabase } from '@/db/supabase';

export interface BrandKit {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    typography: {
        primary: string;
        secondary: string;
        heading: string;
        body: string;
    };
    brand_voice: {
        tone: string[];
        style: string[];
        keywords: string[];
    };
    vibe?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BrandAsset {
    id: string;
    brand_kit_id: string;
    asset_type: 'logo' | 'font' | 'template' | 'image' | 'icon' | 'pattern';
    asset_name: string;
    asset_url: string;
    file_size?: number;
    mime_type?: string;
    metadata: Record<string, any>;
    is_primary: boolean;
    sort_order: number;
    created_at: string;
}

export class BrandKitService {
    /**
     * Get all brand kits for a user
     */
    async getBrandKits(userId: string): Promise<BrandKit[]> {
        const { data, error } = await supabase
            .from('brand_kits')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching brand kits:', error);
            throw new Error('Failed to fetch brand kits');
        }

        return data || [];
    }

    /**
     * Get active brand kit for a user
     */
    async getActiveBrandKit(userId: string): Promise<BrandKit | null> {
        const { data, error } = await supabase
            .from('brand_kits')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching active brand kit:', error);
            return null;
        }

        return data;
    }

    /**
     * Create a new brand kit
     */
    async createBrandKit(userId: string, kitData: Partial<BrandKit>): Promise<BrandKit> {
        const defaultKit = {
            name: 'Mon Kit de Marque',
            primary_color: '#3b82f6',
            secondary_color: '#1d4ed8',
            accent_color: '#8b5cf6',
            font_family: 'Inter',
            typography: {
                primary: 'Inter',
                secondary: 'Roboto',
                heading: 'Inter',
                body: 'Inter'
            },
            brand_voice: {
                tone: [],
                style: [],
                keywords: []
            },
            is_active: true,
            ...kitData
        };

        const { data, error } = await supabase
            .from('brand_kits')
            .insert([{
                user_id: userId,
                ...defaultKit
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating brand kit:', error);
            throw new Error('Failed to create brand kit');
        }

        return data;
    }

    /**
     * Update a brand kit
     */
    async updateBrandKit(kitId: string, updates: Partial<BrandKit>): Promise<BrandKit> {
        const { data, error } = await supabase
            .from('brand_kits')
            .update(updates)
            .eq('id', kitId)
            .select()
            .single();

        if (error) {
            console.error('Error updating brand kit:', error);
            throw new Error('Failed to update brand kit');
        }

        return data;
    }

    /**
     * Set active brand kit for user
     */
    async setActiveBrandKit(userId: string, kitId: string): Promise<void> {
        // First, set all kits to inactive
        await supabase
            .from('brand_kits')
            .update({ is_active: false })
            .eq('user_id', userId);

        // Then set the selected kit to active
        const { error } = await supabase
            .from('brand_kits')
            .update({ is_active: true })
            .eq('id', kitId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error setting active brand kit:', error);
            throw new Error('Failed to set active brand kit');
        }
    }

    /**
     * Delete a brand kit
     */
    async deleteBrandKit(kitId: string): Promise<void> {
        const { error } = await supabase
            .from('brand_kits')
            .delete()
            .eq('id', kitId);

        if (error) {
            console.error('Error deleting brand kit:', error);
            throw new Error('Failed to delete brand kit');
        }
    }

    /**
     * Get brand assets for a kit
     */
    async getBrandAssets(brandKitId: string): Promise<BrandAsset[]> {
        const { data, error } = await supabase
            .from('brand_assets')
            .select('*')
            .eq('brand_kit_id', brandKitId)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching brand assets:', error);
            throw new Error('Failed to fetch brand assets');
        }

        return data || [];
    }

    /**
     * Add a brand asset
     */
    async addBrandAsset(asset: Omit<BrandAsset, 'id' | 'created_at'>): Promise<BrandAsset> {
        const { data, error } = await supabase
            .from('brand_assets')
            .insert([asset])
            .select()
            .single();

        if (error) {
            console.error('Error adding brand asset:', error);
            throw new Error('Failed to add brand asset');
        }

        return data;
    }

    /**
     * Update a brand asset
     */
    async updateBrandAsset(assetId: string, updates: Partial<BrandAsset>): Promise<BrandAsset> {
        const { data, error } = await supabase
            .from('brand_assets')
            .update(updates)
            .eq('id', assetId)
            .select()
            .single();

        if (error) {
            console.error('Error updating brand asset:', error);
            throw new Error('Failed to update brand asset');
        }

        return data;
    }

    /**
     * Delete a brand asset
     */
    async deleteBrandAsset(assetId: string): Promise<void> {
        const { error } = await supabase
            .from('brand_assets')
            .delete()
            .eq('id', assetId);

        if (error) {
            console.error('Error deleting brand asset:', error);
            throw new Error('Failed to delete brand asset');
        }
    }

    /**
     * Extract colors from an image URL using canvas analysis
     */
    async extractColorsFromImage(imageUrl: string): Promise<string[]> {
        try {
            // Create a canvas element for image analysis
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Set up CORS for cross-origin images
            img.crossOrigin = 'anonymous';

            return new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        // Set canvas size to image size
                        canvas.width = img.width;
                        canvas.height = img.height;

                        // Draw image to canvas
                        ctx!.drawImage(img, 0, 0);

                        // Get image data
                        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;

                        // Extract colors using k-means clustering approach
                        const colors = this.extractDominantColors(data, 5);

                        resolve(colors);
                    } catch (error) {
                        console.error('Canvas processing error:', error);
                        resolve(this.getFallbackColors());
                    }
                };

                img.onerror = () => {
                    console.warn('Failed to load image for color extraction, using defaults');
                    resolve(this.getFallbackColors());
                };

                img.src = imageUrl;
            });
        } catch (error) {
            console.error('Error extracting colors:', error);
            return this.getFallbackColors();
        }
    }

    /**
     * Extract dominant colors using simplified k-means clustering
     */
    private extractDominantColors(imageData: Uint8ClampedArray, numColors: number): string[] {
        const pixels: number[][] = [];
        const width = Math.sqrt(imageData.length / 4); // Approximate width

        // Sample pixels (take every 10th pixel for performance)
        for (let i = 0; i < imageData.length; i += 40) { // 4 bytes per pixel * 10 = 40
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const alpha = imageData[i + 3];

            // Skip transparent pixels
            if (alpha > 128) {
                pixels.push([r, g, b]);
            }
        }

        if (pixels.length === 0) {
            return this.getFallbackColors();
        }

        // Simple color quantization - group similar colors
        const colorGroups: { color: number[]; count: number }[] = [];

        pixels.forEach(pixel => {
            let found = false;
            for (const group of colorGroups) {
                if (this.colorDistance(pixel, group.color) < 50) { // Color similarity threshold
                    group.count++;
                    // Average the colors
                    group.color = group.color.map((c, i) => Math.round((c * (group.count - 1) + pixel[i]) / group.count));
                    found = true;
                    break;
                }
            }

            if (!found && colorGroups.length < numColors) {
                colorGroups.push({ color: [...pixel], count: 1 });
            }
        });

        // Sort by frequency and convert to hex
        colorGroups.sort((a, b) => b.count - a.count);

        return colorGroups.slice(0, numColors).map(group =>
            this.rgbToHex(group.color[0], group.color[1], group.color[2])
        );
    }

    /**
     * Calculate Euclidean distance between two RGB colors
     */
    private colorDistance(color1: number[], color2: number[]): number {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    /**
     * Convert RGB to hex color
     */
    private rgbToHex(r: number, g: number, b: number): string {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Get fallback colors when extraction fails
     */
    private getFallbackColors(): string[] {
        return [
            '#3b82f6', // blue-500
            '#1d4ed8', // blue-700
            '#8b5cf6', // violet-500
            '#06b6d4', // cyan-500
            '#10b981', // emerald-500
        ];
    }

    /**
     * Get brand kit summary for UI
     */
    getBrandKitSummary(kit: BrandKit): {
        hasLogo: boolean;
        hasColors: boolean;
        hasTypography: boolean;
        completeness: number;
    } {
        const hasLogo = !!kit.logo_url;
        const hasColors = !!(kit.primary_color && kit.secondary_color && kit.accent_color);
        const hasTypography = !!(kit.typography?.primary && kit.typography?.body);

        const completeness = [hasLogo, hasColors, hasTypography].filter(Boolean).length / 3 * 100;

        return {
            hasLogo,
            hasColors,
            hasTypography,
            completeness: Math.round(completeness)
        };
    }

    /**
     * Export brand kit as JSON
     */
    exportBrandKit(kit: BrandKit, assets: BrandAsset[]): string {
        const exportData = {
            brandKit: kit,
            assets,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }
}

export const brandKitService = new BrandKitService();