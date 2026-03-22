import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { MemoCard } from "@/components/MemoCard";
import { AddMemoSheet } from "@/components/AddMemoSheet";
import { useMemos, useCreateMemo, useDeleteMemo } from "@/hooks/useMemos";
import type { Memo } from "@/hooks/useMemos";

export default function MemosScreen() {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);
  const { data: memos, isLoading, isError, refetch } = useMemos();
  const createMemo = useCreateMemo();
  const deleteMemo = useDeleteMemo();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit(url: string, context: string) {
    await createMemo.mutateAsync({ url, context });
  }

  async function handleDelete(id: string) {
    await deleteMemo.mutateAsync(id);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function handleAdd() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSheetVisible(true);
  }

  const renderItem = ({ item }: { item: Memo }) => (
    <MemoCard memo={item} onDelete={handleDelete} />
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#0E2040", Colors.dark.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.appName}>Linkery Notes</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {memos?.length ?? 0} saved {memos?.length === 1 ? "link" : "links"}
          </Text>
        </View>
        <Pressable onPress={handleAdd} style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
          <Feather name="plus" size={22} color="#000" />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={36} color={Colors.dark.textTertiary} />
          <Text style={styles.emptyTitle}>Connection Error</Text>
          <Text style={styles.emptySubtitle}>Could not load memos</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={memos ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="bookmark" size={32} color={Colors.dark.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No memos yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the{" "}
                <Text style={{ color: Colors.accent }}>+</Text>
                {" "}button to save your first link
              </Text>
            </View>
          }
        />
      )}

      {/* Ad Placement Banner */}
      <View style={[styles.adBanner, { bottom: Platform.OS === "web" ? 84 + 34 : 84 }]}>
        <Feather name="zap" size={12} color={Colors.dark.textTertiary} />
        <Text style={styles.adLabel}>Ad Placement — Google AdMob</Text>
      </View>

      <AddMemoSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appName: {
    fontSize: 26,
    color: Colors.dark.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: Colors.dark.proBadgeBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
  },
  proText: {
    fontSize: 10,
    color: Colors.accent,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.dark.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.dark.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  retryText: {
    fontSize: 14,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
  },
  adBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: Colors.dark.bgElevated,
    borderTopWidth: 1,
    borderColor: Colors.dark.border,
  },
  adLabel: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
