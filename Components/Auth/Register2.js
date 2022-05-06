import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Toast from 'react-native-toast-message';

const {height} = Dimensions.get('window');
const width = Dimensions.get('window').width;

export class Register2 extends Component{
    constructor(props){
        super(props);

        this.state = {
            realname: '',
            phone: '',
            address: '',
            postcode: '',
            city: '',
            countrystate: '',
            country: '',
        }
        console.log(this.props.route.params.username , this.props.route.params.email, this.props.route.params.password)
    }
    
    render(){
        return (
            <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center'}}>

                <View style={{alignSelf: 'center', height: 15, flexDirection: 'row'}}>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: 'white', width: width*0.25, flex:1}}></View>
                </View>

                <View style={styles.form}>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Real Name</Text>
                        <TextInput style={styles.textinput} maxLength={50} placeholder='min 4 characters' onChangeText={(realname) => this.setState({realname: realname.trim()})}></TextInput>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Phone</Text>
                        <TextInput style={styles.textinput} maxLength={20} keyboardType='phone-pad' onChangeText={(phone) => this.setState({phone: phone.trim()})}></TextInput>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Location Address</Text>
                        <TextInput style={styles.textinput} maxLength={100} placeholder='min 8 characters' onChangeText={(address) => this.setState({address: address.trim()})}></TextInput>
                    </View>

                    <View style={styles.smallsection}>
                        <View style={styles.minisection1}>
                            <Text style={styles.heading}>Postcode</Text>
                            <TextInput style={styles.leftinput} maxLength={15} onChangeText={(postcode) => this.setState({postcode: postcode.trim()})}></TextInput>
                        </View>
                        <View style={styles.minisection2}>
                            <Text style={styles.heading}>City</Text>
                            <TextInput style={styles.rightinput} maxLength={50} onChangeText={(city) => this.setState({city: city.trim()})}></TextInput>
                        </View>
                    </View>
                    
                    <View style={styles.smallsection}>
                        <View style={styles.minisection1}>
                            <Text style={styles.heading}>State</Text>
                            <TextInput style={styles.leftinput} maxLength={50} onChangeText={(countrystate) => this.setState({countrystate: countrystate.trim()})}></TextInput>
                        </View>
                        <View style={styles.minisection2}>
                            <Text style={styles.heading}>Country</Text>
                            <TextInput style={styles.rightinput} maxLength={50} onChangeText={(country) => this.setState({country: country.trim()})}></TextInput>
                        </View>
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
        if((this.state.realname.length < 4) || (this.state.realname.length > 50) || (!this.state.realname.replace(/\s/g, '').length) || (this.state.phone.length < 7) || (this.state.phone.length > 20) || (!this.state.phone.replace(/\s/g, '').length) || (this.state.address.length < 8) || (this.state.address.length > 100) || (!this.state.address.replace(/\s/g, '').length) || (this.state.postcode.length < 4) || (this.state.postcode.length > 15) || (/\s/.test(this.state.postcode)) || (!this.state.postcode.replace(/\s/g, '').length) || (this.state.city.length < 1) || (this.state.city.length > 50) || (!this.state.city.replace(/\s/g, '').length) || (this.state.countrystate.length < 1) || (this.state.countrystate.length > 50) ||(!this.state.countrystate.replace(/\s/g, '').length) || (this.state.country.length < 1) || (this.state.country.length > 50) || (!this.state.country.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            Toast.show({
                type: 'error',
                text1: 'Invalid Info',
                text2: 'Please ensure all details are correct'
            })
        }
        else {
            this.props.navigation.navigate("Description", {username: this.props.route.params.username, email: this.props.route.params.email, password: this.props.route.params.password, realname: this.state.realname, phone: this.state.phone, address: this.state.address, postcode: this.state.postcode, city: this.state.city, countrystate: this.state.countrystate, country: this.state.country})
        }
    }
}

const styles = StyleSheet.create({
    form: {
        marginTop: height*0.1,
    },
    section: {
        width: width*0.65,
        alignSelf: 'center',
        marginBottom: 10,
    },
    heading: {
        alignSelf: 'flex-start',
        fontSize: 15,
    },
    textinput: {
        backgroundColor: '#d6d6d6',
        padding: 5,
        borderRadius: 10,
    },
    smallsection:{
        width: width*0.65,
        alignSelf: 'center',
        marginBottom: 10,
        marginTop: 5,
        flexDirection: 'row',
    },
    minisection1: {
        alignSelf: 'center',
        marginBottom: 10,
        flex: 1,
        marginRight: width*0.05
    },
    minisection2: {
        alignSelf: 'center',
        marginBottom: 10,
        flex: 1,
    },
    leftinput: {
        backgroundColor: '#d6d6d6',
        padding: 5,
        borderRadius: 10,
        flex: 1
    },
    rightinput: {
        backgroundColor: '#d6d6d6',
        padding: 5,
        borderRadius: 10,
        flex: 1
    },
    btncontainer: {
        alignSelf: 'center',
        marginTop: height*0.05,
        flexDirection: 'row',
    },
})

export default Register2