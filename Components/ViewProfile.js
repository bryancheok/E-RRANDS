import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";

const width = Dimensions.get('window').width;

export class Profile extends Component {
    constructor(props){
        super(props);
        
        this.id = this.props.route.params.id;
        this.user = firebase.auth().currentUser.uid;

        this.state = {
            image: '',
            username: '',
            email: '',
            realname: '',
            phone: '',
            address: '',
            postcode: '',
            city: '',
            countrystate: '',
            country: '',
            details: '',
            field: '',
            specialization: '',
            experience: '',
            registerdate: '',
            star: 0,
            rating: 0,
            reviews: 0,
            completed: 0,
            cancelled: 0,
            created: 0,
            hired: 0,
            permission: false,
            semipermission: false,
            addbtn: false,

            refresh: false,
        }
    }

    componentDidMount() {
        this.readProfile()
    }

    readProfile(){
        firebase.database().ref().child("relatedusers").child(this.id).child("added").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
            if(snapshot.exists()){
                this.setState({permission: true, semipermission: true, addbtn: false},()=>this.props.navigation.setParams({semiperm: this.state.semipermission, perm: this.state.permission}))
            }
            else {
                firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
                    if(snapshot.exists()){
                        this.setState({permission: false, semipermission: true, addbtn: false},()=>this.props.navigation.setParams({semiperm: this.state.semipermission, perm: this.state.permission}))
                    }
                    else {
                        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").child(this.id).on('value', snapshot=>{
                            if(snapshot.exists()){
                                this.setState({permission: false, semipermission: true, addbtn: true},()=>this.props.navigation.setParams({semiperm: this.state.semipermission, perm: this.state.permission}))
                            }
                            else {
                                firebase.database().ref().child("relatedusers").child(this.id).child("blocked").child(firebase.auth().currentUser.uid).on('value', snapshot=>{
                                    if(snapshot.exists()){
                                        this.setState({permission: false, semipermission: false, addbtn: false},()=>this.props.navigation.setParams({semiperm: this.state.semipermission, perm: this.state.permission}))
                                    }
                                    else {
                                        if(this.id!=firebase.auth().currentUser.uid){
                                            this.setState({permission: false, semipermission: false, addbtn: true},()=>this.props.navigation.setParams({semiperm: this.state.semipermission, perm: this.state.permission}))
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
        firebase.firestore().collection("users").doc(this.id).get().then(doc => {
            if(doc.data()!=null){
                this.setState({
                    image: doc.data().image,
                    username: doc.data().username,
                    email: doc.data().email,
                    realname: doc.data().realname,
                    phone: doc.data().phone,
                    address: doc.data().address,
                    postcode: doc.data().postcode,
                    city: doc.data().city,
                    countrystate: doc.data().countrystate,
                    country: doc.data().country,
                    details: doc.data().details,
                    field: doc.data().field,
                    specialization: doc.data().specialization,
                    experience: doc.data().experience,
                    registerdate: doc.data().registerdate,
                    rating: doc.data().rating,
                    reviews: doc.data().reviews,
                }, ()=>{
                    if(this.state.reviews > 0){
                        this.setState({star: parseFloat(this.state.rating/this.state.reviews)}) 
                    }
                })
            }
        }).then(()=>{
            this.props.navigation.setParams({header: this.state.username, id: this.id, username: this.state.username})
        }).then(()=>{
            firebase.firestore().collection("errands").where("status","==","Completed").where("creatorid","==",this.id).get().then((doc)=>{
                firebase.firestore().collection("errands").where("status","==","Completed").where("hiredid","==",this.id).get().then((doc2)=>{
                    const total = doc.size + doc2.size
                    this.setState({completed: total})
                })
            })
            firebase.firestore().collection("errands").where("status","==","Cancelled").where("creatorid","==",this.id).get().then((doc)=>{
                firebase.firestore().collection("errands").where("status","==","Cancelled").where("hiredid","==",this.id).get().then((doc2)=>{
                    const total = doc.size + doc2.size
                    this.setState({cancelled: total})
                })
            })
            firebase.firestore().collection("errands").where("creatorid","==",this.id).get().then((doc)=>{
                    this.setState({created: doc.size})
            })
            firebase.firestore().collection("errands").where("hiredid","==",this.id).get().then((doc)=>{
                this.setState({hired: doc.size})
            })
        })
        this.setState({refresh: false})
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

    componentWillUnmount() {
        firebase.database().ref().child("relatedusers").child(this.id).child("added").child(this.user).off('value')
        firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(this.user).off('value')
        firebase.database().ref().child("relatedusers").child(this.user).child("pending").child(this.id).off('value')
        firebase.database().ref().child("relatedusers").child(this.id).child("blocked").child(this.user).off('value')
    }

    render() {
        return (
            <ScrollView
                refreshControl={
                <RefreshControl
                    refreshing={this.state.refresh}
                    onRefresh={()=>this.setState({refresh: true}, ()=>this.readProfile())}
                />
                }>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{marginTop: 20, marginLeft: 7}}>              
                                <Image
                                    style={styles.profileImage}
                                    source={this.state.image? {uri: this.state.image}:null}
                                    resizeMethod='scale'
                                    resizeMode='cover'>
                                </Image>

                            <View style={{marginTop: 5, marginLeft: 7}}>
                                <Text style={{opacity: 0.6,fontSize: 12}}> Joined {this.differenceInDays(new Date().getTime(),this.state.registerdate)}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'column', marginTop: 20}}>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Username</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.usernameinfo}>{this.state.username}</Text>
                            </View>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Real Name</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.info}>{this.state.realname}</Text>
                            </View>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Phone</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.info}>{this.state.phone}</Text>
                            </View>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Email</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.info}>{this.state.email}</Text>
                            </View>
                        </View>
                    </View>

                    <View>
                        <View style={{ marginTop: 20, paddingBottom: 5, borderBottomWidth: 0.7, paddingTop: 3, alignSelf: 'flex-start', width: width}}>
                            <View style={{flexDirection: 'row', marginBottom: 5, alignSelf: 'flex-start', width: width*0.5}}>
                                <Text style={styles.statheader}>Field:</Text>
                                <Text style={styles.stat}>{this.state.field}</Text>
                            </View>
                            <View style={{flexDirection: 'row', marginBottom: 5, alignSelf: 'flex-start', width: width*0.5}}>
                                <Text style={styles.statheader}>Specialization:</Text>
                                <Text style={styles.stat}>{this.state.specialization}</Text>
                            </View>
                            <View style={{flexDirection: 'row', marginBottom: 5, alignSelf: 'flex-start', width: width*0.5}}>
                                <Text style={styles.statheader}>Experience:</Text>
                                <Text style={styles.stat}>{this.state.experience}</Text>
                            </View>

                            <View style={{alignSelf: 'center', marginTop: 10, alignItems: 'center', borderTopWidth: 0.5, width: width*0.95}}>
                                <TouchableOpacity
                                    onPress={()=>this.props.navigation.navigate("Reviews", {id: this.id})}
                                >   
                                    <View style={{flexDirection: 'row'}}>
                                        <Icon
                                            name='star'
                                            style={{fontSize: 15, alignSelf: 'center', marginRight: 5, color: '#ff9238'}}
                                        ></Icon>
                                        <Text>Rating</Text>
                                    </View>
                                    <Text style={{fontSize: 16, alignSelf: 'center', color: this.state.star>4?'#ff9238':'#787878'}}>{this.state.star}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{alignSelf: 'center', flexDirection: 'row', marginTop: 10, paddingBottom: 5, borderBottomWidth: 0.5, width: width*0.95}}>
                                
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text>Completed</Text>
                                    <Text>{this.state.completed}</Text>
                                </View>
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text>Cancelled</Text>
                                    <Text>{this.state.cancelled}</Text>
                                </View>
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text>Created</Text>
                                    <Text>{this.state.created}</Text>
                                </View>
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Text>Hired</Text>
                                    <Text>{this.state.hired}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={()=>{this.props.navigation.navigate("View Gallery", {id: this.id})}}>
                                <View style={{ marginTop: 10, alignSelf: 'center', width: width}}>
                                    <Text style={{backgroundColor: '#c2c2c2', padding: 5, textAlign: 'center'}}>User Gallery</Text>
                                </View>
                            </TouchableOpacity>
                        
                        </View>
                    </View>

                    <View style={{marginTop: 10}}>
                        <Text style={styles.addressheader}>Address</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.address}</Text>
                        </View>
                        
                        <Text style={styles.addressheader}>Postcode</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.postcode}</Text>
                        </View>

                        <Text style={styles.addressheader}>City</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.city}</Text>
                        </View>

                        <Text style={styles.addressheader}>State</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.countrystate}</Text>
                        </View>

                        <Text style={styles.addressheader}>Country</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.country}</Text>
                        </View>
                    </View>
                    
                    <View style={{borderWidth: 0.7}}>
                        <Text style={styles.descheader}>Description</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.details}</Text>
                        </View>
                    </View>

                    {this.getAddButton()}

                </View>
            </ScrollView>
        )
    }

    getAddButton(){ 
        if(this.state.addbtn){
            return (
                <View>
                    <TouchableOpacity
                        style={styles.addbtn}
                        onPress={()=>this.addUser()}
                    ><Text style={{fontSize: 20, textAlign: 'center'}}>Add</Text></TouchableOpacity>
                </View>
            )
        }  
    }

    addUser() {
        if(this.state.addbtn){
            firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").child(this.id).get().then((data)=>{
                if(data.exists()){
                    firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("pending").child(this.id).remove().then(()=>{
                        const server = firebase.database.ServerValue.TIMESTAMP
                        firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("added").child(this.id).set({
                            userid: this.id,
                            servertime: server,
                        }).then(()=>{
                            firebase.database().ref().child("relatedusers").child(this.id).child("added").child(firebase.auth().currentUser.uid).set({
                                userid: firebase.auth().currentUser.uid,
                                servertime: server,
                            })
                        })
                    })
                }
                else{
                    firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").child(this.id).get().then((data)=>{
                        if(data.exists()){
                            firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).child("blocked").child(this.id).remove().then(()=>{
                                firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(firebase.auth().currentUser.uid).set({
                                    userid: firebase.auth().currentUser.uid,
                                    servertime: firebase.database.ServerValue.TIMESTAMP,
                                }).then(()=>{
                                    const key = firebase.database().ref().child("notifications").child(this.id).push().key
                                    firebase.database().ref().child("notifications").child(this.id).child(key).set({
                                        id: key,
                                        type: 'user pending',
                                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                                        userid: firebase.auth().currentUser.uid,
                                        date: new Date().getTime(),
                                        new: true,
                                    })
                                })
                            })
                        }
                        else{
                            firebase.database().ref().child("relatedusers").child(this.id).child("pending").child(firebase.auth().currentUser.uid).set({
                                userid: firebase.auth().currentUser.uid,
                                servertime: firebase.database.ServerValue.TIMESTAMP,
                            }).then(()=>{
                                const key = firebase.database().ref().child("notifications").child(this.id).push().key
                                firebase.database().ref().child("notifications").child(this.id).child(key).set({
                                    id: key,
                                    type: 'user pending',
                                    serverdate: firebase.database.ServerValue.TIMESTAMP,
                                    userid: firebase.auth().currentUser.uid,
                                    date: new Date().getTime(),
                                    new: true,
                                })
                            })
                        }
                    })
                }
            })
        }
    }

    toChat() {
        this.props.navigation.navigate("Chat", {id: this.id})
    }

    toCreateErrands() {
        this.props.navigation.navigate("Create Private Errand", {privacy: false, receiver: this.id, username: this.state.username})
    }

    // optionsForUser() {
    //     if(this.state.permission==true){
    //         return (
    //             <View style={{backgroundColor: '#d9d9d9',marginTop: 5}}>
    //                 <View style={{flexDirection: 'row', alignSelf: 'center'}}>
    //                     <Icon
    //                         name='briefcase-outline'
    //                         style={styles.errandicon}
    //                         onPress={()=>this.toCreateErrands()}
    //                     ></Icon>
    //                     <Icon
    //                         name='forum-outline'
    //                         style={styles.chaticon}
    //                         onPress={()=>this.toChat()}
    //                     ></Icon>
    //                 </View>
    //             </View>
    //         )
    //     }
    //     if(this.state.semipermission==true && this.state.permission==false){
    //         return (
    //             <View style={{backgroundColor: '#d9d9d9',marginTop: 5}}>
    //                     <Icon
    //                         name='forum-outline'
    //                         style={styles.singleicon}
    //                         onPress={()=>this.toChat()}
    //                     ></Icon>
    //             </View>
    //         )
    //     }
    // }

}

const styles = StyleSheet.create({
    profileImage: {
        height: width*0.4,
        width: width*0.4,
        marginLeft: 10,
        borderRadius: 100,
        backgroundColor: '#e0e0e0'
    },
    uppersection: {
        marginLeft: 10,
        flexDirection: 'row',
        paddingRight: 20,
        width: width*0.5,
    },
    stat: {
        borderRadius: 5,
        marginLeft: 15,
        marginTop: 2,
        fontSize: 15,
        backgroundColor: '#ffa057',
        color: '#0059b8',
        alignSelf: 'flex-start',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 1,
        paddingBottom: 1,
        borderWidth: 0.8,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    statheader: {
        marginLeft: 15,
        marginTop: 2,
        fontSize: 15,
        width: width*0.4,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 1,
        paddingBottom: 1,
        opacity: 0.6,
        borderWidth: 0.4
    },
    errandicon: {
        fontSize: 40,
        marginTop: 5,
        marginRight: 50,
    },
    chaticon: {
        fontSize: 40,
        marginTop: 5,
        marginLeft: 50,
    },
    singleicon: {
        fontSize: 40,
        marginTop: 5,
        alignSelf: 'center'
    },
    usernameinfo: {
        fontWeight: 'bold',
        fontSize: 15, 
        alignSelf: 'flex-start',
    },
    info: {
        fontSize: 15, 
        alignSelf: 'flex-start',
    },
    address: {
        marginTop: 10,
        marginBottom: 5,
        paddingBottom: 20,
        paddingTop: 5,
        paddingRight: 20,
        paddingLeft: 5,
        flexDirection: 'row',
        alignSelf: 'center',
        width: width*0.95,
        backgroundColor: '#ffffff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addressheader: {
        marginLeft: 10, 
        fontSize: 10, 
        textDecorationLine: 'underline', 
        alignSelf: 'flex-start',
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 5,
        paddingLeft: 5,
        opacity: 0.6,
    },
    descheader: {
        marginLeft: 10, 
        fontSize: 15, 
        alignSelf: 'center',
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 5,
        paddingLeft: 5,
        marginTop: 10,
        textDecorationLine: 'underline',
    },
    icon: {
        fontSize: 20, 
        alignSelf: 'flex-start', 
        position: 'absolute',
        right: 0,
        marginLeft: 10, 
        marginTop: 5,
    },
    addbtn: {
        alignSelf: 'center', 
        marginTop: 10, 
        marginBottom: 10, 
        borderRadius: 30, 
        padding: 10, 
        backgroundColor: '#43e327',
        width: width*0.5,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 5,
    },
});

export default Profile
