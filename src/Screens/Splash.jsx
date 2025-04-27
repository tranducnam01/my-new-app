import React, { useEffect } from 'react'
import { View, Text, ImageBackground, Image } from 'react-native'
import { myColor } from './../Utils/MyColor'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'

const Splash = () => {
  const nav = useNavigation()

  useEffect(() =>{
    setTimeout(() => {
     nav.replace('Signup')
    }, 3000);
  },[]);
  return (
    <View style={{
      backgroundColor: myColor.primary,
      flex: 1,
      justifyContent: 'center',
    }}>
      <StatusBar style='light' />
      <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "center" ,gap:15}}>
        <Image style={{ tintColor: "white", height: 75, width: 65 }} source={require('../assets/icon2.png')} />
        <View>
         <Text style={{fontSize:75,color:myColor.secondary}}>Enzo </Text>
         <Text style={{color:myColor.secondary,fontSize:17,textAlign:'center',letterSpacing:5,top:-15}}>Online Mobile device</Text>
        </View>
      </View>
    </View>
  )
}
export default Splash