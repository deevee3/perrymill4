/**
 * NewsFeed Component
 * Horizontal scrolling list of news articles with fade transitions
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { NEWS_LAYOUT, NEWS_THEME } from '../../config/news.config';
import type { NewsArticle } from '../../types/news.types';
import NewsCard from './NewsCard';

interface NewsFeedProps {
    articles: NewsArticle[];
    loading: boolean;
    onArticlePress: (article: NewsArticle) => void;
    onRefresh?: () => void;
}

export default function NewsFeed({
    articles,
    loading,
    onArticlePress,
    onRefresh,
}: NewsFeedProps) {
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Fade out and fade in when articles change
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: 400 });
    }, [articles]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (loading && articles.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={NEWS_THEME.colors.textPrimary} />
                <Text style={styles.loadingText}>Loading news...</Text>
            </View>
        );
    }

    if (articles.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No articles available</Text>
                <Text style={styles.emptySubtext}>
                    Please check your API key or try again later
                </Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <FlatList
                data={articles}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                renderItem={({ item }) => (
                    <NewsCard article={item} onPress={onArticlePress} />
                )}
                contentContainerStyle={styles.listContent}
                snapToInterval={NEWS_LAYOUT.snapInterval}
                decelerationRate="fast"
                snapToAlignment="center"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: NEWS_THEME.spacing.lg,
    },
    listContent: {
        paddingHorizontal: NEWS_THEME.spacing.md,
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: NEWS_THEME.spacing.xxl,
    },
    loadingText: {
        ...NEWS_THEME.typography.body,
        color: NEWS_THEME.colors.textSecondary,
        marginTop: NEWS_THEME.spacing.md,
    },
    emptyText: {
        ...NEWS_THEME.typography.headline,
        color: NEWS_THEME.colors.textPrimary,
        marginBottom: NEWS_THEME.spacing.sm,
    },
    emptySubtext: {
        ...NEWS_THEME.typography.body,
        color: NEWS_THEME.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: NEWS_THEME.spacing.xl,
    },
});
