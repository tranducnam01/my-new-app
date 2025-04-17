import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { authentication, database } from '../../Firebaseconfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const History = ({ navigation }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const currentUser = authentication.currentUser;
      if (!currentUser) return;

      try {
        const q = query(
          collection(database, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        const allOrders = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allOrders.push(data);
        });

        setOrders(allOrders);
      } catch (error) {
        console.error('❌ Lỗi lấy đơn hàng:', error);
      }
    };

    fetchOrders();
  }, []);

  const renderOrder = ({ item, index }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderTitle}>Đơn hàng #{index + 1}</Text>
      {item.items.map((product, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Image source={{ uri: product.img }} style={styles.image} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.itemQty}>Số lượng: {product.quantity}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Lịch sử mua hàng</Text>
        <View style={{ width: 26 }} /> {/* Placeholder cân giữa header */}
      </View>

      <View style={styles.container}>
        {orders.length === 0 ? (
          <Text style={styles.noOrderText}>Bạn chưa có đơn hàng nào</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  noOrderText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  orderContainer: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },
  orderTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemQty: {
    color: 'gray',
    fontSize: 13,
  },
});

export default History;
