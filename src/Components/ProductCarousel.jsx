import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { myColor } from '../Utils/MyColor';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../Redux/CartSlice';

const ProductCarousel = ({ data }) => {
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlide);
  const nav = useNavigation();

  const renderItem = ({ item }) => {
    const isInCart = storeData.some((value) => value.name === item.name);

    return (
      <TouchableOpacity
        onPress={() => nav.navigate("Details", { main: item })}
        activeOpacity={0.7}
        style={{
          height: responsiveHeight(28),
          borderWidth: 1,
          borderColor: "#E3E3E3",
          width: responsiveWidth(45),
          marginRight: 10,
          borderRadius: 15,
          padding: 10,
          backgroundColor: '#fff',
        }}
      >
        <Image
          style={{
            height: 125,
            width: 120,
            alignSelf: 'center',
            resizeMode: "contain",
            marginBottom: 10,
          }}
          source={{ uri: item.img }}
        />
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            {item.name?.charAt(0).toUpperCase() + item.name?.slice(1)}
          </Text>
          <Text style={{ color: "grey" }}>{item.pieces}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.price}$</Text>
            <FontAwesome
              name={isInCart ? "minus-square" : "plus-square"}
              size={30}
              color={myColor.primary}
              onPress={() =>
                isInCart ? dispatch(removeFromCart(item)) : dispatch(addToCart(item))
              }
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ProductCarousel;
