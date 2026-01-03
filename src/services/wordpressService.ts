import { supabase } from '@/db/supabase';

export interface WordPressSite {
    id: string;
    user_id: string;
    site_name: string;
    site_url: string;
    api_url: string; // https://site.com/wp-json/wp/v2/
    username: string;
    application_password?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WordPressPost {
    id?: number;
    title: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'publish' | 'private' | 'pending';
    categories?: number[];
    tags?: number[];
    featured_media?: number;
    meta?: Record<string, any>;
    slug?: string;
    date?: string;
}

export interface WordPressCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent?: number;
}

export interface WordPressTag {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface WordPressExportOptions {
    content: string;
    title: string;
    excerpt?: string;
    categories?: string[];
    tags?: string[];
    status?: 'draft' | 'publish';
    featuredImage?: File;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
}

export class WordPressService {
    private static instance: WordPressService;

    private constructor() { }

    static getInstance(): WordPressService {
        if (!WordPressService.instance) {
            WordPressService.instance = new WordPressService();
        }
        return WordPressService.instance;
    }

    /**
     * Connect to WordPress site
     */
    async connectSite(siteData: Omit<WordPressSite, 'id' | 'created_at' | 'updated_at'>): Promise<WordPressSite> {
        try {
            // Validate connection by testing API
            const isValid = await this.testConnection(siteData.api_url, siteData.username, siteData.application_password!);

            if (!isValid) {
                throw new Error('Connexion WordPress impossible. Vérifiez vos identifiants.');
            }

            const { data, error } = await supabase
                .from('wordpress_sites')
                .insert([siteData])
                .select()
                .single();

            if (error) {
                console.error('Error saving WordPress site:', error);
                throw new Error('Erreur lors de la sauvegarde du site WordPress');
            }

            return data;
        } catch (error) {
            console.error('WordPress connection error:', error);
            throw error;
        }
    }

    /**
     * Test WordPress API connection
     */
    async testConnection(apiUrl: string, username: string, password: string): Promise<boolean> {
        try {
            const auth = btoa(`${username}:${password}`);
            const response = await fetch(`${apiUrl}users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    /**
     * Get user's connected WordPress sites
     */
    async getUserSites(userId: string): Promise<WordPressSite[]> {
        const { data, error } = await supabase
            .from('wordpress_sites')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching WordPress sites:', error);
            throw new Error('Erreur lors de la récupération des sites WordPress');
        }

        return data || [];
    }

    /**
     * Get WordPress categories
     */
    async getCategories(site: WordPressSite): Promise<WordPressCategory[]> {
        try {
            const auth = btoa(`${site.username}:${site.application_password}`);
            const response = await fetch(`${site.api_url}categories?per_page=100`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des catégories');
            }

            const categories = await response.json();
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Impossible de récupérer les catégories WordPress');
        }
    }

    /**
     * Get WordPress tags
     */
    async getTags(site: WordPressSite): Promise<WordPressTag[]> {
        try {
            const auth = btoa(`${site.username}:${site.application_password}`);
            const response = await fetch(`${site.api_url}tags?per_page=100`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des tags');
            }

            const tags = await response.json();
            return tags;
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw new Error('Impossible de récupérer les tags WordPress');
        }
    }

    /**
     * Export content to WordPress
     */
    async exportToWordPress(site: WordPressSite, options: WordPressExportOptions): Promise<{ postId: number; postUrl: string }> {
        try {
            const auth = btoa(`${site.username}:${site.application_password}`);

            // Prepare post data
            const postData: WordPressPost = {
                title: options.title,
                content: this.formatContentForWordPress(options.content),
                status: options.status || 'draft',
                excerpt: options.excerpt,
            };

            // Handle categories and tags
            if (options.categories?.length) {
                const siteCategories = await this.getCategories(site);
                postData.categories = options.categories
                    .map(catName => siteCategories.find(cat => cat.name.toLowerCase() === catName.toLowerCase())?.id)
                    .filter(Boolean) as number[];
            }

            if (options.tags?.length) {
                const siteTags = await this.getTags(site);
                const existingTags = options.tags
                    .map(tagName => siteTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())?.id)
                    .filter(Boolean) as number[];

                // Create missing tags
                const missingTags = options.tags.filter(tagName =>
                    !siteTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
                );

                for (const tagName of missingTags) {
                    const newTag = await this.createTag(site, tagName);
                    existingTags.push(newTag.id);
                }

                postData.tags = existingTags;
            }

            // Add SEO meta if Yoast is available
            if (options.seoTitle || options.seoDescription || options.focusKeyword) {
                postData.meta = {
                    _yoast_wpseo_title: options.seoTitle,
                    _yoast_wpseo_metadesc: options.seoDescription,
                    _yoast_wpseo_focuskw: options.focusKeyword,
                };
            }

            // Upload featured image if provided
            if (options.featuredImage) {
                const mediaId = await this.uploadMedia(site, options.featuredImage);
                postData.featured_media = mediaId;
            }

            // Create the post
            const response = await fetch(`${site.api_url}posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur WordPress: ${errorData.message || response.statusText}`);
            }

            const post = await response.json();

            return {
                postId: post.id,
                postUrl: post.link
            };
        } catch (error) {
            console.error('WordPress export error:', error);
            throw error;
        }
    }

    /**
     * Upload media to WordPress
     */
    private async uploadMedia(site: WordPressSite, file: File): Promise<number> {
        try {
            const auth = btoa(`${site.username}:${site.application_password}`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);
            formData.append('alt_text', file.name);

            const response = await fetch(`${site.api_url}media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'upload de l\'image');
            }

            const media = await response.json();
            return media.id;
        } catch (error) {
            console.error('Media upload error:', error);
            throw new Error('Impossible d\'uploader l\'image vers WordPress');
        }
    }

    /**
     * Create a new tag in WordPress
     */
    private async createTag(site: WordPressSite, tagName: string): Promise<WordPressTag> {
        try {
            const auth = btoa(`${site.username}:${site.application_password}`);

            const response = await fetch(`${site.api_url}tags`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: tagName,
                    slug: tagName.toLowerCase().replace(/\s+/g, '-')
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du tag');
            }

            return await response.json();
        } catch (error) {
            console.error('Tag creation error:', error);
            throw new Error('Impossible de créer le tag dans WordPress');
        }
    }

    /**
     * Format content for WordPress (convert markdown to HTML if needed)
     */
    private formatContentForWordPress(content: string): string {
        // Basic markdown to HTML conversion for common elements
        let html = content;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    /**
     * Get WordPress post templates optimized for SEO
     */
    getPostTemplates(brandKit?: any): WordPressExportOptions[] {
        const templates: WordPressExportOptions[] = [
            {
                content: '',
                title: 'Template Article SEO',
                categories: ['Blog', 'Marketing'],
                tags: ['SEO', 'contenu', 'marketing digital'],
                status: 'draft',
                seoTitle: '',
                seoDescription: '',
                focusKeyword: ''
            },
            {
                content: '',
                title: 'Template Guide Complet',
                categories: ['Tutoriels', 'Formation'],
                tags: ['guide', 'tutoriel', 'formation'],
                status: 'draft'
            },
            {
                content: '',
                title: 'Template Étude de Cas',
                categories: ['Cas clients', 'Réussite'],
                tags: ['étude de cas', 'succès', 'résultats'],
                status: 'draft'
            }
        ];

        // Apply brand kit if available
        if (brandKit) {
            templates.forEach(template => {
                if (brandKit.brand_voice?.keywords) {
                    template.tags = [...(template.tags || []), ...brandKit.brand_voice.keywords.slice(0, 3)];
                }
            });
        }

        return templates;
    }

    /**
     * Delete WordPress site connection
     */
    async deleteSite(siteId: string): Promise<void> {
        const { error } = await supabase
            .from('wordpress_sites')
            .delete()
            .eq('id', siteId);

        if (error) {
            console.error('Error deleting WordPress site:', error);
            throw new Error('Erreur lors de la suppression du site WordPress');
        }
    }

    /**
     * Update WordPress site
     */
    async updateSite(siteId: string, updates: Partial<WordPressSite>): Promise<WordPressSite> {
        const { data, error } = await supabase
            .from('wordpress_sites')
            .update(updates)
            .eq('id', siteId)
            .select()
            .single();

        if (error) {
            console.error('Error updating WordPress site:', error);
            throw new Error('Erreur lors de la mise à jour du site WordPress');
        }

        return data;
    }
}

export const wordpressService = WordPressService.getInstance();