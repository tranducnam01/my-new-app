import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { myColor } from "../Utils/MyColor";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const Orderplaced = () => {
  const nav = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      nav.navigate("Home");
    }, 2000);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar backgroundColor="white" />
      <MaterialIcons name="verified" size={90} color={myColor.primary} />
      <Text style={{ fontSize: 20, textAlign: "center" }}>
        Congrats,Your Order Places Successfully!!
      </Text>
    </View>
  );
};

export default Orderplaced;
