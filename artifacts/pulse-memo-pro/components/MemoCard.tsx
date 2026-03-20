import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Memo } from "@/hooks/useMemos";

interface MemoCardProps {
  memo: Memo;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function truncateDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url.slice(0, 30);
  }
}

export function MemoCard({ memo, onDelete }: MemoCardProps) {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: Platform.OS !== "web",
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== "web",
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handleOpen = async () => {
    try {
      await Linking.openURL(memo.url);
    } catch {
      Alert.alert("Cannot open URL", memo.url);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Delete Memo", "Are you sure you want to delete this memo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(memo.id),
      },
    ]);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressScale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleOpen}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.faviconContainer}>
            {memo.favicon ? (
              <Image
                source={{ uri: memo.favicon }}
                style={styles.favicon}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <Feather name="link" size={16} color={Colors.dark.textSecondary} />
            )}
          </View>
          <View style={styles.domainWrap}>
            <Text style={styles.domain} numberOfLines={1}>
              {truncateDomain(memo.url)}
            </Text>
            <Text style={styles.date}>{formatDate(memo.createdAt)}</Text>
          </View>
          <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={12}>
            <Feather name="trash-2" size={16} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {memo.title}
        </Text>

        {memo.context ? (
          <View style={styles.contextWrap}>
            <Feather name="message-square" size={12} color={Colors.dark.textSecondary} style={{ marginTop: 1 }} />
            <Text style={styles.context} numberOfLines={3}>
              {memo.context}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.openBadge}>
            <Feather name="external-link" size={11} color={Colors.accent} />
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  faviconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.bgInput,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  favicon: {
    width: 20,
    height: 20,
  },
  domainWrap: {
    flex: 1,
  },
  domain: {
    fontSize: 12,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 21,
    marginBottom: 8,
  },
  contextWrap: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: Colors.dark.bgInput,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  context: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.proBadgeBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  openText: {
    fontSize: 11,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
  },
});
