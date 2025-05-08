import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, Entypo, FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';


const ControlBar = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Dùng để xác định trang hiện tại

  const activeColor = '#007AFF';
  const inactiveColor = 'black';

  const cartItems = useSelector((state) => state.CartSlide);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 60,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      backgroundColor: 'white',
    }}>
      {/* Trang chủ */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="home" size={24} color={route.name === 'Home' ? activeColor : inactiveColor} />
          <Text style={{ color: route.name === 'Home' ? activeColor : inactiveColor }}>Trang chủ</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
        <View style={{ alignItems: 'center' }}>
          <View>
            <Entypo name="shopping-cart" size={24} color={route.name === 'Cart' ? activeColor : inactiveColor} />
            {totalQuantity > 0 && (
              <View style={{
                position: 'absolute',
                right: -10,
                top: -5,
                backgroundColor: 'red',
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 1,
              }}>
                <Text style={{ color: 'white', fontSize: 12 }}>{totalQuantity}</Text>
              </View>
            )}
          </View>
          <Text style={{ color: route.name === 'Cart' ? activeColor : inactiveColor }}>Giỏ hàng</Text>
        </View>
      </TouchableOpacity>


      {/* Người dùng */}
      <TouchableOpacity onPress={() => navigation.navigate('User')}>
        <View style={{ alignItems: 'center' }}>
          <FontAwesome name="user" size={24} color={route.name === 'User' ? activeColor : inactiveColor} />
          <Text style={{ color: route.name === 'User' ? activeColor : inactiveColor }}>Người dùng</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ControlBar;
