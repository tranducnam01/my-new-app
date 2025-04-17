import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React,{useState} from 'react'
import { Dropdown } from '../Utils/Date';
import AntDesign from '@expo/vector-icons/AntDesign';


const DropBox = () => {
    const [myIndex,setmyIndex] = useState();
    const [toggle, settoggle] =useState(false);
    return (
        <View style={{ marginTop: 20 }}>
            <FlatList data={Dropdown}
                renderItem={({ item, index }) => (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                               setmyIndex(index);
                               settoggle(!toggle);
                            }}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottomColor: "#E3E3E3",
                                borderBottomWidth: 1,
                                marginBottom: 10,
                                paddingVertical: 20,
                            }}>
                            <Text>{item.title}</Text>
                            <AntDesign 
                             name={myIndex == index && toggle?'down':"right"} 
                             size={24} 
                             color="black" />
                        </TouchableOpacity>
                        {myIndex == index && toggle ? <Text>{item.content}</Text> :null  }
                    </View>
                )} />
        </View>
    )
}

export default DropBox