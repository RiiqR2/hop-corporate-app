import { Pressable, StyleSheet } from 'react-native';
import { ToastPlacement } from '@gluestack-ui/toast/lib/types';
import { ReactNode, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WarningToast } from '@/assets/svg';
import { Text } from '@/src/components/text/text.component';
import { HStack } from '@/src/components/ui/hstack';
import { CloseCircleIcon, Icon } from '@/src/components/ui/icon';
import { Toast, useToast as useGlueToast } from '@/src/components/ui/toast';
import { VStack } from '@/src/components/ui/vstack';
import { Colors } from '@/src/utils/constants/Colors';

export const useToast = () => {
  const [toastId, setToastId] = useState<number | null>(null);
  const toast = useGlueToast();
  const insets = useSafeAreaInsets();
  const showToast = ({
    message,
    action = 'error',
    duration = 3000,
    placement = 'bottom',
    textCustom,
  }: {
    message?: string;
    action?: 'error' | 'muted' | 'warning' | 'success' | 'info' | undefined;
    duration?: number;
    background?: string;
    placement?: ToastPlacement;
    textCustom?: ReactNode;
  }) => {
    const newId = Math.random();
    setToastId(newId);

    toast.show({
      id: String(newId),
      placement,
      duration: duration,
      render: ({ id }) => {
        const uniqueToastId = 'toast-' + id;
        return (
          <Toast
            action={action}
            variant="solid"
            nativeID={uniqueToastId}
            className="p-4 gap-6 flex-auto border-error-500 w-[98%] rounded-xl shadow-hard-5 flex-row justify-between"
            style={{
              width: '98%',
              marginBottom: insets.bottom + 12,
            }}
          >
            <HStack space="md" className="items-center flex-wrap">
              <Icon as={WarningToast} className="h-8 w-8" />
              <VStack space="xs" style={styles.toast_container}>
                {textCustom ? (
                  textCustom
                ) : (
                  <Text textColor={Colors.WHITE_SECONDARY} fontSize={16} fontWeight={400}>
                    {message}
                  </Text>
                )}
              </VStack>
            </HStack>
            <HStack className="gap-1">
              <Pressable onPress={() => toast.close(id)}>
                <Icon as={CloseCircleIcon} color={Colors.WHITE_SECONDARY} />
              </Pressable>
            </HStack>
          </Toast>
        );
      },
    });
  };

  return { showToast, toastId };
};

const styles = StyleSheet.create({
  toast_container: {
    maxWidth: '80%',
  },
});
