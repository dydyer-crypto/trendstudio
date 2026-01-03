import { supabase } from '@/db/supabase';

export interface AIRequest {
    prompt: string;
    model?: 'deepseek-chat' | 'deepseek-coder' | 'gpt-4' | 'claude-3';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}

export interface AIResponse {
    text: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class AIService {
    private static instance: AIService;

    private constructor() { }

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Generate text using AI
     */
    async generateText(request: AIRequest): Promise<AIResponse> {
        try {
            // Get API keys from user's settings or environment
            const { data: settings } = await supabase
                .from('user_api_settings')
                .select('ai_provider, deepseek_api_key, openai_api_key, anthropic_api_key')
                .single();

            const model = request.model || settings?.ai_provider || 'deepseek-chat';

            switch (model) {
                case 'deepseek-chat':
                case 'deepseek-coder':
                    return await this.callDeepSeekAPI(request, settings?.deepseek_api_key, model);
                case 'gpt-4':
                    return await this.callOpenAIAPI(request, settings?.openai_api_key);
                case 'claude-3':
                    return await this.callAnthropicAPI(request, settings?.anthropic_api_key);
                default:
                    throw new Error(`Unsupported AI model: ${model}`);
            }
        } catch (error) {
            console.error('AI generation error:', error);
            // Fallback to mock response
            return this.generateMockResponse(request);
        }
    }

    /**
     * Call DeepSeek API
     */
    private async callDeepSeekAPI(request: AIRequest, apiKey?: string, model: string = 'deepseek-chat'): Promise<AIResponse> {
        const API_KEY = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY;
        if (!API_KEY) {
            throw new Error('DeepSeek API key not configured');
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: request.systemPrompt || 'You are a helpful AI assistant.'
                    },
                    {
                        role: 'user',
                        content: request.prompt
                    }
                ],
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 1024
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            text: data.choices[0].message.content,
            model: model,
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            }
        };
    }

    /**
     * Call OpenAI API
     */
    private async callOpenAIAPI(request: AIRequest, apiKey?: string): Promise<AIResponse> {
        const API_KEY = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
        if (!API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: request.systemPrompt || 'You are a helpful AI assistant.'
                    },
                    {
                        role: 'user',
                        content: request.prompt
                    }
                ],
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 1024
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            text: data.choices[0].message.content,
            model: 'gpt-4',
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            }
        };
    }

    /**
     * Call Anthropic Claude API
     */
    private async callAnthropicAPI(request: AIRequest, apiKey?: string): Promise<AIResponse> {
        const API_KEY = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
        if (!API_KEY) {
            throw new Error('Anthropic API key not configured');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: request.maxTokens || 1024,
                temperature: request.temperature || 0.7,
                system: request.systemPrompt || 'You are a helpful AI assistant.',
                messages: [{
                    role: 'user',
                    content: request.prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            text: data.content[0].text,
            model: 'claude-3',
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            }
        };
    }

    /**
     * Generate mock response for fallback
     */
    private generateMockResponse(request: AIRequest): AIResponse {
        console.warn('Using mock AI response - configure API keys for real AI integration');

        // Generate a simple mock response based on the prompt
        const mockResponses = [
            "Voici une réponse générée par IA. Configurez vos clés API pour obtenir de meilleurs résultats.",
            "Contenu généré automatiquement. Intégrez DeepSeek, GPT-4 ou Claude pour des réponses de qualité supérieure.",
            "Réponse simulée - Les vraies intégrations IA rendront TrendStudio encore plus puissant !"
        ];

        return {
            text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
            model: 'mock',
            usage: {
                promptTokens: request.prompt.length / 4,
                completionTokens: 50,
                totalTokens: request.prompt.length / 4 + 50
            }
        };
    }

    /**
     * Analyze sentiment of text
     */
    async analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint';
        score: number;
        confidence: number;
    }> {
        const prompt = `Analyze the sentiment of this text and classify it as positive, negative, neutral, question, or complaint. Return JSON with sentiment, score (-1 to 1), and confidence (0-1).

Text: "${text}"

Response format: {"sentiment": "...", "score": 0.5, "confidence": 0.8}`;

        try {
            const response = await this.generateText({
                prompt,
                model: 'deepseek-chat',
                temperature: 0.1,
                maxTokens: 100,
                systemPrompt: 'You are a sentiment analysis expert. Always respond with valid JSON.'
            });

            const result = JSON.parse(response.text);
            return result;
        } catch (error) {
            // Fallback to basic keyword analysis
            return this.basicSentimentAnalysis(text);
        }
    }

    /**
     * Basic sentiment analysis as fallback
     */
    private basicSentimentAnalysis(text: string): {
        sentiment: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint';
        score: number;
        confidence: number;
    } {
        const lowerText = text.toLowerCase();

        const positiveWords = ['super', 'génial', 'excellent', 'merci', 'bravo', 'top', 'incroyable', 'fantastique', 'parfait'];
        const negativeWords = ['nul', 'mauvais', 'horrible', 'déçu', 'échec', 'problème', 'bug', 'cassé'];

        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        let sentiment: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint' = 'neutral';
        let score = 0;
        let confidence = 0.5;

        if (lowerText.includes('?')) {
            sentiment = 'question';
            score = 0.3;
            confidence = 0.8;
        } else if (positiveCount > negativeCount) {
            sentiment = 'positive';
            score = 0.6;
            confidence = Math.min(1, positiveCount / 3);
        } else if (negativeCount > positiveCount) {
            sentiment = negativeCount > 1 ? 'complaint' : 'negative';
            score = -0.6;
            confidence = Math.min(1, negativeCount / 3);
        }

        return { sentiment, score, confidence };
    }
}

export const aiService = AIService.getInstance();