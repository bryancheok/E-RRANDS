import React, { Component } from 'react'
import { View, Text, FlatList, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class Chat extends Component {
    constructor(props){
        super(props);

        this.id = this.props.route.params.id;
        this.userid = firebase.auth().currentUser.uid;
        
        this.state = {
            fromname: '',
            toname: '',
            fromimg: '',
            toimg: '',
            input: '',
            messages: [],
            permission: false,
            chatpath: null,
            modalVisible: false,
            pickedattachment: '',
            chattingusers: []
        }     
    }

    componentDidMount(){
        firebase.database().ref().child("relatedusers").child(this.userid).child("pending").child(this.id).on('value',snapshot=>{
            if(snapshot.exists()){
                this.setState({permission: true})
            }
            else {
                firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(this.userid).on('value',snapshot=>{
                    if(snapshot.exists()){
                        this.setState({permission: true})
                    }
                    else {
                        firebase.database().ref().child("relatedusers").child(this.id).child("added").child(this.userid).on('value',snapshot=>{
                            if(snapshot.exists()){
                                this.setState({permission: true})
                            }
                            else {
                                this.setState({permission: false})
                            }
                        })
                    }
                })
            }
        })

        const chatp = [this.userid,this.id]
        const chatpath = chatp.sort((a,b)=>this.sortAlphaNum(a,b)).join("_")
        this.setState({chatpath: chatpath, chattingusers: chatp.sort((a,b)=>this.sortAlphaNum(a,b))})

        firebase.database().ref().child("chatmessages").child(chatpath).on('value',snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val())
                })
                const rev = arr.reverse()
                this.setState({messages: rev},()=>console.log("chat path ", chatpath))
            }
            else {
                this.setState({messages: arr},()=>console.log("chat path ", chatpath))
            }
        })

        firebase.firestore().collection("users").doc(this.id).get().then((data)=>{
            this.setState({
                toname: data.data().username,
                toimg: data.data().image
            },()=>{this.props.navigation.setParams({header: this.state.toname})})
        })
        firebase.firestore().collection("users").doc(this.userid).get().then((data)=>{
            this.setState({
                fromname: data.data().username,
                fromimg: data.data().image
            })
        })
    }

    sortAlphaNum(a, b) {
        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;
        var aA = a.replace(reA, "");
        var bA = b.replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a.replace(reN, ""), 10);
          var bN = parseInt(b.replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
    }

    differenceInDays(a, b) {
        const diff = Math.floor(
            (a- b) / (1000 * 60 * 60 * 24)
        )
        if(diff < 1){
            return 'Recently'
        }
        else {
            return diff + ' days ago'
        }
    }

    componentWillUnmount() {
        firebase.database().ref().child("relatedusers").child(this.userid).child("pending").child(this.id).off('value')
        firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(this.userid).off('value')
        firebase.database().ref().child("relatedusers").child(this.id).child("added").child(this.userid).off('value')
        firebase.database().ref().child("chatmessages").child(this.state.chatpath).off('value')
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>
                
                <FlatList
                    style={{marginBottom: 50}}
                    data={this.state.messages}
                    inverted={true}
                    renderItem={({item,index})=>
                        this.getType(item,index)
                    }
                    keyExtractor={(item, index) => index.toString()}
                ></FlatList>

                <View style={styles.chatbar}>
                    <TextInput style={styles.input} maxLength={100} placeholder='Message' multiline={false} ref={input => { this.textInput = input }} onChangeText={(input)=>this.setState({input: input.trim()})}></TextInput>
                    <Icon
                        name='paperclip'
                        style={styles.icon}
                        onPress={()=>this.sendAttachment()}
                    ></Icon>
                    <Icon
                        name='send'
                        style={styles.icon2}
                        onPress={()=>this.sendMessage()}
                    ></Icon>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({modalVisible: false});
                    }}
                    ><TouchableOpacity
                        onPressIn={()=>this.setState({modalVisible: false})}                    
                    >
                        <View style={{height: height, width: width, backgroundColor: 'black'}}>
                            <Image
                                source={{uri: this.state.pickedattachment}}
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

    getType(item,i) {
        if(item.attachment==null){
            if(item.creatorid==this.userid){
                return(
                    <View key={i} style={styles.commentto}>   
                        <View>
                            <Text multiline={true} style={styles.messageto}>{item.message}</Text>
                            <Text style={styles.commentdateto}>{this.differenceInDays(new Date().getTime(),item.time)}</Text>
                        </View>
                    </View>
                )
            }
            else if(item.creatorid==this.id){
                return(
                    <View key={i} style={styles.comment}>   
                        <View>
                            <Text multiline={true} style={styles.message}>{item.message}</Text>
                            <Text style={styles.commentdate}>{this.differenceInDays(new Date().getTime(),item.time)}</Text>
                        </View>
                    </View>
                )
            }
            
        }
        else {
            if(item.creatorid==this.userid){
                return(
                    <View key={i} style={styles.commentto}>   
                        <View>
                            <TouchableOpacity
                                onPress={()=>this.showImage(item.attachment)}
                                ><Image
                                source={{uri: item.attachment}}
                                style={styles.attachmentto}
                                resizeMethod='scale'
                                resizeMode='cover'
                                ></Image>
                            </TouchableOpacity>
                            <Text style={styles.commentdateto}>{this.differenceInDays(new Date().getTime(),item.time)}</Text>
                        </View>
                    </View>
                )
            }
            else if(item.creatorid==this.id){
                return(
                    <View key={i} style={styles.comment}>   
                        <View>
                            <TouchableOpacity
                                onPress={()=>this.showImage(item.attachment)}
                                ><Image
                                    source={{uri: item.attachment}}
                                    style={styles.attachment}
                                    resizeMethod='scale'
                                    resizeMode='cover'
                                ></Image>
                            </TouchableOpacity>
                            <Text style={styles.commentdate}>{this.differenceInDays(new Date().getTime(),item.time)}</Text>
                        </View>
                    </View>
                )
            }
        }
    }

    showImage(attachment) {
        console.log('show image')
        this.setState({modalVisible: true,pickedattachment: attachment})
    }

    sendMessage() {
        if((!this.state.input.replace(/\s/g, '').length)){
            
        }
        else {
            if(this.state.permission){
                const message = this.state.input.toString()
                console.log(this.state.input.toString())

                if(this.state.chatpath){
                    const pushkey = firebase.database().ref().child("chatmessages").child(this.state.chatpath).push().key
                    firebase.database().ref().child("chatmessages").child(this.state.chatpath).child(pushkey).set({
                        creatorid: this.userid,
                        message: message,
                        time: new Date().getTime(),
                        id: pushkey,
                        servertime: firebase.database.ServerValue.TIMESTAMP,
                    }).then(()=>{
                        firebase.database().ref().child("chats").child(this.userid).child(this.state.chatpath).set({
                            user1: this.state.chattingusers[0],
                             user2: this.state.chattingusers[1],
                            chatpath: this.state.chatpath,
                            lastchatserver: firebase.database.ServerValue.TIMESTAMP,
                            lastchat: new Date().getTime(),
                        })
                    }).then(()=>{
                        firebase.database().ref().child("chats").child(this.id).child(this.state.chatpath).set({
                            user1: this.state.chattingusers[0],
                            user2: this.state.chattingusers[1],
                            chatpath: this.state.chatpath,
                            lastchatserver: firebase.database.ServerValue.TIMESTAMP,
                            lastchat: new Date().getTime(),
                        })
                    }).then(()=>{
                        this.textInput.clear()
                        this.setState({input: ''})
                    })
                }
            }
            else{
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'You do not have permission to send messages to this user'
                })
            }
        }
    }

    sendAttachment() {
        if(this.state.permission){
            ImagePicker.launchImageLibraryAsync({
                mediaType: 'photo',
                height: 400,
                width: 400,
                quality: 0.6,
            }).then(async (response)=> { 
                if(response.uri!=null){
                    const result = await fetch(response.uri)
                    console.log(response.uri)
                    const blob = await result.blob()
                    this.setState({loading: true})
                    const name = Math.random().toString(28)
                    const path = firebase.storage().ref('/images/Chat Images/'+ this.state.chatpath)
                    path.child(name+'.jpg').put(blob).then(()=>{
                        firebase.storage().ref('/images/Chat Images/'+ this.state.chatpath +'/'+name+'.jpg').getDownloadURL().then((result)=>{
                            const pushkey = firebase.database().ref().child("chatmessages").child(this.state.chatpath).push().key
                            firebase.database().ref().child("chatmessages").child(this.state.chatpath).child(pushkey).set({
                                creatorid: this.userid,
                                attachment: result,
                                time: new Date().getTime(),
                                id: pushkey,
                                servertime: firebase.database.ServerValue.TIMESTAMP,
                            }).then(()=>{
                                firebase.database().ref().child("chats").child(this.userid).child(this.state.chatpath).set({
                                    user1: this.state.chattingusers[0],
                                    user2: this.state.chattingusers[1],
                                    chatpath: this.state.chatpath,
                                    lastchatserver: firebase.database.ServerValue.TIMESTAMP,
                                    lastchat: new Date().getTime(),
                                })
                            }).then(()=>{
                                firebase.database().ref().child("chats").child(this.id).child(this.state.chatpath).set({
                                    user1: this.state.chattingusers[0],
                                    user2: this.state.chattingusers[1],
                                    chatpath: this.state.chatpath,
                                    lastchatserver: firebase.database.ServerValue.TIMESTAMP,
                                    lastchat: new Date().getTime(),
                                })
                            })
                        })
                    })
                }
            })
        }
        else{
            Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'You do not have permission to send messages to this user'
            })
        } 
    }
}

const styles = StyleSheet.create({
    comment: {
        justifyContent: 'flex-start',
        marginBottom: 10,
        alignSelf: 'flex-start',
        width: width,
        flexDirection: 'row',
        padding: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    profilename:{
        fontSize: 13,
        paddingLeft: 5,
        width: width*0.4,
    },
    message: {
        borderRadius: 10,
        padding: 15,
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff',
        marginTop: 5,   
        marginLeft: 5,
    },
    attachment: {
        borderRadius: 10,
        height: width*0.7,
        width: width*0.7,
        marginTop: 5,
        marginLeft: 5,
        backgroundColor: '#e0e0e0',
    },
    profileimage: {
        borderRadius: 10,
        height: 60,
        width: 60,
        marginTop: 5,
    },
    commentdate: {
        fontSize: 10,
        alignSelf: 'flex-start',
        marginLeft: 10,
        marginTop: 5,   
    },
    commentto: {
        justifyContent: 'flex-end',
        marginBottom: 10,
        paddingLeft: 30,
        alignSelf: 'flex-end',
        width: width,
        flexDirection: 'row',
        padding: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    profilenameto:{
        alignSelf: 'flex-end',
        textAlign: 'right',
        fontSize: 13,
        paddingRight: 5,
        width: width*0.4,
    },
    messageto: {
        borderRadius: 10,
        padding: 15,
        marginTop: 5,   
        alignSelf: 'flex-end',
        marginRight: 5,
        backgroundColor: '#c4ffd2',
    },
    attachmentto: {
        borderRadius: 10,
        height: width*0.7,
        width: width*0.7,
        marginTop: 5,
        marginRight: 5,
        backgroundColor: '#e0e0e0',
    },
    profileimageto: {
        borderRadius: 10,
        height: 60,
        width: 60,
        marginTop: 5,
    },
    commentdateto: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginRight: 10,
        marginTop: 5,   
    },
    chatbar: {
        height: 50,
        width: width,
        backgroundColor: '#d1d1d1',
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 7,
        padding: 5,
        height: 30,
        width: width-140,
        marginLeft: 20,
        marginTop: 10,
    },
    icon: {
        fontSize: 30,
        marginLeft: 20,
        marginTop: 10,
        color: '#ff843d',
    },
    icon2: {
        fontSize: 30,
        marginLeft: 20,
        marginTop: 10,
        color: '#ff843d',
    },
})

export default Chat