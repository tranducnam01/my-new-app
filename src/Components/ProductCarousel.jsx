import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../Redux/CartSlice";
import { myColor } from "../Utils/MyColor";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../Utils/config";
import AsyncStorage from '@react-native-async-storage/async-storage';




const ProductCarousel = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlide); // ✅ Sửa thành CartSlide
  const nav = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products?categoryId=${categoryId}`);
        const mappedData = response.data.map((item) => ({
          name: item.Name,
          price: item.Price,
          img: item.Img,
          pieces: item.Pieces,
          productId: item.ProductId,  // thêm id để dễ quản lý cart
        }));

        setProducts(mappedData);
      } catch (err) {
        console.error("❌ Lỗi khi lấy sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  const updateProductPieces = (productId, change) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productId === productId
          ? { ...product, pieces: parseInt(product.pieces) + change }
          : product
      )
    );
  };
  

  const handleAddToCart = async (item) => {
    console.log("🛒 Sản phẩm được thêm vào giỏ hàng:", item); // 👈 in ra terminal
    
    updateProductPieces(item.productId, -1);
    dispatch(addToCart(item)); // vẫn gọi Redux như cũ
    
    try {
      const userId = await AsyncStorage.getItem('userId'); // từ AsyncStorage
      await axios.post(`${BASE_URL}/api/cart/add`, {
        userId,
        items: [{
          productId: item.productId,
          quantity: 1,
          pieces: item.pieces -1,
        }]
      });
    } catch (err) {
      console.error("❌ Lỗi khi lưu vào MySQL:", err);
      updateProductPieces(item.productId, 1);
      dispatch(removeFromCart(item));
    }
  };
  const handleRemoveFromCart = async (item) => {

    updateProductPieces(item.productId, 1);
    dispatch(removeFromCart(item)); // Xóa khỏi Redux
    
  
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn("⚠️ Không tìm thấy userId");
        return;
      }
  
      await axios.post(`${BASE_URL}/api/cart/delete`, {
        userId,
        productId: item.productId
      });
  
      console.log("✅ Đã xóa sản phẩm khỏi cart và hoàn kho");
    } catch (err) {
      console.error("❌ Lỗi khi xóa khỏi MySQL:", err);
      updateProductPieces(item.productId, -1);
      dispatch(addToCart(item));
    }
  };
  
    
  const renderItem = ({ item }) => {
    const isInCart = storeData.some((value) => value.productId === item.productId); // ✅ So sánh theo id cho an toàn

    return (
      <TouchableOpacity
        onPress={() => {
          if (parseInt(item.pieces) === 0) {
            alert("Sản phẩm đã hết hàng!");
            return;
          }
          nav.navigate("Details", { main: item });
        }}
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
            {item.name}
          </Text>
          <Text style={{ color: "grey" }}>{item.pieces} cái</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.price}$</Text>
            <FontAwesome
              name={isInCart ? "minus-square" : "plus-square"}
              size={30}
              color={myColor.primary}
              onPress={() =>
                isInCart
                  ? handleRemoveFromCart(item)
                  : handleAddToCart(item) 
              }
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ height: responsiveHeight(30), justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={myColor.primary} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => item.productId.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ProductCarousel;