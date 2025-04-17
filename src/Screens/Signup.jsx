import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { myColor } from './../Utils/MyColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { authentication, database } from '../../Firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [isVisbile, setisVisbile] = useState(true);
  const [userCrendetails, setuserCrendetails] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { email, password, name } = userCrendetails;
  const nav = useNavigation();

  const userAccount = () => {
    createUserWithEmailAndPassword(authentication, email, password)
      .then(async () => {
        const uid = authentication.currentUser.uid;
        await setDoc(doc(database, "users", uid), {
          username: name,
          email: email,
          id: uid
        });
        Alert.alert('Tạo tài khoản thành công!');
        nav.replace('Login');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Email đã được sử dụng!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Email không hợp lệ!');
        } else {
          console.error(error);
          Alert.alert('Lỗi: ', error.message);
        }
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: myColor.secondary }}>
      <StatusBar />
      <ScrollView style={{ flex: 1, paddingTop: 30 }}>
        <Image
          style={{ alignSelf: "center" }}
          source={require('../assets/icon.png')}
        />
        <View style={{ paddingHorizontal: 20, marginTop: 50 }}>
          <Text style={{ color: myColor.third, fontSize: 24, fontWeight: '500' }}>Sign Up</Text>
          <Text style={{ fontSize: 16, fontWeight: '400', color: 'grey', margin: 10 }}>Enter credentials to continue</Text>

          <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 40 }}>UserName</Text>
          <TextInput
            maxLength={20}
            value={name}
            onChangeText={(val) => setuserCrendetails({ ...userCrendetails, name: val })}
            keyboardType="default"
            style={{ borderColor: '#E3E3E3', borderBottomWidth: 3, fontSize: 16, marginTop: 15 }}
          />

          <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(val) => setuserCrendetails({ ...userCrendetails, email: val })}
            maxLength={40}
            keyboardType="email-address"
            style={{ borderColor: '#E3E3E3', borderBottomWidth: 3, fontSize: 16, marginTop: 15 }}
          />

          <Text style={{ fontSize: 16, fontWeight: '500', color: 'grey', marginTop: 30 }}>Password</Text>
          <View style={{ borderColor: "#E3E3E3", borderBottomWidth: 3, flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
            <TextInput
              value={password}
              onChangeText={(val) => setuserCrendetails({ ...userCrendetails, password: val })}
              secureTextEntry={isVisbile}
              maxLength={20}
              keyboardType="default"
              style={{
                fontSize: 17,
                marginTop: 15,
                flex: 0.9,
              }}
            />
            <Ionicons
              onPress={() => setisVisbile(!isVisbile)}
              name={isVisbile ? "eye-off-outline" : 'eye-outline'}
              size={24}
              color="black"
            />
          </View>

          <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '400', color: "black", marginTop: 15, opacity: 0.7 }}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </Text>

          <TouchableOpacity
            onPress={userAccount}
            style={{ backgroundColor: myColor.primary, marginTop: 30, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: "center" }}
          >
            <Text style={{ fontSize: 19, color: myColor.secondary, fontWeight: '500' }}>Sign Up</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: "center", marginTop: 20, gap: 5 }}>
            <Text style={{ fontSize: 16 }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => nav.navigate('Login')}>
              <Text style={{ fontSize: 15, color: myColor.primary }}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
