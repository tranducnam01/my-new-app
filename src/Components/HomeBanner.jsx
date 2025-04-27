import React, { useRef, useEffect, useState } from 'react';
import { View, Image, FlatList, Dimensions } from 'react-native';
import { responsiveHeight } from 'react-native-responsive-dimensions';

const bannerImages = [
  
  require("../assets/bannertesst.png"),
  require("../assets/smartphone2.png"),
];

const HomeBanner = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 2000); // chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={bannerImages}
        horizontal
        pagingEnabled
        scrollEnabled={true} // không cho người dùng vuốt tay
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={{
              height: responsiveHeight(13),
              width: Dimensions.get('window').width - 40, // trừ padding ngang
              borderRadius: 10,
              resizeMode: 'cover',
            }}
          />
        )}
      />
    </View>
  );
};

export default HomeBanner;
