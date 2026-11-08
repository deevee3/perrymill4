/**
 * NewsDialFilter Component
 * Animated circular dial for filtering news by Popular, Recent (New), and Breaking (Old)
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { NEWS_THEME } from '../../config/news.config';
import type { FilterMode } from '../../types/news.types';

interface NewsDialFilterProps {
    onModeChange: (mode: FilterMode) => void;
    currentMode: FilterMode;
    counts?: Record<FilterMode, number>;
}

const DIAL_SIZE = 320; // Increased size
const DIAL_RADIUS = DIAL_SIZE / 2;
const TRACK_RADIUS = DIAL_RADIUS - 20;

// Position angles for each mode (in degrees)
const MODE_ANGLES = {
    popular: 0,      // Top (12 o'clock)
    breaking: 240,   // Bottom left (8 o'clock) - labeled "Old"
    recent: 120,     // Bottom right (4 o'clock) - labeled "New"
};

const LABELS = [
    { mode: 'popular' as FilterMode, angle: 0, label: 'Popular', x: 0, y: -TRACK_RADIUS - 25 },
    { mode: 'breaking' as FilterMode, angle: 240, label: 'Old', x: -TRACK_RADIUS * 0.8, y: TRACK_RADIUS * 0.6 },
    { mode: 'recent' as FilterMode, angle: 120, label: 'New', x: TRACK_RADIUS * 0.8, y: TRACK_RADIUS * 0.6 },
];

/**
 * Find the nearest mode based on angle
 */
function findNearestMode(angle: number): FilterMode {
    'worklet';
    // Normalize angle to 0-360
    let normalizedAngle = ((angle % 360) + 360) % 360;

    const modes: FilterMode[] = ['popular', 'breaking', 'recent'];
    let nearestMode: FilterMode = 'popular';
    let minDiff = Infinity;

    modes.forEach((mode) => {
        const modeAngle = MODE_ANGLES[mode];
        let diff = Math.abs(normalizedAngle - modeAngle);

        // Handle wrap-around (e.g., 350° vs 10°)
        if (diff > 180) {
            diff = 360 - diff;
        }

        if (diff < minDiff) {
            minDiff = diff;
            nearestMode = mode;
        }
    });

    return nearestMode;
}

/**
 * Convert angle to radians
 */
function toRadians(angle: number): number {
    return (angle * Math.PI) / 180;
}

/**
 * Generate a smooth tri-lobe path based on 3 radii
 * r1: Top (Popular)
 * r2: Bottom Right (Recent/New)
 * r3: Bottom Left (Breaking/Old)
 */
function generateTriLobePath(r1: number, r2: number, r3: number): string {
    const c = { x: 0, y: 0 };
    
    // Angles in radians (offset by -90 to start at top)
    const a1 = -Math.PI / 2;
    const a2 = a1 + (2 * Math.PI) / 3;
    const a3 = a2 + (2 * Math.PI) / 3;

    // Tip points
    const p1 = { x: c.x + r1 * Math.cos(a1), y: c.y + r1 * Math.sin(a1) };
    const p2 = { x: c.x + r2 * Math.cos(a2), y: c.y + r2 * Math.sin(a2) };
    const p3 = { x: c.x + r3 * Math.cos(a3), y: c.y + r3 * Math.sin(a3) };

    // Control point distance factor (adjust for "fatness" of lobes)
    const f = 0.5; 

    // We need control points between the tips.
    // For a smooth blob, we can use cubic beziers.
    // Between P1 and P2, we have a midpoint that is closer to center?
    // Actually, a simple way is to have control points perpendicular to the radius at the tip.
    
    // Tangent vectors at tips (perpendicular to radius)
    const t1 = { x: -Math.sin(a1) * r1 * f, y: Math.cos(a1) * r1 * f };
    const t2 = { x: -Math.sin(a2) * r2 * f, y: Math.cos(a2) * r2 * f };
    const t3 = { x: -Math.sin(a3) * r3 * f, y: Math.cos(a3) * r3 * f };

    // SVG Path: M p1 C (p1+t1) (p2-t2) p2 ...
    return `
        M ${p1.x},${p1.y}
        C ${p1.x + t1.x},${p1.y + t1.y} ${p2.x - t2.x},${p2.y - t2.y} ${p2.x},${p2.y}
        C ${p2.x + t2.x},${p2.y + t2.y} ${p3.x - t3.x},${p3.y - t3.y} ${p3.x},${p3.y}
        C ${p3.x + t3.x},${p3.y + t3.y} ${p1.x - t1.x},${p1.y - t1.y} ${p1.x},${p1.y}
        Z
    `.replace(/\s+/g, ' ').trim();
}

export default function NewsDialFilter({ onModeChange, currentMode, counts }: NewsDialFilterProps) {
    const rotation = useSharedValue(MODE_ANGLES[currentMode]);
    
    // Update rotation when currentMode changes externally
    useEffect(() => {
        rotation.value = withSpring(MODE_ANGLES[currentMode], {
            damping: 20,
            stiffness: 120,
            mass: 1.2, // Add some weight to the feel
        });
    }, [currentMode]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const centerX = DIAL_RADIUS;
            const centerY = DIAL_RADIUS;
            const dx = event.x - centerX;
            const dy = event.y - centerY;

            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            angle += 90; // Offset so 0° is at top
            rotation.value = angle;
        })
        .onEnd(() => {
            const nearestMode = findNearestMode(rotation.value);
            const targetAngle = MODE_ANGLES[nearestMode];

            rotation.value = withSpring(targetAngle, {
                damping: 20,
                stiffness: 120,
                mass: 1.2,
            });

            runOnJS(onModeChange)(nearestMode);
        });

    const animatedDialStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    // Calculate dynamic radii based on counts
    const baseSize = 55; 
    const maxAdd = 25;
    // Default counts to 0 if undefined, but we want to show something reasonable
    const getRadius = (count: number = 20) => baseSize + Math.min(maxAdd, (count / 50) * maxAdd);

    const rPopular = getRadius(counts?.popular);
    const rRecent = getRadius(counts?.recent);
    const rBreaking = getRadius(counts?.breaking);

    const dynamicPath = generateTriLobePath(rPopular, rRecent, rBreaking);

    // Generate tick marks
    const ticks = Array.from({ length: 60 }).map((_, i) => {
        const angle = toRadians(i * 6 - 90); // 6 degrees per tick
        const isMajor = i % 5 === 0; // Major tick every 5 ticks
        const length = isMajor ? 12 : 6;
        const startR = TRACK_RADIUS;
        const endR = TRACK_RADIUS - length;
        
        const x1 = DIAL_RADIUS + startR * Math.cos(angle);
        const y1 = DIAL_RADIUS + startR * Math.sin(angle);
        const x2 = DIAL_RADIUS + endR * Math.cos(angle);
        const y2 = DIAL_RADIUS + endR * Math.sin(angle);

        return (
            <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={NEWS_THEME.colors.dialStroke}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
            />
        );
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <View style={styles.dialContainer}>
                    {/* SVG Dial Background & Ticks */}
                    <Svg width={DIAL_SIZE} height={DIAL_SIZE} style={styles.svg}>
                        {/* Tick Marks Ring */}
                        <G>{ticks}</G>
                        
                        {/* Indicator Lines for Modes */}
                        {LABELS.map((label, index) => {
                            const angle = toRadians(label.angle - 90);
                            // Small indicator inside the ring
                            const r = TRACK_RADIUS - 20;
                            const x = DIAL_RADIUS + r * Math.cos(angle);
                            const y = DIAL_RADIUS + r * Math.sin(angle);
                            
                            return (
                                <Line
                                    key={`ind-${index}`}
                                    x1={DIAL_RADIUS + (r - 8) * Math.cos(angle)}
                                    y1={DIAL_RADIUS + (r - 8) * Math.sin(angle)}
                                    x2={DIAL_RADIUS + (r + 2) * Math.cos(angle)}
                                    y2={DIAL_RADIUS + (r + 2) * Math.sin(angle)}
                                    stroke={NEWS_THEME.colors.textPrimary}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </Svg>

                    {/* Rotating Center Shape (Tri-Lobe) */}
                    <Animated.View style={[styles.centerContainer, animatedDialStyle]}>
                        <Svg width={180} height={180} viewBox="0 0 180 180">
                            <G transform="translate(90, 90)">
                                {/* Main organic shape */}
                                <Path
                                    d={dynamicPath}
                                    fill={NEWS_THEME.colors.dialCenter}
                                    opacity={0.8}
                                />
                                
                                {/* White Arms/Connectors - dynamic length */}
                                <Line x1="0" y1="0" x2="0" y2={-rPopular + 10} stroke="white" strokeWidth="6" strokeLinecap="round" />
                                <Line 
                                    x1="0" y1="0" 
                                    x2={(rRecent - 10) * Math.cos(toRadians(30))} 
                                    y2={(rRecent - 10) * Math.sin(toRadians(30))} 
                                    stroke="white" strokeWidth="6" strokeLinecap="round" 
                                />
                                <Line 
                                    x1="0" y1="0" 
                                    x2={(rBreaking - 10) * Math.cos(toRadians(150))} 
                                    y2={(rBreaking - 10) * Math.sin(toRadians(150))} 
                                    stroke="white" strokeWidth="6" strokeLinecap="round" 
                                />
                                
                                {/* Center Pivot */}
                                <Circle cx="0" cy="0" r="8" fill="black" />
                                
                                {/* End Points */}
                                <Circle cx="0" cy={-rPopular + 10} r="5" fill="black" />
                                <Circle 
                                    cx={(rRecent - 10) * Math.cos(toRadians(30))} 
                                    cy={(rRecent - 10) * Math.sin(toRadians(30))} 
                                    r="5" fill="black" 
                                />
                                <Circle 
                                    cx={(rBreaking - 10) * Math.cos(toRadians(150))} 
                                    cy={(rBreaking - 10) * Math.sin(toRadians(150))} 
                                    r="5" fill="black" 
                                />
                            </G>
                        </Svg>
                    </Animated.View>

                    {/* Labels */}
                    {LABELS.map((label, index) => (
                        <View
                            key={index}
                            style={[
                                styles.labelContainer,
                                {
                                    left: DIAL_RADIUS + label.x,
                                    top: DIAL_RADIUS + label.y,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.labelText,
                                    currentMode === label.mode && styles.labelTextActive,
                                ]}
                            >
                                {label.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialContainer: {
        width: DIAL_SIZE,
        height: DIAL_SIZE,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    centerContainer: {
        width: 180,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for the floating piece
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    labelContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 30,
        transform: [{ translateX: -40 }, { translateY: -15 }],
    },
    labelText: {
        fontSize: 13,
        fontWeight: '600',
        color: NEWS_THEME.colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    labelTextActive: {
        color: NEWS_THEME.colors.textPrimary,
        fontWeight: '700',
    },
});
