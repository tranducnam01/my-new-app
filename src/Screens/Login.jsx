import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import React, { useState } from 'react';
import { myColor } from '../Utils/MyColor'; // Sửa MyColor thành myColor
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, StackActions } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import axios from 'axios';
import { BASE_URL } from '../Utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const nav = useNavigation();
  const [loginCredentials, setloginCredentials] = useState({
    email: '',
    password: '',
  });
  const [isVisible, setIsVisible] = useState(true);
  const [forgotEmail, setForgotEmail] = useState(''); // State cho email reset
  const [modalVisible, setModalVisible] = useState(false); // State cho modal
  const { email, password } = loginCredentials;

  const loginUser = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải đủ 6 ký tự');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      const { success, message, token, user } = response.data;

      if (success) {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        await AsyncStorage.setItem('userId', user.id.toString());
        nav.dispatch(StackActions.replace('Home'));
      } else {
        Alert.alert('Đăng nhập thất bại', message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi đăng nhập', error.message);
    }
  };

  const resetPassword = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/forgot-password`, { email: forgotEmail });
      if (response.data.success) {
        Alert.alert('Thành công', response.data.message);
        setModalVisible(false); // Đóng modal sau khi thành công
        setForgotEmail(''); // Reset email
      } else {
        Alert.alert('Lỗi', response.data.message);
      }
    } catch (error) {
      console.error('Lỗi reset mật khẩu:', error);
      Alert.alert('Lỗi', 'Không thể reset mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: myColor.secondary }}>
      <ScrollView style={{ flex: 1, paddingTop: 30 }}>
        <Image style={{ alignSelf: 'center' }} source={require('../assets/icon2.png')} />
        <View style={{ paddingHorizontal: 20, marginTop: 50 }}>
          <Text style={{ color: myColor.third, fontSize: 24, fontWeight: '500' }}>Login</Text>
          <Text style={{ fontSize: 16, fontWeight: '400', color: 'grey', margin: 10 }}>email and password</Text>

          <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(val) => setloginCredentials({ ...loginCredentials, email: val })}
            maxLength={50}
            keyboardType="email-address"
            style={{ borderColor: '#E3E3E3', borderBottomWidth: 3, fontSize: 16, marginTop: 15 }}
          />

          <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Password</Text>
          <View style={{ borderColor: '#E3E3E3', borderBottomWidth: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextInput
              value={password}
              onChangeText={(val) => setloginCredentials({ ...loginCredentials, password: val })}
              secureTextEntry={isVisible}
              maxLength={6}
              keyboardType="ascii-capable"
              style={{ fontSize: 17, marginTop: 15, flex: 0.9 }}
            />
            <Ionicons
              onPress={() => setIsVisible(!isVisible)}
              name={isVisible ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="black"
            />
          </View>
          <Text
            numberOfLines={2}
            style={{ fontSize: 14, fontWeight: '400', color: 'black', marginTop: 15, textAlign: 'right' }}
            onPress={() => setModalVisible(true)} // Mở modal khi nhấn "Forgot Password?"
          >
            Forgot Password?
          </Text>
          <TouchableOpacity
            onPress={loginUser}
            style={{ backgroundColor: myColor.primary, marginTop: 30, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 19, color: myColor.secondary, fontWeight: '500' }}>Log in</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 5 }}>
            <Text style={{ fontSize: 16 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => nav.dispatch(StackActions.replace('Signup'))}>
              <Text style={{ fontSize: 15, color: myColor.primary }}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal để nhập email reset mật khẩu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 10 }}>Đặt lại mật khẩu</Text>
            <Text style={{ fontSize: 14, color: 'grey', marginBottom: 10 }}>Nhập email để nhận mật khẩu mới</Text>
            <TextInput
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              style={{ borderColor: '#E3E3E3', borderBottomWidth: 2, fontSize: 16, marginBottom: 20 }}
              placeholder="Nhập email"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button title="Hủy" onPress={() => setModalVisible(false)} color={myColor.primary} />
              <Button title="Gửi" onPress={resetPassword} color={myColor.primary} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Login;