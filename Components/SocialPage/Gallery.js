import React, { Component } from 'react'
import { View, Text, ScrollView, StyleSheet, Dimensions, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Dialog from "react-native-dialog";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

export class Gallery extends Component {
    constructor(props){
        super(props);

        this.state = {
            images: [],
            name: '',
            loading: false,
            delete: false,
            selected: '',
            refresh: false,
        }
    }
    
    componentDidMount() {
        this.readGallery()
    }

    readGallery(){
        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(doc => {
            this.setState({name: doc.data().username})
            if(doc.data().gallery){
                this.setState({
                    images: doc.data().gallery.reverse(),
                }, () => console.log(this.state.images))
            }
        })
        this.setState({refresh: false})
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}}
                refreshControl={
                    <RefreshControl
                    refreshing={this.state.refresh}
                    onRefresh={()=>this.setState({refresh: true}, ()=>this.readGallery())}
                    />
                }>
                <View>
                    <Text style={styles.title}>{this.state.name}'s Gallery</Text>
                    <View style={{marginBottom: 50}}>
                        {this.state.images.map((item,i)=>{
                            return ( 
                                    <View key={i}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({delete: true, selected: item})}
                                        ><Image 
                                            style={styles.image}
                                            source={{uri: item}}
                                            resizeMethod='resize'  
                                            resizeMode='contain'  
                                            ></Image> 
                                        </TouchableOpacity>
                                    </View>
                                    )
                        })}

                        <View>
                            <Dialog.Container visible={this.state.delete}>
                                <Dialog.Title>Remove image from gallery</Dialog.Title>
                                <Dialog.Description>Confirm image removal ?</Dialog.Description>
                                <Dialog.Button label="Cancel" onPress={() => this.setState({delete: false})} />
                                <Dialog.Button label="Ok" onPress={() => this.deleteImage(this.state.selected)} />
                            </Dialog.Container>
                        </View>
                        <TouchableOpacity
                            style={{backgroundColor: '#bdbdbd', alignSelf:'center', width: width*0.5, height: width*0.08, paddingTop: 5, marginTop: 20}}
                            onPress={() => this.uploadImages()}>
                            <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff'}}>Add Image To Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 

            </ScrollView>
        )
    }

    deleteImage(url) {
        this.setState({delete: false})
        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            gallery: firebase.firestore.FieldValue.arrayRemove(url)
        }).then(()=>{
            firebase.storage().ref('/images/User Images/User Gallery/'+firebase.auth().currentUser.uid+'/'+firebase.storage().refFromURL(url).name).delete()
        }).then(()=>{
            this.readGallery()
        })
    }
    
    uploadImages = async () => {
        if(this.state.images.length < 10){
            const path = firebase.storage().ref('/images/User Images/User Gallery/'+firebase.auth().currentUser.uid+'/');
            ImagePicker.launchImageLibraryAsync({
                mediaType: 'photo',
                height: 400,
                width: 400,
            }).then(async (response)=> { 
                const result = await fetch(response.uri)
                console.log(response.uri)
                const blob = await result.blob()
                this.setState({loading: true})
                const name = Math.random().toString(28)
                path.child(name+'.jpg').put(blob).then(()=>{
                    firebase.storage().ref('/images/User Images/User Gallery/'+firebase.auth().currentUser.uid+'/'+name+'.jpg').getDownloadURL().then((result)=>{
                        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                            gallery: firebase.firestore.FieldValue.arrayUnion(result)
                        }).then(()=>{this.setState({loading: false})})
                    }).then(()=>{
                        this.readGallery()
                    })
                })
            })
        }   
        else {
            Toast.show({
                type: 'error',
                text1: 'Images Limit',
                text2: 'Maximum of 10 images allowed in gallery, press on an image to remove them'
            })
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
    title: {
        width: width,
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontSize: 30,
        marginBottom: 20,
        marginTop: 10,
        fontWeight: 'bold',
    },
    image: {
        height:400,
        width:300,
        alignSelf: 'center', 
        marginTop: 10,
    },
})

export default Gallery