import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ControlBar from './controlBar';
import { myColor } from "../Utils/MyColor";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../Utils/config';

const User = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  });

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log("userId:", userId);
        if (!userId) return;

        const response = await axios.get(`${BASE_URL}/api/user-info`, {
          params: { userId },
        });

        if (response.data.success) {
          const fetchedUser = response.data.user;
          setUser(fetchedUser);
          setUserInfo({
            name: fetchedUser.name,
            email: fetchedUser.email,
            phone: fetchedUser.phone,
            avatar: fetchedUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
          });
          console.log("1 Thông tin người dùng:", fetchedUser);
        } else {
          console.warn("❗ Không tìm thấy người dùng");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin người dùng:", err);
      }
    };

    const fetchPurchasedProducts = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('🔄 Fetching products for user:', userId);

        const response = await axios.get(`${BASE_URL}/api/user-purchased-products`, {
          params: { userId }
        });

        console.log('📦 Full response:', response.data);

        if (response.data && response.data.success) {
          const products = response.data.products;

          const normalizedProducts = Array.isArray(products) ? products : [products];
          console.log('✅ Normalized products:', normalizedProducts);

          setPurchasedItems(normalizedProducts);
        } else {
          console.warn('⚠️ No products or success false');
          setPurchasedItems([]);
        }
      } catch (err) {
        console.error('❌ Fetch error:', {
          message: err.message,
          response: err.response?.data
        });
        setPurchasedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedProducts();
    fetchUserInfo();
  }, []);

  // Hàm xử lý hủy đơn hàng
const handleCancelOrderItem = async (orderItemId) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ Không tìm thấy userId');
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }

    console.log('📤 Gửi yêu cầu hủy:', { userId, orderItemId });

    const response = await axios.delete(`${BASE_URL}/api/orderitems/delete`, {
      data: { userId, orderItemId },
    });

    console.log('📥 Phản hồi từ API:', response.data);

    if (response.data.success) {
      setPurchasedItems(purchasedItems.filter(item => item.OrderItemId !== orderItemId));
      Alert.alert('Thành công', 'Đã hủy sản phẩm khỏi đơn hàng');
      console.log('✅ Đã hủy sản phẩm:', orderItemId);
    } else {
      Alert.alert('Lỗi', response.data.error || 'Không thể hủy sản phẩm');
    }
  } catch (err) {
    console.error('❌ Lỗi khi hủy sản phẩm:', err.response?.data || err.message);
    Alert.alert('Lỗi', err.response?.data?.error || 'Đã xảy ra lỗi khi hủy sản phẩm');
  }
};

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.header}>
          <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{userInfo.name}</Text>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileText}>Chuyển trang cá nhân</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng của tôi</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('History')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Xem tất cả đơn hàng</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tên người dùng</Text>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã mua</Text>
          {loading ? (
            <Text style={{ fontStyle: 'italic', color: '#999' }}>Đang tải...</Text>
          ) : purchasedItems.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: '#999' }}>Bạn chưa mua sản phẩm nào</Text>
          ) : (
            purchasedItems.map((item, index) => (
              <View key={index} style={styles.purchasedItem}>
                <Image
                  source={{ uri: item.Img && item.Img.startsWith('http') ? item.Img : 'https://via.placeholder.com/60' }}
                  style={styles.purchasedImage}
                  onError={(e) => console.log(`❌ Lỗi tải hình ảnh cho ${item.Name}:`, e.nativeEvent.error)}
                />
                <View style={styles.purchasedInfo}>
                  <Text style={styles.purchasedName}>{item.Name}</Text>
                  <Text style={styles.purchasedDetail}>Số lượng: {item.Quantity}</Text>
                  <Text style={styles.purchasedDetail}>Giá: {item.Price} VND</Text>
                  <Text style={styles.purchasedDetail}>Trạng thái: {item.Status}</Text>
                  <Text style={styles.purchasedDetail}>Ngày tháng: {item.OrderDate}</Text>
                </View>
                {item.Status !== 'Processed' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      Alert.alert(
                        'Xác nhận hủy',
                        `Bạn có chắc muốn hủy sản phẩm ${item.Name}?`,
                        [
                          { text: 'Hủy', style: 'cancel' },
                          { text: 'Xác nhận', onPress: () => handleCancelOrderItem(item.OrderItemId) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.controlBarWrapper}>
        <ControlBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  editProfileBtn: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#333',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  infoItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginTop: 3,
  },
  purchasedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  purchasedImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    resizeMode: 'cover',
  },
  purchasedInfo: {
    flex: 1,
  },
  purchasedName: {
    fontSize: 16,
    fontWeight: '500',
  },
  purchasedDetail: {
    color: 'gray',
    fontSize: 14,
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: myColor.primary,
    marginTop: 30,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
});

export default User;