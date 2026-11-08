/**
 * NewsCard Component
 * Displays a news article card matching the inspiration design
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NEWS_LAYOUT, NEWS_THEME } from '../../config/news.config';
import { formatArticleDate } from '../../services/newsService';
import type { NewsArticle } from '../../types/news.types';

interface NewsCardProps {
    article: NewsArticle;
    onPress: (article: NewsArticle) => void;
}

export default function NewsCard({ article, onPress }: NewsCardProps) {
    const placeholderImage = 'https://via.placeholder.com/400x300/E0DCD3/6B6B6B?text=No+Image';

    return (
        <Pressable
            style={styles.container}
            onPress={() => onPress(article)}
            android_ripple={{ color: NEWS_THEME.colors.accent }}
        >
            {/* Article Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: article.urlToImage || placeholderImage }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            {/* Article Info */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={3}>
                    {article.title}
                </Text>

                <Text style={styles.date}>
                    {formatArticleDate(article.publishedAt)}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: NEWS_LAYOUT.cardWidth,
        marginHorizontal: NEWS_LAYOUT.cardMargin,
        // Removed background color and shadows for uniform look
    },
    imageContainer: {
        borderRadius: NEWS_THEME.borderRadius.md, // Slightly more rounded
        overflow: 'hidden',
        marginBottom: NEWS_THEME.spacing.sm,
    },
    image: {
        width: '100%',
        height: 160, // Slightly taller
        backgroundColor: NEWS_THEME.colors.accent,
    },
    content: {
        padding: 0, // Remove padding to align with image edge
    },
    title: {
        ...NEWS_THEME.typography.headline,
        fontSize: 16, // Slightly adjusted
        color: NEWS_THEME.colors.textPrimary,
        marginBottom: 4,
        lineHeight: 22,
    },
    date: {
        ...NEWS_THEME.typography.caption,
        color: NEWS_THEME.colors.textSecondary,
        fontSize: 13,
    },
});
