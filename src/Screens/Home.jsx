import { View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeIcon from "../Components/HomeIcon";
import HomeSearch from "../Components/HomeSearch";
import HomeBanner from "../Components/HomeBanner";
import Product_title from "../Components/Product_title";
import ProductCarousel from "../Components/ProductCarousel";
import ControlBar from "./controlBar";
import { collection, getDocs } from 'firebase/firestore';
import { database } from "../../Firebaseconfig";

const Home = () => {
  const [laptopData, setLaptopData] = useState([]);
  const [smartphoneData, setSmartphoneData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const laptopSnap = await getDocs(collection(database, 'laptop'));
        const smartphoneSnap = await getDocs(collection(database, 'smartphone'));

        const laptops = laptopSnap.docs.map(doc => doc.data());
        const phones = smartphoneSnap.docs.map(doc => doc.data());

        setLaptopData(laptops);
        setSmartphoneData(phones);
      } catch (err) {
        console.error('❌ Error loading products:', err);
      }
    };

    fetchData();
  }, []);

  const filteredLaptop = laptopData.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSmartphone = smartphoneData.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Product_title title='Laptop' />
          <ProductCarousel data={filteredLaptop} />
          <Product_title title='Smartphone' />
          <ProductCarousel data={filteredSmartphone} />
        </View>
      </ScrollView>
      <ControlBar />
    </SafeAreaView>
  );
};

export default Home;
