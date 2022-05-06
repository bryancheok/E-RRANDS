import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions } from 'react-native';
import Header from '../Header';

const width = Dimensions.get('window').width;

export class ActiveErrands extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width, marginTop:50}}>

                <Header navigation={this.props.navigation}/>

                
            </View>
        )
    }
}

export default ActiveErrands
