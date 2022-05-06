import React, { Component } from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Toast from 'react-native-toast-message';

const {height} = Dimensions.get('window');
const width = Dimensions.get('window').width;

export class Register3 extends Component{
    constructor(props){
        super(props)
        
        this.state = {
            details: '',
        }

        console.log(this.props.route.params.username , this.props.route.params.email, this.props.route.params.password, this.props.route.params.username, this.props.route.params.phone, this.props.route.params.address1, this.props.route.params.address2, this.props.route.params.postcode, this.props.route.params.city, this.props.route.params.countrystate, this.props.route.params.country)
    }
    
    render(){
        return (
            <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center'}}>

                <View style={{alignSelf: 'center', height: 15, flexDirection: 'row'}}>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                </View>

                <View style={{marginTop: height*0.1}}>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Tell Us More About Yourself</Text>
                        <TextInput style={styles.textinput} maxLength={1000} placeholder='Description' textAlignVertical={'top'} multiline={true} onChangeText={(details) => this.setState({details: details.trim()})}></TextInput>
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

    checkInfo() {
        if(this.state.details.length < 20 || this.state.details.length > 1000 || (!this.state.details.replace(/\s/g, '').length)) {
            console.log("Invalid description")
            Toast.show({
                type: 'error',
                text1: 'Invalid Info',
                text2: 'Description is only allowed to be 20 - 1000 characters long'
            })
        }
        else {
            console.log("Valid description")
            this.props.navigation.navigate("Skills", {username: this.props.route.params.username, email: this.props.route.params.email, password: this.props.route.params.password, realname: this.props.route.params.realname, phone: this.props.route.params.phone, address: this.props.route.params.address, postcode: this.props.route.params.postcode, city: this.props.route.params.city, countrystate: this.props.route.params.countrystate, country: this.props.route.params.country, details: this.state.details})
        }
    }
}

const styles = StyleSheet.create({
    section: {
        width: width*0.8,
        alignSelf: 'center',
        marginBottom: 10,
    },
    heading: {
        alignSelf: 'flex-start',
        fontSize: 20,
        alignSelf: 'center'
    },
    textinput: {
        marginTop: 50,
        height: height*0.3,
        borderWidth: 0.7,
        borderRadius: 5,
        backgroundColor: 'white',
        padding: 5,
    },
    btncontainer: {
        alignSelf: 'center',
        marginTop: height*0.05,
        flexDirection: 'row',
    },
})

export default Register3