
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { fruits } from './../Utils/Date'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { myColor } from '../Utils/MyColor';
import { use } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../Redux/CartSlice';
import { authentication, database } from '../../Firebaseconfig';


const ProductCarousel = ({ data }) => {
    const dispatch = useDispatch();
    const storeData = useSelector((state) => state.CartSlide);

    const nav = useNavigation();
    console.log(data);
    return (
        <View>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={data}
                renderItem={({ item, index }) => (

                    <TouchableOpacity
                        onPress={() => {
                            nav.navigate("Details", {
                                main: item
                            });
                        }}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(28),
                            borderWidth: 2,
                            borderColor: "#E3E3E3",
                            width: responsiveWidth(45),
                            marginRight: 10,
                            borderRadius: 15
                        }}>
                        <Image
                            style={{ height: 125, width: 120, alignSelf: 'center', resizeMode: "contain" }}
                            source={{ uri: item.img }} />
                        <View style={{ paddingHorizontal: 10, gap: 3 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600' }}>
                                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                            </Text>
                            <Text style={{ color: "grey" }}>{item.pieces}</Text>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 10
                            }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.price}$</Text>
                                {
                                    storeData.some((value) => value.name == item.name) ? (<FontAwesome name="minus-square" size={30} color={myColor.primary}
                                        onPress={() => {
                                            dispatch(removeFromCart(item));
                                        }}
                                    />
                                    ) : (
                                        <FontAwesome name="plus-square" size={30} color={myColor.primary}
                                            onPress={() => {
                                                dispatch(addToCart(item));
                                            }}
                                        />
                                    )}

                            </View>
                        </View>
                    </TouchableOpacity>
                )} />
        </View>
    )
}

export default ProductCarousel

