import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import Dialog from "react-native-dialog";
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

const width = Dimensions.get('window').width;

export class Profile extends Component {
    constructor(props){
        super(props);
        
        this.id = firebase.auth().currentUser.uid;

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
            btn1visible: false,
            loading: false,
            title: '',
            description: '',
            type: '',
            input: '',
            refresh: false,
        }
        this.titles = [
            'Modify username',
            'Modify realname',
            'Modify phone number',
            'Modify address',
            'Modify postcode',
            'Modify city',
            'Modify state',
            'Modify country',
            'Modify user description'
        ]
        this.descriptions = [
            'Make changes to username',
            'Make changes to real name',
            'Make changes to phone number',
            'Make changes to address',
            'Make changes to postcode',
            'Make changes to city',
            'Make changes to state',
            'Make changes to country',
            'Make changes to user description',
        ]
    }

    componentDidMount() {
        this.readProfile()
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
    
    readProfile(){
        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(doc => {
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
            if(this.state.image == '' || this.state.image == null){
                firebase.storage().ref('/images/Default Images/blankprofile.png').getDownloadURL().then((image) => this.setState({image: image}))
            }
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
                            <TouchableOpacity                            
                                onPress={() => this.uploadImage()}>               
                                <Image
                                    style={styles.profileImage}
                                    source={this.state.image? {uri: this.state.image}:null}
                                    resizeMethod='scale'
                                    resizeMode='cover'>
                                </Image>
                            </TouchableOpacity>

                            <View style={{marginTop: 5, marginLeft: 7}}>
                                <Text style={{opacity: 0.6,fontSize: 12}}> Joined {this.differenceInDays(new Date().getTime(),this.state.registerdate)}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'column', marginTop: 20}}>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Username</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.usernameinfo}>{this.state.username}</Text>
                                {/* <Icon
                                    name='pencil-outline' 
                                    style={styles.icon}
                                    onPress={() => this.showDialog('0')}
                                ></Icon> */}
                                {/* <Button title="Show dialog" onPress={() => this.showDialog('0')} /> */}
                            </View>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Real Name</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.info}>{this.state.realname}</Text>
                                {/* <Icon
                                    name='pencil-outline' 
                                    style={styles.icon}
                                    onPress={() => this.showDialog('1')}
                                ></Icon> */}
                            </View>
                            <Text style={{marginLeft: 10, fontSize: 10, textDecorationLine: 'underline',opacity: 0.6}}>Phone</Text>
                            <View style={styles.uppersection}>
                                <Text style={styles.info}>{this.state.phone}</Text>
                                <Icon
                                    name='pencil-outline' 
                                    style={styles.icon}
                                    onPress={() => this.showDialog('2')}
                                ></Icon>
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
                                onPress={()=>{this.props.navigation.navigate("Gallery")}}>
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
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('3')}
                            ></Icon>
                        </View>
                        
                        <Text style={styles.addressheader}>Postcode</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.postcode}</Text>
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('4')}
                            ></Icon>
                        </View>

                        <Text style={styles.addressheader}>City</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.city}</Text>
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('5')}
                            ></Icon>
                        </View>

                        <Text style={styles.addressheader}>State</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.countrystate}</Text>
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('6')}
                            ></Icon>
                        </View>

                        <Text style={styles.addressheader}>Country</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.country}</Text>
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('7')}
                            ></Icon>
                        </View>
                    </View>
                    
                    <View style={{borderWidth: 0.7}}>
                        <Text style={styles.descheader}>Description</Text>
                        <View style={styles.address}>
                            <Text style={{fontSize: 20}}>{this.state.details}</Text>
                            <Icon
                                name='pencil-outline' 
                                style={styles.icon}
                                onPress={() => this.showDialog('8')}
                            ></Icon>
                        </View>
                    </View>

                    {/* <TouchableOpacity
                            style={{backgroundColor: '#ff0303', alignSelf:'center', width: width*0.25, height: width*0.08, paddingTop: 5, marginTop: 30, marginBottom: 30, borderRadius: 20}}
                            onPress={() => this.signOut()}>
                        <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff'}}>Sign Out</Text>
                    </TouchableOpacity> */}
                </View>

                <View>
                    <Dialog.Container visible={this.state.btn1visible}>
                        <Dialog.Title>{this.state.title}</Dialog.Title>
                        <Dialog.Description>{this.state.description}</Dialog.Description>
                        {this.state.type=='2'? (<Dialog.Input keyboardType='phone-pad' onChangeText={(input) => this.setState({input: input.trim()})}/>)
                        :(<Dialog.Input onChangeText={(input) => this.setState({input: input.trim()})}/>
                        )}
                        <Dialog.Button label="Cancel" onPress={() => this.setState({btn1visible: false, input: ''})} />
                        <Dialog.Button label="Ok" onPress={() => this.checkChange()} />
                    </Dialog.Container>
                </View>

                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
                                
            </ScrollView>
        )
    }

    uploadImage = async () => {
        const path = firebase.storage().ref('/images/User Images/Profile Images/'+firebase.auth().currentUser.uid+'.jpg');
        ImagePicker.launchImageLibraryAsync({
            mediaType: 'photo',
            height: 150,
            width: 150,
        }).then(async (response)=> {  
            if(response.uri!=null){
                const result = await fetch(response.uri)
                console.log(response.uri)
                const blob = await result.blob()
                this.setState({loading: true})
                path.put(blob).then(()=>{
                    firebase.storage().ref('/images/User Images/Profile Images/'+firebase.auth().currentUser.uid+'.jpg').getDownloadURL().then((data)=>{
                        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                            image: data
                        }).then(()=>this.setState({loading: false},()=>this.readProfile()))
                    })
                })
            }
        })         
    }

    showDialog(type){
        this.setState({btn1visible: true})
        this.setState({type: type})
        this.setState({title: this.titles[parseInt(type)]})
        this.setState({description: this.descriptions[parseInt(type)]})
    }

    checkChange(){
        if(this.state.type == '0'){
            if(this.validateUsername(this.state.input)){
                this.setState({username: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '1'){
            if(this.validateRealname(this.state.input)){
                this.setState({realname: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '2'){
            if(this.validatePhone(this.state.input)){
                this.setState({phone: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '3'){
            if(this.validateAddress(this.state.input)){
                this.setState({address: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '4'){
            if(this.validatePostcode(this.state.input)){
                this.setState({postcode: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '5'){
            if(this.validateCommon(this.state.input)){
                this.setState({city: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '6'){
            if(this.validateCommon(this.state.input)){
                this.setState({countrystate: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '7'){
            if(this.validateCommon(this.state.input)){
                this.setState({country: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
        else if(this.state.type == '8'){
            if(this.validateDetails(this.state.input)){
                this.setState({details: this.state.input},()=>this.saveProfile())
                this.setState({input: ''})
            }
            else {
                console.log('Save Failure')
            }
        }
    }

    saveProfile(){
        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            username: this.state.username,
            realname: this.state.realname,
            phone: this.state.phone,
            address: this.state.address,
            postcode: this.state.postcode,
            city: this.state.city,
            countrystate: this.state.countrystate,
            country: this.state.country,
            details: this.state.details,
        }).then(()=>{
            this.readProfile()
        })
        this.setState({btn1visible: false})
    }   
    validateUsername = (username) => {
        if((username.indexOf(' ') >= 0) || (/\s/.test(username)) || (!username.replace(/\s/g, '').length) || (username.length < 6) || (username.length > 20)){
            alert('Please make sure that the username does not have any spaces and is 6 - 20 characters long')
            return false
        }
        else {
            return true
        }
    }
    validateDetails(details) {
        if(details.length < 20 || details.length > 1000 || (!details.replace(/\s/g, '').length)) {
            console.log("Invalid details")
            alert('Description is only allowed to be 20 - 1000 characters long')
            return false
        }
        else {
            console.log("Valid Details")
            return true
        }
    }
    validateRealname(realname){
        if((realname.length < 4) || (realname.length > 50) || (!realname.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            alert('Please make sure that the real name has 4 - 50 characters')
            return false
        }
        else{
            return true
        }
    }
    validatePhone(phone){
        if((phone.length < 7) || (phone.length > 20) || (!phone.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            alert('Please make sure that the phone number is correct')
            return false
        }
        else{
            return true
        }
    }
    validateAddress(address){
        if((address.length < 8) || (address.length > 100) || (!address.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            alert('Please make sure that the address is correct')
            return false
        }
        else{
            return true
        }
    }
    validatePostcode(postcode){
        if((postcode.length < 4) || (postcode.length > 15) || (!postcode.replace(/\s/g, '').length) || (/\s/.test(postcode)) ){
            console.log("Invalid Information")
            alert('Please make sure that the postcode is correct')
            return false
        }
        else{
            return true
        }
    }
    validateCommon(common){
        if((common.length < 1) || (common.length > 50) || (!common.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            alert('Please make sure that all of the details are correct')
            return false
        }
        else{
            return true
        }
    }
    // signOut(){
    //     firebase.auth().signOut().then(() => {
    //         if(firebase.auth().currentUser==null){
    //             console.log("Logged Out")
    //             return () => subscriber()
    //         }
    //         else{
    //             console.log("Failed Log Out")
    //         }
    //     });
    // }
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        width: 50,
        top: 0,
        bottom: 0,
      },
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
        marginLeft: 10,
        paddingBottom: 20,
        paddingTop: 5,
        paddingRight: 20,
        paddingLeft: 5,
        flexDirection: 'row',
        alignSelf: 'flex-start',
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
});

export default Profile
