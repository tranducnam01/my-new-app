import { View, Text } from 'react-native';
import React from 'react';

const ProductTitle = ({ title }) => (
  <View style={{ paddingVertical: 8 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
  </View>
);

export default ProductTitle;