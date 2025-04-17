import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { authentication, database } from '../../Firebaseconfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ControlBar from './controlBar';
import { myColor } from "../Utils/MyColor";
import { useNavigation } from "@react-navigation/native";

const User = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  });

  const [purchasedItems, setPurchasedItems] = useState([]);
 const nav = useNavigation();
  useEffect(() => {
    const fetchUserInfo = async () => {
      const currentUser = authentication.currentUser;

      if (currentUser) {
        try {
          const docRef = doc(database, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserInfo({
              name: data.username || '',
              email: data.email || currentUser.email,
              avatar: data.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
            });
          }
        } catch (error) {
          console.error('Lỗi lấy user info:', error);
        }
      }
    };

    const fetchOrders = async () => {
      const currentUser = authentication.currentUser;
      if (!currentUser) return;

      try {
        const q = query(
          collection(database, "orders"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.items.forEach(item => items.push(item));
        });

        setPurchasedItems(items);
      } catch (error) {
        console.log("❌ Lỗi lấy đơn hàng:", error);
      }
    };

    fetchUserInfo();
    fetchOrders();
  }, []);

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
          {purchasedItems.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: '#999' }}>Bạn chưa mua sản phẩm nào</Text>
          ) : (
            purchasedItems.slice(0, 5).map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                <Image
                  source={{ uri: item.img }}
                  style={{ width: 60, height: 60, borderRadius: 10, marginRight: 10 }}
                />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                  <Text style={{ color: 'gray' }}>Số lượng: {item.quantity}</Text>
                </View>
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