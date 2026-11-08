/**
 * Storage Service
 * Handles local storage for caching news data and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NewsArticle, FilterMode } from '../types/news.types';

const KEYS = {
    FAVORITE_SOURCES: '@news_app:favorite_sources',
    CACHED_NEWS: '@news_app:cached_news',
};

/**
 * Save favorite news sources
 */
export async function saveFavoriteSources(sources: string[]): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.FAVORITE_SOURCES, JSON.stringify(sources));
    } catch (error) {
        console.error('Error saving favorite sources:', error);
    }
}

/**
 * Load favorite news sources
 */
export async function loadFavoriteSources(): Promise<string[]> {
    try {
        const data = await AsyncStorage.getItem(KEYS.FAVORITE_SOURCES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading favorite sources:', error);
        return [];
    }
}

/**
 * Toggle a source as favorite
 */
export async function toggleFavoriteSource(sourceId: string): Promise<string[]> {
    const favorites = await loadFavoriteSources();
    const index = favorites.indexOf(sourceId);

    if (index === -1) {
        favorites.push(sourceId);
    } else {
        favorites.splice(index, 1);
    }

    await saveFavoriteSources(favorites);
    return favorites;
}

/**
 * Cache news articles with timestamp
 */
export async function cacheNews(
    mode: FilterMode,
    articles: NewsArticle[]
): Promise<void> {
    try {
        const cacheData = {
            mode,
            articles,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(
            `${KEYS.CACHED_NEWS}_${mode}`,
            JSON.stringify(cacheData)
        );
    } catch (error) {
        console.error('Error caching news:', error);
    }
}

/**
 * Get cached news articles if not expired
 */
export async function getCachedNews(
    mode: FilterMode,
    maxAge: number = 30 * 60 * 1000 // 30 minutes default
): Promise<NewsArticle[] | null> {
    try {
        const data = await AsyncStorage.getItem(`${KEYS.CACHED_NEWS}_${mode}`);
        if (!data) return null;

        const cached = JSON.parse(data);
        const age = Date.now() - cached.timestamp;

        // Return cached data if not expired
        if (age < maxAge) {
            return cached.articles;
        }

        return null;
    } catch (error) {
        console.error('Error getting cached news:', error);
        return null;
    }
}

/**
 * Clear all cached news
 */
export async function clearNewsCache(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([
            `${KEYS.CACHED_NEWS}_popular`,
            `${KEYS.CACHED_NEWS}_recent`,
            `${KEYS.CACHED_NEWS}_breaking`,
        ]);
    } catch (error) {
        console.error('Error clearing news cache:', error);
    }
}
