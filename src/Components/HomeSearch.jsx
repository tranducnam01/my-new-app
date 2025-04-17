import { View, Text,TextInput } from 'react-native'
import React from 'react'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import EvilIcons from '@expo/vector-icons/EvilIcons';

const HomeSearch = () => {
  return (
    <View style={{
        backgroundColor:'#F2F3F2',
        height:responsiveHeight(6.5),
        borderRadius:10,
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:20,
        gap:10

    }}>
      <EvilIcons name="search" size={24} color="black" />
        <TextInput style={{flex:1}} placeholder="Search Store"/>
    </View>
  )
}

export default HomeSearch