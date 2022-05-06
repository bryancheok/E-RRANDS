import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, Switch, RefreshControl, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class FeedDetails extends Component {
    constructor(props){
        super(props);

        this.id = this.props.route.params.id;
        this.user = firebase.auth().currentUser.uid
        this.state = {
            title:'',
            desc:'',
            images: [],
            date:'',
            field: '',
            creatorid:'',
            creatorimage: '',
            input: '',
            likedusers: '',
            comments: [],
            likedfeeds: [],
            status: '',
            modalVisible: false,
            like: false,
            hide: false,
            showimage: '',

            refresh: false,
        }
    }

    componentDidMount() {
        this.readFeedDetails()
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
    
    readFeedDetails(){
        firebase.database().ref().child("likedfeeds").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val().feedid)
                })
                this.setState({likedfeeds: arr},()=>{
                    if(this.state.likedfeeds.includes(this.id)){
                        this.setState({like: true})
                    }
                })
            }
            else {
                this.setState({likedfeeds: arr, like: false})
            }
        })
        firebase.firestore().collection("feeds").doc(this.id).get().then((doc)=>{
            if(doc!=null){
                this.setState({
                    title: doc.data().title,
                    desc: doc.data().description,
                    images: doc.data().images,
                    field: doc.data().field,
                    date: doc.data().datecreated,
                    creatorid: doc.data().creatorid,
                    likedusers: doc.data().likedusers,
                    status: doc.data().status,
                }, ()=>{
                    if(this.state.status=="Hide"){
                        this.setState({hide: true})
                    }
                    else {
                        this.setState({hide: false})
                    }
                    firebase.firestore().collection("fieldpreferences").doc(this.state.field).get().then(doc=>{
                        if(doc.exists){
                            firebase.firestore().collection("fieldpreferences").doc(this.state.field).update({
                                views: firebase.firestore.FieldValue.increment(1)
                            })
                        }
                        else {
                            firebase.firestore().collection("fieldpreferences").doc(this.state.field).set({
                                views: 1
                            })
                        }
                    }).then(()=>{
                        firebase.database().ref().child("userpreferences").child(this.user).child("fields").child(this.state.field).update({
                            views: firebase.database.ServerValue.increment(1)
                        })
                    })
                })
            }
        }).then(()=>{
            firebase.firestore().collection("users").doc(this.state.creatorid).get().then((doc)=>{
                this.setState({
                    creatorimage: doc.data().image,
                })
            }).then(()=>{this.props.navigation.setParams({creatorimage: this.state.creatorimage, creatorid: this.state.creatorid})})
        })
        firebase.database().ref().child("feedcomments").child(this.id).on('value',snapshot=>{
            const arr = []
            snapshot.forEach((data)=>{
                arr.push(data.val())
            })
            this.setState({
                comments: arr,
            })
        })
        this.setState({refresh: false})
    }

    componentWillUnmount() {
        firebase.database().ref().child("likedfeeds").child(this.user).off('value')
        firebase.database().ref().child("feedcomments").child(this.id).off('value')
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>
                
                <ScrollView style={{marginBottom: 50}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readFeedDetails())}
                        />
                    }
                    >
                    <View style={{marginBottom: 20}}>
                        <View style={styles.feed}>
                            <Text style={styles.title}>{this.state.title}</Text>
                            <Text style={styles.desc}>{this.state.desc}</Text>
                            <Text style={styles.date}>Posted {this.differenceInDays(new Date().getTime(),this.state.date)}</Text>
                            
                            <ScrollView
                                horizontal={true}
                                nestedScrollEnabled={true}
                                style={{width:width, marginLeft: -10}}
                            >
                                {this.state.images.map((item,index)=>{
                                    return this.showImages(item,index)
                                })}
                            </ScrollView>

                            {this.likeButton(this.id)}
                            
                            <Text numberOfLines={1} style={styles.likecount}>{this.state.likedusers}</Text>

                            {this.hideSwitch(this.id)}
                        </View>
                    </View>
                    
                    <View style={{flexDirection:'row', marginBottom: width*0.05, borderBottomWidth: 0.2, alignSelf: 'center', width: width*0.95}}>
                        <Text>Comments</Text>
                        <Text style={{marginLeft: width*0.05}}>{this.state.comments.length}</Text>
                    </View>

                    
                    <FlatList
                        nestedScrollEnabled={true}
                        inverted={true}
                        data={this.state.comments}
                        renderItem={({item,index})=>
                            <Comment key={index} item={item} navigation={this.props.navigation}/> 
                        }
                        keyExtractor={(item, index) => index.toString()}
                    ></FlatList>
                    
                </ScrollView>

                <View style={styles.chatbar}>
                    <TextInput style={styles.input} multiline={false} maxLength={70} placeholder='Leave a comment' ref={input => { this.textInput = input }} onChangeText={(input)=>this.setState({input: input.trim()})}></TextInput>
                    <Icon
                        name='send'
                        style={styles.icon}
                        onPress={()=>this.postComment()}
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
                                source={{uri: this.state.showimage}}
                                style={{height: height-50, width: width-10, alignSelf: 'center', marginTop: 10}}
                                resizeMethod='resize'
                                resizeMode='contain'
                            ></Image>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }

    imageNum(i){
        if(this.state.images.length > 1){
            return (
                <Text style={{position: 'absolute', right: 5, bottom: 5, fontSize: 16, color: 'white'}}>{i+1}/{this.state.images.length}</Text>
            )
        }
    }
    
    showImages(image,index) {
        return (
            <Pressable
                key={index}
                onPress={()=>this.setState({modalVisible: true, showimage: image})}
            >
                <Image
                    style={styles.image}
                    source={image ? {uri: image } : null}
                    resizeMethod='resize'
                    resizeMode='cover'
                ></Image>
                {this.imageNum(index)}
            </Pressable>
        )
    }

    likeButton(feedid) {
        if(this.state.likedfeeds.includes(feedid) || this.state.like == true){
            return(
                <Icon
                    style={styles.liked}
                    name='thumb-up'
                ></Icon>
            )
        }
        else if(!this.state.likedfeeds.includes(feedid) || this.state.like == false) {
            return(
                <Icon
                    style={styles.like}
                    name='thumb-up-outline'
                    onPress={()=>this.likeFeed(feedid)}
                ></Icon>
            )
        }
    }

    likeFeed(id) {
        console.log("liked" , id)
        this.setState({like: true, likedusers: this.state.likedusers + 1})
        Toast.show({
            text1: 'Feed Liked',
            text2: 'Thank you for showing appreciation for this feed'
        })
        firebase.database().ref().child("likedfeeds").child(firebase.auth().currentUser.uid).child(id).set({
            feedid: id
        }).then(()=>{
            firebase.firestore().collection("feeds").doc(id).update({
                likedusers: firebase.firestore.FieldValue.increment(1)
            })
        })
    }

    // hideButton(feedid) {
    //     if(this.state.creatorid==firebase.auth().currentUser.uid){
    //         if(this.state.status=="Hide" || this.state.hide == true){
    //             return (
    //                 <Icon
    //                     style={styles.hide}
    //                     name='eye-off'
    //                     onPress={()=>this.unhideFeed(feedid)}
    //                 ></Icon>
    //             )
    //         }
    //         else if(!this.state.status=="Hide" || this.state.hide == false){
    //             return (
    //                 <Icon
    //                     style={styles.hide}
    //                     name='eye-off-outline'
    //                     onPress={()=>this.hideFeed(feedid)}
    //                 ></Icon>
    //             )
    //         }
    //     }
    // }

    hideSwitch(id) {
        if(this.state.creatorid==firebase.auth().currentUser.uid){
            return (
                <View style={{alignSelf: 'flex-end',position: 'absolute',right: 5,bottom: 15}}>
                    <Switch
                        style={styles.hide}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={!this.state.hide? "#80ff86" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={()=>this.hideAction(id)}
                        value={!this.state.hide}
                    ></Switch>
                    <Text style={{position: 'absolute',right: 10,bottom: 0, fontSize: 12, opacity: 0.5}}>Hide</Text>
                </View>
            )
        }
    }

    hideAction(id) {
        if(this.state.hide) {
            this.unhideFeed(id)
        }
        else {
            this.hideFeed(id)
        }
    }

    hideFeed(id) {
        this.setState({hide: true})
        Toast.show({
            type: 'error',
            text1: 'Feed Hidden',
            text2: 'Your feed will no longer be found by other users'
        })
        firebase.firestore().collection("feeds").doc(id).update({
            status: "Hide"
        }).then(()=>{this.readFeedDetails()})
    }

    unhideFeed(id) {
        this.setState({hide: false})
        Toast.show({
            type: 'info',
            text1: 'Feed Open',
            text2: 'Your feed can be found by other users'
        })
        firebase.firestore().collection("feeds").doc(id).update({
            status: "Open"
        }).then(()=>{this.readFeedDetails()})
    }
    
    postComment() {
        if(this.state.input.length > 70 || (!this.state.input.replace(/\s/g, '').length)){
            
        }
        else {
            const message = this.state.input.toString()
            console.log(this.state.input.toString())
            const userid = firebase.auth().currentUser.uid
            firebase.database().ref().child("feedcomments").child(this.id).push({
                creatorid: userid,
                message: message,
                time: new Date().getTime(),
            }).then(()=>{
                this.textInput.clear()
                this.setState({input: ''})
                Toast.show({
                    text1: 'Comment Posted',
                    text2: 'Your comment has been created'
                })
            })
        }
    }
}

class Comment extends Component {
    constructor(props){
        super(props);

        this.item = this.props.item;

        this.state = {
            username: '',
            image: '',
        }
    }

    componentDidMount() {
        firebase.firestore().collection("users").doc(this.item.creatorid).get().then(doc=>{
            if(doc.exists){
                this.setState({
                    username: doc.data().username,
                    image: doc.data().image
                })
            }
        })
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

    render() {
        return(
            <View style={styles.comment}>   
                <TouchableOpacity
                    onPress={()=>this.props.navigation.navigate("View Profile",{id: this.item.creatorid})}
                ><Image
                    source={{uri: this.state.image==''? null:this.state.image}}
                    style={styles.profileimage}
                    resizeMethod='scale'
                    resizeMode='cover'
                ></Image>
                </TouchableOpacity>
                <View>
                    <Text numberOfLines={1} style={styles.profilename}>{this.state.username}: </Text>
                    <Text style={styles.message}>{this.item.message}</Text>
                    <Text style={styles.commentdate}>Posted {this.differenceInDays(new Date().getTime(),this.item.time)}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    feed: {
        alignSelf: 'flex-start',
        width: width,
        backgroundColor: 'white',
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 25,
        padding: 5,
        fontWeight: 'bold'
    },
    desc: {
        fontSize: 20,
        padding: 5,
    },
    creator: {
        fontSize: 15,
        padding: 5,
        width: width*0.7,
    },
    date: {
        fontSize: 13,
        alignSelf: 'flex-start',
        marginTop: 5,
        marginBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
    },
    image: {
        height: width,
        width: width,
        alignSelf: 'center',
        backgroundColor: '#e0e0e0'
    },
    like: {
        marginTop: 10,
        marginLeft: 5,
        fontSize: 25,
        alignSelf: 'flex-start',
        color: '#a6a6a6'
    },
    liked: {
        marginTop: 10,
        marginLeft: 5,
        fontSize: 25,
        alignSelf: 'flex-start',
        color: '#03a1fc',
    },
    hide: {
        transform: [{ scaleX: .8 }, { scaleY: .8 }],
    },
    post: {
        fontSize: 50,
        backgroundColor: '#ffac63',
        opacity: 0.8,
        borderWidth: 0.4,
        borderRadius: 20,
        right: 20,
        bottom: 40,
        position: 'absolute',
        shadowColor: "#ffde21",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 25,
    },
    likecount:{
        fontSize: 12,
        width: width*0.2,
        height: height*0.02,
        marginLeft: 15,
        color: '#03a1fc',
    },
    comment: {
        marginBottom: 10,
        alignSelf: 'center',
        width: width*0.95,
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 0.2,
    },
    profilename:{
        fontSize: 12,
        paddingLeft: 5,
        width: width*0.5,
    },
    message: {
        paddingBottom: 10,
        paddingTop: 5,
        paddingLeft: 5,
        alignSelf: 'flex-start',
        marginTop: 5,   
        width: width*0.8,
    },
    profileimage: {
        height: width*0.1,
        width: width*0.1,
        borderRadius: 100,
        marginTop: 5,
        backgroundColor: '#e0e0e0',
    },
    commentdate: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginLeft: 10,
        marginTop: 5,
        width: width*0.2
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
        width: width-100,
        marginLeft: 20,
        marginTop: 10,
    },
    icon: {
        fontSize: 30,
        marginLeft: 20,
        marginTop: 10,
        color: '#ff843d',
    },
})

export default FeedDetails