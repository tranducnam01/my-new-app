// Upload.js
import { database } from './Firebaseconfig.js'; // Đường đúng tới Firebaseconfig
import { collection, addDoc } from 'firebase/firestore';
import { smartphone, laptop, Dropdown } from './src/Utils/Date.js'; // File chứa dữ liệu

const uploadData = async () => {
  try {
    const smartphoneRef = collection(database, 'smartphone');
    for (const phone of smartphone) {
      await addDoc(smartphoneRef, phone);
    }

    const laptopRef = collection(database, 'laptop');
    for (const item of laptop) {
      await addDoc(laptopRef, item);
    }

    const dropdownRef = collection(database, 'dropdown');
    for (const entry of Dropdown) {
      await addDoc(dropdownRef, entry);
    }

    console.log("✅ Data uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading data: ", error);
  }
};

uploadData();
