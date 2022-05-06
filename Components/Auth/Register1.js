import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Toast from 'react-native-toast-message';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class Register1 extends Component{

    constructor(props){
        super(props);

        this.state = {
            username: '',
            email: '',
            password: '',
            validEmail: false,
        }
    }

    render(){
        return (
            <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center'}}>

                <View style={{alignSelf: 'center', height: 15, flexDirection: 'row'}}>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                </View>

                <View>
                    <Text style={styles.title}>Registration</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Username</Text>
                        <TextInput style={styles.textinput} maxLength={20} onChangeText={(username) => this.setState({username: username.trim()})}></TextInput>
                        <Text style={styles.hint}>6 - 20 characters, spaces not allowed</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Email</Text>
                        <TextInput style={styles.textinput} onChangeText={(email) => this.findEmail(email.trim())}></TextInput>
                        {this.state.validEmail && <Text style={styles.invalidEmail}>This Email Is Already Registered</Text>}
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Password</Text>
                        <TextInput style={styles.textinput} placeholder='min 6 characters' secureTextEntry={true} onChangeText={(password) => this.setState({password: password})}></TextInput>
                    </View>
                </View>
                
                <View style={styles.btncontainer}>
                    <TouchableOpacity
                        onPress={() => this.checkInfo()}
                    ><Icon
                        name='chevron-right'
                        style={{fontSize: 50, borderRadius: 50, backgroundColor: '#f5a742', padding: 20, marginBottom: 20}}
                    ></Icon></TouchableOpacity>
                </View>
                
            </ScrollView>
        )
    }

    validateMailStr = (email) => {
        const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        
        return expression.test(String(email).toLowerCase())
    }

    findEmail(email) {
        this.setState({email})
        
        firebase.firestore().collection('users').where("email","==",email).get().then(doc => {
            console.log('Total users: ', doc.size);
            if(doc.size > 0){
                this.setState({validEmail: true})
            }
            else {
            this.setState({validEmail: false})
            }
        });
    }

    validateUsername = (username) => {
        if((username.indexOf(' ') >= 0) || (/\s/.test(username)) || (username.length < 6) || (username.length > 20)){
            return false
        }
        else {
            return true
        }
    }

    validatePassword = (password) => {
        if(password.length < 6){
            return false
        }
        else {
            return true
        }
    }

    checkInfo() {
        const a = this.validateMailStr(this.state.email);
        const b = this.validateUsername(this.state.username);
        const c = this.validatePassword(this.state.password);
        if(a){
            console.log("is an email")
        }
        else {
            console.log("not an email")
        }
        if(b){
            console.log("valid username");
        }
        else {
            console.log("invalid username")
        }
        if(c){
            console.log("valid password");
        }
        else {
            console.log("invalid password")
        }
        if(a && b && c && (this.state.validEmail == false)){
            console.log("Accepted")
            this.props.navigation.navigate("Personal Details", {username: this.state.username, email: this.state.email.toLowerCase(), password: this.state.password})
        }
        else {
            console.log("Denied")
            Toast.show({
                type: 'error',
                text1: 'Invalid Info',
                text2: 'Please ensure all details are correct'
            })
            console.log(this.state)
        }
    }

    // register() {
    //     const username = this.state.username;
    //     const email = this.state.email;
    //     const password = this.state.password;

    //     firebase.auth().createUserWithEmailAndPassword(email,password).then((result) => {
    //         firebase.firestore().collection("users")
    //             .doc(firebase.auth().currentUser.uid)
    //             .set({
    //                 username,
    //                 email,
    //             })
    //         console.log(result)
    //     })
    //     .catch((error) => {
    //         console.log(error)
    //     })
    // }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        alignSelf: 'center',
        marginTop: height*0.07,
        fontWeight: 'bold'
    },
    form: {
        marginTop: 50,
    },
    section: {
        width: width*0.65,
        alignSelf: 'center',
        marginBottom: 30,
    },
    heading: {
        alignSelf: 'flex-start',
        fontSize: 15,
    },
    hint : {
        alignSelf: 'flex-start',
        fontSize: 12,
    },
    textinput: {
        backgroundColor: '#d6d6d6',
        padding: 5,
        borderRadius: 10,
    },
    invalidEmail: {
        alignSelf: 'flex-end',
        paddingTop: 5,
        fontSize: 10,
        color: '#fc2803',
    },
    btncontainer: {
        alignSelf: 'center',
        marginTop: height*0.05,
        flexDirection: 'row',
    },
})

export default Register1