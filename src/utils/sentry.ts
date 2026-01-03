import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry configuration for TrendStudio
export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        console.warn('Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE || 'development',
        release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || 'local',

        // Performance monitoring
        integrations: [
            new BrowserTracing({
                tracePropagationTargets: [
                    'localhost',
                    /^https:\/\/.*\.trendstudio\.ai/,
                    /^https:\/\/.*\.vercel\.app/
                ],
            }),
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Performance sampling
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev

        // Session replay
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,

        // Error filtering
        beforeSend(event: any, hint: any) {
            // Filter out common non-critical errors
            const error = hint.originalException;

            // Ignore network errors for external services
            if (error && error.message?.includes('Failed to fetch')) {
                // Check if it's an AI API error
                if (error.message?.includes('deepseek') ||
                    error.message?.includes('stripe') ||
                    error.message?.includes('supabase')) {
                    return null; // Don't send AI/external API errors
                }
            }

            // Ignore cancelled requests
            if (error && error.name === 'AbortError') {
                return null;
            }

            return event;
        },

        // Custom error context
        beforeBreadcrumb(breadcrumb: any, hint: any) {
            // Add user context to breadcrumbs
            if (breadcrumb.category === 'ui.click') {
                breadcrumb.data = {
                    ...breadcrumb.data,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
            }

            return breadcrumb;
        }
    });
};

// Helper functions for tracking
export const setUserContext = (user: any) => {
    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.email
        });
        Sentry.setTag('subscription_plan', user.subscription_plan || 'free');
    }
};

// Track AI API usage
export const trackAIUsage = (model: string, tokens: number, cost: number) => {
    Sentry.addBreadcrumb({
        category: 'ai',
        message: `AI API call: ${model}`,
        data: {
            model,
            tokens,
            cost,
            timestamp: new Date().toISOString()
        },
        level: 'info'
    });
};

// Track feature usage
export const trackFeatureUsage = (feature: string, action: string) => {
    Sentry.addBreadcrumb({
        category: 'feature',
        message: `Feature usage: ${feature} - ${action}`,
        data: {
            feature,
            action,
            timestamp: new Date().toISOString()
        },
        level: 'info'
    });
};

// Track payment events
export const trackPayment = (event: string, amount?: number, plan?: string) => {
    Sentry.addBreadcrumb({
        category: 'payment',
        message: `Payment event: ${event}`,
        data: {
            amount,
            plan,
            timestamp: new Date().toISOString()
        },
        level: 'info'
    });
};

// Initialize Sentry on app start
initSentry();