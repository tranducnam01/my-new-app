import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import AntDesign from '@expo/vector-icons/AntDesign';
import { myColor } from '../Utils/MyColor';
import { useDispatch, useSelector } from 'react-redux';
import { incrementQuantity, decrementQuantity, removeFromCart, clearCart } from '../../Redux/CartSlice';
import { useNavigation, StackActions } from '@react-navigation/native';
import ControlBar from "./controlBar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from "../Utils/config";
import { removeFromCart as removeFromCartRedux } from '../../Redux/CartSlice'; // Đổi tên local tránh trùng



const Cart = () => {
    const nav = useNavigation()
    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.CartSlide);

    // Tính tổng tiền
    let amount = 0;
    storeData.forEach(element => {
        amount += element.price * element.quantity;
    });
    const updateCartItem = async (productId, quantity) => {
        try {
            const userId = await AsyncStorage.getItem('userId'); // ✅ lấy userId
            if (!userId) return;
    
            const response = await axios.post(`${BASE_URL}/api/cart/update`, {
                userId,
                productId,
                quantity,
            });
    
            console.log('✅ Cập nhật giỏ hàng thành công:', response.data);
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật giỏ hàng:', error.response?.data || error.message);
        }
    };
    const removeCartItem = async (productId) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;
    
            const response = await axios.post(`${BASE_URL}/api/cart/delete`, {
                userId,
                productId,
            });
    
            console.log('✅ Xóa sản phẩm thành công:', response.data);
        } catch (error) {
            console.error('❌ Lỗi khi xóa sản phẩm:', error.response?.data || error.message);
        }
    };
    const handleCheckout = async () => {
        try {
            if (storeData.length === 0) {
                nav.dispatch(StackActions.replace('Home'));
                return;
            }

            const user = authentication.currentUser;
            if (!user) {
                alert("Vui lòng đăng nhập để thanh toán!");
                return;
            }

            // Kiểm tra tồn kho trước khi thanh toán
            for (const item of storeData) {
                if (item.quantity > parseInt(item.pieces)) {
                    alert(`Sản phẩm "${item.name}" không còn đủ số lượng tồn kho!`);
                    return;
                }
            }

            const timeNow = moment().format("YYYY-MM-DD HH:mm:ss");

            // Gửi đơn hàng vào collection "orders"

            await fetch(`${BASE_URL}/api/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    items: storeData.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        pieces: item.pieces
                    }))
                })
            })

            // Xoá giỏ hàng và điều hướng
            dispatch(clearCart());
            nav.dispatch(StackActions.replace('Orderplace'));

        } catch (error) {
            console.error("❌ Lỗi khi xử lý thanh toán:", error.message || error.code || error);
        }
    };


    return (
        <SafeAreaView style={{
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor: 'white',
            gap: 5,
        }}>
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: "500" }}>My Cart</Text>

            <View style={{ flex: 0.9, justifyContent: 'flex-end' }}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={storeData}
                    keyExtractor={(item) => item.productId.toString()}
                    renderItem={({ item }) => (
                        <View style={{
                            height: responsiveHeight(18),
                            borderBottomColor: "#E3E3E3",
                            borderBottomWidth: 2,
                            flexDirection: 'row',
                        }}>
                            <View style={{
                                flex: 0.35,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image style={{ height: 120, width: 120, resizeMode: "contain" }} source={{ uri: item.img }} />
                            </View>

                            <View style={{ flex: 0.7, paddingHorizontal: 10, paddingVertical: 20 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{ fontSize: 20, fontWeight: '600' }}>{item.name}</Text>
                                    <AntDesign
                                        name="close"
                                        size={25}
                                        color="grey"
                                        onPress={() => {
                                            dispatch(removeFromCartRedux({ productId: item.productId })); // Xóa trên Redux trước (UI phản hồi nhanh)
                                            removeCartItem(item.productId); // Gọi API để xóa bên server MySQL
                                        }}                                   />
                                </View>
                                <Text style={{ fontSize: 17, color: 'grey', marginTop: 5 }}>{item.pieces}, price</Text>
                                <View style={{
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 10
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}>
                                        <AntDesign
                                            name="minuscircleo"
                                            size={25}
                                            color={myColor.primary}
                                            onPress={() => {
                                                if (item.quantity > 1) {
                                                    dispatch(decrementQuantity({ productId: item.productId }));
                                                    updateCartItem(item.productId, item.quantity - 1); // 🛠 Sync lên server
                                                }
                                            }}
                                        />
                                        <Text style={{ fontSize: 16 }}>{item.quantity}</Text>
                                        <AntDesign
                                            name="pluscircleo"
                                            size={25}
                                            color={myColor.primary}
                                            onPress={() => {
                                                if (item.quantity < item.pieces) {
                                                    dispatch(incrementQuantity({ productId: item.productId }));
                                                    updateCartItem(item.productId, item.quantity + 1); // 🛠 Sync lên server
                                                }
                                            }}
                                        />
                                    </View>
                                    <Text style={{ fontSize: 22, fontWeight: '600' }}>${item.quantity * item.price}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>

            <View>
                <TouchableOpacity
                    onPress={handleCheckout}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: myColor.primary,
                        borderRadius: 15,
                        height: 70,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40, justifyContent: 'space-evenly' }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: "600" }}>Go to checkOut</Text>
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: "500" }}>${amount}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                right: 0,
            }}>
                <ControlBar />
            </View>
        </SafeAreaView>
    )
}

export default Cart;
