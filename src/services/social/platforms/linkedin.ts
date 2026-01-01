import { PlatformCredential } from '../../socialAuth';

export interface LinkedInPost {
    text: string;
    title?: string;
    imageUrl?: string;
    articleUrl?: string;
    visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export interface LinkedInPostResult {
    postId: string;
    url: string;
    status: 'published' | 'failed';
    error?: string;
}

export class LinkedInAPIClient {
    constructor(private credential: PlatformCredential) { }

    /**
     * Publish a post to LinkedIn
     */
    async publishPost(post: LinkedInPost): Promise<LinkedInPostResult> {
        try {
            // Get user info first to get the author URN
            const userInfo = await this.getUserInfo();
            const authorUrn = `urn:li:person:${userInfo.id}`;

            let postData: any;

            if (post.articleUrl) {
                // Article post
                postData = {
                    content: {
                        contentEntities: [
                            {
                                entityLocation: post.articleUrl,
                                thumbnails: post.imageUrl ? [{ resolvedUrl: post.imageUrl }] : [],
                            },
                        ],
                        title: post.title || '',
                    },
                    distribution: {
                        feedDistribution: 'MAIN_FEED',
                        targetEntities: [],
                        thirdPartyDistributionChannels: [],
                    },
                    owner: authorUrn,
                    subject: post.title || 'Article',
                    text: {
                        text: post.text,
                    },
                };
            } else if (post.imageUrl) {
                // Image post
                const mediaId = await this.uploadImage(post.imageUrl);

                postData = {
                    author: authorUrn,
                    commentary: post.text,
                    visibility: post.visibility || 'PUBLIC',
                    distribution: {
                        feedDistribution: 'MAIN_FEED',
                        targetEntities: [],
                        thirdPartyDistributionChannels: [],
                    },
                    content: {
                        media: {
                            id: mediaId,
                        },
                    },
                };
            } else {
                // Text-only post
                postData = {
                    author: authorUrn,
                    commentary: post.text,
                    visibility: post.visibility || 'PUBLIC',
                    distribution: {
                        feedDistribution: 'MAIN_FEED',
                        targetEntities: [],
                        thirdPartyDistributionChannels: [],
                    },
                };
            }

            const response = await fetch('https://api.linkedin.com/v2/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`LinkedIn API error: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();

            return {
                postId: result.id,
                url: `https://www.linkedin.com/feed/update/${result.id}`,
                status: 'published',
            };
        } catch (error) {
            console.error('LinkedIn post failed:', error);
            return {
                postId: '',
                url: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Upload image to LinkedIn
     */
    private async uploadImage(imageUrl: string): Promise<string> {
        try {
            // Step 1: Register upload
            const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    registerUploadRequest: {
                        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                        owner: `urn:li:person:${(await this.getUserInfo()).id}`,
                        serviceRelationships: [
                            {
                                relationshipType: 'OWNER',
                                identifier: 'urn:li:userGeneratedContent',
                            },
                        ],
                    },
                }),
            });

            if (!registerResponse.ok) {
                throw new Error(`Image upload registration failed: ${registerResponse.statusText}`);
            }

            const registerData = await registerResponse.json();
            const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            const assetId = registerData.value.asset.split(':').pop();

            // Step 2: Upload image
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
            }
            const imageBlob = await imageResponse.blob();

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'image/jpeg',
                },
                body: imageBlob,
            });

            if (!uploadResponse.ok) {
                throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
            }

            return assetId;
        } catch (error) {
            console.error('LinkedIn image upload failed:', error);
            throw error;
        }
    }

    /**
     * Get user info
     */
    async getUserInfo(): Promise<any> {
        try {
            const response = await fetch('https://api.linkedin.com/v2/people/~', {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`LinkedIn API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get LinkedIn user info:', error);
            return null;
        }
    }

    /**
     * Get user organizations (companies)
     */
    async getUserOrganizations(): Promise<any[]> {
        try {
            const response = await fetch('https://api.linkedin.com/v2/organizations', {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`LinkedIn API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.elements || [];
        } catch (error) {
            console.error('Failed to get LinkedIn organizations:', error);
            return [];
        }
    }
}