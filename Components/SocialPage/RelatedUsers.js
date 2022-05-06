import React, { Component } from 'react'
import { View, Text, FlatList, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers} from 'react-native-popup-menu';
const { SlideInMenu } = renderers;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class RelatedUsers extends Component {
    constructor(props){
        super(props);

        this.user = firebase.auth().currentUser.uid
        this.state = {
            type: this.props.route.params.type,
            input: '',
            list: [],
            savedadd: [],
            savedblock: [],
            savedpending: [],
            addusers: [],
            blockusers: [],
            pendingusers: [],
            refresh: false,
            loading: false,
        }
    }

    componentDidMount() {
        this.readUsers()
    }

    componentWillUnmount() {
        firebase.database().ref().child("relatedusers").child(this.user).child("pending").off('value')
    }
    
    readUsers(){
        firebase.database().ref().child("relatedusers").child(this.user).child("pending").off('value')
        if(this.state.type=='added'){
            this.readAdd()
        }
        if(this.state.type=='pending'){
            this.readPend()
        }
        if(this.state.type=='blocked'){
            this.readBlock()
        }
        this.setState({refresh: false})
    }

    readAdd(){
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("added").once('value',snapshot=>{
            this.setState({addusers: [], blockusers: [], pendingusers: [], savedadd: [], savedblock: [], savedpending: [], loading: false})
            if(snapshot.exists()){
                const arr1 = []
                const arrRead = []
                snapshot.forEach((data)=>{
                    arr1.push(data.val().userid)
                })
                const arr = arr1.reverse()
                if(this.state.type=='added'){
                    if(arr.length>0){
                        for(let i = 0; i < arr.length; i++){
                            firebase.firestore().collection("users").doc(arr[i]).get().then(onSnapshot=>{
                                arrRead.push(onSnapshot.data())
                                this.setState({addusers: arrRead, savedadd: arrRead, loading: true})
                            })
                        }
                    }
                    
                }
            }
        })
    }
    
    readBlock() {
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").once('value',snapshot=>{
            this.setState({addusers: [], blockusers: [], pendingusers: [], savedadd: [], savedblock: [], savedpending: [], loading: false})
            if(snapshot.exists()){
                const arr1 = []
                const arrRead = []
                snapshot.forEach((data)=>{
                    arr1.push(data.val().userid)
                })
                const arr = arr1.reverse()
                if(this.state.type=='blocked'){
                    if(arr.length>0){
                        for(let i = 0; i < arr.length; i++){
                            firebase.firestore().collection("users").doc(arr[i]).get().then(onSnapshot=>{
                                arrRead.push(onSnapshot.data())
                                this.setState({blockusers: arrRead, savedblock: arrRead, loading: true})
                            })
                        }
                    }
                    
                }
            }
        })
    }

    readPend(){
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").on('value',snapshot=>{
            this.setState({addusers: [], blockusers: [], pendingusers: [], savedadd: [], savedblock: [], savedpending: [], loading: false})
            if(snapshot.exists()){
                const arr1 = []
                const arrRead = []
                snapshot.forEach((data)=>{
                    arr1.push(data.val().userid)
                })
                const arr = arr1.reverse()
                if(this.state.type=='pending'){
                    if(arr.length>0){
                        for(let i = 0; i < arr.length; i++){
                            firebase.firestore().collection("users").doc(arr[i]).get().then(onSnapshot=>{
                                arrRead.push(onSnapshot.data())
                                this.setState({pendingusers: arrRead, savedpending: arrRead, loading: true})
                            })
                        }
                    }
                    
                }
            }
        })
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width}}>

                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({type: 'added'}, ()=>this.readUsers())}
                    >
                    <Text style={{color: this.state.type=='added' ? '#4a9df0': 'black', fontSize: this.state.type=='added' ? 16:14}}>Added</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({type: 'pending'}, ()=>this.readUsers())}
                    ><Text style={{color: this.state.type=='pending' ? '#4a9df0': 'black', fontSize: this.state.type=='pending' ? 16:14}}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({type: 'blocked'}, ()=>this.readUsers())}
                    ><Text style={{color: this.state.type=='blocked' ? '#4a9df0': 'black', fontSize: this.state.type=='blocked' ? 16:14}}>Blocked</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ListHeaderComponent={
                        <View>
                            <View style={styles.searchbar}>
                                <TextInput style={styles.input} placeholder='Username' onChangeText={(username) => this.searchUser(username)}></TextInput>    
                                <Icon
                                    name='magnify'
                                    style={styles.search}
                                ></Icon>
                                {this.findUser()}
                            </View>

                            {this.getEmpty()}
                        </View>
                    }
                    data={this.getUsers()}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readUsers())}
                        />
                        }
                    renderItem={({item,index}) => 
                        this.showflat(item,index)
                    }
                    keyExtractor={(item, index) => item.id.toString()}
                    >
                </FlatList>

            </View>
        )
    }
    
    findUser(){
        if(this.state.type == 'added'){
            return (
                <View>
                    <Icon name='plus-circle-outline' style={{fontSize:30, marginLeft: 150, color: '#3e85f0'}} onPress={()=>this.toFindUser()}></Icon>
                </View>
            )
        }
    }

    toFindUser(){
        this.props.navigation.navigate("Find User")
    }

    showflat(item,index){
        if(this.state.loading == true){
            return(
                <View>
                    <Menu key={index} renderer={SlideInMenu}>
                        <MenuTrigger>
                            <View style={styles.profilesection}>
                                <TouchableOpacity
                                    onPress={()=>this.viewProfile(item.id)}>
                                    <Image
                                        source={{uri: item.image}}
                                        style={styles.profileimage}
                                        resizeMethod='scale'
                                        resizeMode='cover'
                                    ></Image>
                                </TouchableOpacity>
                                <View style={styles.userinfo}>
                                    <Text numberOfLines={1} style={styles.infotextname}>{item.username}</Text>
                                    <Text numberOfLines={1} style={styles.infotext}>{item.email}</Text>            
                                </View>
                            </View>
                            {/* {this.getType(this.state.type,item.id)} */}
                        </MenuTrigger>
                        {this.getType(this.state.type,item.id,item.username)}
                    </Menu>
                </View>
            ) 
        }
    }

    getEmpty() {
        if(this.state.type=='added'){
            if(this.state.addusers < 1){
                return (
                    <Text style={{alignSelf: 'center', marginTop: 50}}>No Users Found</Text>
                )
            }
        }
        if(this.state.type=='pending'){
            if(this.state.pendingusers < 1){
                return (
                    <Text style={{alignSelf: 'center', marginTop: 50}}>No Users Found</Text>
                )
            }
        }
        if(this.state.type=='blocked'){
            if(this.state.blockusers < 1){
                return (
                    <Text style={{alignSelf: 'center', marginTop: 50}}>No Users Found</Text>
                )
            }
        }
    }

    getUsers(){
        if(this.state.type=='added'){
            return this.state.addusers
        }
        if(this.state.type=='blocked'){
            return this.state.blockusers
        }
        if(this.state.type=='pending'){
            return this.state.pendingusers
        }
    }
    getSavedUsers(){
        if(this.state.type=='added'){
            return this.state.savedadd
        }
        if(this.state.type=='blocked'){
            return this.state.savedblock
        }
        if(this.state.type=='pending'){
            return this.state.savedpending
        }
    }
    searchUser(username){
        this.setState({input: username})
        const arr = this.getSavedUsers()
        const newarr = []
        for(let i = 0; i< arr.length; i++){
            if(arr[i].username.toLowerCase().includes(username.toLowerCase())){
                newarr.push(arr[i])
                if(this.state.type=='added'){
                    this.setState({
                        addusers: newarr
                    })
                }
                if(this.state.type=='blocked'){
                    this.setState({
                        blockusers: newarr
                    })
                }
                if(this.state.type=='pending'){
                    this.setState({
                        pendingusers: newarr
                    })
                }
            }
            else {
                this.setState({
                    addusers: newarr,
                    blockusers: newarr,
                    pendingusers: newarr
                })
            }
        }
    }
    getType(type,id,username){
        if(type=='added'){
            return (
                <MenuOptions style={styles.side}>
                    <MenuOption disabled={true} style={{alignSelf: 'center'}}><Text style={{fontSize: 20}}>{username}</Text></MenuOption>
                    <View style={{flexDirection: 'row'}}>
                        <MenuOption customStyles={{optionWrapper:{marginRight: 60}}}>
                            <Icon
                                name='account-minus-outline'
                                style={styles.deletebutton}
                                onPress={()=> this.removeUser(id)}
                            ></Icon>
                            <Text style={styles.removetext}>Remove</Text>
                        </MenuOption>
                        <MenuOption customStyles={{optionWrapper:{marginLeft: 60}}}>
                            <Icon
                                name='account-cancel'
                                style={styles.blockbutton}
                                onPress={()=> this.blockUserFromAdd(id)}
                            ></Icon>
                            <Text style={styles.blocktext}>Block</Text>
                        </MenuOption>
                    </View>
                </MenuOptions>
            )
        }
        else if(type=='pending'){
            return (
                <MenuOptions style={styles.side}>
                    <MenuOption disabled={true} style={{alignSelf: 'center'}}><Text style={{fontSize: 20}}>{username}</Text></MenuOption>
                    <View style={{flexDirection: 'row'}}>
                        <MenuOption customStyles={{optionWrapper:{marginRight: 60}}}>
                            <Icon
                                name='account-check-outline'
                                style={styles.addbutton}
                                onPress={()=> this.acceptUser(id)}
                            ></Icon>
                            <Text style={styles.addtext}>Accept</Text>
                        </MenuOption>
                        <MenuOption customStyles={{optionWrapper:{marginLeft: 60}}}>
                            <Icon
                                name='account-cancel'
                                style={styles.blockbutton}
                                onPress={()=> this.blockUser(id)}
                            ></Icon>
                            <Text style={styles.blocktext}>Block</Text>
                        </MenuOption>
                    </View>
                </MenuOptions>
            )
        }
        else if(type=='blocked'){
            return (
                <MenuOptions style={styles.side}>
                    <MenuOption disabled={true} style={{alignSelf: 'center'}}><Text style={{fontSize: 20}}>{username}</Text></MenuOption>
                    <MenuOption>
                        <Icon
                            name='account-cancel-outline'
                            style={styles.unblockbutton}
                            onPress={()=> this.unblockUser(id)}
                        ></Icon>
                        <Text style={styles.unblocktext}>Unblock</Text>
                    </MenuOption>
                </MenuOptions>
            )
        }
    }
    viewProfile(user){
        this.props.navigation.navigate("View Profile", {id: user})
    }
    removeUser(id){
        console.log('Removing User', id)
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("added").child(id).remove().then(()=>{
            firebase.database().ref().child("relatedusers").child(id).child("added").child(firebase.auth().currentUser.uid).remove()
        }).then(()=>this.readAdd())
    }
    blockUserFromAdd(id){
        console.log('Blocking User', id)
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("added").child(id).remove().then(()=>{
            firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").child(id).set({
                userid: id,
                servertime: firebase.database.ServerValue.TIMESTAMP,
            }).then(()=>{
                firebase.database().ref().child("relatedusers").child(id).child("added").child(firebase.auth().currentUser.uid).remove().then(()=>this.readAdd())
            })
        })
    }
    acceptUser(id){
        console.log('Accept User', id)
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").child(id).remove().then(()=>{
            firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("added").child(id).set({
                userid: id,
                servertime: firebase.database.ServerValue.TIMESTAMP,
            }).then(()=>{
                firebase.database().ref().child("relatedusers").child(id).child("added").child(firebase.auth().currentUser.uid).set({
                    userid: firebase.auth().currentUser.uid,
                    servertime: firebase.database.ServerValue.TIMESTAMP,
                })
            })
        })
    }
    blockUser(id){
        console.log('Blocking User', id)
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").child(id).remove().then(()=>{
            firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").child(id).set({
                userid: id,
                servertime: firebase.database.ServerValue.TIMESTAMP,
            })
        })
    }
    unblockUser(id){
        console.log('Unblocking User', id)
        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").child(id).remove().then(()=>this.readBlock())
    }
}

const styles = StyleSheet.create({
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
    searchbar: {
        flexDirection: 'row',
        paddingTop: 10,
        height: 50,
        paddingLeft: 10,
        paddingBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        width: width*0.4,
    },
    search: {
        fontSize: 20,
        alignSelf: 'center',
        marginLeft: 10,
    },
    profilesection: {
        padding: 10,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        width: width,
        marginBottom: 1,
        borderBottomWidth: 0.2,
    },
    profileimage: {
        borderRadius: 40,
        height: width*0.2,
        width: width*0.2,
        backgroundColor: '#e0e0e0'
    },
    userinfo: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
        paddingRight: 20,
        marginLeft: 10,
    },
    infotext: {
        alignSelf: 'flex-start',
        width: width*0.7,
        marginBottom: 5,
    },
    infotextname: {
        marginTop: height*0.01,
        alignSelf: 'flex-start',
        width: width*0.7,
        fontSize: 30,
    },
    side:{
        alignItems: 'center',
        height: 100,
        marginBottom: width*0.2,
    },
    addbutton: {
        fontSize: 40,
        alignSelf: 'center',
        color: '#43e327',
    },
    deletebutton: {
        fontSize: 40,
        alignSelf: 'center',
        color: '#ff6d24',
    },
    blockbutton: {
        fontSize: 40,
        alignSelf: 'center',
        color: '#ff4419',
    },
    unblockbutton: {
        fontSize: 40,
        alignSelf: 'center',
        color: '#639fff'
    },
    addtext: {
        fontSize: 12,
        marginTop: -5,
        color: '#43e327',
    },
    removetext: {
        fontSize: 12,
        marginTop: -5,
        color: '#ff6d24',
    },
    blocktext: {
        fontSize: 12,
        marginTop: -5,
        color: '#ff4419',
        marginLeft: 3,
    },
    unblocktext: {
        fontSize: 12,
        marginTop: -5,
        color: '#639fff',
        alignSelf: 'center'
    },
})

// class DisplayAdd extends Component {
//     constructor(props){
//         super(props);
//     }
//     render(){
//         return(
//             <View style={styles.side}>
//                 <Icon
//                     name='account-minus-outline'
//                     style={styles.deletebutton}
//                     onPress={()=> this.removeUser(this.props.id)}
//                 ></Icon>
//                 <Icon
//                     name='account-cancel'
//                     style={styles.blockbutton}
//                     onPress={()=> this.blockUser(this.props.id)}
//                 ></Icon>
//             </View>
//         )
//     }
//     removeUser(id){
//         console.log('Removing User', id)
//         firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
//             addedlist: firebase.firestore.FieldValue.arrayRemove(id)
//         }).then(()=>{
//             firebase.firestore().collection("users").doc(id).update({
//                 addedlist: firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)
//             })
//         })
//     }
//     blockUser(id){
//         console.log('Blocking User', id)
//         firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
//             blockedlist: firebase.firestore.FieldValue.arrayUnion(id),
//             addedlist: firebase.firestore.FieldValue.arrayRemove(id)
//         }).then(()=>{
//             firebase.firestore().collection("users").doc(id).update({
//                 addedlist: firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)
//             })
//         })
//     }
// }

// class DisplayPending extends Component {
//     constructor(props){
//         super(props);

//         this.state = {
//             temp: []
//         }
//     }
//     render(){
//         return(
//             <View style={styles.side}>
//                 <Icon
//                     name='account-check-outline'
//                     style={styles.addbutton}
//                     onPress={()=> this.acceptUser(this.props.id)}
//                 ></Icon>
//                 <Icon
//                     name='account-cancel'
//                     style={styles.blockbutton}
//                     onPress={()=> this.blockUser(this.props.id)}
//                 ></Icon>
//             </View>
//         )
//     }
//     acceptUser(id){
//         console.log('Accept User', id)
//         firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
//             pendinglist: firebase.firestore.FieldValue.arrayRemove(id),
//             addedlist: firebase.firestore.FieldValue.arrayUnion(id)
//         }).then(()=>{
//             firebase.firestore().collection("users").doc(id).update({
//                 addedlist: firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
//             })
//         })
//     }
//     blockUser(id){
//         console.log('Blocking User', id)
//         firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
//             blockedlist: firebase.firestore.FieldValue.arrayUnion(id),
//             pendinglist: firebase.firestore.FieldValue.arrayRemove(id)
//         })
//     }
// }

// class DisplayBlock extends Component {
//     constructor(props){
//         super(props);
//     }
//     render(){
//         return(
//             <Icon
//                 name='account-cancel-outline'
//                 style={styles.unblockbutton}
//                 onPress={()=> this.unblockUser(this.props.id)}
//             ></Icon>
//         )
//     }
//     unblockUser(id){
//         console.log('Unblocking User', id)
//         firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
//             blockedlist: firebase.firestore.FieldValue.arrayRemove(id),
//             pendinglist: firebase.firestore.FieldValue.arrayUnion(id)
//         })
//     }
// }

export default RelatedUsers