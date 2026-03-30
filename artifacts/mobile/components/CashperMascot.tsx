import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type MascotMood = 'happy' | 'celebrate' | 'saving' | 'alert' | 'default';

const MASCOT_IMAGES: Record<MascotMood, any> = {
  happy: require('@/assets/images/mascot-happy.png'),
  celebrate: require('@/assets/images/mascot-celebrate.png'),
  saving: require('@/assets/images/mascot-saving.png'),
  alert: require('@/assets/images/mascot-alert.png'),
  default: require('@/assets/images/icon.png'),
};

const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  happy: [
    "All caught up! See you tomorrow! 🌟",
    "You're doing great, keep it up!",
    "Financial freedom is just around the corner!",
  ],
  celebrate: [
    "Goal completed! You're amazing! 🎉",
    "Wahoo! Look at you go! 🎊",
    "That's what I'm talking about! 🚀",
  ],
  saving: [
    "Great savings habit! Keep it going! 💰",
    "Every peso saved is a step forward!",
    "Your future self will thank you!",
  ],
  alert: [
    "You're near your budget limit!",
    "Heads up — spending is getting close!",
    "Time to pump the brakes a little!",
  ],
  default: [
    "Track • Save • Grow 🐱",
    "Let's manage your money together!",
    "Hi! I'm Cashper, your finance buddy!",
  ],
};

interface CashperMascotProps {
  mood?: MascotMood;
  message?: string;
  size?: number;
  showMessage?: boolean;
  style?: object;
}

export function CashperMascot({
  mood = 'default',
  message,
  size = 80,
  showMessage = true,
  style,
}: CashperMascotProps) {
  const messages = MASCOT_MESSAGES[mood];
  const displayMessage = message ?? messages[Math.floor(Math.random() * messages.length)];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={MASCOT_IMAGES[mood]}
        style={[styles.mascot, { width: size, height: size }]}
        resizeMode="contain"
      />
      {showMessage && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{displayMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  mascot: {
    borderRadius: 16,
  },
  bubble: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    maxWidth: 220,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
