import { View, StyleSheet, Pressable, Image } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useCountriesFromList } from '@/src/hooks';
import { Colors } from '@/src/utils/constants/Colors';
import Input from '../input/input.component';
import { Text } from '../text/text.component';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
  ActionsheetItem,
} from '../ui/actionsheet';
import { SearchIcon } from '../ui/icon';

export const PhoneNumber = (props: any) => {
  const { value, error, onBlur, onChangeText: onTextChange, placeholder, phoneNumber, handleChangeCode } = props;
  const { countries } = useCountriesFromList();
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [countryCodeSelected, setCountryCodeSelected] = useState(phoneNumber);
  const parsedCountries = countries.map((country) => ({
    label: country.name,
    value: country.codeNumber,
    image: country.flag,
    id: country.codeNumber,
  }));

  const handleInputChange = (text: string) => {
    setSearchText(text);
  };

  const filteredData = useCallback(() => {
    return parsedCountries?.filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()) || item.value.includes(searchText));
  }, [parsedCountries, searchText]);

  const handleClose = (number: string) => {
    setShowActionsheet(false);
    setCountryCodeSelected(number);
    handleChangeCode(number);
    setSearchText('');
  };

  const Item: React.FC<{ title: string; image: string; id: string }> = useCallback((value) => {
    return (
      <ActionsheetItem onPress={() => handleClose(value.id)} className="h-12 p-2 items-center gap-4">
        <View className="w-10 h-10">
          <Image
            source={{
              uri: value?.image,
            }}
            width={40}
            height={40}
          />
        </View>
        <Text textColor={Colors.BLACK}>{value.title}</Text>
      </ActionsheetItem>
    );
  }, []);

  return (
    <>
      <Input
        label={'Contacto'}
        onBlur={onBlur}
        onChangeText={(text: string) => {
          const numericText = text.replace(/[^0-9]/g, '');
          const limitedText = numericText.slice(0, 10);
          onTextChange(limitedText);
        }}
        placeholder={placeholder}
        value={value}
        error={error}
        custom={
          <Pressable
            style={{
              height: 40,
              borderEndWidth: 1,
              borderColor: Colors.PRIMARY,
              minWidth: 40,
            }}
            className="items-center justify-center pr-3"
            onPress={() => setShowActionsheet(true)}
          >
            <Text fontWeight={400}>{countryCodeSelected}</Text>
          </Pressable>
        }
        leftIcon
        touched={false}
        {...props}
        maxLength={10}
      />
      <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)} snapPoints={[70]}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-10">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View style={styles.search_bar_container}>
            <Input placeholder="Search..." label="" onBlur={() => {}} onChangeText={handleInputChange} className="" icon={SearchIcon} rightIcon size="sm" />
          </View>
          <ActionsheetFlatList
            data={filteredData()}
            renderItem={({ item }: any) => <Item id={item.id} title={item.value} image={item.image} />}
            contentContainerClassName="gap-4"
            keyExtractor={(item: any) => `${item.id}-${item.label}`}
          />
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

const styles = StyleSheet.create({
  search_bar_container: {
    width: '100%',
    marginBottom: 24,
    marginTop: 24,
  },
});
