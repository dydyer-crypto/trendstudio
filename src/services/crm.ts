import { supabase } from '@/db/supabase';

export interface CRMWebhook {
    id: string;
    name: string;
    url: string;
    is_active: boolean;
}

export class CRMService {
    private static instance: CRMService;

    private constructor() { }

    static getInstance(): CRMService {
        if (!CRMService.instance) {
            CRMService.instance = new CRMService();
        }
        return CRMService.instance;
    }

    async getWebhooks(userId: string): Promise<CRMWebhook[]> {
        const { data, error } = await supabase
            .from('webhooks')
            .select('*')
            .eq('user_id', userId)
            .contains('events', ['quote.accepted']);

        if (error) throw error;
        return data || [];
    }

    async sendQuoteToCRM(webhookUrl: string, quoteData: any): Promise<boolean> {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'TrendStudio AI Consultant',
                    event: 'quote.accepted',
                    timestamp: new Date().toISOString(),
                    payload: {
                        site_url: quoteData.url,
                        audit_score: quoteData.score,
                        summary: quoteData.summary,
                        total_budget: quoteData.budget_estimate?.total,
                        proposed_variants: quoteData.redesign_variants?.map((v: any) => ({
                            title: v.title,
                            type: v.type,
                            focus: v.focus
                        })),
                        full_report: quoteData
                    }
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to send quote to CRM:', error);
            return false;
        }
    }
}

export const crmService = CRMService.getInstance();
