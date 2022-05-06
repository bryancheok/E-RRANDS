import React, { Component } from 'react'
import { View, Text, RefreshControl, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog from "react-native-dialog";
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class RequestDetail extends Component {
    constructor(props){
        super(props);

        this.requestid = this.props.route.params.requestid;

        this.state = {
            id: '',
            creatorid: '',
            title: '',
            description: '',
            datecreated: '',
            errandid: '',
            image: '',
            profileimage: '',
            username: '',
            permission: false,
            accept: false,
            loading: false,
            refresh: false,
            showimg: false,
        }
    }

    componentDidMount() {
        firebase.firestore().collection("requests").doc(this.requestid).update({
            read: true,
        })
        this.readRequestDetail()
    }

    differenceInDays(a, b) {
        const diff = Math.floor(
            (a- b) / (1000 * 60 * 60 * 24)
        )
        if(diff < 1){
            return 'recently'
        }
        else {
            return diff + ' days ago'
        }
    }

    readRequestDetail(){
        firebase.firestore().collection("requests").doc(this.requestid).get().then((data)=>{
            firebase.firestore().collection("users").doc(data.data().creatorid).get().then(doc=>{
                this.setState({
                    id: data.id,
                    creatorid: data.data().creatorid,
                    title: data.data().title,
                    description: data.data().description,
                    errandid: data.data().errandid,
                    datecreated: data.data().datecreated,
                    profileimage: doc.data().image,
                    username: doc.data().username,
                })
                if(data.data().image!=null){
                    this.setState({image: data.data().image})
                }
                else {
                    this.setState({image: ''})
                }
            }).then(()=>{
                firebase.firestore().collection("errands").doc(this.state.errandid).get().then((data)=>{
                    if(data.data().hiredid==null){
                        this.setState({permission: true})
                    }
                    else {
                        this.setState({permission: false})
                    }
                })
            })
        })
        this.setState({refresh: false})
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width, alignSelf: 'center'}}>
                <ScrollView style={{flex:1, minWidth: width, marginBottom: 20}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readRequestDetail())}
                        />
                    }>

                    <View style={{padding: 10}}>
                        <Text style={styles.date}>Posted {this.differenceInDays(new Date().getTime(),this.state.datecreated)}</Text>
                        <Text style={styles.header}>Title</Text>
                        <Text style={styles.title}>{this.state.title}</Text>
                        <Text style={styles.header}>Description</Text>
                        <Text style={styles.description}>{this.state.description}</Text>
                        <Text style={styles.header}>Attachment</Text>
                        {this.getRequestImage()}
                    </View>
                        
                    <View>
                        <Dialog.Container visible={this.state.accept}>
                            <Dialog.Title>Accept Request</Dialog.Title>
                            <Dialog.Description>Accept this user's request ? ( You can Add and Chat with the user via their profile to better communicate )</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({accept: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.acceptRequest()} />
                        </Dialog.Container>
                    </View>
                
                    <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
                </ScrollView>

                {this.acceptBtn()}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.showimg}
                    onRequestClose={() => {
                        this.setState({modalVisible: false});
                    }}
                    ><TouchableOpacity
                        onPressIn={()=> this.setState({showimg: false})}
                    >
                        <View style={{height: height, width: width, backgroundColor: 'black'}}>
                            <Image
                                source={{uri: this.state.image}}
                                style={{height: height-50, width: width-10, alignSelf: 'center',marginTop: 10}}
                                resizeMethod='scale'
                                resizeMode='contain'
                            ></Image>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }

    getRequestImage() {
        if(this.state.image!=''){
            return (
                <TouchableOpacity
                    onPress={()=>this.setState({showimg: true})}
                >
                    <Image
                        source={{uri: this.getImage()}}
                        style={styles.image}
                        resizeMethod='scale'
                        resizeMode='cover'
                    ></Image>
                </TouchableOpacity>
            )
        }
        else {
            return (
                <Text style={styles.noimage}>No Attachments</Text>
            )
        }
    }

    acceptBtn() {
        if(this.state.permission==true){
            return (
                <View style={styles.btn}>
                    <View style={styles.btncover}>
                        <TouchableOpacity
                            onPress={()=>{
                                firebase.firestore().collection("errands").doc(this.state.errandid).get().then((data)=>{
                                    if(data.data().hiredid==null){
                                        this.setState({permission: true, accept: true})
                                    }
                                    else {
                                        this.setState({permission: false})
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Accept Failure',
                                            text1: 'A user is already hired for this errand'
                                        })
                                    }
                                })
                            }}
                        ><Text style={styles.btntextaction}>Accept</Text></TouchableOpacity>
                        <Icon
                            style={{fontSize: 25, padding: 5}}
                            name='check-outline'
                        ></Icon>
                    </View>
                </View>
            )
        }
        else {
            return (
                <View style={styles.btn}>
                    <Text style={styles.btntext}>Closed</Text>
                    <Icon
                        style={styles.actionicon}
                        name='briefcase-minus'
                    ></Icon>
                </View>
            )
        }
    }

    getImage(){
        if(this.state.image==''){
            return null
        }
        else {
            return this.state.image
        }
    }
    
    acceptRequest() {
        firebase.firestore().collection("errands").doc(this.state.errandid).get().then((data)=>{
            if(data.data().hiredid==null){
                this.setState({permission: true})
            }
            else {
                this.setState({permission: false})
            }
        }).then(()=>{
            if(this.state.permission){
                this.setState({accept: false, loading: true})
                firebase.firestore().collection("errands").doc(this.state.errandid).update({
                    status: "In Progress",
                    hiredid: this.state.creatorid,
                    hiredate: new Date().getTime(),
                }).then(()=>{
                    this.setState({loading: false})
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.creatorid).child(this.state.errandid).set({
                        errandid: this.state.errandid,
                        status: 'in progress',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        hiredid: this.state.creatorid,
                        privacy: true,
                        new: true,
                    }).then(()=>{
                        const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                        firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                            id: key,
                            type: 'request accepted',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            errandid: this.state.errandid,
                            date: new Date().getTime(),
                            new: true,
                        })
                    })
                }).then(()=>{
                    firebase.database().ref().child("errands").child(firebase.auth().currentUser.uid).child(this.state.errandid).set({
                        errandid: this.state.errandid,
                        status: 'in progress',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        hiredid: this.state.creatorid,
                        privacy: true,
                        new: true,
                    })
                })
                this.props.navigation.goBack()
            }
            else {
                this.setState({accept: false})
                Toast.show({
                    type: 'error',
                    text1: 'Accept Failure',
                    text1: 'A user is already hired for this errand'
                })
            }
        })
    }
}

const styles = StyleSheet.create({
    header: {
        fontSize: 15,
        width: width*0.95,
        marginBottom: 3,
        textDecorationLine: 'underline',
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
        width: width*0.95,
    },
    description: {
        fontSize: 25,
        marginBottom: 10,
        width: width*0.95,
    },
    date: {
        fontSize: 13,
        marginBottom: 5,
    },
    image: {
        height: width*0.95,
        width: width*0.95,
        backgroundColor: '#e0e0e0',
        marginBottom: 40,
    },
    noimage: {
        fontSize: 15,
        alignSelf: 'flex-start',
        padding: 5,
        width: width*0.95,
        backgroundColor: '#e0e0e0',
        marginBottom: 40,
    },
    btn: {
        height: 60,
        width: width,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#d1d1d1',
        paddingTop: 5,
        paddingBottom: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    btncover: {
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#ff843d',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btntextaction: {
        fontSize: 20,
    },
    btntext: {
        fontSize: 20,
        color: '#e6e6e6'
    },
    actionicon: {
        fontSize: 25,
        marginLeft: 10,
        color: '#e6e6e6'
    },
})

export default RequestDetail