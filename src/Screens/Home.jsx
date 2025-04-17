import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context"
import HomeIcon from "../Components/HomeIcon";
import HomeSearch from "../Components/HomeSearch";
import HomeBanner from "../Components/HomeBanner";
import Product_title from "../Components/Product_title";
import ProductCarousel from "../Components/ProductCarousel";
import { ScrollView } from "react-native";
import { laptop, smartphone } from "../Utils/Date";
import ControlBar from "./controlBar";


const Home = () => {
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: 'white',
    }}>
      <ScrollView
      showsVerticalScrollIndicator= {false}
      style={{
        flex:1,
        paddingHorizontal:20
        }}>
        <View style={{gap:20}}>
          <HomeIcon />
          <HomeSearch />
          <HomeBanner />
          <Product_title title='Lap Top' />
          <ProductCarousel data ={laptop}/>
          <Product_title title='Smart Phone' />
          <ProductCarousel data ={smartphone}/>
        </View>
      </ScrollView>
      <ControlBar />
    </SafeAreaView>
  )
}
export default Home