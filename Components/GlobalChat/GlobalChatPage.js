import React, { Component } from 'react'
import { View, Text, FlatList, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers} from 'react-native-popup-menu';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

class GlobalChatPage extends Component {
    constructor(props){
        super(props);

        this.user = firebase.auth().currentUser.uid;
        
        this.state = {
            messages: [],
            input: '',
            type: 'default',
        }
    }

    componentDidMount() {
        firebase.database().ref().child("globalchat").limitToLast(30).on('value',snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach(data=>{
                    arr.push(data.val())
                })
                const arrrev = arr.reverse()
                this.setState({messages: arrrev}, ()=>console.log(this.state.messages))
            }
            else {
                this.setState({messages: arr})
            }
        })
    }

    componentWillUnmount() {
        firebase.database().ref().child("globalchat").limitToLast(30).off('value')
    }

    render() {
        return (
            <View style={{width: width, flex: 1}}>
                {this.getChat()}
                <View style={{height: 50, width: width, position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: this.getColor()}}>
                    {this.getChatbarHeader()}
                    <View style={{height: 50, width: width, position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: this.getColor()}}>
                        <TextInput style={styles.input} maxLength={100} placeholder='Message' multiline={false} ref={input => { this.textInput = input }} onChangeText={(input)=>this.setState({input: input.trim()})}></TextInput>
                        <Menu>
                            <MenuTrigger>
                                <Icon
                                    name='bullhorn'
                                    style={styles.icon}
                                    
                                ></Icon>
                            </MenuTrigger>
                            <MenuOptions optionsContainerStyle={{marginTop: -50, width: width*0.2, borderRadius: 10, padding: 10}}>
                                <MenuOption onSelect={() => this.setState({type: 'default'})}>
                                    <Text style={{color: '#d1d1d1', fontSize: 12}}>Normal</Text>
                                </MenuOption>
                                <MenuOption onSelect={() => this.setState({type: 'tohire'})}>
                                    <Text style={{color: '#639fff', fontSize: 12}}>Errand Offer</Text>
                                </MenuOption>
                                <MenuOption onSelect={() => this.setState({type: 'torequest'})}>
                                    <Text style={{color: '#f5e042', fontSize: 12}}>Finding Errands</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                        <Icon
                            name='send'
                            style={styles.icon2}
                            onPress={()=>this.sendMessage()}
                        ></Icon>
                    </View>
                </View>
            </View>
        );
    }

    getChatbarHeader(){
        if(this.state.type=='default'){
            return (
                <Text style={{fontSize: 12, position: 'absolute', bottom: 50, padding: 5, borderTopRightRadius: 5, color: 'white', backgroundColor: this.getColor()}}>Normal</Text>
            )
        }
        if(this.state.type=='tohire'){
            return (
                <Text style={{fontSize: 12, position: 'absolute', bottom: 50, padding: 5, borderTopRightRadius: 5, color: 'white', backgroundColor: this.getColor()}}>Errand Offer</Text>
            )
        }
        if(this.state.type=='torequest'){
            return (
                <Text style={{fontSize: 12, position: 'absolute', bottom: 50, padding: 5, borderTopRightRadius: 5, color: 'white', backgroundColor: this.getColor()}}>Finding Errands</Text>
            )
        }
    }

    getColor(){
        if(this.state.type=='default'){
            return '#d1d1d1'
        }
        if(this.state.type=='tohire'){
            return '#639fff'
        }
        if(this.state.type=='torequest'){
            return '#f5e042'
        }
    }
    
    getChat() {
        if(this.state.messages.length > 0) {
            return (
                <FlatList
                    style={{marginBottom: 50}}
                    data={this.state.messages}
                    inverted={true}
                    renderItem={({item,index})=>
                       this.getChatBox(item,index)
                    }
                ></FlatList>
            )
        }
    }
    
    getChatBox(item,index) {
        if(item.creatorid==this.user){
            return <MyChat key={index} item={item} navigation={this.props.navigation}/>
        }
        else {
            return <OthersChat key={index} item={item} navigation={this.props.navigation}/>
        }
    }

    sendMessage() {
        if((!this.state.input.replace(/\s/g, '').length)){
            
        }
        else {
            this.textInput.clear()
            this.setState({input: '', type: 'default'})
            const ref = firebase.database().ref().child("globalchat").push().key
            firebase.database().ref().child("globalchat").child(ref).set({
                id: ref,
                message: this.state.input,
                creatorid: this.user,
                time: new Date().getTime(),
                serverdate: firebase.database.ServerValue.TIMESTAMP,
                type: this.state.type,
            })
        }
    }
}

class MyChat extends Component{
    constructor(props){
        super(props);

        this.creatorid = this.props.item.creatorid;
        this.type = this.props.item.type;
        this.message = this.props.item.message;
        this.type = this.props.item.type;

        this.state = {
            username: '',
            image: '',
        }
    }
    
    componentDidMount() {
        firebase.firestore().collection("users").doc(this.creatorid).get().then((doc)=>{
            if(doc.exists){
                this.setState({
                    username: doc.data().username,
                    image: doc.data().image,
                })
            }
        })
    }

    render() {
        return (
            <View style={styles.mychatbox}>
                <View style={{marginRight: 10}}>
                    <Text numberOfLines={1} style={styles.mychatname}>{this.state.username}</Text>
                    {this.getTypeHeader()}
                    <Text style={{textAlign: 'right', padding: 5, maxWidth: width*0.6, borderBottomRightRadius: 5, borderBottomLeftRadius: 5, backgroundColor: this.getColor()}}>{this.message}</Text>
                </View>
                <Image
                    style={styles.myimage}
                    source={{uri: this.state.image==''? null:this.state.image}}
                ></Image>
            </View>
        );
    }

    getTypeHeader() {
        if(this.type=='tohire'){
            return (
                <Text style={{fontSize: 10, alignSelf: 'flex-end', color: 'white', backgroundColor: '#639fff', paddingLeft: 5, paddingRight: 5, borderTopRightRadius: 5, borderTopLeftRadius: 5}}>Errand Offer</Text>
            )
        }
        if(this.type=='torequest'){
            return (
                <Text style={{fontSize: 10, alignSelf: 'flex-end', color: 'white', backgroundColor: '#f5e042', paddingLeft: 5, paddingRight: 5, borderTopRightRadius: 5, borderTopLeftRadius: 5}}>Finding Errand</Text>
            )
        }
    }

    getColor(){
        if(this.type=='default'){
            return 'white'
        }
        if(this.type=='tohire'){
            return '#639fff'
        }
        if(this.type=='torequest'){
            return '#f5e042'
        }
    }
}

class OthersChat extends Component{
    constructor(props){
        super(props);

        this.creatorid = this.props.item.creatorid;
        this.type = this.props.item.type;
        this.message = this.props.item.message;
        this.type = this.props.item.type;

        this.state = {
            username: '',
            image: '',
        }
    }

    componentDidMount() {
        firebase.firestore().collection("users").doc(this.creatorid).get().then((doc)=>{
            if(doc.exists){
                this.setState({
                    username: doc.data().username,
                    image: doc.data().image,
                })
            }
        })
    }

    render() {
        return (
             <View style={styles.otherschatbox}>
                 <TouchableOpacity
                    onPress={()=>this.props.navigation.navigate("View Profile", {id: this.creatorid})}
                 >
                    <Image
                        style={styles.othersimage}
                        source={{uri: this.state.image==''? null:this.state.image}}
                    ></Image>
                 </TouchableOpacity>
                 <View style={{marginLeft: 10}}>
                    <Text numberOfLines={1} style={styles.otherchatname}>{this.state.username}</Text>
                    {this.getTypeHeader()}
                    <Text style={{padding: 5, maxWidth: width*0.6, borderBottomRightRadius: 5, borderBottomLeftRadius: 5, backgroundColor: this.getColor()}}>{this.message}</Text>
                 </View>
             </View>
        );
    }

    getTypeHeader() {
        if(this.type=='tohire'){
            return (
                <Text style={{fontSize: 10, alignSelf: 'flex-start', color: 'white', backgroundColor: '#639fff', paddingLeft: 5, paddingRight: 5, borderTopRightRadius: 5, borderTopLeftRadius: 5}}>Errand Offer</Text>
            )
        }
        if(this.type=='torequest'){
            return (
                <Text style={{fontSize: 10, alignSelf: 'flex-start', color: 'white', backgroundColor: '#f5e042', paddingLeft: 5, paddingRight: 5, borderTopRightRadius: 5, borderTopLeftRadius: 5}}>Finding Errand</Text>
            )
        }
    }

    getColor(){
        if(this.type=='default'){
            return 'white'
        }
        if(this.type=='tohire'){
            return '#639fff'
        }
        if(this.type=='torequest'){
            return '#f5e042'
        }
    }
}

const styles = StyleSheet.create({
    mychatbox: {
        width: width*0.9,
        padding: 10,
        flexDirection: 'row',
        alignSelf: 'flex-end',
        justifyContent: 'flex-end'
    },
    myimage: {
        alignSelf: 'flex-end',
        width: width*0.1,
        height: width*0.1,
        borderRadius: 100,
    },
    otherschatbox: {
        width: width*9,
        padding: 10,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start'
    },
    othersimage: {
        alignSelf: 'flex-start',
        width: width*0.1,
        height: width*0.1,
        borderRadius: 100,
    },
    otherchatname: {
        fontSize: 10,
        alignSelf: 'flex-start',
        maxWidth: width*0.3, 
    },
    mychatname: {
        fontSize: 10,
        alignSelf: 'flex-end',
        maxWidth: width*0.3, 
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

export default GlobalChatPage;