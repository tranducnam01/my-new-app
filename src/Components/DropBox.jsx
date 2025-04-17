import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../../Firebaseconfig';

const DropBox = () => {
  const [myIndex, setMyIndex] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);

  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, 'dropdown'));
        const data = querySnapshot.docs.map((doc) => doc.data());
        setDropdownData(data);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };

    fetchDropdown();
  }, []);

  return (
    <View style={{ marginTop: 20 }}>
      <FlatList
        data={dropdownData}
        renderItem={({ item, index }) => (
          <View>
            <TouchableOpacity
              onPress={() => {
                setMyIndex(index);
                setToggle(myIndex === index ? !toggle : true); // nếu cùng index thì toggle, khác thì mở mới
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomColor: '#E3E3E3',
                borderBottomWidth: 1,
                marginBottom: 10,
                paddingVertical: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
              <AntDesign
                name={myIndex === index && toggle ? 'down' : 'right'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            {myIndex === index && toggle && (
              <Text style={{ fontSize: 14, color: '#444', paddingBottom: 10 }}>
                {item.content}
              </Text>
            )}
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

export default DropBox;
