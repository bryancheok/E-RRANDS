import React, { Component } from 'react'
import { View, Text, Button, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class Notifications extends Component {
    constructor(props){
        super(props);
        
        this.user = firebase.auth().currentUser.uid
        this.state = {
            notif: {
                id: '',
                type: '',
                serverdate: '',
                new: false,
            },
            notifications: []
        }
    }

    componentDidMount() {
        firebase.database().ref().child("notifications").child(this.user).orderByChild("serverdate").on('value', snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach(data=>{
                    if(data.val().errandid!=null){
                        this.setState({
                            notif: {
                                id: data.val().id,
                                type: data.val().type,
                                serverdate: data.val().serverdate,
                                new: data.val().new,
                                errandid: data.val().errandid
                            },
                        })
                    }
                    else {
                        this.setState({
                            notif: {
                                id: data.val().id,
                                type: data.val().type,
                                serverdate: data.val().serverdate,
                                new: data.val().new,
                                userid: data.val().userid
                            },
                        })
                    }
                    arr.push(data.val())
                })
                this.setState({notifications: arr.reverse()})
            }
            else {
                this.setState({notifications: arr.reverse()})
            }
        })
    }

    componentWillUnmount() {
        firebase.database().ref().child("notifications").child(this.user).orderByChild("serverdate").off('value')
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width, alignSelf: 'center'}}>

                <FlatList
                    data={this.state.notifications}
                    renderItem={({item,index})=>
                        {return this.getNotifType(item,index)}
                    }
                    keyExtractor={(item, index) => index.toString()}
                ></FlatList>
                
            </View>
        )
    }

    getErrand(notifid,id) {
        this.props.navigation.navigate("Errand Details", {errandid: id})
        firebase.database().ref().child("notifications").child(firebase.auth().currentUser.uid).child(notifid).update({
            new: false
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

    getUser(notifid,id) {
        this.props.navigation.navigate("View Profile", {id: id})
        firebase.database().ref().child("notifications").child(firebase.auth().currentUser.uid).child(notifid).update({
            new: false
        })
    }
    
    getTextColor(read) {
        if(read) {
            return 'black'
        }
        else return '#a8a8a8'
    }
    
    getNotifType(item,index) {
        if(item.type=='request accepted'){
            return this.errandNotifBar(item,'Your request for an errand has been accepted !')
        }
        if(item.type=='errand requested'){
            return this.errandNotifBar(item,'Your errand has received a request !')
        }
        if(item.type=='errand received'){
            return this.errandNotifBar(item,'You received an errand.')
        }
        if(item.type=='errand accepted'){
            return this.errandNotifBar(item,'You errand has been accepted !')
        }
        if(item.type=='errand closed'){
            return this.errandNotifBar(item,'Your errand has been closed.')
        }
        if(item.type=='errand rejected'){
            return this.errandNotifBar(item,'Your errand has been rejected.')
        }
        if(item.type=='errand pending complete'){
            return this.errandNotifBar(item,'An errand is almost completed !')
        }
        if(item.type=='errand pending cancel'){
            return this.errandNotifBar(item,'An errand is pending to be cancelled.')
        }
        if(item.type=='errand completed'){
            return this.errandNotifBar(item,'An errand has been completed !')
        }
        if(item.type=='errand cancelled'){
            return this.errandNotifBar(item,'An errand has been cancelled')
        }
        if(item.type=='user pending'){
            return (
                <TouchableOpacity
                    style={styles.notif}
                    onPress={()=>this.getUser(item.id,item.userid)}
                >
                    <Icon
                        style={{fontSize: 20, marginRight: 10, color: this.getTextColor(item.new)}}
                        name='account-outline'
                    ></Icon>
                    <Text style={{color: this.getTextColor(item.new), width: width*0.6}}>A user wants to get to know you.</Text>
                    <Text style={styles.textdate}>{this.differenceInDays(new Date().getTime(),item.serverdate)}</Text>
                </TouchableOpacity>
            )
        }
    }

    errandNotifBar(item,text) {
        return (
            <TouchableOpacity
                style={styles.notif}
                onPress={()=>this.getErrand(item.id,item.errandid)}
            >
                <Icon
                    style={{fontSize: 20, marginRight: 10, color: this.getTextColor(item.new)}}
                    name='briefcase-outline'
                ></Icon>
                <Text style={{color: this.getTextColor(item.new), width: width*0.6}}>{text}</Text>
                <Text style={styles.textdate}>{this.differenceInDays(new Date().getTime(),item.serverdate)}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    notif: {
        alignItems: 'center', 
        alignSelf: 'center',
        padding: 20, 
        width: width*0.95 ,
        flexDirection: 'row',
        borderBottomWidth: 0.2,
    },
    textdate: {
        fontSize: 12,
        position: 'absolute',
        right: width* 0.02,
        bottom: height*0.01,
    }
})

export default Notifications