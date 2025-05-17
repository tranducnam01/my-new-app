import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DropBox from '../Components/DropBox';
import { myColor } from '../Utils/MyColor';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../Redux/CartSlice';
import { BASE_URL } from '../Utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // Đảm bảo axios đã được import

const Details = ({ route }) => {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const dispatch = useDispatch();
   const storeData = useSelector((state) => state.CartSlide); // ✅ Sửa thành CartSlide

  const nav = useNavigation();
    // Lấy dữ liệu sản phẩm từ route
  const productData = route.params?.main;
  const { name, price, pieces, img, productId } = productData;

  const handleAddToCart = async (item) => {
    console.log("🛒 Sản phẩm được thêm vào giỏ hàng:", item); // 👈 in ra terminal

   
    dispatch(addToCart(item)); // vẫn gọi Redux như cũ

    try {
      const userId = await AsyncStorage.getItem('userId'); // từ AsyncStorage
      await axios.post(`${BASE_URL}/api/cart/add`, {
        userId,
        items: [{
          productId: item.productId,
          quantity: 1,
          pieces: item.pieces - 1,
        }]
      });
      dispatch(addToCart(item)); // cập nhật Redux
    } catch (err) {
      console.error("❌ Lỗi khi lưu vào MySQL:", err);
      dispatch(removeFromCart(item));
    }
  };
  return (

    <SafeAreaView style={{ flex: 1, gap: 20, backgroundColor: "white" }}>
      <StatusBar backgroundColor="white" />
      <View>
        <Image
          resizeMode="contain"
          style={{ height: 300, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
          source={{ uri: img }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'absolute',
            width: "100%",
            paddingHorizontal: 15,
            alignItems: "center"
          }}>
          <Ionicons
            onPress={() => {
              nav.goBack();
            }}
            name="chevron-back" size={28} color="black" />
          <Feather name="share" size={28} color="black" />
        </View>
      </View>
      <View
        style={{ paddingHorizontal: 15, backgroundColor: "white", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Text
            style={{
              fontSize: 25,
              color: 'black',
              fontWeight: "600"
            }}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Text>
          <MaterialIcons name="favorite-border" size={30} color="black" />
        </View>
        <Text style={{ marginTop: 5, fontSize: 15, color: 'grey' }}>{pieces} , price</Text>
        <Text style={{ marginTop: 5, fontSize: 28, color: 'black', fontWeight: "bold" }}>{price}</Text>
        <DropBox />
        <View style={{

          flex: 0.9,
          justifyContent: "flex-end"
        }}>
          {storeData.some((value) => value.productId === productData.productId) ? (

            <TouchableOpacity
              disabled={true}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#E3E3E3",
                borderRadius: 10,
                height: 70,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "700" }}>
                Added to Basket
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                handleAddToCart(productData);
                nav.navigate("Cart");
              }}
              activeOpacity={0.8}
              style={{
                backgroundColor: myColor.primary,
                borderRadius: 10,
                height: 70,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
                Add to Basket
              </Text>
            </TouchableOpacity>
          )}

        </View>

      </View>

    </SafeAreaView>
  )
}

export default Details