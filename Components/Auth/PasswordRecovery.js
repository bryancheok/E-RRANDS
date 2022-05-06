import React, { Component } from 'react'
import { View, Text, RefreshControl, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog from "react-native-dialog";
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default class PasswordRecovery extends Component {
    constructor(props){
        super(props);

        this.state = {
            email: '',
            sent: false,
            sending: false,
        }
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width, alignItems: 'center'}}>

                <Text style={styles.header}>Recovery Email</Text>

                <TextInput style={styles.input} onChangeText={(input)=>this.setState({email: input.trim()})}></TextInput>

                <TouchableOpacity
                    style={styles.sendbtn}
                    onPress={()=>this.sendCode()}
                ><View style={{flexDirection: 'row'}}>
                    <Icon
                        name='email-send-outline'
                        style={{fontSize: 50, color: 'white'}}
                    ></Icon>
                </View>
                </TouchableOpacity>

                <View>
                    <Dialog.Container visible={this.state.sent}>
                        <Dialog.Title>Password recovery email sent</Dialog.Title>
                        <Dialog.Description>You can change your password using the recovery email sent.</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({sent: false})} />
                        <Dialog.Button style={styles.ok} label="Ok" onPress={() => this.props.navigation.goBack()} />
                    </Dialog.Container>
                </View>

                <Dialog.Container visible={this.state.sending} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.sending} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
            </View>
        )
    }
    
    sendCode() {
        this.setState({sending: true})
        if(this.validateMailStr(this.state.email)){
            firebase.auth().sendPasswordResetEmail(this.state.email).then(()=>{
                this.setState({sent: true, sending: false})
            })
        }
        else {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please make sure the email is correct'
            })
        }
    }
    
    validateMailStr = (email) => {
        const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        
        return expression.test(String(email).toLowerCase())
    }
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
    header: {
        marginTop: height*0.2,
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: width*0.6,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: height*0.07,
    },
    sendbtn: {
        backgroundColor: '#20fc03',
        borderRadius: 20,
        padding: 20,
    },
    ok: {
        marginLeft: 20,
        borderRadius: 10,
        backgroundColor: '#f59b42'
    }
})
