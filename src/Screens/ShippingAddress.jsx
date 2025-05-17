import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { myColor } from '../Utils/MyColor';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../Utils/config';
import { useNavigation, StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../Redux/CartSlice';
import { useRoute } from '@react-navigation/native';




const ShippingAddress = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const storeData = useSelector(state => state.CartSlide);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const route = useRoute();
  const { amount } = route.params;



  const handleSave = async () => {
    if (!address.trim() || !phoneNumber.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ và số điện thoại.');
      return;
    }


    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
      return;
    }
    // Kiểm tra storeData
    console.log('storeData:', storeData); // Log để gỡ lỗi
    if (!storeData || !Array.isArray(storeData) || storeData.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống hoặc không hợp lệ. Vui lòng thêm sản phẩm vào giỏ hàng.');
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
        return;
      }

      // ✅ Đảm bảo biến cartItems được khai báo đúng
      const cartItems = storeData.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        amount: item.price * item.quantity,
      }));
      // xác minh tổng tiền
      const calculatedTotal = storeData.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (calculatedTotal !== amount) {
        console.warn('Tổng tiền không khớp:', { calculatedTotal, passedAmount: amount });
      }
      // Ánh xạ paymentMethod
      const backendPaymentMethod = paymentMethod === 'cod' ? 'offline' : 'online';
      console.log({
        userId,
        address,
        phoneNumber,
        cartItems,
        totalAmount: amount,
        paymentMethod: backendPaymentMethod,
      });

      const response = await axios.post(`${BASE_URL}/api/shipping-address`, {
        userId,
        address,
        phoneNumber,
        cartItems,
        totalAmount: amount,
        paymentMethod : backendPaymentMethod,
      });

      if (response.data.success) {
        Alert.alert('Thành công', 'Đã lưu địa chỉ giao hàng.');
        dispatch(clearCart());
        if (paymentMethod === 'cod') {
          nav.navigate('Orderplace');
        }
      } else {
        Alert.alert('Lỗi', response.data.message || 'Đã xảy ra lỗi trong quá trình lưu.');
      }
    } catch (error) {
      console.error('Lỗi khi lưu địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ giao hàng. Vui lòng thử lại.');
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: myColor.secondary }}>
      <ScrollView style={{ padding: 20 }}>
        {/* Nút quay lại và tiêu đề */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => nav.dispatch(StackActions.replace('Cart'))}
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: 50,
              padding: 8,
              marginRight: 10,
            }}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>Địa chỉ giao hàng</Text>
        </View>

        {/* Ô nhập địa chỉ */}
        <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 10 }}>Địa chỉ</Text>
        <TextInput
          placeholder="Nhập địa chỉ giao hàng"
          value={address}
          onChangeText={setAddress}
          style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            borderColor: '#ccc',
            borderWidth: 1,
            marginBottom: 20,
          }}
        />

        {/* Ô nhập số điện thoại */}
        <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 10 }}>Số điện thoại</Text>
        <TextInput
          placeholder="Nhập số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            borderColor: '#ccc',
            borderWidth: 1,
            marginBottom: 40,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 10 }}>Phương thức thanh toán</Text>
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => setPaymentMethod('cod')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: '#555',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10
            }}>
              {paymentMethod === 'cod' && <View style={{
                height: 10,
                width: 10,
                borderRadius: 5,
                backgroundColor: '#555'
              }} />}
            </View>
            <Text>Thanh toán tại nhà</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod('direct')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: '#555',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10
            }}>
              {paymentMethod === 'direct' && <View style={{
                height: 10,
                width: 10,
                borderRadius: 5,
                backgroundColor: '#555'
              }} />}
            </View>
            <Text>Thanh toán trực tiếp</Text>
          </TouchableOpacity>
        </View>

        {/* Nút lưu */}
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: myColor.primary,
            padding: 18,
            borderRadius: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Lưu và tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShippingAddress;