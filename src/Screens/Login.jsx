
import { View, Text, ScrollView, Image, TextInput,Touchable, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { myColor, MyColor } from './../Utils/MyColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation , StackActions} from "@react-navigation/native";
import uuid from 'react-native-uuid';
import axios from 'axios';
import { BASE_URL } from '../Utils/config';

import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = () => {
  const nav = useNavigation();
   const [loginCredentials,setloginCredentials] = useState({
    email:"",
    password:"",
   });
   const [isVisbile, setisVisbile] = useState(true);
   
   const{email,password} = loginCredentials;


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
        // ✅ Lưu phiên đăng nhập vào thiết bị
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        await AsyncStorage.setItem('userId', user.id.toString()); // Lưu userId riêng


        nav.dispatch(StackActions.replace('Home'));
      } else {
        Alert.alert('Đăng nhập thất bại', message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi đăng nhập', error.message);
    }
  };
  
  
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: myColor.secondary }}>
         <ScrollView style={{ flex: 1, paddingTop: 30 }}>
              <Image
                style={{ alignSelf: "center" }}
                source={require('../assets/icon2.png')}
              />
      
              <View style={{ paddingHorizontal: 20, marginTop: 50 }}>
                <Text style={{ color: myColor.third, fontSize: 24, fontWeight: '500' }}>Login</Text>
                <Text style={{ fontSize: 16, fontWeight: '400', color: 'grey', margin: 10 }}>email and password </Text>
      
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Email</Text>
                <TextInput 
                   value ={email}
                   onChangeText ={(val) =>{
                    setloginCredentials ({...loginCredentials,email:val});
                   }}
                maxLength={20} keyboardType="email-address" style={{ borderColor: '#E3E3E3', borderBottomWidth: 3, fontSize: 16, marginTop: 15 }} />
      
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Password</Text>
                <View style={{ borderColor: "E3E3E3", borderBottomWidth: 3, flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                  <TextInput    
                  value ={password}
                onChangeText ={(val) =>{
                  setloginCredentials ({...loginCredentials,password:val});
                }} secureTextEntry={isVisbile} maxLength={6} keyboardType="ascii-capable"
                    style={{
      
                      fontSize: 17,
                      marginTop: 15,
                      flex: 0.9,
                    }} />
                  <Ionicons onPress={
                    () => {
                      setisVisbile(!isVisbile)
                    }} 
                    name={isVisbile == true ? "eye-off-outline" : 'eye-outline'}
                     size={24} 
                     color="black" 
                     />
                </View>
                <Text numberOfLines={2}  style={{fontSize:14,fontWeight:'400',color:"black",marginTop:15, textAlign:'right'}}>Forgot Password?</Text>
                    <TouchableOpacity 
                   onPress={loginUser}
                    style={{backgroundColor:myColor.primary,marginTop:30,height:70,borderRadius:20,justifyContent:'center',alignItems:"center"}}>
                      <Text style={{fontSize:19,color:myColor.secondary,fontWeight:'500'}}>Log in</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection:"row",justifyContent:'center',alignItems:"center",marginTop:20,
                      gap:5
                    }}>
                      <Text style={{fontSize:16}}>Don't have an account?</Text>
                      <TouchableOpacity    
                      onPress={()=>{
                          nav.dispatch(StackActions.replace('Signup'))
                        }}>
                      <Text style={{fontSize:15,color:myColor.primary}}>Signup </Text>
      
                      </TouchableOpacity>
               
                    </View>
              </View>
            </ScrollView>
    </SafeAreaView>
  )
}

export default Login