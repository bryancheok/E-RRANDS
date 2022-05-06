import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet, Dimensions } from 'react-native';
import Header from '../Header';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class PendingErrands extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <View style={{flex:1, minHeight: height, minWidth: width, marginTop:50}}>

                <Header navigation={this.props.navigation}/>

                
            </View>
        )
    }
}

export default PendingErrands