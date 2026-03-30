import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/context/ThemeContext';

export type MascotMood =
  | 'happy'
  | 'celebrate'
  | 'saving'
  | 'alert'
  | 'default'
  | 'encourage'
  | 'levelup';

const MASCOT_IMAGES: Record<MascotMood, any> = {
  happy:     require('@/assets/images/mascot-happy.png'),
  celebrate: require('@/assets/images/mascot-celebrate.png'),
  saving:    require('@/assets/images/mascot-saving.png'),
  alert:     require('@/assets/images/mascot-alert.png'),
  encourage: require('@/assets/images/mascot-happy.png'),
  levelup:   require('@/assets/images/mascot-celebrate.png'),
  default:   require('@/assets/images/icon.png'),
};

const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  happy: [
    "All caught up! See you tomorrow!",
    "You're doing great, keep it up!",
    "Financial freedom is just around the corner!",
    "Look at you, staying on top of things!",
    "Another day of tracking done. You're building a great habit!",
    "One transaction at a time — that's how wealth is built.",
    "Cashper is proud of you!",
    "Keep logging and watch your wealth grow!",
    "Consistency is your superpower. Don't stop now!",
  ],
  celebrate: [
    "Goal completed! You're amazing!",
    "Wahoo! Look at you go!",
    "That's what I'm talking about!",
    "You're on fire! Nothing can stop you!",
    "Achievement unlocked! Cashper does a happy dance!",
    "This calls for a celebration — you crushed it!",
    "Streak milestone! Cashper is doing backflips!",
    "You're writing your own success story!",
    "Big wins start with small daily actions — and you've got both!",
  ],
  saving: [
    "Great savings habit! Keep it going!",
    "Every peso saved is a step forward!",
    "Your future self will thank you!",
    "Being under budget feels amazing, doesn't it?",
    "You're saving like a champion — compound interest is your friend!",
    "Small savings today = big dreams tomorrow!",
    "Under budget again? You're Cashper's hero!",
    "Your piggy bank is very happy right now!",
    "Saving money is paying your future self first!",
  ],
  alert: [
    "You're near your budget limit — time to slow down!",
    "Heads up! Spending is getting close to the edge.",
    "Time to pump the brakes a little!",
    "Cashper is a little worried... let's review those expenses.",
    "Budget alert! Time to switch to savings mode.",
    "Every budget is a promise to your future self — let's keep it.",
    "Overspend detected! Cashper to the rescue!",
    "Pause before the next purchase — your budget will thank you.",
    "Review your spending now and get back on track!",
  ],
  default: [
    "Track • Save • Grow",
    "Let's manage your money together!",
    "Hi! I'm Cashper, your finance buddy!",
    "Ready to track your first transaction?",
    "Add a wallet and let's get started!",
    "Every financial journey starts with the first step.",
    "I'm here whenever you need a money pep talk!",
    "Your finances, your future — let's shape it together!",
  ],
  encourage: [
    "Every expert was once a beginner!",
    "Set a budget today — future you will be grateful!",
    "The best time to track finances is right now!",
    "Small steps lead to big changes. Keep going!",
    "You're already ahead just by opening this app!",
    "Log one transaction and watch the magic happen!",
    "Great things take time — and so does financial health!",
    "You've got this. Cashper believes in you!",
  ],
  levelup: [
    "LEVEL UP! You're getting stronger every day!",
    "New level, new possibilities! Keep it up!",
    "Cashper is so proud! Look at you growing!",
    "Rank up! Your financial skills are leveling up too!",
    "Higher level, higher potential — onward and upward!",
    "That XP is paying off! You're unstoppable!",
  ],
};

interface CashperMascotProps {
  mood?: MascotMood;
  message?: string;
  size?: number;
  showMessage?: boolean;
  style?: object;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function CashperMascot({
  mood = 'default',
  message,
  size = 80,
  showMessage = true,
  style,
  autoRotate = true,
  rotateInterval = 7000,
}: CashperMascotProps) {
  const Colors = useColors();
  const msgs = MASCOT_MESSAGES[mood];

  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * msgs.length));
  const displayMessage = message ?? msgs[msgIndex];

  const bubbleOpacity   = useRef(new Animated.Value(0)).current;
  const bubbleTranslateY = useRef(new Animated.Value(14)).current;
  const imageScale       = useRef(new Animated.Value(0.75)).current;
  const imageBounce      = useRef(new Animated.Value(1)).current;

  const animateBubbleIn = useCallback(() => {
    bubbleOpacity.setValue(0);
    bubbleTranslateY.setValue(14);
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(bubbleTranslateY, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [bubbleOpacity, bubbleTranslateY]);

  const animateBubbleOut = useCallback((onDone: () => void) => {
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(bubbleTranslateY, { toValue: -6, duration: 160, useNativeDriver: true }),
    ]).start(onDone);
  }, [bubbleOpacity, bubbleTranslateY]);

  useEffect(() => {
    Animated.spring(imageScale, {
      toValue: 1,
      tension: 55,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    animateBubbleIn();
  }, [displayMessage]);

  useEffect(() => {
    setMsgIndex(Math.floor(Math.random() * MASCOT_MESSAGES[mood].length));
  }, [mood]);

  useEffect(() => {
    if (!autoRotate || message) return;
    const timer = setInterval(() => {
      animateBubbleOut(() => {
        setMsgIndex(i => (i + 1) % MASCOT_MESSAGES[mood].length);
      });
    }, rotateInterval);
    return () => clearInterval(timer);
  }, [mood, message, autoRotate, rotateInterval, animateBubbleOut]);

  const handlePress = useCallback(() => {
    if (message) return;
    Animated.sequence([
      Animated.timing(imageBounce, { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.spring(imageBounce, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
    animateBubbleOut(() => {
      setMsgIndex(i => (i + 1) % MASCOT_MESSAGES[mood].length);
    });
  }, [mood, message, imageBounce, animateBubbleOut]);

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePress}>
        <Animated.View style={{ transform: [{ scale: imageScale }, { scale: imageBounce }] }}>
          <Image
            source={MASCOT_IMAGES[mood]}
            style={[styles.mascot, { width: size, height: size }]}
            resizeMode="contain"
          />
        </Animated.View>
      </Pressable>

      {showMessage && (
        <Pressable onPress={handlePress} style={styles.bubbleWrapper}>
          <Animated.View style={[
            styles.bubble,
            {
              backgroundColor: Colors.accent + '18',
              borderColor: Colors.accent + '35',
              opacity: bubbleOpacity,
              transform: [{ translateX: bubbleTranslateY }],
            },
          ]}>
            <View style={[styles.tail, { borderRightColor: Colors.accent + '35' }]} />
            <View style={[styles.tailInner, { borderRightColor: Colors.accent + '18' }]} />
            <Text style={[styles.bubbleText, { color: Colors.accent }]}>{displayMessage}</Text>
            {!message && (
              <Text style={[styles.tapHint, { color: Colors.accent + '70' }]}>tap for more</Text>
            )}
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  mascot: {
    borderRadius: 16,
  },
  bubbleWrapper: {
    flex: 1,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingLeft: 16,
    borderWidth: 1,
  },
  tail: {
    position: 'absolute',
    left: -9,
    top: '50%' as any,
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tailInner: {
    position: 'absolute',
    left: -7,
    top: '50%' as any,
    marginTop: -7,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  tapHint: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
