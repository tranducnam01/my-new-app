import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { myColor } from '../Utils/MyColor';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../Redux/CartSlice';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../../Firebaseconfig';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlide);
  const nav = useNavigation();

  // Fetch all products from 4 collections
  useEffect(() => {
    const fetchProducts = async () => {
      const collectionsToFetch = ['headphones', 'laptop', 'smartphone', 'speakers'];
      let allItems = [];

      try {
        for (const col of collectionsToFetch) {
          const snapshot = await getDocs(collection(database, col));
          snapshot.forEach((doc) => {
            const data = doc.data();
            allItems.push(data);
          });
        }

        setProducts(allItems);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu sản phẩm:", err);
      }
    };

    fetchProducts();
  }, []);

  const renderItem = ({ item }) => {
    const isInCart = storeData.some((value) => value.name === item.name);

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
        data={products}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ProductCarousel;
