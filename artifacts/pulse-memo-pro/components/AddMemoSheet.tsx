import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

interface AddMemoSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (url: string, context: string) => Promise<void>;
}

export function AddMemoSheet({ visible, onClose, onSubmit }: AddMemoSheetProps) {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [urlError, setUrlError] = useState("");
  const [contextError, setContextError] = useState("");
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setUrl("");
      setContext("");
      setUrlError("");
      setContextError("");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== "web",
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [visible]);

  function validateUrl(val: string): boolean {
    try {
      const u = new URL(val);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    let valid = true;
    if (!url.trim()) {
      setUrlError("URL is required");
      valid = false;
    } else if (!validateUrl(url.trim())) {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
      valid = false;
    } else {
      setUrlError("");
    }
    if (!context.trim()) {
      setContextError("Tell yourself why you saved this");
      valid = false;
    } else {
      setContextError("");
    }
    if (!valid) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLoading(true);
    try {
      await onSubmit(url.trim(), context.trim());
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onClose();
    } catch (err: any) {
      setUrlError(err?.message || "Failed to save memo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kavContainer}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Save Link</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
          >
            <View>
              <Text style={styles.label}>URL</Text>
              <View style={[styles.inputWrap, urlError ? styles.inputError : null]}>
                <Feather name="link" size={16} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={url}
                  onChangeText={(v) => { setUrl(v); setUrlError(""); }}
                  placeholder="https://example.com"
                  placeholderTextColor={Colors.dark.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
              {urlError ? <Text style={styles.errorText}>{urlError}</Text> : null}
            </View>

            <View>
              <Text style={styles.label}>Why I saved this</Text>
              <View style={[styles.inputWrap, styles.textareaWrap, contextError ? styles.inputError : null]}>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={context}
                  onChangeText={(v) => { setContext(v); setContextError(""); }}
                  placeholder="Research for Q2 campaign, read later, share with team..."
                  placeholderTextColor={Colors.dark.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </View>
              {contextError ? <Text style={styles.errorText}>{contextError}</Text> : null}
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed, loading && styles.submitBtnLoading]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Feather name="bookmark" size={16} color="#000" />
                  <Text style={styles.submitText}>Save Memo</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  kavContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.dark.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textareaWrap: {
    alignItems: "flex-start",
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    minHeight: 90,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  submitBtnLoading: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
});
