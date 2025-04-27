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
  const [headphones, setHeadphoneData] = useState([]);
  const [speakers, setSpeakerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const laptopSnap = await getDocs(collection(database, 'laptop'));
        const smartphoneSnap = await getDocs(collection(database, 'smartphone'));
        const headphoneSnap = await getDocs(collection(database, 'headphones'));
        const speakerSnap = await getDocs(collection(database, 'speakers'));

        const laptops = laptopSnap.docs.map(doc => doc.data());
        const phones = smartphoneSnap.docs.map(doc => doc.data());
        const headphoneList = headphoneSnap.docs.map(doc => doc.data());
        const speakerList = speakerSnap.docs.map(doc => doc.data());

        setLaptopData(laptops);
        setSmartphoneData(phones);
        setHeadphoneData(headphoneList);
        setSpeakerData(speakerList);
      } catch (err) {
        console.error('❌ Error loading products:', err);
      }
    };

    fetchData();
  }, []);

  const filterByQuery = (data) =>
    data.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredLaptop = filterByQuery(laptopData);
  const filteredSmartphone = filterByQuery(smartphoneData);
  const filteredHeadphones = filterByQuery(headphones);
  const filteredSpeakers = filterByQuery(speakers);

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
          <Product_title title='Headphones' />
          <ProductCarousel data={filteredHeadphones} />
          <Product_title title='Speakers' />
          <ProductCarousel data={filteredSpeakers} />
        </View>
      </ScrollView>
      <ControlBar />
    </SafeAreaView>
  );
};

export default Home;
