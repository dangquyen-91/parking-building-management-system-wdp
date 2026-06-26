import { Pressable, Text, View, useThemeColors } from "@/tw";
import { Linking, Modal } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import Ionicons from "react-native-vector-icons/Ionicons";

type SubscriptionPaymentModalProps = {
  onClose: () => void;
  onNavigationStateChange: (navigation: WebViewNavigation) => void;
  paymentUrl: string | null;
};

export function SubscriptionPaymentModal({
  onClose,
  onNavigationStateChange,
  paymentUrl,
}: SubscriptionPaymentModalProps) {
  const { iconPrimary } = useThemeColors();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={Boolean(paymentUrl)}
    >
      <View className="flex-1 bg-page">
        <View className="flex-row items-center justify-between border-b border-border-theme bg-glass-card px-4 pb-3 pt-14">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-badge"
            onPress={onClose}
          >
            <Ionicons name="close" color={iconPrimary} size={22} />
          </Pressable>

          <Text className="font-sans text-base font-extrabold text-fg">
            PayOS payment
          </Text>

          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-badge"
            onPress={() => {
              if (paymentUrl) {
                void Linking.openURL(paymentUrl);
              }
            }}
          >
            <Ionicons name="open-outline" color={iconPrimary} size={20} />
          </Pressable>
        </View>

        {paymentUrl ? (
          <WebView
            className="flex-1"
            onNavigationStateChange={onNavigationStateChange}
            source={{ uri: paymentUrl }}
            startInLoadingState
          />
        ) : null}
      </View>
    </Modal>
  );
}
