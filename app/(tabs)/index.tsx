/**
 * News Home Screen
 * Main screen with animated dial filter and news feed
 */

import ArticleDetailModal from '@/components/news/ArticleDetailModal';
import NewsDialFilter from '@/components/news/NewsDialFilter';
import NewsFeed from '@/components/news/NewsFeed';
import { NEWS_THEME } from '@/config/news.config';
import { fetchNewsByMode } from '@/services/newsService';
import type { FilterMode, NewsArticle } from '@/types/news.types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsScreen() {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<FilterMode>('popular');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<FilterMode, number>>({
    popular: 0,
    recent: 0,
    breaking: 0,
  });
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Initial load of all counts
  useEffect(() => {
    loadAllCounts();
  }, []);

  // Fetch news when mode changes
  useEffect(() => {
    loadNews(currentMode);
  }, [currentMode]);

  const loadAllCounts = async () => {
    try {
      const [popular, recent, breaking] = await Promise.all([
        fetchNewsByMode('popular', true),
        fetchNewsByMode('recent', true),
        fetchNewsByMode('breaking', true),
      ]);
      
      setCounts({
        popular: popular.length,
        recent: recent.length,
        breaking: breaking.length,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const loadNews = async (mode: FilterMode) => {
    setLoading(true);
    try {
      const data = await fetchNewsByMode(mode, true);
      setArticles(data);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert(
        'Error Loading News',
        'Unable to fetch news. Please check your API key in config/news.config.ts',
        [{ text: 'OK' }]
      );
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: FilterMode) => {
    setCurrentMode(mode);
  };

  const handleArticlePress = (article: NewsArticle) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedArticle(null);
  };

  const handleRefresh = () => {
    loadNews(currentMode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.title}>PerryMill</Text>
        </View>

        {/* Animated Dial Filter */}
        <View style={styles.dialContainer}>
          <NewsDialFilter
            currentMode={currentMode}
            onModeChange={handleModeChange}
            counts={counts}
          />
        </View>

        {/* Article Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Start</Text>
          <Text style={styles.counterValue}>{articles.length}</Text>
        </View>

        {/* News Feed */}
        <NewsFeed
          articles={articles}
          loading={loading}
          onArticlePress={handleArticlePress}
          onRefresh={handleRefresh}
        />
      </ScrollView>

      <ArticleDetailModal
        visible={modalVisible}
        article={selectedArticle}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEWS_THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: NEWS_THEME.spacing.xxl,
  },
  header: {
    paddingHorizontal: NEWS_THEME.spacing.lg,
    paddingTop: NEWS_THEME.spacing.md,
    paddingBottom: NEWS_THEME.spacing.lg,
  },
  title: {
    ...NEWS_THEME.typography.title,
    color: NEWS_THEME.colors.textPrimary,
    lineHeight: 38,
  },
  dialContainer: {
    alignItems: 'center',
    paddingVertical: NEWS_THEME.spacing.lg,
  },
  counterContainer: {
    paddingHorizontal: NEWS_THEME.spacing.lg,
    paddingTop: NEWS_THEME.spacing.md,
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: NEWS_THEME.colors.textPrimary,
    marginBottom: 4,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '400',
    color: NEWS_THEME.colors.textSecondary,
  },
});
