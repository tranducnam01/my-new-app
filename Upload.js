import { database } from './Firebaseconfig.js';
import { collection, addDoc } from 'firebase/firestore';
import { smartphone, laptop, Dropdown, headphones, speakers } from './src/Utils/Date.js';

// Hàm thêm id cho từng sản phẩm
const addIdToItems = (items) => {
  return items.map((item, index) => ({
    ...item,
    id: item.name?.replace(/\s+/g, "_").toLowerCase() + "_" + index, // Ví dụ: iphone_5_0
  }));
};

const uploadData = async () => {
  try {
    const smartphoneRef = collection(database, 'smartphone');
    for (const phone of addIdToItems(smartphone)) {
      await addDoc(smartphoneRef, phone);
    }

    const laptopRef = collection(database, 'laptop');
    for (const item of addIdToItems(laptop)) {
      await addDoc(laptopRef, item);
    }

    const dropdownRef = collection(database, 'dropdown');
    for (const entry of addIdToItems(Dropdown)) {
      await addDoc(dropdownRef, entry);
    }

    const headphonesRef = collection(database, 'headphones');
    for (const headphone of addIdToItems(headphones)) {
      await addDoc(headphonesRef, headphone);
    }

    const speakersRef = collection(database, 'speakers');
    for (const speaker of addIdToItems(speakers)) {
      await addDoc(speakersRef, speaker);
    }

    console.log("✅ Data uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading data: ", error);
  }
};

uploadData();
