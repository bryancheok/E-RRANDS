import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions, RefreshControl, FlatList, Image, TouchableOpacity } from 'react-native';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";

const width = Dimensions.get('window').width;

export class Messages extends Component {
    constructor(props){
        super(props);

        this.user = firebase.auth().currentUser.uid;

        this.state = {
            refresh: false,
            chats: [],
        }
    }

    componentDidMount() {
        this.readChats()
    }

    readChats() {
        firebase.database().ref().child("chats").child(firebase.auth().currentUser.uid).orderByChild("lastchatserver").on('value',snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val())
                })
                const myData = [].concat(arr)
                .sort((a, b) => a.lastchatserver < b.lastchatserver ? 1 : -1)
                this.setState({chats: myData}, ()=>console.log(myData))
            }
            else {
                this.setState({chats: arr})
            }
        })
        this.setState({refresh: false})
    }

    componentWillUnmount() {
        firebase.database().ref().child("chats").child(this.user).orderByChild("lastchatserver").off('value')
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

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>

                {this.getNoChat()}

                <FlatList
                    data={this.state.chats}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readChats())}
                        />
                        }
                    renderItem={({item,index})=>
                        <Chat key={index} item={item} navigation={this.props.navigation} lastchat={this.differenceInDays(new Date().getTime(),item.lastchat)}/>
                    }
                    keyExtractor={(item, index) => item.chatpath.toString()}
                ></FlatList>
                
            </View>
        )
    }
    
    getNoChat() {
        if(this.state.chats < 1) {
            return (
                <View>
                    <Text style={{marginTop: 40, alignSelf: 'center'}}>Find users to chat with !</Text>
                </View>
            )
        }
    }
}

class Chat extends Component {
    constructor(props){
        super(props);

        this.chatpath = this.props.item.chatpath;

        this.state = {
            lastchat: this.props.lastchat,
            userid: '',
            username: '',
            image: '',
            lastmessage: '',
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

    componentDidMount() {
        if(this.props.item.user1==firebase.auth().currentUser.uid){
            this.setState({userid: this.props.item.user2}, ()=>this.readUserInfo())
        }
        if(this.props.item.user2==firebase.auth().currentUser.uid){
            this.setState({userid: this.props.item.user1}, ()=>this.readUserInfo())
        }
        firebase.database().ref().child("chatmessages").child(this.chatpath).limitToLast(1).on('value',snapshot=>{
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    if(data.val().message!=null){
                        this.setState({
                            lastmessage: data.val().message,
                        })
                    }
                    if(data.val().attachment!=null){
                        this.setState({
                            lastmessage: 'Image',
                        })
                    }
                })
            }
            else {
                this.setState({
                    lastmessage: '',
                })
            }
        })
    }
    
    readUserInfo() {
        firebase.firestore().collection("users").doc(this.state.userid).get().then((doc)=>{
            if(doc.data()!=null){
                this.setState({
                    username: doc.data().username,
                    image: doc.data().image,
                })
            }
        })
    }

    componentWillUnmount() {
        firebase.database().ref().child("chatmessages").child(this.chatpath).limitToLast(1).off('value')
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.box}
                onPress={()=>this.goToChat()}
            >
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity
                        onPress={()=>this.props.navigation.navigate("View Profile", {id: this.state.userid})}
                    >
                        <Image
                            style={styles.image}
                            source={{uri: this.state.image!='' ? this.state.image:null}}
                            resizeMethod='scale'
                            resizeMode='cover'
                        ></Image>
                    </TouchableOpacity>
                    <View style={{marginLeft: 10}}>
                        <Text numberOfLines={1} style={styles.username}>{this.state.username}</Text>
                        <Text numberOfLines={1} style={styles.lastmsg}>{this.state.lastmessage}</Text>
                    </View>
                    <Text style={styles.lastdate}>{this.state.lastchat}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    goToChat(){
        if(this.state.userid!=''){
            this.props.navigation.navigate("Chat", {id: this.state.userid})
        }
    }
}

const styles = StyleSheet.create({
    box: {
        padding: 10,
        borderBottomWidth: 0.2,
    },
    image: {
        height: width*0.15,
        width: width*0.15,
        borderRadius: 100,
    },
    username: {
        fontSize: 16,
        padding: 3,
        width: width-250,
    },
    lastmsg: {
        fontSize: 12,
        color: '#9e9e9e',
        padding: 3,
        width: width-250,
    },
    lastdate: {
        fontSize: 11,
        position: 'absolute',
        width: width-300,
        right: 0,
        marginTop: 3,
    },
})

export default Messages