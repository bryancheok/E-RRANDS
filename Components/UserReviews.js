import React, { Component } from 'react'
import { View, Text, Modal, RefreshControl, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog from "react-native-dialog";
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Toast from 'react-native-toast-message';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class UserReviews extends Component {
    constructor(props){
        super(props);

        this.id = this.props.route.params.id;
        this.state = {
            reviews: [],
            refresh: false,
        }
    }

    componentDidMount() {
        this.readReviews()
    }

    readReviews() {
        firebase.firestore().collection("reviews").where("reviewedid","==",this.id).orderBy("serverdate","desc").get().then((doc)=>{
            const arr = []
            if(!doc.empty){
                doc.forEach(data=>{
                    arr.push(data.data())
                })
                this.setState({reviews: arr})
            }
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

    render() {
        return (
           <View style={{width: width}}>

               {this.getEmpty()}
               <FlatList
                    style={{width: width, padding: 10}}
                    data={this.state.reviews}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readReviews())}
                        />
                    }
                    renderItem={({item,index})=>
                        <View style={{width: width*0.95, backgroundColor: 'white', padding: 5, borderRadius: 5, marginBottom: 5}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', width: width*0.95}}>
                                <Icon
                                    name='star'
                                    style={{fontSize: 15, color: '#ff9238', marginRight: 5}}
                                ></Icon>
                                <Text>{item.star}</Text>
                                <Text style={{alignSelf: 'center', textAlign: 'right', width: width*0.8, fontSize: 12}}>{this.differenceInDays(new Date().getTime(),item.time)}</Text>
                            </View>
                            <View style={{width: width*0.95}}>
                                <Text numberOfLines={5} allowFontScaling={true}>{item.review}</Text>
                            </View>
                        </View>
                    }
                    keyExtractor={(item, index) => index.toString()}
               ></FlatList>
               
           </View>
        );
    }
    
    getEmpty() {
        if(this.state.reviews.length < 1) {
            return (
                <Text style={{marginTop: 40, alignSelf: 'center'}}>No Reviews</Text>
            )
        }
    }
}

export default UserReviews;