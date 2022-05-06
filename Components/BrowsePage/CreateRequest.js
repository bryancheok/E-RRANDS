import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import Dialog from "react-native-dialog";
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

export class CreateRequest extends Component {
    constructor(props){
        super(props);

        this.id = firebase.auth().currentUser.uid;
        this.errandid = this.props.route.params.errandid;
        this.creatorid = this.props.route.params.creatorid;

        this.state = {
            title: '',
            description: '',
            image: '',
            imagepending: false,
            delete: false,
            final: false,
            loading: false,
        }
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}}>

                <View style={styles.section}>
                    <Text style={styles.header}>Title</Text>
                    <TextInput style={styles.textinput} maxLength={100} multiline={true} placeholder='> 15 characters' onChangeText={(input)=>this.setState({title: input.trim()})}></TextInput>
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Description</Text>
                    <TextInput style={styles.textinput} maxLength={500} multiline={true} placeholder='> 20 characters' onChangeText={(input)=>this.setState({description: input.trim()})}></TextInput>
                </View>

                <Text style={{fontSize: 13, marginLeft: 40, marginTop: 10, marginBottom: 3}}>Attachments</Text>

                <TouchableOpacity
                    style={{borderWidth: 0.5, marginLeft: 40, width: 301}}
                    onPress={()=>{
                        if(this.state.image!=''){
                            this.setState({delete:true})
                        }
                    }}
                    >
                    <Image 
                        style={styles.image}
                        source={{uri:this.getImage()}}  
                        resizeMethod='scale'
                        resizeMode='cover'  
                    ></Image>
                </TouchableOpacity> 

                <TouchableOpacity
                    style={{backgroundColor: '#bdbdbd', alignSelf:'center', width: 200, height: 30, paddingTop: 5, marginTop: 10, marginBottom: 20}}
                    onPress={() => this.pickImage()}>
                    <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff'}}>Add Image To Request</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.uploadbtn}
                    onPress={() => this.checkRequest()}>
                    <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff', fontSize: 23, marginTop: 5}}>Create Request</Text>
                </TouchableOpacity>

                <View>
                    <Dialog.Container visible={this.state.imagepending}>
                        <Dialog.Title>No Attached Images</Dialog.Title>
                        <Dialog.Description>No attached images are found, do you wish to proceed with the request upload ? ( An image attachment may raise the chances for getting hired )</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({imagepending: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.uploadRequest()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.delete}>
                        <Dialog.Title>Delete Image</Dialog.Title>
                        <Dialog.Description>Remove image for request ?</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({delete: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.deleteImage()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.final}>
                        <Dialog.Title>Create Request</Dialog.Title>
                        <Dialog.Description>Confirm request upload ? ( Changes to request cannot be made after uploading )</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({final: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.uploadRequestWithImage()} />
                    </Dialog.Container>
                </View>

                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
                
            </ScrollView>
        )
    }

    validateTitle(title) {
        if(title.length < 15 || title.length > 100 || (!title.replace(/\s/g, '').length)) {
            console.log("Invalid errand title")
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Please make sure that the title has 15 - 100 characters'
            })
            return false
        }
        else {
            console.log("Valid Details")
            return true
        }
    }
    validateDescription(desc) {
        if(desc.length < 20 || desc.length > 500 || (!desc.replace(/\s/g, '').length)) {
            console.log("Invalid errand description")
            Toast.show({
                type: 'error',
                text1: 'Invalid Detail',
                text2: 'Please make sure that the description has 20 to 500 characters'
            })
            return false
        }
        else {
            console.log("Valid Details")
            return true
        }
    }

    getImage() {
        if(this.state.image==''){
            return null
        }
        else {
            return this.state.image
        }
    }

    deleteImage() {
        this.setState({image: '', delete: false})
    }

    pickImage() {
        ImagePicker.launchImageLibraryAsync({
            mediaType: 'photo',
            height: 400,
            width: 300,
        }).then(async (response)=> { 
            if(response.uri!=null){
                this.setState({image: response.uri})
            }
            else {
                this.setState({image: ''})
            }
            console.log(response.uri)
        })  
    }

    checkRequest() {
        if(this.validateTitle(this.state.title)){
            if(this.validateDescription(this.state.description)){
                if(this.state.image==''){
                    this.setState({imagepending: true})
                }
                else {
                    this.setState({final: true})
                }
            }
        }
    }

    uploadRequest() {
        this.setState({imagepending: false, loading: true})
        firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
            if(doc.data().status=="Open"){
                firebase.firestore().collection("requests").where("creatorid","==",this.id).where("errandid","==",this.errandid).get().then((data)=>{
                    if(data.empty){
                        firebase.firestore().collection("requests").add({
                            title: this.state.title,
                            description: this.state.description,
                            datecreated: new Date().getTime(),
                            creatorid: this.id,
                            errandid: this.errandid,
                            read: false,
                            serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                        }).then(()=>{
                            firebase.firestore().collection("errands").doc(this.errandid).update({
                                requests: firebase.firestore.FieldValue.increment(1)
                            })
                        }).then(()=>{
                            firebase.database().ref().child("errands").child(this.creatorid).child(this.errandid).set({
                                errandid: this.errandid,
                                request: true,
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                creatorid: this.creatorid,
                                privacy: true,
                                new: true,
                            })
                        }).then(()=>{
                            firebase.database().ref().child("errands").child(firebase.auth().currentUser.uid).child(this.errandid).set({
                                errandid: this.errandid,
                                request: true,
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                creatorid: this.creatorid,
                                privacy: true,
                                new: true,
                            })
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.creatorid).push().key
                            firebase.database().ref().child("notifications").child(this.creatorid).child(key).set({
                                id: key,
                                type: 'errand requested',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            }).then(()=>this.setState({laoding: false}))
                        })
                        this.props.navigation.goBack()
                    }
                    else {
                        Toast.show({
                            type: 'error',
                            text1: 'Errand Already Requested',
                            text2: 'You have already created a request for this errand'
                        })
                    }
                })
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Errand Closed',
                    text2: 'The errand is no longer open for requests'
                })
            }
        })
    }

    async uploadRequestWithImage() {
        this.setState({final: false, loading : true})
        const name = Math.random().toString(28)
        const result = await fetch(this.state.image)
        const blob = await result.blob()
        firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
            if(doc.data().status=="Open"){
                firebase.firestore().collection("requests").where("creatorid","==",this.id).where("errandid","==",this.errandid).get().then((data)=>{
                    if(data.empty){
                        firebase.storage().ref('/images/Request Images/'+name+'.jpg').put(blob).then(()=>{
                            firebase.storage().ref('/images/Request Images/'+name+'.jpg').getDownloadURL().then((data)=>{
                                firebase.firestore().collection("requests").add({
                                    title: this.state.title,
                                    description: this.state.description,
                                    datecreated: new Date().getTime(),
                                    image: data,
                                    creatorid: this.id,
                                    errandid: this.errandid,
                                    read: false,
                                    serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                                }).then(()=>{
                                    firebase.firestore().collection("errands").doc(this.errandid).update({
                                        requests: firebase.firestore.FieldValue.increment(1)
                                    })
                                }).then(()=>{
                                    firebase.database().ref().child("errands").child(this.creatorid).child(this.errandid).set({
                                        errandid: this.errandid,
                                        request: true,
                                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                                        creatorid: this.creatorid,
                                        privacy: true,
                                        new: true,
                                    })
                                }).then(()=>{
                                    firebase.database().ref().child("errands").child(firebase.auth().currentUser.uid).child(this.errandid).set({
                                        errandid: this.errandid,
                                        request: true,
                                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                                        creatorid: this.creatorid,
                                        privacy: true,
                                        new: true,
                                    })
                                }).then(()=>{
                                    const key = firebase.database().ref().child("notifications").child(this.creatorid).push().key
                                    firebase.database().ref().child("notifications").child(this.creatorid).child(key).set({
                                        id: key,
                                        type: 'errand requested',
                                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                                        errandid: this.errandid,
                                        date: new Date().getTime(),
                                        new: true,
                                    }).then(()=>this.setState({laoding: false}))
                                })
                                this.props.navigation.goBack()
                            })
                        })
                    }
                    else {
                        Toast.show({
                            type: 'error',
                            text1: 'Errand Already Requested',
                            text2: 'You have already created a request for this errand'
                        })
                    }
                })
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Errand Closed',
                    text2: 'The errand is no longer open for requests'
                })
            }
        })
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
    section: {
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginLeft: 20,
        marginBottom: 5,
        width: 350,
    },
    header: {
        fontSize: 13,
        marginBottom: 3,
    },
    textinput: {
        fontSize: 15,
        alignSelf: 'flex-start',
        padding: 5,
        width: 300,
        backgroundColor: '#d6d6d6',
    },
    image: {
        width: 300,
        height: 300,
        backgroundColor: '#e0e0e0',
    },
    uploadbtn: {
        backgroundColor: '#43e327', 
        alignSelf:'center', 
        width: 200, 
        height: 50, 
        paddingTop: 3, 
        marginTop: 10, 
        marginBottom: 30, 
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

export default CreateRequest