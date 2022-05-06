import React, { Component } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image, RefreshControl, Switch, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import RBSheet from "react-native-raw-bottom-sheet";
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;

export class Feeds extends Component {
    constructor(props){
        super(props);

        this.user = firebase.auth().currentUser.uid
        this.state = {
            type: this.props.route.params.type,
            feed: {
                id: '',
                title:'',
                images: [],
                date:'',
                creatorid:'',
                likedusers: '',
                status: '',
            },
            likedfeeds: [],
            feeds: [],
            refresh: false,
            max: 0,

            field: '',
            preferfield: '',

            sort: 'All',
            limit: 10,
        }
    }

    componentDidMount() {
        firebase.firestore().collection("feeds").where("status","==","Open").get().then((read)=>{
            if(!read.empty){
                this.setState({max: read.size})
            }
            else {
                this.setState({max: 0})
            }
        })
        firebase.database().ref().child("likedfeeds").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val().feedid)
                })
                this.setState({likedfeeds: arr})
            }
            else {
                this.setState({likedfeeds: arr})
            }
        })

        firebase.firestore().collection("fieldpreferences").orderBy("views","desc").limit(1).get().then((doc)=>{
            if(!doc.empty){
                doc.forEach(snapshot=>{
                    if(snapshot.data().views > 30){
                        this.setState({preferfield: snapshot.id})
                    }
                })
            }
        }).then(()=>{
            firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then((doc)=>{
                this.setState({
                    field: doc.data().field
                })
            }).then(()=>this.readFeeds())
        })
    }
    
    sortAlgo(ref) {
        if(this.state.sort=='All'){
            return ref
        }
        else if(this.state.sort=='Popular'){
            return ref.orderBy("likedusers","desc")
        }
        else if(this.state.sort=='Recent'){
            return ref.orderBy("serverdate","desc")
        }
    }

    readOptions() {
        const ref = firebase.firestore().collection("feeds").where("status","==","Open").limit(this.state.limit)
        const ref1 = this.sortAlgo(ref)

        if(this.state.sort=='Popular'){
            ref1.get().then((querySnapshot)=>{
                this.setState({feeds: []})
                const arr = []
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            feed:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                images: documentSnapshot.data().images,
                                creatorid: documentSnapshot.data().creatorid,
                                date: documentSnapshot.data().datecreated,
                                likedusers: documentSnapshot.data().likedusers,
                                status: documentSnapshot.data().status,
                            }
                        })
                        arr.push(this.state.feed)
                    })
                }
                this.setState({feeds: arr},()=>console.log('feeds: ',this.state.feeds))
            })
        }
        else if(this.state.sort=='Recent'){
            ref1.get().then((querySnapshot)=>{
                this.setState({feeds: []})
                const arr = []
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            feed:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                images: documentSnapshot.data().images,
                                creatorid: documentSnapshot.data().creatorid,
                                date: documentSnapshot.data().datecreated,
                                likedusers: documentSnapshot.data().likedusers,
                                status: documentSnapshot.data().status,
                            }
                        })
                        arr.push(this.state.feed)
                    })
                }
                this.setState({feeds: arr},()=>console.log('feeds: ',this.state.feeds))
            })
        }
        else {
            const arr = []
            firebase.firestore().collection("feeds").where("status","==","Open").where("field","==",this.state.preferfield).orderBy("serverdate","desc").limit(this.state.limit/2).get().then((querySnapshot)=>{
                this.setState({feeds: []})
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            feed:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                images: documentSnapshot.data().images,
                                creatorid: documentSnapshot.data().creatorid,
                                date: documentSnapshot.data().datecreated,
                                likedusers: documentSnapshot.data().likedusers,
                                status: documentSnapshot.data().status,
                            }
                        })
                        arr.push(this.state.feed)
                    })
                }
                this.setState({feeds: arr},()=>console.log('feeds: ',this.state.feeds))
            }).then(()=>{
                firebase.firestore().collection("feeds").where("status","==","Open").where("field","!=",this.state.preferfield).limit(this.state.limit/2).get().then((querySnapshot)=>{
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            feed:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                images: documentSnapshot.data().images,
                                creatorid: documentSnapshot.data().creatorid,
                                date: documentSnapshot.data().datecreated,
                                likedusers: documentSnapshot.data().likedusers,
                                status: documentSnapshot.data().status,
                            }
                        })
                        arr.push(this.state.feed)
                    })
                }
                this.setState({feeds: arr},()=>console.log('feeds: ',this.state.feeds))
            })
            })
        }
    }

    readFeeds() {
        if(this.state.type=='browse'){
            this.readOptions()
        }
        else if(this.state.type=='self'){
            const ref = firebase.firestore().collection("feeds").where("creatorid","==",firebase.auth().currentUser.uid).limit(this.state.limit)
            const ref1 = this.sortAlgo(ref)
            ref1.get().then((querySnapshot)=>{
                this.setState({feeds: []})
                const arr = []
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            feed:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                images: documentSnapshot.data().images,
                                creatorid: documentSnapshot.data().creatorid,
                                date: documentSnapshot.data().datecreated,
                                likedusers: documentSnapshot.data().likedusers,
                                status: documentSnapshot.data().status,
                            }
                        })
                        arr.push(this.state.feed)
                    })
                }
                this.setState({feeds: arr},()=>console.log('feeds: ',this.state.feeds))
            })
        }
        this.setState({refresh: false})
    }

    componentWillUnmount() {
        firebase.database().ref().child("likedfeeds").child(this.user).off('value')
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>

                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({type: 'browse', sort: 'All', limit: 10}, ()=>this.readFeeds())}
                    >
                    <Text style={{color: this.state.type=='browse' ? '#4a9df0': 'black', fontSize: this.state.type=='browse' ? 16:14}}>Browse</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({type: 'self', sort: 'Recent', limit: 10}, ()=>this.readFeeds())}
                    ><Text style={{color: this.state.type=='self' ? '#4a9df0': 'black', fontSize: this.state.type=='self' ? 16:14}}>My Feeds</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    initialNumToRender={3}
                    ListHeaderComponent={
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center', width: width}}>
                                <TouchableOpacity
                                    style={styles.sort}
                                    onPress={() => this.RBSheet.open()}
                                ><Text style={{color: 'white'}}>{this.state.sort}</Text></TouchableOpacity>

                                <View style={{justifyContent: 'flex-end', width: width*0.6}}>
                                    <Icon name='plus-circle-outline' style={{fontSize:30, alignSelf: 'flex-end', color: '#3e85f0'}} onPress={()=>this.createFeed()}></Icon>
                                </View>
                            </View>
                            
                            {this.getNoFeeds()}
                        </View>
                    }
                    ListFooterComponent={
                        <View>
                            {this.getLoadMore()}
                        </View>
                    }
                    data={this.state.feeds}
                    extraData={this.state.likedfeeds}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true, limit: 10}, ()=>this.readFeeds())}
                        />
                    }
                    renderItem={({item,index})=>
                        <FeedComponent key={item.id} item={item} index={index} presetlike={this.getLikePreset(item.id)} presethide={this.getHidePreset(item.status)}  navigation={this.props.navigation}/>
                    }
                    keyExtractor={(item, index) => item.id.toString()}
                ></FlatList>
                
                {/* <Icon
                    style={styles.post}
                    name='plus'
                    onPress={()=>this.createFeed()}
                ></Icon> */}

                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
                    height={this.state.type=='browse' ? 200 : 160}
                    openDuration={250}
                    customStyles={{
                        container: {
                            alignItems: 'center',
                            paddingTop: 10,
                        }
                    }}
                    >
                    <Text style={styles.boxtitle}>Sort</Text>
                    <View style={styles.bottombox}>
                        {this.getAllBtn()}
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({sort: 'Recent', limit: 10}, ()=>{
                                    this.readFeeds()
                                })
                                this.RBSheet.close()
                            }}
                        ><Text style={this.getStyle('Recent')}>Recent</Text></TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({sort: 'Popular', limit: 10}, ()=>{
                                    this.readFeeds()
                                })
                                this.RBSheet.close()
                            }}
                        ><Text style={this.getStyle('Popular')}>Popular</Text></TouchableOpacity>
                    </View>
                </RBSheet>
                
            </View>
        )
    }

    getLoadMore() {
        if(this.state.feeds.length < this.state.max && this.state.type=='browse'){
            return (
                <TouchableOpacity
                    onPress={()=>this.setState({limit: this.state.limit + 10}, ()=>this.readFeeds())}
                ><Text style={{padding: 10, alignSelf: 'center', backgroundColor: 'white', borderRadius: 10, marginTop: 10, marginBottom: 10}}>More</Text></TouchableOpacity>
            )
        }
    }

    getStyle(now) {
        if(this.state.sort==now){
            return {
                    padding: 10,
                    color: '#f2a157',
                }
        }
        else {
            return {
                padding: 10,
            }
        }
    }

    getAllBtn() {
        if(this.state.type=='browse'){
            return (
                <TouchableOpacity
                    onPress={()=>{
                        this.setState({sort: 'All', limit: 10}, ()=>{
                            this.readFeeds()
                            })
                        this.RBSheet.close()
                    }}
                ><Text style={this.getStyle('All')}>All</Text></TouchableOpacity>
            )
        }
    }

    getNoFeeds() {
        if(this.state.feeds.length < 1){
            return (
                <View>
                    <Text style={{alignSelf: 'center'}}>Oops, no feeds were found.</Text>
                    <Text style={{alignSelf: 'center'}}>Feel free to share your experiences !</Text>
                </View>
            )
        }
    }

    getLikePreset(feedid) {
        if(this.state.likedfeeds.includes(feedid)){
            return true
        }
        else {
            return false
        }
    }

    getHidePreset(status) {
        if(status == "Open"){
            return false
        }
        else {
            return true
        }
    }

    createFeed(){
        this.props.navigation.navigate("Create Feed", {field: this.state.field})
    }
}

class FeedComponent extends Component {
    constructor(props){
        super(props);

        this.user = this.user = firebase.auth().currentUser.uid;
        
        this.state = {
            like: this.props.presetlike,
            hide: this.props.presethide,
            likedfeeds: []
        }
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

    componentDidMount() {
        firebase.database().ref().child("likedfeeds").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val().feedid)
                })
                this.setState({likedfeeds: arr})
            }
            else {
                this.setState({likedfeeds: arr})
            }
        })
    }

    componentWillUnmount() {
        firebase.database().ref().child("likedfeeds").child(this.user).off('value')
    }

    render(){
        return (
            <View>
                <View style={styles.feed}>
                    <TouchableOpacity
                        onPress={()=>this.viewFeed(this.props.item.id)}
                    >
                        <Text numberOfLines={3} style={styles.title} onPress={()=>this.viewFeed(this.props.item.id)}>{this.props.item.title}</Text>
                        <Text style={styles.date} onPress={()=>this.viewFeed(this.props.item.id)}>Posted {this.differenceInDays(new Date().getTime(),this.props.item.date)}</Text>
                    </TouchableOpacity>
                    <ScrollView
                        horizontal={true}
                        nestedScrollEnabled={true}
                        style={{width:width, marginLeft: -10}}
                    >
                        {this.props.item.images.map((item,index)=>{
                            return this.showImages(item,index)
                        })}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={()=>this.viewFeed(this.props.item.id)}
                    >
                        {this.likeButton(this.props.item.id)}                
                        {/* {this.hideSwitch(this.props.item.creatorid,this.props.item.id)} */}
                    </TouchableOpacity>
                </View>
                <View style={styles.split}>
                    <View style={{borderBottomWidth: 0.2, borderBottomColor: '#919191'}}></View>    
                </View>
            </View>
        )
    }

    imageNum(i){
        if(this.props.item.images.length > 1){
            return (
                <Text style={{position: 'absolute', right: 5, bottom: 5, fontSize: 16, color: 'white'}}>{i+1}/{this.props.item.images.length}</Text>
            )
        }
    }

    showImages(image,i) {
        return (
            <View key={i}>
                <Image
                    style={styles.image}
                    source={image? {uri: image}:null}
                    resizeMethod='scale'
                    resizeMode='cover'
                ></Image>
                {this.imageNum(i)}
            </View>
        )
    }

    likeButton(feedid) {
        if(this.state.likedfeeds.includes(feedid)){
            return(
                <Icon
                    style={styles.liked}
                    name='thumb-up'
                ></Icon>
            )
        }
        else if(!this.state.likedfeeds.includes(feedid)){
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
        this.setState({like: true})
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

    // hideButton(feedid,creatorid) {
    //     if(creatorid==firebase.auth().currentUser.uid){
    //         if(this.state.hide){
    //             return (
    //                 <Icon
    //                     style={styles.hide}
    //                     name='eye-off'
    //                     onPress={()=>this.unhideFeed(feedid)}
    //                 ></Icon>
    //             )
    //         }
    //         else {
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

    hideSwitch(creatorid,id) {
        if(creatorid==firebase.auth().currentUser.uid){
            return (
                <Switch
                    style={styles.hide}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={!this.state.hide? "#80ff86" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={()=>this.hideAction(id)}
                    value={!this.state.hide}
                ></Switch>
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
        })
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
        })
    }

    viewFeed(id) {
        this.props.navigation.navigate("Details", {id: id})
    }
}

const styles = StyleSheet.create({
    boxtitle: {
        fontSize: 23,
        padding: 5,
        left: 20,
        position: 'absolute',
    },
    bottombox: {
        marginTop: 40,
        width: width*0.7,
        borderColor: '#e69245',
        borderRadius: 10,
        borderWidth: 1,
    },
    sort: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        padding: 7,
        backgroundColor: '#949494',
        width: width*0.3,
        borderRadius: 30,
        alignItems: 'center'
    },
    navigation: {
        flexDirection: 'row',
        alignSelf: 'center',
        height: 50,
        borderBottomWidth: 0.5,
        borderColor: '#9a9b9c',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    navbar: {
        alignSelf: 'center',
        alignItems: 'center',
        flex: 1,
    },
    feed: {
        alignSelf: 'flex-start',
        width: width,
        backgroundColor: 'white',
        padding: 10,
    },
    split: {
        height: width*0.02,
        width: width*0.95,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    title: {
        fontSize: 25,
        padding: 5,
        fontWeight: 'bold'
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
        height: width*0.5,
        width: width,
        alignSelf: 'center',
        backgroundColor: '#e0e0e0'
    },
    like: {
        marginTop: 5,
        marginLeft: 5,
        fontSize: 25,
        alignSelf: 'flex-start',
        color: '#a6a6a6'
    },
    liked: {
        marginTop: 5,
        marginLeft: 5,
        fontSize: 25,
        alignSelf: 'flex-start',
        color: '#03a1fc',
    },
    hide: {
        position: 'absolute',
        right: 0,
        top: 5,
        transform: [{ scaleX: .8 }, { scaleY: .8 }],
        alignSelf: 'flex-end',
    },
    post: {
        fontSize: 50,
        backgroundColor: '#ffb56b',
        opacity: 0.7,
        borderWidth: 0.7,
        borderRadius: 20,
        right: 20,
        bottom: 40,
        position: 'absolute',
        color: '#244cff',
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 25,
    },
})

export default Feeds