import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import Dialog from "react-native-dialog";
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class CreateReview extends Component {
    constructor(props){
        super(props);

        this.id = firebase.auth().currentUser.uid;
        this.errandid = this.props.route.params.errandid;
        this.creatorid = this.props.route.params.creatorid;
        this.hiredid = this.props.route.params.hiredid;

        this.state = {
            review: '',
            star: 1,
            loading: false,
        }
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center', padding: 10 }}>
                <View style={{flexDirection: 'row', marginTop: 50}}>
                    {this.getStars(1)}
                    {this.getStars(2)}
                    {this.getStars(3)}
                    {this.getStars(4)}
                    {this.getStars(5)}
                </View>
                <Text style={{marginTop: 50}}>Your Experience: </Text>
                <TextInput maxLength={300} placeholder='Review' textAlignVertical='top' multiline={true} style={{padding: 5, height: height*0.3, width: width*0.95, backgroundColor: 'white', borderWidth: 0.7, borderRadius: 5}} onChangeText={(input)=>this.setState({review: input.trim()})}></TextInput>

                <TouchableOpacity
                    style={{flexDirection: 'row', alignSelf: 'center', marginTop: 50, backgroundColor: '#3e85f0', borderRadius: 10, width: 100, alignItems: 'center', padding: 10}}
                    onPress={()=>this.validateDescription(this.state.review.trim())}
                >
                    <Text>Confirm</Text>
                    <Icon
                        name='checkbox-marked-circle-outline'
                        style={{fontSize: 30, alignSelf: 'flex-end'}}
                    ></Icon>
                </TouchableOpacity>
                
                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
            </ScrollView>
        );
    }

    validateDescription(desc) {
        if(desc.length > 300 || (!desc.replace(/\s/g, '').length)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Review',
                text2: 'Please make sure that the review is appropriate'
            })
        }
        else {
            this.uploadReview()
        }
    }

    uploadReview() {
        firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
            if(doc.data().hiredid==firebase.auth().currentUser.uid){
                if(doc.data().hiredreview!=null){
                    Toast.show({
                        type: 'error',
                        text1: 'Reviewed',
                        text2: 'This errand has already been reviewed'
                    })
                }
                else {
                    this.setState({loading: true})
                    firebase.firestore().collection("reviews").add({
                        type: 'fromhired',
                        creatorid: firebase.auth().currentUser.uid,
                        errandid: this.errandid,
                        reviewedid: this.creatorid,
                        star: this.state.star,
                        review: this.state.review.trim(),
                        time: new Date().getTime(),
                        serverdate: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(()=>{
                        firebase.firestore().collection("errands").doc(this.errandid).update({
                            hiredreview: firebase.auth().currentUser.uid
                        })
                        firebase.firestore().collection("users").doc(this.creatorid).update({
                            reviews: firebase.firestore.FieldValue.increment(1),
                            rating: firebase.firestore.FieldValue.increment(this.state.star)
                        }).then(()=>{
                            this.setState({loading: false})
                            this.props.navigation.goBack()
                        })
                    })
                }
            }
            if(doc.data().creatorid==firebase.auth().currentUser.uid){
                if(doc.data().creatorreview!=null){
                    Toast.show({
                        type: 'error',
                        text1: 'Reviewed',
                        text2: 'This errand has already been reviewed'
                    })
                }
                else {
                    this.setState({loading: true})
                    firebase.firestore().collection("reviews").add({
                        type: 'fromcreator',
                        creatorid: firebase.auth().currentUser.uid,
                        errandid: this.errandid,
                        reviewedid: this.hiredid,
                        star: this.state.star,
                        review: this.state.review.trim(),
                        time: new Date().getTime(),
                        serverdate: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(()=>{
                        firebase.firestore().collection("errands").doc(this.errandid).update({
                            creatorreview: firebase.auth().currentUser.uid
                        })
                        firebase.firestore().collection("users").doc(this.hiredid).update({
                            reviews: firebase.firestore.FieldValue.increment(1),
                            rating: firebase.firestore.FieldValue.increment(this.state.star),
                        }).then(()=>{
                            this.setState({loading: false})
                            this.props.navigation.goBack()
                        })
                    })
                }
            }
        })
    }

    getStars(i) {
        return (
            <TouchableOpacity
                style={{alignItems: 'center', flex:1}}
                onPress={()=>this.setState({star: i})}
            >
                 <Icon
                    name={this.starType(i)}
                    style={{fontSize: 40, color: this.starColor(i)}}
                ></Icon>
            </TouchableOpacity>
        )
    }

    starColor(i) {
        if(this.state.star >= i){
            return '#ffe23d'
        }
        else {
            return '#ff9238'
        }
    }

    starType(i) {
        if(this.state.star >= i){
            return 'star'
        }
        else {
            return 'star-outline'
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
})

export default CreateReview;