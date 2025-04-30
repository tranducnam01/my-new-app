import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeIcon from "../Components/HomeIcon";
import HomeSearch from "../Components/HomeSearch";
import HomeBanner from "../Components/HomeBanner";
import ProductTitle from "../Components/Product_title";
import ProductCarousel from "../Components/ProductCarousel"; 
import ControlBar from "./controlBar";
import axios from 'axios';
import { BASE_URL } from "../Utils/config";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    var url = `${BASE_URL}/api/categories`;

    axios.get(url)
      .then((response) => {
        console.log(response.data);
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, paddingHorizontal: 20 }}
      >
        <View style={{ gap: 20 }}>
          <HomeIcon />
          <HomeSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <HomeBanner />
          
          {/* Hiển thị danh sách danh mục */}
          {categories.map((category) => (
            <View key={category.CategoryId} style={{ marginBottom: 20 }}>
              <ProductTitle title={category.Category} /> 
              {/* Hiển thị sản phẩm theo CategoryId */}
              <ProductCarousel categoryId={category.CategoryId} />
            </View>
          ))}
        </View>
      </ScrollView>
      <ControlBar />
    </SafeAreaView>
  );
};

export default Home;
