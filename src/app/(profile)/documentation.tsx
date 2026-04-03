import { View, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WebView from 'react-native-webview';
import useSWR from 'swr';
import { router, useNavigation } from 'expo-router';
import { Documents, DocumentUpload, Gallery, SuccessRounded } from '@/assets/svg';
import { Container, Header } from '@/src/components';
import { Text } from '@/src/components/text/text.component';
import Tooltip from '@/src/components/tooltip/tooltip.component';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/src/components/ui/actionsheet';
import { Box } from '@/src/components/ui/box';
import { HStack } from '@/src/components/ui/hstack';
import { AlertCircleIcon, Icon } from '@/src/components/ui/icon';
import { VStack } from '@/src/components/ui/vstack';
import { useFilePicker, useMe, useToast } from '@/src/hooks';
import { getUserDocumentation } from '@/src/services/user.service';
import { Colors } from '@/src/utils/constants/Colors';
import { documentationHopper } from '@/src/utils/constants/documentation.constants';

const { width } = Dimensions.get('window');

export default function Documentation() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { user } = useMe();

  const { data } = useSWR(`/user-documents/user/${user?.id!}`, async () => getUserDocumentation(user?.id!), {
    revalidateOnFocus: true,
    refreshInterval: 5,
  });

  const { selectedDocuments, selectedImages, pickDocument, resetDocuments, pickImage } = useFilePicker();
  const [showTooltip, setShowTooltip] = useState(false);
  const { showToast } = useToast();
  const documentation = documentationHopper(t);
  const [documentsByItem, setDocumentsByItem] = useState<Record<string, any[]>>({});
  const [openActionSheetIndex, setOpenActionSheetIndex] = useState<number | null>(null);
  const [imagesByItem, setImagesByItem] = useState<any>([]);
  const [selectedPdf, setSelectedPdf] = useState<string>('');
  const handleOpenActionSheet = (index: number) => {
    setOpenActionSheetIndex(index);
  };

  const handleCloseActionSheet = () => {
    setOpenActionSheetIndex(null);
  };

  const handleClosePdfActionSheet = () => {
    setOpenActionSheetIndex(null);
    setSelectedPdf('');
  };

  const handlePickDocument = (itemId: number, type: string, multiple: boolean, name: string) => {
    const totalDocuments = selectedDocuments.length + (documentsByItem[itemId]?.length || 0);

    if (totalDocuments > 5) {
      showToast({
        message: t('max_documents_reached', { ns: 'utils' }),
        action: 'error',
        duration: 3000,
        placement: 'bottom',
      });
      return;
    }
    pickDocument(itemId, [type], false, name);
    resetDocuments();
  };

  const handlePickImage = (itemId: number) => {
    pickImage(itemId);
  };

  const handleActionSheetSelection = (type: string, index: number, name: string) => {
    if (type === 'image') {
      handlePickImage(index);
    } else if (type === 'document') {
      handlePickDocument(index, '*/*', true, name);
    }
  };

  useEffect(() => {
    if (selectedDocuments.length > 0) {
      setDocumentsByItem((prev) => {
        const updatedDocuments = { ...prev };

        selectedDocuments.forEach((doc) => {
          if (!updatedDocuments[doc.folder!]) {
            updatedDocuments[doc.folder!] = [doc];
          } else {
            const currentDocuments = updatedDocuments[doc.folder!];
            const isDuplicate = currentDocuments.some((existingDoc) => existingDoc.uri === doc.uri);

            if (!isDuplicate) {
              updatedDocuments[doc.folder!].push(doc);
            }
          }
        });

        return updatedDocuments;
      });
    }
    if (selectedImages.length > 0) {
      setImagesByItem((prev: any) => {
        const itemId = selectedImages[0]?.itemId;
        const currentImages = prev[itemId] || [];
        const newImages = selectedImages.filter((img) => !currentImages.some((existingImg: { uri: string }) => existingImg.uri === img.uri));
        return {
          ...prev,
          [itemId]: [...currentImages, ...newImages],
        };
      });
    }
  }, [selectedImages, selectedDocuments]);

  useEffect(() => {
    setDocumentsByItem({
      seremi: data?.seremiDecree && ([{ name: data?.seremiDecree }] as any),
      curriculum_vitae: data?.driverResume && ([{ name: data?.driverResume }] as any),
      permission: data?.circulationPermit && ([{ name: data?.circulationPermit }] as any),
      secure: data?.passengerInsurance && ([{ name: data?.passengerInsurance }] as any),
      vehiclePictures: data?.vehiclePictures && ([{ name: data?.vehiclePictures }] as any),
      identificationPictures: data?.identificationPictures && ([{ name: data?.identificationPictures }] as any),
    });

    if (data?.vehiclePictures) {
      setImagesByItem([...data?.vehiclePictures!, ...selectedImages.map((item) => item.uri)] as any);
    }
    if (data?.identificationPictures) {
      setImagesByItem([...data?.identificationPictures!, ...selectedImages.map((item) => item.uri)] as any);
    }
  }, [selectedImages, data, selectedImages]);

  useEffect(() => {
    navigation.setOptions({
      header: () => <Header title={t('profile.documentation.title', { ns: 'profile' })} arrow onPressArrow={() => router.back()} />,
    });
  }, [navigator]);

  const imageWidth = (width - 2 * 28) / 3;

  return (
    <>
      <Container>
        <Box style={styles.content}>
          <VStack space="md" className="mb-8">
            {documentation.map((documentation, index) => (
              <Box key={index} className="gap-3">
                <HStack className="gap-2">
                  <Text fontWeight={600} fontSize={14} textColor={Colors.DARK_PURPLE}>
                    {documentation.value}
                  </Text>
                  {documentation.info && (
                    <Pressable className="w-full relative" onPress={() => setShowTooltip(true)}>
                      <Icon as={AlertCircleIcon} color={Colors.PRIMARY} />
                      {showTooltip && <Tooltip documentation={documentation} setShowTooltip={setShowTooltip} />}
                    </Pressable>
                  )}
                </HStack>
                <Pressable
                  style={{ backgroundColor: Colors.PRIMARY }}
                  className="py-3 px-7 h-11 w-full rounded-xl flex-row items-center gap-2 self-center justify-center"
                  onPress={() => {
                    if (documentsByItem[documentation.name]?.length === 1) {
                      showToast({
                        message: t('max_documents_reached', { ns: 'utils' }),
                        action: 'error',
                        duration: 3000,
                        placement: 'bottom',
                      });
                      return;
                    }
                    if (documentation.type === 'pdf') {
                      handlePickDocument(index, 'application/pdf', true, documentation.name);
                    } else {
                      handleOpenActionSheet(index);
                    }
                  }}
                  disabled
                >
                  <Text textColor={Colors.DARK_PURPLE} fontWeight={600}>
                    {t('signup.step_3.upload')}
                  </Text>
                  <DocumentUpload color={Colors.DARK_PURPLE} />
                </Pressable>
                {index === 4 && data?.vehiclePictures && data?.vehiclePictures.length > 0 && (
                  <ScrollView contentContainerStyle={styles.gridContainer}>
                    <HStack style={styles.row}>
                      {imagesByItem?.map((image: string) => {
                        return (
                          <View style={[styles.imageWrapper, { width: imageWidth }]} key={image}>
                            <Image className="rounded-lg" source={{ uri: image }} style={[styles.image, { width: imageWidth }]} />
                          </View>
                        );
                      })}
                    </HStack>
                  </ScrollView>
                )}
                {documentsByItem[documentation.name] && documentsByItem[documentation.name]?.length > 0 && (
                  <View className="gap-4">
                    {documentsByItem[documentation.name]?.map((doc) => (
                      <Pressable
                        key={doc?.uri ?? ''}
                        className="flex-row items-center justify-between gap-2"
                        onPress={() => setSelectedPdf(doc?.name ?? '')}
                        disabled={true}
                      >
                        <Box className="flex-row gap-2 items-center">
                          <SuccessRounded />
                          <Text className="w-[80%]">{doc?.name?.split('/')?.pop() ?? ''}</Text>
                        </Box>
                      </Pressable>
                    ))}
                  </View>
                )}
                <Actionsheet isOpen={openActionSheetIndex === index} onClose={handleCloseActionSheet} snapPoints={[25]} key={`actionsheet-${index}`}>
                  <ActionsheetBackdrop />
                  <ActionsheetContent>
                    <ActionsheetDragIndicatorWrapper>
                      <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    <HStack className="flex-1 justify-center w-full m-auto px-6 py-4 gap-6">
                      <Pressable
                        className="flex-1 h-auto justify-center items-center gap-3"
                        onPress={() => handleActionSheetSelection('image', index, documentation.name)}
                      >
                        <Text className="text-lg font-semibold text-center text-gray-700">{t('gallery', { ns: 'utils' })}</Text>
                        <Gallery color={Colors.PRIMARY} width={35} height={35} />
                      </Pressable>
                      <Pressable
                        className="flex-1 h-auto justify-center items-center gap-3"
                        onPress={() => handleActionSheetSelection('document', index, documentation.name)}
                      >
                        <Text className="text-lg font-semibold text-center text-gray-700">{t('document', { ns: 'utils' })}</Text>
                        <Documents color={Colors.PRIMARY} width={35} height={35} />
                      </Pressable>
                    </HStack>
                  </ActionsheetContent>
                </Actionsheet>
              </Box>
            ))}
          </VStack>
        </Box>
      </Container>
      <Actionsheet isOpen={selectedPdf !== '' && selectedPdf.startsWith('http')} onClose={handleClosePdfActionSheet} snapPoints={[75]} key={`actionsheet`}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <HStack className="flex-1 justify-center w-full m-auto px-6 py-4 gap-6">
            <WebView source={{ uri: selectedPdf }} className="flex-1" />
          </HStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 28,
  },
  mark_map: {
    color: Colors.PRIMARY,
  },
  button: {
    marginTop: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    paddingHorizontal: 5,
  },
  image: {
    height: 120,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.LIGHT_GRAY,
    width: 16,
    height: 16,
    borderRadius: 15,
  },
});
