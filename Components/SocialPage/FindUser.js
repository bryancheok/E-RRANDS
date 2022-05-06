import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase/compat';
import "firebase/compat/firestore";

const width = Dimensions.get('window').width;

export default class FindUser extends Component {
    constructor(props){
        super(props);

        this.state = {
            input: '',
            foundusers: [],
        }
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>
                <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 20,marginBottom: 10}}>
                    <TextInput style={{width: width*0.5, borderBottomWidth:1, left: 20}} onChangeText={(textinput)=>this.setState({input: textinput})}></TextInput>
                    <Icon name='magnify' style={{fontSize:30, marginLeft: 50}} onPress={()=>{this.findUser(this.state.input)}}></Icon>
                </View>

                {this.getEmpty()}
                
                <ScrollView>
                    {this.state.foundusers.map((item,i)=>{
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={()=>this.viewProfile(item.id)}>
                                <View style={styles.profilesection}>
                                    <Image
                                        source={{uri: item.image}}
                                        style={styles.profileimage}
                                        resizeMethod='resize'
                                        resizeMode='cover'
                                    ></Image>
                                    <View style={styles.userinfo}>
                                        <Text style={{fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Username</Text>
                                        <Text numberOfLines={1} style={styles.infotext}>{item.username}</Text>
                                        <Text style={{fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Email</Text>
                                        <Text numberOfLines={1} style={styles.infotext}>{item.email}</Text>
                                        <Text style={{fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Phone</Text>
                                        <Text numberOfLines={1} style={styles.infotext}>{item.phone}</Text>                 
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
                
            </View>
        )
    }

    viewProfile(user){
        this.props.navigation.navigate("View Profile", {id: user})
    }
    
    findUser(input){
        firebase.firestore().collection("users").where("id","!=",firebase.auth().currentUser.uid).where("username","==",input).get().then((querySnapshot)=>{
            this.setState({foundusers: []})
            const arr = []
            if(!querySnapshot.empty){
                querySnapshot.forEach((documentSnapshot)=>{
                    arr.push(documentSnapshot.data())
                })
            }
            this.setState({foundusers: arr})
        })
    }

    getEmpty(){
        if(this.state.foundusers.length < 1){
            return (
                <View style={{alignSelf: 'center', marginTop: 50}}>
                    <Text>No User Found</Text>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    profilesection: {
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#d4d4d4',
        alignSelf: 'flex-start',
        width: width,
        borderBottomWidth: 0.7,
    },
    profileimage: {
        height: width*0.3,
        width: width*0.3,
        borderRadius: 100,
        backgroundColor: '#e0e0e0'
    },
    userinfo: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
        paddingRight: 40,
        marginLeft: 10,
    },
    infotext: {
        alignSelf: 'flex-start',
        width: width*0.7,
        marginBottom: 10,
        paddingRight: 30,
    },
    side:{
        position: 'absolute',
        right: 0,
    },
})
