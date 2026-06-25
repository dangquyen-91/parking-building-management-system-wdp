import { Linking, Modal } from "react-native";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { WebView } from "react-native-webview";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Pressable, Text, View, useThemeColors } from "@/tw";

type BookingPaymentModalProps = {
  onClose: () => void;
  onNavigationStateChange: (navigation: WebViewNavigation) => void;
  paymentUrl: string | null;
};

export function BookingPaymentModal({
  onClose,
  onNavigationStateChange,
  paymentUrl,
}: BookingPaymentModalProps) {
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
            onNavigationStateChange={onNavigationStateChange}
            source={{ uri: paymentUrl }}
            startInLoadingState
            className="flex-1"
          />
        ) : null}
      </View>
    </Modal>
  );
}
