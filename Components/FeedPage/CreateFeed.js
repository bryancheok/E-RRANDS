import React, { Component } from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import Dialog from "react-native-dialog";
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

export class CreateFeed extends Component {
    constructor(props){
        super(props);

        this.state = {
            title: '',
            description: '',
            uri: [],
            index: 0,
            visible: false,
        }

        this.field = this.props.route.params.field;
        this.id = firebase.auth().currentUser.uid;
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}} contentContainerStyle={{alignSelf: 'center'}}>

                <View style={styles.sec}>
                    <Text style={styles.heading}>Title</Text>
                    <TextInput style={styles.input} multiline={true} maxLength={100} onChangeText={(input)=>{this.setState({title: input.trim()})}}></TextInput>

                    <Text style={styles.heading}>Description</Text>
                    <TextInput style={styles.input} multiline={true} maxLength={700} onChangeText={(input)=>{this.setState({description: input.trim()})}}></TextInput>

                    <ScrollView
                        horizontal={true}
                        nestedScrollEnabled={true}
                        style={{backgroundColor: 'white', width: width*0.9, height: width*0.3}}
                        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                    >
                        {this.state.uri.map((item,index)=>{
                            return (
                                <View key={index} style={{marginLeft: 5, marginRight: 5}}>
                                    <TouchableOpacity
                                        style={{borderWidth: 1}}
                                        onPress={()=>this.setState({delete: true, index: index})}
                                    >
                                        <Image
                                            key={index}
                                            source={{uri: item ? item:null}}
                                            style={styles.image}
                                            resizeMethod='resize'
                                            resizeMode='cover'  
                                        ></Image>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.addimage}
                        onPress={()=>this.pickImage()}
                    ><Text>Add Image</Text></TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={()=>this.uploadFeed()}
                    ><Text style={{alignSelf: 'center',color: '#ffffff', fontSize: 15}}>Upload</Text></TouchableOpacity>

                    {/* <Icon
                        name='check-circle-outline'
                        style={styles.icon}
                        onPress={()=>this.uploadFeed()}
                    ></Icon> */}
                </View>
                
                <Dialog.Container visible={this.state.visible}>
                    <Dialog.Title>Uploading...</Dialog.Title>
                </Dialog.Container>

                <View>
                    <Dialog.Container visible={this.state.delete}>
                        <Dialog.Title>Delete Image</Dialog.Title>
                        <Dialog.Description>Remove image from feed ?</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({delete: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.deleteImage()} />
                    </Dialog.Container>
                </View>

                <Dialog.Container visible={this.state.visible} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.visible} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
            </ScrollView>
        )
    }

    deleteImage(){
        const arr = this.state.uri
        arr.splice(this.state.index, 1)
        this.setState({uri: arr, delete: false})
    }
    
    checkTitle() {
        if(this.state.title.length < 4 || (!this.state.title.replace(/\s/g, '').length)){
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Title is too short'
            })
            return false
        }
        else if(this.state.title.length > 100){
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Title is too long'
            })
            return false
        }
        else{
            return true
        }
    }

    checkDescription() {
        if(this.state.description.length < 20 || (!this.state.description.replace(/\s/g, '').length)){
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Description is too short'
            })
            return false
        }
        else if(this.state.description.length > 700){
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Description is too long'
            })
            return false
        }
        else {
            return true
        }
    }

    checkImage() {
        if(this.state.uri.length < 1){
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Please select an image for the feed'
            })
            return false
        }
        else {
            return true
        }
    }

    pickImage() {
        if(this.state.uri.length == 10){
            Toast.show({
                type: 'error',
                text1: 'Images Limit',
                text2: 'Only a maximum of 10 images are allowed, press an image to remove them'
            })
        }    
        else {
            ImagePicker.launchImageLibraryAsync({
                mediaType: 'photo',
                height: 400,
                width: 300,
            }).then(async (response)=> { 
                if(response.uri!=null){
                    const arr = this.state.uri
                    arr.push(response.uri)
                    this.setState({uri: arr})
                    console.log(response.uri)
                }
            }) 
        }
    }
    
    uploadFeed = async () => {
        if(this.checkTitle() && this.checkDescription() && this.checkImage()){
            this.setState({visible: true})
            const arr = []
            for(let i = 0; i < this.state.uri.length; i++){
                const name = Math.random().toString(28)
                const result = await fetch(this.state.uri[i])
                const blob = await result.blob()
                firebase.storage().ref('/images/Feed Images/'+name+'.jpg').put(blob).then(()=>{
                    firebase.storage().ref('/images/Feed Images/'+name+'.jpg').getDownloadURL().then((data)=>{
                        arr.push(data)
                    }).then(()=>{
                        if(arr.length == this.state.uri.length){
                            firebase.firestore().collection("feeds").add({
                                title: this.state.title,
                                description: this.state.description,
                                images: arr,
                                datecreated: new Date().getTime(),
                                creatorid: this.id,
                                likedusers: 1,
                                status: "Open",
                                field: this.field,
                                serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                            }).then((result)=>{
                                firebase.database().ref().child("likedfeeds").child(firebase.auth().currentUser.uid).child(result.id).set({
                                    feedid: result.id
                                })
                                this.setState({visible: false})
                                this.props.navigation.goBack()
                            })
                        }
                    })
                })
            }
            firebase.firestore().collection("fieldpreferences").doc(this.field).get().then(doc=>{
                if(doc.exists){
                    firebase.firestore().collection("fieldpreferences").doc(this.field).update({
                        views: firebase.firestore.FieldValue.increment(1)
                    })
                }
                else {
                    firebase.firestore().collection("fieldpreferences").doc(this.field).set({
                        views: 1
                    })
                }
            })
        }
        else {
            console.log("Post fail")
        }
    }
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        width: 50,
        top: 0,
        bottom: 0,
      },
    sec: {
        marginTop: 20,
        padding: 20,
    },
    heading: {
        marginBottom: 5,
        fontSize: 15,
    },
    input: {
        backgroundColor: '#dbdbdb',
        width: width-40,
        alignSelf: 'flex-start',
        padding: 10,
        marginBottom: 10,
    },
    image: {
        height: width*0.2,
        width: width*0.3,
        backgroundColor: '#ededed'
    },
    addimage: {
        alignSelf: 'center',
        backgroundColor: '#bdbdbd',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 5,
        paddingBottom: 5,
        opacity: 0.6,
        marginTop: 20,
    },
    icon: {
        fontSize: 60,
        alignSelf: 'center',
        marginTop: 50,
        marginBottom: 30,
        width: width*0.3,
        height: 40,
        paddingTop: 10,
        backgroundColor: '#43e327',
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 5,
    },
})

export default CreateFeed