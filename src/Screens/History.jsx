import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment'; // 🕓 để định dạng ngày
import { BASE_URL } from '../Utils/config'; // Giả sử BASE_URL được định nghĩa

const History = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!refreshing) setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('⚠️ Không tìm thấy userId');
        setOrders([]);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/orders/processed`, {
        params: { userId },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy đơn hàng:', error.response?.data || error.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrder = ({ item, index }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderTitle}>Đơn hàng #{item.OrderId}</Text>
      <Text style={styles.orderDate}>
        Ngày mua: {moment(item.OrderDate).format('DD/MM/YYYY HH:mm')}
      </Text>
      <Text style={styles.orderStatus}>Trạng thái: {item.Status}</Text>

      {!item.items || item.items.length === 0 ? (
        <Text style={styles.noItemsText}>Không có sản phẩm trong đơn hàng</Text>
      ) : (
        item.items.map((product, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Image
              source={{
                uri:
                  product.img && product.img.startsWith('http')
                    ? product.img
                    : 'https://via.placeholder.com/50',
              }}
              style={styles.image}
              onError={(e) =>
                console.log(`❌ Lỗi tải hình ảnh cho ${product.name}:`, e.nativeEvent.error)
              }
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.itemQty}>Số lượng: {product.quantity}</Text>
              <Text style={styles.itemPrice}>Giá: {product.price} VND</Text>
              <Text style={styles.itemTotal}>Tổng: {product.totalAmount} VND</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Lịch sử mua hàng</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.container}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
        ) : orders.length === 0 ? (
          <Text style={styles.noOrderText}>Bạn chưa có đơn hàng đã xử lý</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.OrderId.toString()}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
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
    color: '#444',
  },
  orderDate: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  orderStatus: {
    color: '#666',
    fontSize: 13,
    marginBottom: 8,
  },
  noItemsText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
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
    resizeMode: 'cover',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemQty: {
    color: 'gray',
    fontSize: 13,
    marginTop: 2,
  },
  itemPrice: {
    color: 'gray',
    fontSize: 13,
    marginTop: 2,
  },
  itemTotal: {
    color: 'gray',
    fontSize: 13,
    marginTop: 2,
  },
});

export default History;
