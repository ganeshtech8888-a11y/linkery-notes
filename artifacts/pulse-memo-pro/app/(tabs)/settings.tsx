import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

interface SettingRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string;
}

function SettingRow({ icon, label, sublabel, value, onPress, destructive, disabled, badge }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconDanger]}>
        <Feather name={icon as any} size={16} color={destructive ? Colors.danger : Colors.accent} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDanger]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>{badge}</Text>
        </View>
      ) : value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : onPress && !disabled ? (
        <Feather name="chevron-right" size={16} color={Colors.dark.textTertiary} />
      ) : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleUpgrade() {
    Alert.alert(
      "Linkery Notes Pro",
      "Pro plan coming soon! Unlock unlimited notes, cloud sync, and ad-free experience.",
      [{ text: "Got it", style: "default" }]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#0E2040", Colors.dark.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 84 + 34 : 120 },
        ]}
      >
        {/* Upgrade Card */}
        <Pressable
          onPress={handleUpgrade}
          style={({ pressed }) => [styles.upgradeCard, pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={["#003D4D", "#001A26"]}
            style={StyleSheet.absoluteFill}
            borderRadius={16}
          />
          <View style={styles.upgradeContent}>
            <View style={styles.upgradeLeft}>
              <View style={styles.proBadgeLarge}>
                <Text style={styles.proBadgeLargeText}>PRO</Text>
              </View>
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>Unlimited memos, no ads, cloud sync</Text>
              </View>
            </View>
            <View style={styles.upgradeArrow}>
              <Feather name="arrow-right" size={18} color={Colors.accent} />
            </View>
          </View>
        </Pressable>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingRow
            icon="user"
            label="Sign In"
            sublabel="Sync across devices"
            badge="Soon"
            disabled
          />
          <SettingRow
            icon="cloud"
            label="Cloud Backup"
            sublabel="Automatic backup of all memos"
            badge="Pro"
            disabled
          />
        </View>

        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingRow
            icon="moon"
            label="Dark Mode"
            value="Always"
            disabled
          />
          <SettingRow
            icon="bell"
            label="Notifications"
            badge="Soon"
            disabled
          />
          <SettingRow
            icon="tag"
            label="Tags & Folders"
            sublabel="Organize your memos"
            badge="Pro"
            disabled
          />
        </View>

        <SectionHeader title="Import & Export" />
        <View style={styles.section}>
          <SettingRow
            icon="download"
            label="Import Bookmarks"
            sublabel="From Chrome or Safari"
            badge="Soon"
            disabled
          />
          <SettingRow
            icon="share"
            label="Export as CSV"
            badge="Pro"
            disabled
          />
        </View>

        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingRow
            icon="info"
            label="Version"
            value="1.0.0"
            disabled
          />
          <SettingRow
            icon="star"
            label="Rate the App"
            onPress={() => Alert.alert("Thank you!", "Rating feature coming soon.")}
          />
          <SettingRow
            icon="mail"
            label="Send Feedback"
            onPress={() => Alert.alert("Feedback", "Email support coming soon.")}
          />
        </View>

        {/* Ad Placement */}
        <View style={styles.adContainer}>
          <View style={styles.adBanner}>
            <Feather name="zap" size={12} color={Colors.dark.textTertiary} />
            <Text style={styles.adLabel}>Ad Placement — Google AdMob</Text>
          </View>
          <Text style={styles.adNote}>
            Upgrade to Pro to remove ads
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    color: Colors.dark.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.accent + "33",
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  upgradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  proBadgeLarge: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadgeLargeText: {
    fontSize: 13,
    color: "#000",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  upgradeArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.dark.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  rowPressed: {
    backgroundColor: Colors.dark.bgElevated,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.bgInput,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: {
    backgroundColor: Colors.danger + "22",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.dark.text,
    fontFamily: "Inter_500Medium",
  },
  rowLabelDanger: {
    color: Colors.danger,
  },
  rowSublabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  comingSoonBadge: {
    backgroundColor: Colors.dark.bgElevated,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  comingSoonText: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  adContainer: {
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    width: "100%",
  },
  adLabel: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  adNote: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    fontFamily: "Inter_400Regular",
  },
});
