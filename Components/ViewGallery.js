import React, { Component } from 'react'
import { View, Text, ScrollView, StyleSheet, Dimensions, Image, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class ViewGallery extends Component {
    constructor(props){
        super(props);

        this.id = this.props.route.params.id;

        this.state = {
            images: [],
            name: '',
            modalVisible: false,
            pickedimage: '',

            refresh: false,
        }
    }

    componentDidMount() {
        this.readGallery()
    }

    readGallery(){
        firebase.firestore().collection("users").doc(this.id).get().then(doc => {
            this.setState({name: doc.data().username})
            if(doc.data().gallery){
                this.setState({
                    images: doc.data().gallery.reverse(),
                }, () => console.log(this.state.images))
            }
        }).then(()=>{this.props.navigation.setParams({header: this.state.name})})
        this.setState({refresh: false})
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refresh}
                        onRefresh={()=>this.setState({refresh: true}, ()=>this.readGallery())}
                    />
                }>
                <View>
                    <Text style={styles.title}>{this.state.name}'s Gallery</Text>
                    <View style={{marginBottom: 50}}>
                        {this.state.images.map((item,i)=>{
                            return ( 
                                    <View key={i}>
                                        <TouchableOpacity
                                            onPress={()=>this.setState({modalVisible: true, pickedimage: item})}
                                        ><Image 
                                                style={styles.image}
                                                source={{uri: item}}  
                                                resizeMethod='resize'
                                                resizeMode='contain'  
                                            ></Image>
                                        </TouchableOpacity> 
                                    </View>
                                    )
                        })}
                    </View>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({modalVisible: false});
                    }}
                    ><TouchableOpacity
                        onPressIn={()=>this.setState({modalVisible: false})}
                    >
                        <View style={{height: height, width: width, backgroundColor: 'black'}}>
                            <Image
                                source={{uri: this.state.pickedimage}}
                                style={{height: height-50, width: width-10, alignSelf: 'center',marginTop: 10}}
                                resizeMethod='scale'
                                resizeMode='contain'
                            ></Image>
                        </View>
                    </TouchableOpacity>
                </Modal>

            </ScrollView>
        )
    }

}

const styles = StyleSheet.create({
    title: {
        width: width,
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontSize: 30,
        marginBottom: 30,
        marginTop: 10,
        fontWeight: 'bold',
    },
    image: {
        height:400,
        width:300,
        alignSelf: 'center', 
        marginTop: 10,
    },
})

export default ViewGallery