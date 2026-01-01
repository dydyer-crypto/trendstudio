
/**
 * ScraperService for TrendStudio
 * Uses public proxies/APIs to fetch site content for AI analysis
 */
export class ScraperService {
    private static instance: ScraperService;

    private constructor() { }

    static getInstance(): ScraperService {
        if (!ScraperService.instance) {
            ScraperService.instance = new ScraperService();
        }
        return ScraperService.instance;
    }

    /**
     * Fetches metadata and simplified HTML from a URL
     */
    async scrapeSite(url: string): Promise<{ title: string; description: string; h1s: string[]; content: string }> {
        try {
            // Using Microlink API for a robust metadata extraction (free tier)
            const mlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true&screenshot=true&meta=true`;
            const response = await fetch(mlinkUrl);
            const data = await response.json();

            if (data.status === 'success') {
                return {
                    title: data.data.title || '',
                    description: data.data.description || '',
                    h1s: [], // Microlink might not give all H1s easily without advanced options
                    content: `Site Content Summary: ${data.data.description}. 
                             Language: ${data.data.lang}. 
                             Colors detected: ${data.data.palette?.join(', ') || 'N/A'}.`
                };
            }

            // Fallback to a simple proxy if Microlink fails or for more raw content
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const proxyRes = await fetch(proxyUrl);
            const proxyData = await proxyRes.json();
            const html = proxyData.contents;

            // Simple parser to extract H1s and basic info from raw HTML
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const h1s = Array.from(doc.querySelectorAll('h1')).map(h => h.textContent?.trim() || '');
            const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            const title = doc.title || '';

            // Get some body text (first 2000 chars)
            const bodyText = doc.body?.innerText?.replace(/\s+/g, ' ').substring(0, 2000) || '';

            return {
                title,
                description: metaDesc,
                h1s,
                content: bodyText
            };
        } catch (error) {
            console.error('Scraping failed:', error);
            return {
                title: 'Unknown Site',
                description: 'Impossible de scraper les données.',
                h1s: [],
                content: 'Données non disponibles.'
            };
        }
    }
}

export const scraperService = ScraperService.getInstance();
