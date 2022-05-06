import React, { Component } from 'react'
import { View, Text, Modal, RefreshControl, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog from "react-native-dialog";
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import Toast from 'react-native-toast-message';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class ErrandDetails extends Component {
    constructor(props){
        super(props);

        this.type = this.props.route.params.type;
        this.errandid = this.props.route.params.errandid;
        this.user = firebase.auth().currentUser.uid;

        this.state = {
            title: '',
            description: '',
            address: '',
            postcode: '',
            city: '',
            countrystate: '',
            country: '', 
            field: '', 
            specialization: '', 
            experience: '',
            type: '',
            payment: '',
            images: [],
            creatorid: '',
            datecreated: '',
            privacy: true,
            status: '', 
            hiredate: '',
            receiverid: '',  
            receiverimage: '',
            receiverusername: '',
            hiredid: '',
            hiredimage: '',
            hiredusername: '',
            closedate: '',
            canceldate: '',
            pendingcanceldate: '',
            completedate: '',
            pendingcompletedate: '',
            keywords: [],   
            reviews: [],
            
            modalVisible: false,
            close: false,
            complete: false,
            cancel: false,
            accept: false,
            reject: false,
            selectedimage: '',

            creatorname: '',
            creatorimage: '',

            refresh: false,
        }
    }

    componentDidMount(){
        this.readErrandDetails()
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
    
    readErrandDetails(){
        firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
            if(doc.exists){
                this.setState({
                    title: doc.data().title,
                    description: doc.data().description,
                    address: doc.data().address,
                    postcode: doc.data().postcode,
                    city: doc.data().city,
                    countrystate: doc.data().countrystate,
                    country: doc.data().country, 
                    field: doc.data().field, 
                    specialization: doc.data().specialization, 
                    experience: doc.data().experience,
                    type: doc.data().type,
                    payment: doc.data().payment,
                    creatorid: doc.data().creatorid,
                    datecreated: doc.data().datecreated,
                    privacy: doc.data().privacy,
                    status: doc.data().status, 
                    keywords: doc.data().keywords,
                }, ()=> this.setPreferences())
                firebase.firestore().collection("users").doc(this.state.creatorid).get().then(data=>{
                    this.setState({
                        creatorname: data.data().username,
                        creatorimage: data.data().image,
                    },()=>this.props.navigation.setParams({creatorimage: this.state.creatorimage, creatorid: this.state.creatorid}))
                })
                if(doc.data().images!=null){
                    this.setState({images: doc.data().images})
                }
                if(doc.data().pendingcompletedate!=null){
                    this.setState({pendingcompletedate: doc.data().pendingcompletedate})
                }
                if(doc.data().pendingcanceldate!=null){
                    this.setState({pendingcanceldate: doc.data().pendingcanceldate})
                }
                if(doc.data().completedate!=null){
                    this.setState({completedate: doc.data().completedate})
                }
                if(doc.data().canceldate!=null){
                    this.setState({canceldate: doc.data().canceldate})
                }
                if(doc.data().closedate!=null){
                    this.setState({closedate: doc.data().closedate})
                }
                if(doc.data().hiredid!=null){
                    firebase.firestore().collection("users").doc(doc.data().hiredid).get().then((data)=>{
                        this.setState({
                            hiredid: doc.data().hiredid, 
                            hiredate: doc.data().hiredate,
                            hiredimage: data.data().image,
                            hiredusername: data.data().username,
                        },()=>this.props.navigation.setParams({creatorimage: this.state.creatorimage, creatorid: this.state.creatorid, hiredimage: this.state.hiredimage, hiredid: this.state.hiredid}))
                    })
                }
                if(doc.data().privacy==false){
                    firebase.firestore().collection("users").doc(doc.data().receiverid).get().then((data)=>{
                        this.setState({
                            receiverid: doc.data().receiverid, 
                            receiverimage: data.data().image,
                            receiverusername: data.data().username,
                        },()=>{
                            if(this.state.hiredid==null || this.state.hiredid==''){
                                this.props.navigation.setParams({creatorimage: this.state.creatorimage, creatorid: this.state.creatorid, receiverimage: this.state.receiverimage, receiverid: this.state.receiverid})
                            }
                        })
                    })
                }
                firebase.firestore().collection("reviews").where("reviewedid","==",this.state.creatorid).orderBy("serverdate","desc").limit(5).get().then((doc)=>{
                    const arr = []
                    if(!doc.empty){
                        doc.forEach(data=>{
                            arr.push(data.data())
                        })
                        this.setState({reviews: arr})
                    }
                })
            }
        }).then(()=>{
            firebase.database().ref().child("errands").child(this.user).child(this.errandid).once('value',snapshot=>{
                if(snapshot.exists()){
                    firebase.database().ref().child("errands").child(this.user).child(this.errandid).update({
                        new: false
                    })
                }
            })
        })
        this.setState({refresh: false})
    }

    setPreferences() {
        if(this.type=='browse'){
            if(this.state.field!='-'){
                firebase.firestore().collection("fieldpreferences").doc(this.state.field).get().then((doc)=>{
                    if(doc.exists){
                        firebase.firestore().collection("fieldpreferences").doc(this.state.field).update({
                            views: firebase.firestore.FieldValue.increment(1)
                            })
                    }
                    else {
                        firebase.firestore().collection("fieldpreferences").doc(this.state.field).set({
                            views: firebase.firestore.FieldValue.increment(1)
                        })
                    }
                }).then(()=>{
                    firebase.database().ref().child("userpreferences").child(this.user).child("fields").child(this.state.field).update({
                        views: firebase.database.ServerValue.increment(1)
                    })
                    firebase.database().ref().child("userpreferences").child(this.user).child("specializations").child(this.state.specialization).update({
                        views: firebase.database.ServerValue.increment(1)
                    })
                    firebase.database().ref().child("userpreferences").child(this.user).child("experiences").child(this.state.experience).update({
                        views: firebase.database.ServerValue.increment(1)
                    })
                })
            }
        }
    }

    render() {
        return (
            <View style={{flex:1, minWidth: width, alignSelf: 'center'}}>
                <ScrollView style={{flex:1, paddingLeft: 10, marginBottom: 50}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true}, ()=>this.readErrandDetails())}
                        />
                    }>

                    {this.getPrivacy()}

                    <View style={styles.section}>
                        <Text style={styles.title}>{this.state.title}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Posted {this.differenceInDays(new Date().getTime(),this.state.datecreated)}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Description</Text>
                        <Text style={styles.desc}>{this.state.description}</Text>
                    </View>

                    {this.getLocationInfo()}

                    <View style={styles.section}>
                        <Text style={styles.header}>Type</Text>
                        <Text style={styles.info}>{this.state.type}</Text>
                    </View>
                    
                    <View style={styles.section}>
                        <Text style={styles.header}>Field</Text>
                        <Text style={styles.infos}>{this.state.field}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Specialization</Text>
                        <Text style={styles.infos}>{this.state.specialization}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Experience</Text>
                        <Text style={styles.infos}>{this.state.experience}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Payment</Text>
                        <Text style={{color: '#949494', fontSize: 12}}>MYR $</Text>
                        <Text style={styles.infos}>{this.state.payment}</Text>
                    </View>

                    <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3, textDecorationLine: 'underline'}}>Keywords</Text>

                    <ScrollView
                        style={{height: height*0.05, width: width*0.95, borderRadius: 10}}
                        horizontal={true}
                        nestedScrollEnabled={true}
                        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                    >
                        {this.state.keywords.map((item,index)=>{
                            return (
                                <Text key={index} style={{textAlign: 'center', backgroundColor: '#d6d6d6', borderRadius: 10, padding: 5, marginLeft: 5, marginRight: 5}}>{item}</Text>
                            )
                        })}
                    </ScrollView>

                    <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3, textDecorationLine: 'underline'}}>Attachments</Text>
                    
                    {this.getImages()}

                    <Text style={{marginBottom: 3}}>More Info:</Text>
                    <View style={{backgroundColor: '#adadad', height: 1, width: width*0.95}}></View>

                    <Text style={{marginTop: 10}}>Progress:</Text>
                    {this.getProgress(this.state.status)}

                    <View style={{backgroundColor: '#adadad', height: 1, width: width*0.95}}></View>

                    <Text style={{marginTop: 10}}>Users:</Text>
                    <View style={{justifyContent: 'space-evenly', flex: 1, flexDirection: 'row', marginTop: 20}}>
                        {this.getCreator()}
                        {this.getRelatedUser()}
                    </View>

                    <View style={{backgroundColor: '#adadad', height: 1, width: width*0.95}}></View>

                    <View style={{marginTop: 10, marginBottom: 40, justifyContent: 'center'}}>
                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <Icon
                                name='star'
                                style={{fontSize: 20, color: '#ff9238', alignSelf: 'center', marginRight: 5}}
                            ></Icon>
                            <Text style={{marginRight: 5, textAlign: 'center', alignSelf: 'center'}}>Recent reviews of this user:</Text>
                            <Image
                                source={{uri: this.state.creatorimage==''?null:this.state.creatorimage}}
                                style={{width: width*0.05, height: width*0.05, borderRadius: 100}}
                            ></Image>
                        </View>
                        <View>
                            {this.getReviews()}
                        </View>
                    </View>

                    <View style={{backgroundColor: '#adadad', height: 1, width: width*0.95}}></View>

                    <View>
                        <Dialog.Container visible={this.state.close}>
                            <Dialog.Title>Close Errand</Dialog.Title>
                            <Dialog.Description>Confirm to stop receiving user requests for this errand ? ( Changes to request cannot be made after closing )</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({close: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.closeErrand()} />
                        </Dialog.Container>
                    </View>

                    <View>
                        <Dialog.Container visible={this.state.complete}>
                            <Dialog.Title>Finish Errand</Dialog.Title>
                            <Dialog.Description>Finish and update the errand as complete ? ( Make sure the hired user is in agreement )</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({complete: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.completeErrand()} />
                        </Dialog.Container>
                    </View>
                    
                    <View>
                        <Dialog.Container visible={this.state.cancel}>
                            <Dialog.Title>Cancel Errand</Dialog.Title>
                            <Dialog.Description>Confirm to cancel the ongoing errand ? ( Make sure the hired user is in agreement )</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({cancel: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.cancelErrand()} />
                        </Dialog.Container>
                    </View>

                    <View>
                        <Dialog.Container visible={this.state.accept}>
                            <Dialog.Title>Accept Errand</Dialog.Title>
                            <Dialog.Description>Confirm to accept the private errand ?</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({accept: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.acceptErrand()} />
                        </Dialog.Container>
                    </View>

                    <View>
                        <Dialog.Container visible={this.state.reject}>
                            <Dialog.Title>Reject Errand</Dialog.Title>
                            <Dialog.Description>Confirm to reject the private errand ?</Dialog.Description>
                            <Dialog.Button label="Cancel" onPress={() => this.setState({reject: false})} />
                            <Dialog.Button label="Ok" onPress={() => this.rejectErrand()} />
                        </Dialog.Container>
                    </View>
                </ScrollView>

                {this.getActions()}
                
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({modalVisible: false});
                    }}
                    ><TouchableOpacity
                        onPressIn={()=> this.setState({modalVisible: false})}
                    >
                        <View style={{height: height, width: width, backgroundColor: 'black'}}>
                            <Image
                                source={{uri: this.state.selectedimage}}
                                style={{height: height-50, width: width-10, alignSelf: 'center',marginTop: 10}}
                                resizeMethod='scale'
                                resizeMode='contain'
                            ></Image>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        )
    }

    getReviews() {
        if(this.state.reviews.length > 0){
            return (
                this.state.reviews.map((item,i)=>{
                    return (
                        <Review key={i} item={item}/>
                    )
                })
            )
        }
        else {
            return (
                <Text>No reviews found</Text>
            )
        }
    }

    getProgress(name) {
        if(name=="Open"){
            return this.progressBlock("Open",false)
        }
        if(name=="Closed"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("Closed",true)}
                </View>
            )
        }
        if(name=="Completed"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("In Progress",true)}
                    {this.progressBlock("Completed",true)}
                </View>
            )
        }
        if(name=="Cancelled"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("In Progress",true)}
                    {this.progressBlock("Cancelled",true)}
                </View>
            )
        }
        if(name=="Pending"){
            return this.progressBlock("Pending",false)
        }
        if(name=="In Progress"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("In Progress",false)}
                </View>
            )
        }
        if(name=="Pending Complete"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("Pending Complete",false)}
                </View>
            )
        }
        if(name=="Pending Cancel"){
            return (
                <View style={{flexDirection: 'row'}}>
                    {this.progressBlock("Open",true)}
                    {this.progressBlock("Pending Cancel",false)}
                </View>
            )
        }
    }

    progressBlock(name,past) {
        const arr = ['Closed','Completed','Cancelled',]
        if(!arr.includes(name)){
            return (
                <View style={{flexDirection: 'row', padding: 10}}>
                    <TouchableOpacity
                        style={{alignSelf: 'center', justifyContent: 'center', width: width*0.2, height: width*0.2, backgroundColor: this.getProgressTextColor(name), borderRadius: 20}}
                        onPress={()=>this.getToast(name)}
                    ><Text style={{textAlign: 'center'}} adjustsFontSizeToFit={true}>{name}</Text></TouchableOpacity>
                    <View style={{justifyContent: 'center'}}>
                        <Icon
                            name='arrow-right-thick'
                            style={{fontSize: 40, marginLeft: 5, color: past==true ? '#595959':'#bababa'}}
                        ></Icon>
                    </View>
                </View>
            )
        }
        else {
            return (
                <View style={{flexDirection: 'row', padding: 10}}>
                    <TouchableOpacity
                        style={{alignSelf: 'center', justifyContent: 'center', width: width*0.2, height: width*0.2, backgroundColor: this.getProgressTextColor(name), borderRadius: 20}}
                        onPress={()=>this.getToast(name)}
                    ><Text style={{textAlign: 'center'}} adjustsFontSizeToFit={true}>{name}</Text></TouchableOpacity>
                </View>
            )
        }
    }

    getProgressTextColor(name){
        if(name=="Open"){
            return '#00e608'
        }
        if(name=="Closed"){
            return '#737373'
        }
        if(name=="Completed"){
            return '#3faefc'
        }
        if(name=="Cancelled"){
            return '#ff3508'
        }
        if(name=="Pending"){
            return '#ffb847'
        }
        if(name=="In Progress"){
            return '#e6d200'
        }
        if(name=="Pending Complete"){
            return '#33f1ff'
        }
        if(name=="Pending Cancel"){
            return '#e65100'
        }
    }

    getToast(name) {
        if(name=="Open"){
            Toast.show({
                text1: 'Open Errand',
                text2: 'Errand open for requests on ' + new Date(this.state.datecreated).toUTCString()
            })
        }
        if(name=="Closed"){
            Toast.show({
                type: 'error',
                text1: 'Closed Errand',
                text2: 'Errand closed since ' + new Date(this.state.closedate).toUTCString()
            })
        }
        if(name=="Completed"){
            Toast.show({
                text1: 'Errand Completed',
                text2: 'Errand successfully completed on ' + new Date(this.state.completedate).toUTCString()
            })
        }
        if(name=="Cancelled"){
            Toast.show({
                type: 'error',
                text1: 'Errand Cancelled',
                text2: 'Errand cancelled on ' + new Date(this.state.canceldate).toUTCString()
            })
        }
        if(name=="Pending"){
            Toast.show({
                text1: 'Pending Errand',
                text2: 'Errand pending for approval on ' + new Date(this.state.datecreated).toUTCString()
            })
        }
        if(name=="In Progress"){
            Toast.show({
                text1: 'Errand In Progress',
                text2: 'Errand started progress on ' + new Date(this.state.hiredate).toUTCString()
            })
        }
        if(name=="Pending Complete"){
            Toast.show({
                text1: 'Errand Pending Completion',
                text2: 'Pending approval to be completed since ' + new Date(this.state.pendingcompletedate).toUTCString()
            })
        }
        if(name=="Pending Cancel"){
            Toast.show({
                text1: 'Errand Pending Cancellation',
                text2: 'Pending approval to be cancelled since ' + new Date(this.state.pendingcanceldate).toUTCString()
            })
        }
    }

    getActions(){
        if(this.state.status=="Open"){
            if(this.state.creatorid==this.user){
                return this.toShowRequests()
            }
            else {
                return this.toCreateRequest()
            }
        }
        if(this.state.status=="Closed"){
            return this.showNoActionRed("Closed","briefcase-minus")
        }
        if(this.state.status=="Completed"){
            return this.showCompleted()
        }
        if(this.state.status=="Cancelled"){
            return this.showNoActionRed("Cancelled","cancel")
        }
        if(this.state.status=="Pending"){
            if(this.state.creatorid==this.user){
                return this.showNoAction("Pending Receiver Approval","account-clock")
            }
            else {
                return this.showPendingOptions()
            }
        }
        if(this.state.status=="In Progress"){
            if(this.state.creatorid==this.user){
                return this.showComplete()
            }
            else {
                return this.showCancel()
            }
        }
        if(this.state.status=="Pending Complete"){
            if(this.state.creatorid==this.user){
                return this.showNoAction("Pending Completion","account-clock")
            }
            else {
                return this.confirmComplete()
            }
        }
        if(this.state.status=="Pending Cancel"){
            if(this.state.creatorid==this.user){
                return this.confirmCancel()
            }
            else {
                return this.showNoAction("Pending Cancellation","account-clock")
            }
        }
    }

    getPrivacy(){
        if(this.state.privacy){
            return (
                <Text style={styles.public}>Public</Text>
            )
        }
        else {
            return (
                <Text style={styles.private}>Private</Text>
            )
        }
    }
    
    getLocationInfo(){
        if(this.state.type=='Local'){
            return(
                <View>
                    <View style={styles.section}>
                        <Text style={styles.header}>Location Address</Text>
                        <Text style={styles.info}>{this.state.address}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location Postcode</Text>
                        <Text style={styles.info}>{this.state.postcode}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location City</Text>
                        <Text style={styles.info}>{this.state.city}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location State</Text>
                        <Text style={styles.info}>{this.state.countrystate}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location Country</Text>
                        <Text style={styles.info}>{this.state.country}</Text>
                    </View>
                </View>
            )
        }
    }

    showImage(item){
        this.setState({modalVisible:true, selectedimage: item})
    }
    
    getRelatedUser(){
        if(this.state.hiredid=='' || this.state.hiredid==null){
            return this.getReceiver()
        }
        else {
            return this.getHiredUser()
        }
    }

    getHiredUser(){
        if(this.state.hiredid!=null && this.state.hiredid!=''){
            return( 
                <View>
                    <Text style={{fontSize: 13, alignSelf: 'center', marginBottom: 10, color: '#52b1ff', backgroundColor: '#5c5b5b', padding: 5, borderRadius: 10}}>Hired:</Text>
                    <View style={styles.profilesection}>
                        <TouchableOpacity
                            onPress={()=>this.props.navigation.navigate("View Profile", {id: this.state.hiredid})}
                            style={styles.profilebtn}
                        >
                            <Image
                                style={styles.profileimage}
                                source={{uri:this.state.hiredimage==''? null:this.state.hiredimage}}
                                resizeMethod='scale'
                                resizeMode='cover'
                            ></Image>
                        
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.profilename}>{this.state.hiredusername}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    getCreator(){
        return (
            <View style={styles.profilesection}>
                <Text style={{fontSize: 13, alignSelf: 'center', marginBottom: 10, color: '#47ff50', backgroundColor: '#5c5b5b', padding: 5, borderRadius: 10}}>Posted by:</Text>
                <TouchableOpacity
                    onPress={()=>this.props.navigation.navigate("View Profile", {id: this.state.creatorid})}
                    style={styles.profilebtn}
                >
                    <Image
                        style={styles.profileimage}
                        source={{uri:this.state.creatorimage==''? null:this.state.creatorimage}}
                        resizeMethod='scale'
                        resizeMode='cover'
                    ></Image>
                
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.profilename}>{this.state.creatorname}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    getReceiver(){
        if(this.state.receiverid!=null && this.state.receiverid!=''){
            return( 
                <View>
                    <Text style={{fontSize: 13, alignSelf: 'center', marginBottom: 10, color: '#ffb847', backgroundColor: '#5c5b5b', padding: 5, borderRadius: 10}}>Received By:</Text>
                    <View style={styles.profilesection}>
                        <TouchableOpacity
                            onPress={()=>this.props.navigation.navigate("View Profile", {id: this.state.receiverid})}
                            style={styles.profilebtn}
                        >
                            <Image
                                style={styles.profileimage}
                                source={{uri: this.state.receiverimage=='' ? null:this.state.receiverimage}}
                                resizeMethod='scale'
                                resizeMode='cover'
                            ></Image>
                        
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.profilename}>{this.state.receiverusername}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    getImages(){
        if(this.state.images.length > 0){
            return (
                <ScrollView
                    style={styles.imagessection}
                    horizontal={true}
                    nestedScrollEnabled={true}
                >
                    {this.state.images.map((item,i)=>{
                        return (
                        <View key={i}>
                            <TouchableOpacity
                                style={{borderWidth: 0.5}}
                                onPress={()=>this.showImage(item)}
                                >
                                <Image 
                                    style={styles.image}
                                    source={{uri: item}}  
                                    resizeMethod='resize'
                                    resizeMode='cover'  
                                ></Image>
                                {this.imageNum(i)}
                            </TouchableOpacity> 
                        </View>
                        )
                    })}
                </ScrollView>
            )
        }
        else {
            return (
                <Text style={styles.noimage}>No Attachments</Text>
            )
        }
    }

    imageNum(i){
        if(this.state.images.length > 1){
            return (
                <Text style={{position: 'absolute', right: 5, bottom: 5, fontSize: 16, color: 'white'}}>{i+1}/{this.state.images.length}</Text>
            )
        }
    }

    showNoActionRed(text, icon) {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <Text style={styles.redtext}>{text}</Text>
                    <Icon
                        style={styles.actioniconred}
                        name={icon}
                    ></Icon>
                </View>
            </View>
        )
    }

    showNoAction(text, icon) {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <Text style={styles.greytext}>{text}</Text>
                    <Icon
                        style={styles.actionicon}
                        name={icon}
                    ></Icon>
                </View>
            </View>
        )
    }
    
    toCreateRequest() {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <TouchableOpacity
                        onPress={()=>{
                            firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
                                if(doc.data().status=="Open"){
                                    firebase.firestore().collection("requests").where("creatorid","==",this.user).where("errandid","==",this.errandid).get().then((data)=>{
                                        if(data.empty){
                                            this.props.navigation.navigate("Create Request", {errandid: this.errandid, creatorid: this.state.creatorid})
                                        }
                                        else {
                                            alert("You have already created a request for this errand.")
                                        }
                                    })
                                }
                                else {
                                    alert("The errand is no longer open for requests.")
                                }
                            })
                        }}
                    ><Text style={styles.btntextaction}>Create Request</Text></TouchableOpacity>
                    <Icon
                        style={styles.actionicontap}
                        name='briefcase-outline'
                    ></Icon>
                </View>
            </View>
        )
    }

    toShowRequests(){
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, flex: 1}}
                            onPress={()=>{
                                firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
                                    if(data.data().status=="Open"){
                                        this.setState({close: true})
                                    }
                                    else {
                                        alert("The errand is already in progress")
                                    }
                                })
                            }}
                        >
                            <Icon
                                style={{fontSize: 25, color: '#ff3300'}}
                                name='briefcase-minus-outline'
                            ></Icon>
                            <Text style={styles.closebtn}>Close Errand</Text>
                        </TouchableOpacity>
                  

                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 20, flex: 1}}
                            onPress={()=>this.props.navigation.navigate("Requests", {errandid: this.errandid})}
                        >
                            <Text style={styles.btntext1}>User Requests</Text>
                            <Icon
                                style={{fontSize: 25,}}
                                name='file-document-outline'
                            ></Icon>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ) 
    }

    showCompleted(){
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center'}}>
                            <Icon
                                style={styles.actionicongreen}
                                name='briefcase-check'
                            ></Icon>
                            <Text style={styles.greentext}>Completed</Text>
                        </View>

                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 20, flex: 1}}
                            onPress={()=>this.toCreateReview()}
                        >
                            <Text style={styles.btntext1}>Review</Text>
                            <Icon
                                style={{fontSize: 25}}
                                name='star-outline'
                            ></Icon>
                        </TouchableOpacity>                    
                    </View>
                </View>
            </View>
        )
    }

    showPendingOptions(){
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>  
                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, flex: 1}}
                            onPress={()=>this.setState({reject: true})}
                            >
                            <Icon
                                style={{fontSize: 25, color: '#ff3300'}}
                                name='close'
                            ></Icon>
                            <Text style={styles.closebtn}>Reject Errand</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 20, flex: 1}}
                            onPress={()=>this.setState({accept: true})}
                        >
                            <Text style={styles.btntext1}>Accept Errand</Text>
                            <Icon
                                style={{fontSize: 25}}
                                name='check-outline'
                            ></Icon>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    showCancel() {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <TouchableOpacity
                        onPress={()=>this.setState({cancel: true})}
                    ><Text style={styles.textbtn}>Cancel Errand</Text></TouchableOpacity>
                    <Icon
                        style={styles.actionicontap}
                        name='briefcase-remove-outline'
                    ></Icon>
                </View>
            </View>
        )
    }

    showComplete() {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <TouchableOpacity
                        onPress={()=>this.setState({complete: true})}
                    ><Text style={styles.btntextaction}>Complete Errand</Text></TouchableOpacity>
                    <Icon
                        style={styles.actionicontap}
                        name='briefcase-check-outline'
                    ></Icon>
                </View>
            </View>
        )
    }

    confirmComplete() {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <TouchableOpacity
                        onPress={()=>this.setState({complete: true})}
                    ><Text style={styles.btntextaction}>Confirm Complete</Text></TouchableOpacity>
                    <Icon
                        style={styles.actionicontap}
                        name='briefcase-check-outline'
                    ></Icon>
                </View>
            </View>
        )
    }

    confirmCancel() {
        return (
            <View style={styles.btn}>
                <View style={styles.btncover}>
                    <TouchableOpacity
                        onPress={()=>this.setState({cancel: true})}
                    ><Text style={styles.textbtn}>Confirm Cancel</Text></TouchableOpacity>
                    <Icon
                        style={styles.actionicontap}
                        name='briefcase-remove-outline'
                    ></Icon>
                </View>
            </View>
        )
    }

    closeErrand(){
        this.setState({close: false})
        firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
            if(data.data().status=="Open"){
                this.setState({status: "Closed"})
                firebase.firestore().collection("errands").doc(this.errandid).update({
                    status: "Closed",
                    closedate: new Date().getTime(),
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                        errandid: this.errandid,
                        status: 'closed',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.state.creatorid,
                        privacy: this.state.privacy,
                    }).then(()=>{
                        const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                        firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                            id: key,
                            type: 'errand closed',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            errandid: this.errandid,
                            date: new Date().getTime(),
                            new: true
                        })
                    })
                })
            }
            else {
                alert("The errand is already in progress")
            }
        })
    }

    rejectErrand(){
        this.setState({reject: false})
        firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
            if(data.data().status=="Pending"){
                this.setState({status: "Closed"})
                firebase.firestore().collection("errands").doc(this.errandid).update({
                    status: "Closed",
                    closedate: new Date().getTime(),
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                        errandid: this.errandid,
                        status: 'rejected',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.state.creatorid,
                        privacy: this.state.privacy,
                        new: true,
                    }).then(()=>{
                        const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                        firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                            id: key,
                            type: 'errand rejected',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            errandid: this.errandid,
                            date: new Date().getTime(),
                            new: true,
                        })
                    })
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.receiverid).child(this.errandid).set({
                        errandid: this.errandid,
                        status: 'rejected',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.state.creatorid,
                        privacy: this.state.privacy,
                    })
                })
            }
            else {
                alert("You cannot reject the errand as the errand's status has changed. ( Refresh the errand's status )")
            }
        })
    }

    acceptErrand(){
        this.setState({accept: false})
        firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
            if(data.data().status=="Pending"){
                this.setState({status: "In Progress"})
                firebase.firestore().collection("errands").doc(this.errandid).update({
                    status: "In Progress",
                    hiredid: this.user,
                    hiredate: new Date().getTime(),
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                        errandid: this.errandid,
                        status: 'in progress',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.state.creatorid,
                        privacy: this.state.privacy,
                        new: true,
                    }).then(()=>{
                        const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                        firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                            id: key,
                            type: 'errand accepted',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            errandid: this.errandid,
                            date: new Date().getTime(),
                            new: true,
                        })
                    })
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.state.receiverid).child(this.errandid).set({
                        errandid: this.errandid,
                        status: 'in progress',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.state.creatorid,
                        privacy: this.state.privacy,
                        new: true,
                    })
                })
            }
            else {
                alert("You cannot accept the errand as the errand's status has changed. ( Refresh the errand's status )")
            }
        })
    }

    completeErrand() {
        this.setState({complete: false})
        if(this.state.creatorid==this.user){
            firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
                if(data.data().status=="In Progress"){
                    this.setState({status: "Pending Complete"})
                    firebase.firestore().collection("errands").doc(this.errandid).update({
                        status: "Pending Complete",
                        pendingcompletedate: new Date().getTime(),
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.hiredid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'pending complete',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.hiredid).push().key
                            firebase.database().ref().child("notifications").child(this.state.hiredid).child(key).set({
                                id: key,
                                type: 'errand pending complete',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'pending complete',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                        })
                    })
                }
                else {
                    alert("You cannot complete or finish the errand as the errand's status has changed. ( Refresh the errand's status )")
                }
            })
        }
        else if(this.state.hiredid==this.user){
            firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
                if(data.data().status=="Pending Complete"){
                    this.setState({status: "Completed"})
                    firebase.firestore().collection("errands").doc(this.errandid).update({
                        status: "Completed",
                        completedate: new Date().getTime(),
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'completed',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                            firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                                id: key,
                                type: 'errand completed',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.hiredid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'completed',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.hiredid).push().key
                            firebase.database().ref().child("notifications").child(this.state.hiredid).child(key).set({
                                id: key,
                                type: 'errand completed',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    })
                }
                else {
                    alert("You cannot complete or finish the errand as the errand's status has changed. ( Refresh the errand's status )")
                }
            })
        }
    }

    cancelErrand() {
        this.setState({cancel: false})
        if(this.state.creatorid==this.user){
            firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
                if(data.data().status=="Pending Cancel"){
                    this.setState({status: "Cancelled"})
                    firebase.firestore().collection("errands").doc(this.errandid).update({
                        status: "Cancelled",
                        canceldate: new Date().getTime(),
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.hiredid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'cancelled',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.hiredid).push().key
                            firebase.database().ref().child("notifications").child(this.state.hiredid).child(key).set({
                                id: key,
                                type: 'errand cancelled',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'cancelled',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                            firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                                id: key,
                                type: 'errand cancelled',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    })
                }
                else {
                    alert("You cannot cancel the errand as the errand's status has changed. ( Refresh the errand's status )")
                }
            })
        }
        else if(this.state.hiredid==this.user){
            firebase.firestore().collection("errands").doc(this.errandid).get().then((data)=>{
                if(data.data().status=="In Progress"){
                    this.setState({status: "Pending Cancel"})
                    firebase.firestore().collection("errands").doc(this.errandid).update({
                        status: "Pending Cancel",
                        pendingcanceldate: new Date().getTime(),
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.creatorid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'pending cancel',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                            new: true,
                        }).then(()=>{
                            const key = firebase.database().ref().child("notifications").child(this.state.creatorid).push().key
                            firebase.database().ref().child("notifications").child(this.state.creatorid).child(key).set({
                                id: key,
                                type: 'errand pending cancel',
                                serverdate: firebase.database.ServerValue.TIMESTAMP,
                                errandid: this.errandid,
                                date: new Date().getTime(),
                                new: true,
                            })
                        })
                    }).then(()=>{
                        firebase.database().ref().child("errands").child(this.state.hiredid).child(this.errandid).set({
                            errandid: this.errandid,
                            status: 'pending cancel',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            creatorid: this.state.creatorid,
                            privacy: this.state.privacy,
                        })
                    })
                }
                else {
                    alert("You cannot cancel the errand as the errand's status has changed. ( Refresh the errand's status )")
                }
            })
        }
    }

    toCreateReview() {
        firebase.firestore().collection("errands").doc(this.errandid).get().then((doc)=>{
            if(doc.data().hiredid==this.user){
                if(doc.data().hiredreview!=null){
                    Toast.show({
                        type: 'error',
                        text1: 'Reviewed',
                        text2: 'This errand has already been reviewed'
                    })
                }
                else {
                    this.props.navigation.navigate("Review", {errandid: this.errandid, creatorid: this.state.creatorid, hiredid: this.state.hiredid})
                }
            }
            else if(doc.data().creatorid==this.user){
                if(doc.data().creatorreview!=null){
                    Toast.show({
                        type: 'error',
                        text1: 'Reviewed',
                        text2: 'This errand has already been reviewed'
                    })
                }
                else {
                    this.props.navigation.navigate("Review", {errandid: this.errandid, creatorid: this.state.creatorid, hiredid: this.state.hiredid})
                }
            }
        })
    }
}

class Review extends Component {
    constructor(props){
        super(props);
        
        this.item = this.props.item
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
            <View style={{width: width*0.95, backgroundColor: 'white', padding: 5, borderRadius: 5, marginBottom: 5}}>
                <View style={{flexDirection: 'row', alignItems: 'center', width: width*0.95}}>
                    <Icon
                        name='star'
                        style={{fontSize: 15, color: '#ff9238', marginRight: 5}}
                    ></Icon>
                    <Text>{this.item.star}</Text>
                    <Text style={{alignSelf: 'center', textAlign: 'right', width: width*0.8, fontSize: 12}}>{this.differenceInDays(new Date().getTime(),this.item.time)}</Text>
                </View>
                <View style={{width: width*0.95}}>
                    <Text numberOfLines={5} allowFontScaling={true}>{this.item.review}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    profilesection: {
        marginBottom: width*0.1,
    },
    profilename: {
        width: width*0.2,
        textAlign: 'center',
        alignSelf: 'center'
    },
    profileimage: {
        width: width*0.3,
        height: width*0.3,
        borderRadius: 100,
        marginBottom: 10,
        borderWidth: 0.2,
        borderColor: 'black'
    },
    section: {
        paddingTop: 10,
        paddingRight: 20,
        marginBottom: 5,
        width: width-20,
    },
    title: {
        fontSize: 25,
        alignSelf: 'flex-start',
        paddingTop: 5,
        paddingBottom: 5,
        width: width-20,
    },
    desc: {
        fontSize: 20,
        alignSelf: 'flex-start',
        width: width-20,
    },
    header: {
        fontSize: 13,
        marginBottom: 3,
        textDecorationLine: 'underline',
    },
    private: {
        textAlign: 'center',
        width: width*0.2,
        fontSize: 13,
        marginTop: 10,
        padding: 3,
        borderRadius: 20,
        backgroundColor: '#ff5447'
    },
    public: {
        textAlign: 'center',
        width: width*0.2,
        fontSize: 13,
        marginTop: 10,
        padding: 3,
        borderRadius: 20,
        backgroundColor: '#4dff52'
    },
    date: {
        fontSize: 13,
        marginBottom: 3,
    },
    info: {
        fontSize: 15,
        alignSelf: 'flex-start',
        width: width-20,
    },
    infos: {
        fontSize: 15,
        alignSelf: 'flex-start',
        width: width-20,
        padding: 5,
        backgroundColor: '#d6d6d6',
        borderRadius: 10
    },
    noimage: {
        fontSize: 15,
        alignSelf: 'flex-start',
        padding: 5,
        width: width-20,
        backgroundColor: '#e0e0e0',
        marginBottom: 40,
        borderRadius: 10
    },
    imagessection: {
        width: width-20,
        height: width-20,
        backgroundColor: 'white',
        marginBottom: 40,
    },
    image: {
        width: width-20,
        height: width-20,
        backgroundColor: '#e0e0e0',
    },
    btn: {
        height: 60,
        width: width,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#d1d1d1',
        paddingTop: 5,
        paddingBottom: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    btncover: {
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#ff843d',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionicon: {
        fontSize: 25,
        marginLeft: 10,
        color: '#e6e6e6'
    },
    actioniconred: {
        fontSize: 25,
        marginLeft: 10,
        color: '#ff3300'
    },
    actionicongreen: {
        fontSize: 25,
        marginLeft: 10,
        color: '#5cff59'
    },
    actionicontap: {
        fontSize: 25,
        marginLeft: 10,
    },
    btntext: {
        fontSize: 20,
        color: '#e6e6e6'
    },
    btntextaction: {
        fontSize: 20,
    },
    closebtn: {
        padding: 5,
        fontSize: 15,
        borderRadius: 30,
        color: '#ff3300'
    },
    btntext1: {
        padding: 5,
        fontSize: 15,
        borderRadius: 30,
    },
    greytext: {
        padding: 5,
        fontSize: 20,
        borderRadius: 30,
        color: '#e6e6e6'
    },
    greentext: {
        padding: 5,
        fontSize: 20,
        borderRadius: 30,
        color: '#5cff59'
    },
    redtext: {
        padding: 5,
        fontSize: 20,
        borderRadius: 30,
        color: '#ff3300'
    },
    textbtn: {
        padding: 5,
        fontSize: 20,
        borderRadius: 30,
    },
})

export default ErrandDetails