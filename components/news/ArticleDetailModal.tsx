import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { NEWS_THEME } from '../../config/news.config';
import { formatArticleDate } from '../../services/newsService';
import type { NewsArticle } from '../../types/news.types';

interface ArticleDetailModalProps {
    visible: boolean;
    article: NewsArticle | null;
    onClose: () => void;
}

export default function ArticleDetailModal({ visible, article, onClose }: ArticleDetailModalProps) {
    if (!article) return null;

    const placeholderImage = 'https://via.placeholder.com/400x300/E0DCD3/6B6B6B?text=No+Image';

    const handleReadFullStory = () => {
        if (article.url) {
            Linking.openURL(article.url).catch(console.error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header / Close Button */}
                <View style={styles.header}>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && styles.closeButtonPressed
                        ]}
                    >
                        <Ionicons name="close" size={24} color={NEWS_THEME.colors.textPrimary} />
                    </Pressable>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: article.urlToImage || placeholderImage }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{article.title}</Text>
                        
                        <View style={styles.metaContainer}>
                            {article.author && (
                                <Text style={styles.author}>{article.author}</Text>
                            )}
                            <Text style={styles.date}>
                                {formatArticleDate(article.publishedAt)}
                            </Text>
                        </View>

                        <Text style={styles.content}>
                            {article.content 
                                ? article.content.replace(/\[\+\d+ chars\]$/, '') 
                                : article.description}
                        </Text>

                        <Pressable
                            onPress={handleReadFullStory}
                            style={({ pressed }) => [
                                styles.readMoreButton,
                                pressed && styles.readMoreButtonPressed
                            ]}
                        >
                            <Text style={styles.readMoreText}>Read Full Story</Text>
                            <Ionicons name="arrow-forward" size={16} color="white" />
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: NEWS_THEME.colors.background,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 10 : 40, // Adjust for status bar if not using SafeAreaView inside Modal
        right: 20,
        zIndex: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    closeButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: NEWS_THEME.colors.accent,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 24,
        marginTop: -20,
        backgroundColor: NEWS_THEME.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    title: {
        ...NEWS_THEME.typography.headline,
        fontSize: 24,
        lineHeight: 32,
        marginBottom: 16,
        color: NEWS_THEME.colors.textPrimary,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    author: {
        ...NEWS_THEME.typography.caption,
        fontSize: 14,
        fontWeight: '600',
        color: NEWS_THEME.colors.textSecondary,
        maxWidth: '60%',
    },
    date: {
        ...NEWS_THEME.typography.caption,
        color: NEWS_THEME.colors.textSecondary,
    },
    content: {
        ...NEWS_THEME.typography.body,
        fontSize: 18,
        lineHeight: 28,
        color: NEWS_THEME.colors.textPrimary,
        marginBottom: 32,
    },
    readMoreButton: {
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    readMoreButtonPressed: {
        backgroundColor: '#333',
        transform: [{ scale: 0.98 }],
    },
    readMoreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
});
