import { View, Text } from 'react-native'
import React from 'react'
import {myColor} from "./../Utils/MyColor";

const Product_title = ({title}) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style ={{fontSize:20 , fontWeight:'600'}}>{title}</Text>
            <Text style ={{fontSize:16 , color:myColor.primary}}> See all</Text>
        </View>
    )
}

export default Product_title