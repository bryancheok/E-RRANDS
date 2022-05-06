import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase/compat';
import "firebase/compat/firestore";

const width = Dimensions.get('window').width;

export class Requests extends Component {
    constructor(props){
        super(props);
        
        this.errandid = this.props.route.params.errandid;

        this.state = {
            requests: [],
            request: {
                id: '',
                creatorid: '',
                title: '',
                description: '',
                datecreated: '',
                image: '',
                read: true,
                username: '',
                refresh: false,
            },
        }
    }

    componentDidMount(){
        this.readRequests()
    }

    readRequests(){
        firebase.firestore().collection("requests").where("errandid","==",this.errandid).orderBy("serverdate","desc").get().then((data)=>{
            const arr = []
            data.forEach(doc=>{
                firebase.firestore().collection("users").doc(doc.data().creatorid).get().then(snapshot=>{
                    this.setState({
                        request: {
                            id: doc.id,
                            creatorid: doc.data().creatorid,
                            title: doc.data().title,
                            description: doc.data().description,
                            datecreated: doc.data().datecreated,
                            image: snapshot.data().image,
                            username: snapshot.data().username,
                            read: doc.data().read,
                        }
                    })
                    arr.push(this.state.request)
                    this.setState({requests: arr})
                    console.log("Requests found: ", this.state.requests.length)
                })
            })
        })
        this.setState({refresh: false})
    }
    
    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refresh}
                        onRefresh={()=>this.setState({refresh: true}, ()=>this.readRequests())}
                    />
                }>

                {this.showRequests()}
                
            </ScrollView>
        )
    }
    
    showRequests(){
        if(this.state.requests.length < 1){
            return (
                <View>
                    <Text style={{fontSize: 20, alignSelf: 'center', marginTop: 40}}>No requests found</Text>
                </View>
            )
        }
        else {
            return (
                <View>
                    {this.state.requests.map((item,i)=>{
                        return(
                            <Request key={i} request={item} i={i} navigation={this.props.navigation}/>
                        )
                    })}
                </View>
            )
        }
    }
}

class Request extends Component {
    constructor(props){
        super(props);

        this.state = this.props.request;
    }

    render() {
        return (
            <TouchableOpacity style={this.getColors(this.state.read)} key={this.props.i}
                onPress={()=>{
                    this.setState({read: true})
                    this.props.navigation.navigate("Request Detail", {requestid: this.state.id})
                }}
            >
                <TouchableOpacity
                    onPress={()=>this.props.navigation.navigate("View Profile", {id: this.state.creatorid})}
                >
                    <Image
                        source={{uri: this.state.image}}
                        style={styles.profileimage}
                        resizeMethod='scale'
                        resizeMode='cover'
                    ></Image>
                </TouchableOpacity>

                <View>
                    <Text style={styles.username}>{this.state.username}</Text>
                    <Text style={styles.title}>{this.state.title}</Text>
                    <Text style={styles.date}>Posted {this.differenceInDays(new Date().getTime(),this.state.datecreated)}</Text>
                </View>
                
            </TouchableOpacity>
        )
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

    getColors(read) {
        if(read){
            return {
                padding: 10,
                flexDirection: 'row',
                backgroundColor: '#d4d4d4',
                alignSelf: 'flex-start',
                width: width,
                borderBottomWidth: 0.2,
            }
        }
        else {
            return {
                padding: 10,
                flexDirection: 'row',
                backgroundColor: 'white',
                alignSelf: 'flex-start',
                width: width,
                borderBottomWidth: 0.2,
            }
        }
    }
}

const styles = StyleSheet.create({
    profileimage: {
        height: width*0.2,
        width: width*0.2,
        borderRadius: 100,
        backgroundColor: '#e0e0e0'
    },
    username: {
        marginLeft: 10,
        fontSize: 16,
        marginBottom: 5,
        width: 250,
    },
    title: {
        marginLeft: 10,
        marginBottom: 5,
        fontSize: 20,
        width: 250,
    },
    date: {
        marginLeft: 10,
        fontSize: 12,
        width: 250,
    },
})

export default Requests