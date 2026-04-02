import { Text, View } from 'react-native';
import React from 'react';
import Spinner from '@/src/components/ui/spinner';
import { Colors } from '@/src/utils/constants/Colors';

const loading = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner size="large" color={Colors.SECONDARY} />
        <Text style={{ marginVertical: 10 }}>Loading...</Text>
      </View>
    </>
  );
};

export default loading;
