/**
 * News App Configuration
 * 
 * To use this app, add your NewsAPI key to .env file:
 * NEWS_API_KEY=your-actual-api-key-here
 * 
 * Get a free key at https://newsapi.org
 * Free tier limits: 100 requests/day, 50 requests/6 hours
 */

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const NEWS_LAYOUT = {
  cardWidth: width * 0.6, // Increased to show fewer cards but with more detail, similar to inspiration
  cardMargin: 12,
  get snapInterval() {
    return this.cardWidth + (this.cardMargin * 2);
  }
};

export const NEWS_CONFIG = {
  // NewsAPI Configuration - reads from .env file
  API_KEY: process.env.EXPO_PUBLIC_NEWS_API_KEY || 'YOUR_API_KEY_HERE',
  BASE_URL: 'https://newsapi.org/v2',

  // Cache duration in milliseconds (30 minutes)
  CACHE_DURATION: 30 * 60 * 1000,

  // Number of articles to fetch per request
  PAGE_SIZE: 20,

  // Default country for news (US)
  COUNTRY: 'us',

  // Filter modes
  FILTER_MODES: {
    POPULAR: 'popular',
    RECENT: 'recent',
    BREAKING: 'breaking',
  } as const,

  // Dial positions (in degrees)
  DIAL_POSITIONS: {
    POPULAR: 0,      // Top (12 o'clock)
    RECENT: 120,     // Bottom right (4 o'clock) - "New"
    BREAKING: 240,   // Bottom left (8 o'clock) - "Old" position
  } as const,
};

// Theme colors matching the inspiration images
export const NEWS_THEME = {
  colors: {
    background: '#EAE5D9',      // Slightly warmer beige/bone background from inspiration
    cardBackground: 'transparent', // Transparent to blend with background
    textPrimary: '#000000',     // Stark black for headlines
    textSecondary: '#666666',   // Dark gray for metadata
    textTertiary: '#A0A0A0',
    accent: '#D4CFC5',
    dialStroke: '#D1CDC5',      // Subtle dial track
    dialHandle: '#FFFFFF',      // White handle arms
    dialCenter: '#D8D3C8',      // Darker beige for the center shape
  },

  typography: {
    headline: {
      fontSize: 18,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};
