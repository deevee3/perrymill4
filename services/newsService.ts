/**
 * News Service
 * Handles fetching news from NewsAPI with caching
 */

import axios from 'axios';
import { NEWS_CONFIG } from '../config/news.config';
import type { FilterMode, NewsArticle, NewsApiResponse, NewsSourcesResponse, NewsSource } from '../types/news.types';
import { cacheNews, getCachedNews } from './storageService';

const api = axios.create({
    baseURL: NEWS_CONFIG.BASE_URL,
    timeout: 10000,
    headers: {
        'X-Api-Key': NEWS_CONFIG.API_KEY,
    },
});

/**
 * Fetch breaking news (top headlines)
 */
async function fetchBreakingNews(): Promise<NewsArticle[]> {
    const response = await api.get<NewsApiResponse>('/top-headlines', {
        params: {
            country: NEWS_CONFIG.COUNTRY,
            pageSize: NEWS_CONFIG.PAGE_SIZE,
        },
    });

    return response.data.articles;
}

/**
 * Fetch recent news (everything sorted by publishedAt)
 */
async function fetchRecentNews(): Promise<NewsArticle[]> {
    // Get articles from the last 7 days, sorted by most recent
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    const response = await api.get<NewsApiResponse>('/everything', {
        params: {
            q: 'news OR trending', // General query
            from: fromDate.toISOString(),
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: NEWS_CONFIG.PAGE_SIZE,
        },
    });

    return response.data.articles;
}

/**
 * Fetch popular news (sorted by popularity/engagement)
 */
async function fetchPopularNews(): Promise<NewsArticle[]> {
    const response = await api.get<NewsApiResponse>('/everything', {
        params: {
            q: 'trending OR viral OR popular',
            sortBy: 'popularity',
            language: 'en',
            pageSize: NEWS_CONFIG.PAGE_SIZE,
        },
    });

    return response.data.articles;
}

/**
 * Fetch news based on filter mode with caching
 */
export async function fetchNewsByMode(
    mode: FilterMode,
    useCache: boolean = true
): Promise<NewsArticle[]> {
    // Try to get cached data first
    if (useCache) {
        const cached = await getCachedNews(mode, NEWS_CONFIG.CACHE_DURATION);
        if (cached) {
            console.log(`Using cached ${mode} news`);
            return cached;
        }
    }

    console.log(`Fetching fresh ${mode} news from API`);

    let articles: NewsArticle[];

    try {
        switch (mode) {
            case 'breaking':
                articles = await fetchBreakingNews();
                break;
            case 'recent':
                articles = await fetchRecentNews();
                break;
            case 'popular':
                articles = await fetchPopularNews();
                break;
            default:
                articles = await fetchBreakingNews();
        }

        // Cache the fresh data
        await cacheNews(mode, articles);

        return articles;
    } catch (error) {
        console.error(`Error fetching ${mode} news:`, error);

        // If API fails, try to return stale cache as fallback
        const staleCache = await getCachedNews(mode, Infinity);
        if (staleCache) {
            console.log(`Using stale cache for ${mode} news`);
            return staleCache;
        }

        throw error;
    }
}

/**
 * Fetch all available news sources
 */
export async function fetchNewsSources(): Promise<NewsSource[]> {
    try {
        const response = await api.get<NewsSourcesResponse>('/sources', {
            params: {
                language: 'en',
            },
        });

        return response.data.sources;
    } catch (error) {
        console.error('Error fetching news sources:', error);
        return [];
    }
}

/**
 * Filter articles by source IDs
 */
export function filterArticlesBySource(
    articles: NewsArticle[],
    sourceIds: string[]
): NewsArticle[] {
    if (sourceIds.length === 0) {
        return articles;
    }

    return articles.filter((article) => {
        const sourceId = article.source.id || article.source.name.toLowerCase().replace(/\s+/g, '-');
        return sourceIds.includes(sourceId);
    });
}

/**
 * Format date for display
 */
export function formatArticleDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}
