/**
 * Type definitions for News App
 */

export type FilterMode = 'popular' | 'recent' | 'breaking';

export interface NewsSource {
    id: string | null;
    name: string;
    description?: string;
    url?: string;
    category?: string;
    language?: string;
    country?: string;
}

export interface NewsArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

export interface NewsSourcesResponse {
    status: string;
    sources: NewsSource[];
}

export interface CachedNewsData {
    data: NewsArticle[];
    timestamp: number;
    mode: FilterMode;
}

export interface DialPosition {
    angle: number;
    mode: FilterMode;
    label: string;
}
