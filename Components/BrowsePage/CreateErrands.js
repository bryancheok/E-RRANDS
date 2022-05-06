import React, { Component } from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase/compat';
import Dialog from "react-native-dialog";
import "firebase/compat/firestore";
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class CreateErrands extends Component {
    constructor(props){
        super(props);

        this.fields = ['Field : -'].concat(['Entertainment','Software Engineering','Art','Architecture and Engineering','Digital Art','Business Management','Media and Communications','Education','Repair and Maintenance','Healthcare','Literature'].sort());
        this.experiences = ['Experience : -','Novice','Intermediate','Expert'];
        this.empty = ['Specialization : -'];
        this.ent = ['Specialization : -'].concat(['Streaming','Gaming','Vocalist','Film-maker','Voice-Acting','Instrumentalist'].sort()).concat(['Others']);
        this.softeng = ['Specialization : -'].concat(['Web Designer','App Developer','Cybersecurity','Game Designer'].sort()).concat(['Others']);
        this.art = ['Specialization : -'].concat(['Origami','Drawing','Figure Modeling','Fashion Designer','Photographer'].sort()).concat(['Others']);
        this.digiart = ['Specialization : -'].concat(['Graphic Designer','UI Designer','3D Printing'].sort()).concat(['Others']);
        this.arch = ['Specialization : -'].concat(['Architect','Civil Engineer','Landscape Architect','Sustainable Designer','Biomedical Engineer'].sort()).concat(['Others']);
        this.buss = ['Specialization : -'].concat(['Marketing Assistant','Accountant','Personal Finance Advisor'].sort()).concat(['Others']);
        this.media = ['Specialization : -'].concat(['Journalist','Copywriter','Event Planner','Social Media Manager','Social Media Influencer','Virtual Assistant','Community Manager'].sort()).concat(['Others']);
        this.edu = ['Specialization : -'].concat(['Teacher','Home-Tutor','Online-Tutor'].sort()).concat(['Others']);
        this.repair = ['Specialization : -'].concat(['Plumber','Electrical Technician','Carpenter'].sort()).concat(['Others']);
        this.health = ['Specialization : -'].concat(['Nurse','Certified Physician','Veterinarian','Dental Specialist','Therapist','Personal Trainer','Beauty Advisor'].sort()).concat(['Others']);
        this.liter = ['Specialization : -'].concat(['Writer','Proof-Reader','Translator','Transcriptionist'].sort()).concat(['Others']);
        this.type = ['Remote','Local'];
        this.id = firebase.auth().currentUser.uid;
        this.privacy = this.props.route.params.privacy;
        this.receiver = this.props.route.params.receiver;

        if(this.props.route.params.username){
            this.props.navigation.setParams({header: 'Private Errand for: '+this.props.route.params.username})
        }
        
        this.state = {
            title: '',
            description: '',
            address: '',
            postcode: '',
            city: '',
            countrystate: '',
            country: '', 
            field: 'Field : -', 
            specialization: 'Specialization : -', 
            experience: 'Experience : -',
            type: 'Remote',
            payment: '',
            images: [],
            keyword: '',
            keywords: [],
            index: 0,
            loading: false,
            delete: false,
            imagepending: false,
            final: false,
            keywordinput: false,
            keywordindex: 0,
            deletekw: false,
        };
    }

    render() {
        return (
            <ScrollView style={{flex:1, minWidth: width}} contentContainerStyle={{alignSelf: 'center'}}>

                <View style={styles.section}>
                    <Text style={styles.header}>Title</Text>
                    <TextInput style={styles.textinput} maxLength={100} multiline={true} placeholder='> 15 characters' onChangeText={(input)=>this.setState({title: input.trim()})}></TextInput>
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Description</Text>
                    <TextInput style={styles.textinput} maxLength={1000} multiline={true} placeholder='> 20 characters' onChangeText={(input)=>this.setState({description: input.trim()})}></TextInput>
                </View>

                {this.getLocationInput()}
                
                <View style={styles.section}>
                    <Text style={styles.header}>Type</Text>
                    <Picker
                        style={styles.picker}
                        selectedValue={this.state.type}
                        onValueChange={(option)=>this.setState({type: option})}>
                            {this.type.map((item,i)=>{
                                    return <Picker.Item style={styles.pickeritem} label={item} value={this.type[i]} key={i}/>
                            })}
                    </Picker>
                </View>

                {this.getPicker()}

                <View style={styles.section}>
                    <Text style={styles.header}>Payment</Text>
                    <Text style={{color: '#949494', fontSize: 12}}>MYR $</Text>
                    <TextInput style={styles.textinput} maxLength={6} keyboardType='decimal-pad' onChangeText={(input)=>this.setState({payment: input.trim()})}></TextInput>
                </View>
                            
                <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3}}>Keywords</Text>

                <ScrollView
                    style={{height: height*0.05, backgroundColor: 'white', width: width*0.9, borderRadius: 10}}
                    horizontal={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                >
                    {this.state.keywords.map((item,index)=>{
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={()=>this.setState({deletekw: true, keywordindex: index})}
                            >
                                <Text style={{textAlign: 'center', backgroundColor: '#b3b3b3', borderRadius: 10, padding: 5, marginLeft: 5, marginRight: 5}}>{item}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>

                <TouchableOpacity
                    style={{backgroundColor: '#bdbdbd', alignSelf:'center', width: width*0.5, height: 30, paddingTop: 5, marginTop: 10, marginBottom: 20}}
                    onPress={() => this.inputKeyword()}>
                    <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff'}}>Add Keyword</Text>
                </TouchableOpacity>

                <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3}}>Attachments</Text>
                
                <ScrollView
                    style={styles.imagessection}
                    horizontal={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                >
                    {this.state.images.map((item,i)=>{
                        return (
                        <View key={i} style={{marginLeft: 5, marginRight: 5}}>
                            <TouchableOpacity
                                style={{borderWidth: 1}}
                                onPress={()=>this.setState({delete:true, index: i})}
                                >
                                <Image 
                                    style={styles.image}
                                    source={{uri: item ? item:null}}  
                                    resizeMethod='resize'
                                    resizeMode='cover'  
                                ></Image>
                            </TouchableOpacity> 
                        </View>
                        )
                    })}
                </ScrollView>

                <TouchableOpacity
                    style={{backgroundColor: '#bdbdbd', alignSelf:'center', width: width*0.5, height: 30, paddingTop: 5, marginTop: 10, marginBottom: 20}}
                    onPress={() => this.pickImage()}>
                    <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff'}}>Add Image To Errand</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.uploadbtn}
                    onPress={() => this.checkErrand()}>
                    <Text style={{alignSelf: 'center', textAlign: 'center', color: '#ffffff', fontSize: 25, marginTop: 5}}>Upload</Text>
                </TouchableOpacity>

                <View>
                    <Dialog.Container visible={this.state.imagepending}>
                        <Dialog.Title>No Attached Images</Dialog.Title>
                        <Dialog.Description>No attached images are found, do you wish to proceed with the errand upload ? ( Changes to errand cannot be made after uploading )</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({imagepending: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.uploadErrand()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.delete}>
                        <Dialog.Title>Delete Image</Dialog.Title>
                        <Dialog.Description>Remove image from errand ?</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({delete: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.deleteImage()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.deletekw}>
                        <Dialog.Title>Delete keyword</Dialog.Title>
                        <Dialog.Description>Remove keyword from errand ?</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({deletekw: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.deleteKeyword()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.final}>
                        <Dialog.Title>Upload Errand</Dialog.Title>
                        <Dialog.Description>Confirm errand upload ? ( Changes to errand cannot be made after uploading )</Dialog.Description>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({final: false})} />
                        <Dialog.Button label="Ok" onPress={() => this.uploadErrandWithImages()} />
                    </Dialog.Container>
                </View>

                <View>
                    <Dialog.Container visible={this.state.keywordinput}>
                        <Dialog.Title>Add A Keyword</Dialog.Title>
                        <Dialog.Description>Add keywords to the errand to improve clarity of needs. ( Max 10 keywords, max 30 characters each )</Dialog.Description>
                        <Dialog.Input maxLength={30} onChangeText={(keyword) => this.setState({keyword: keyword.trim()})}/>
                        <Dialog.Button label="Cancel" onPress={() => this.setState({keywordinput: false, keyword: ''})} />
                        <Dialog.Button label="Ok" onPress={() => this.addKeyword()} />
                    </Dialog.Container>
                </View>

                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
            </ScrollView>
        )
    }

    checkErrand() {
        if(this.privacy){
            if(this.validateTitle(this.state.title)){
                if(this.validateDescription(this.state.description)){
                    if(this.state.field!='Field : -' && this.state.specialization!='Specialization : -' && this.state.experience!='Experience : -'){
                        if(this.state.payment!='' && this.state.payment.length > 0 && this.state.payment.length < 10 && this.state.payment > 0){
                            if(this.state.type=='Local'){
                                if(this.validateAddress(this.state.address)){
                                    if(this.validatePostcode(this.state.postcode)){
                                        if(this.validateCommon(this.state.city)){
                                            if(this.validateCommon(this.state.countrystate)){
                                                if(this.validateCommon(this.state.country)){
                                                    if(this.state.images.length == 0){
                                                        this.setState({imagepending: true})
                                                    }
                                                    else {
                                                        this.setState({final: true})
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if(this.state.images.length == 0){
                                    this.setState({imagepending: true})
                                }
                                else {
                                    this.setState({final: true})
                                }
                            }
                        }
                        else {
                            this.getToast("error","Invalid Payment","Please enter a valid payment for the errand")
                        }
                    }
                    else {
                        this.getToast("error","Invalid Detail","Please select the proper fields, specialization and recommended experience for the errand")
                    }
                }
            }
        }
        else {
            if(this.validateTitle(this.state.title)){
                if(this.validateDescription(this.state.description)){
                    if(this.state.payment!='' && this.state.payment.length > 0 && this.state.payment.length < 10 && this.state.payment > 0){
                        if(this.state.type=='Local'){
                            if(this.validateAddress(this.state.address)){
                                if(this.validatePostcode(this.state.postcode)){
                                    if(this.validateCommon(this.state.city)){
                                        if(this.validateCommon(this.state.countrystate)){
                                            if(this.validateCommon(this.state.country)){
                                                if(this.state.images.length == 0){
                                                    this.setState({imagepending: true})
                                                }
                                                else {
                                                    this.setState({final: true})
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if(this.state.images.length == 0){
                                this.setState({imagepending: true})
                            }
                            else {
                                this.setState({final: true})
                            }
                        }
                    }
                    else {
                        this.getToast("error","Invalid Detail","Please enter a valid payment for the errand")
                    }
                }
            }
        }
    }
    
    getToast(type,msg1,msg2) {
        Toast.show({
            type: type,
            text1: msg1,
            text2: msg2,
        })
    }
    
    getPicker() {
        if(this.receiver==null){
            return (
                <View>
                    <View style={styles.section}>
                        <Text style={styles.header}>Field</Text>
                        <Picker
                            style={styles.picker}
                            selectedValue={this.state.field}
                            onValueChange={(option)=>this.setField(option)}>
                                {this.fields.map((item,i)=>{
                                        return <Picker.Item style={styles.pickeritem} label={item} value={this.fields[i]} key={i}/>
                                })}
                        </Picker>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Specialization</Text>
                        <Picker
                            style={styles.picker}
                            selectedValue={this.state.specialization}
                            onValueChange={(option)=>this.setSpecial(option)}>
                                {this.getItems(this.state.field).map((item,i)=>{
                                    return <Picker.Item style={styles.pickeritem} label={item} value={this.getItems(this.state.field)[i]} key={i}/>
                                })}
                        </Picker>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Recommended Experience</Text>
                        <Picker
                            style={styles.picker}
                            selectedValue={this.state.experience}
                            onValueChange={(option)=>this.setExpe(option)}>
                                {this.experiences.map((item,i)=>{
                                    return <Picker.Item style={styles.pickeritem} label={item} value={this.experiences[i]} key={i}/>
                                })}
                        </Picker>
                    </View>
                </View>
            )
        }
    }

    getLocationInput() {
        if(this.state.type=='Local'){
            return (
                <View>
                    <View style={styles.section}>
                        <Text style={styles.header}>Location Address</Text>
                        <TextInput style={styles.textinput} maxLength={100} multiline={true} onChangeText={(input)=>this.setState({address: input.trim()})}></TextInput>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location Postcode</Text>
                        <TextInput style={styles.textinput} maxLength={15} onChangeText={(input)=>this.setState({postcode: input.trim()})}></TextInput>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location City</Text>
                        <TextInput style={styles.textinput} maxLength={50} onChangeText={(input)=>this.setState({city: input.trim()})}></TextInput>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location State</Text>
                        <TextInput style={styles.textinput} maxLength={50} onChangeText={(input)=>this.setState({countrystate: input.trim()})}></TextInput>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.header}>Location Country</Text>
                        <TextInput style={styles.textinput} maxLength={50} onChangeText={(input)=>this.setState({country: input.trim()})}></TextInput>
                    </View>
                </View>
            )
        }
    }

    inputKeyword() {
        if(this.state.keywords.length < 10){
            this.setState({keywordinput: true})
        }
        else {
            Toast.show({
                type: 'error',
                text1: 'Keywords exceeded',
                text2: 'Maximum of 10 keywords allowed'
            })
        }
    }

    addKeyword() {
        if((this.state.keyword.length < 1) || (this.state.keyword.length > 30) || (!this.state.keyword.replace(/\s/g, '').length || this.state.keywords.includes(this.state.keyword))){
            console.log("Invalid Information")
            alert('Invalid keyword or keyword already exists')
        }
        else{
            this.setState({keywordinput: false})
            const arr = this.state.keywords
            arr.push(this.state.keyword)
            this.setState({keywords: arr, keyword: ''})
        }
    }

    uploadErrand() {
        this.setPreferences()
        this.setState({imagepending: false, loading: true})
        const pay = parseFloat(this.state.payment)
        const digit = pay.toFixed(2)
        if(this.receiver==null){
            firebase.firestore().collection("errands").add({
                title: this.state.title,
                description: this.state.description,
                address: this.state.address,
                postcode: this.state.postcode,
                city: this.state.city,
                countrystate: this.state.countrystate,
                country: this.state.country, 
                field: this.state.field, 
                specialization: this.state.specialization, 
                experience: this.state.experience,
                type: this.state.type,
                payment: digit,
                creatorid: this.id,
                datecreated: new Date().getTime(),
                privacy: this.privacy,
                status: "Open",
                keywords: this.state.keywords,
                requests: 0,
                serverdate: firebase.firestore.FieldValue.serverTimestamp(),
            }).then((data)=>{
                firebase.database().ref().child("errands").child(this.id).child(data.id).set({
                    errandid: data.id,
                    status: 'open',
                    serverdate: firebase.database.ServerValue.TIMESTAMP,
                    creatorid: this.id,
                    privacy: this.privacy
                })
            }).then(()=>{
                this.setState({loading: false})
                if(this.privacy){
                    this.props.navigation.goBack()
                }
                else {
                    this.props.navigation.goBack()
                }
            })
        }
        else if(this.receiver!=null){
            firebase.firestore().collection("errands").add({
                title: this.state.title,
                description: this.state.description,
                address: this.state.address,
                postcode: this.state.postcode,
                city: this.state.city,
                countrystate: this.state.countrystate,
                country: this.state.country, 
                field: '-', 
                specialization: '-', 
                experience: '-',
                type: this.state.type,
                payment: digit,
                creatorid: this.id,
                datecreated: new Date().getTime(),
                privacy: this.privacy,
                status: "Pending",
                receiverid: this.receiver,
                keywords: this.state.keywords,
                serverdate: firebase.firestore.FieldValue.serverTimestamp(),
            }).then((data)=>{
                firebase.database().ref().child("errands").child(this.id).child(data.id).set({
                    errandid: data.id,
                    status: 'open',
                    serverdate: firebase.database.ServerValue.TIMESTAMP,
                    creatorid: this.id,
                    privacy: this.privacy,
                    request: true,
                }).then(()=>{
                    firebase.database().ref().child("errands").child(this.receiver).child(data.id).set({
                        errandid: data.id,
                        status: 'open',
                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                        creatorid: this.id,
                        privacy: this.privacy,
                        request: true,
                        new: true,
                    }).then(()=>{
                        const key = firebase.database().ref().child("notifications").child(this.receiver).push().key
                        firebase.database().ref().child("notifications").child(this.receiver).child(key).set({
                            id: key,
                            type: 'errand received',
                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                            errandid: data.id,
                            date: new Date().getTime(),
                            new: true,
                        })
                    })
                })
            }).then(()=>{
                this.setState({loading: false})
                if(this.privacy){
                    this.props.navigation.goBack()
                }
                else {
                    this.props.navigation.goBack()
                }
            })
        }
    }

    async uploadErrandWithImages() {
        this.setPreferences()
        this.setState({imagepending: false, final: false, loading: true})
        const arr = []
        for(let i = 0; i < this.state.images.length; i++){
            const name = Math.random().toString(28)
            const result = await fetch(this.state.images[i])
            const blob = await result.blob()
            firebase.storage().ref('/images/Errand Images/'+name+'.jpg').put(blob).then(()=>{
                firebase.storage().ref('/images/Errand Images/'+name+'.jpg').getDownloadURL().then((data)=>{
                    arr.push(data)
                    console.log(data)
                }).then(()=>{
                    if(arr.length == this.state.images.length){
                        console.log(this.state)
                        if(this.receiver==null){
                            console.log("No receiver")
                            firebase.firestore().collection("errands").add({
                                title: this.state.title,
                                description: this.state.description,
                                address: this.state.address,
                                postcode: this.state.postcode,
                                city: this.state.city,
                                countrystate: this.state.countrystate,
                                country: this.state.country, 
                                field: this.state.field, 
                                specialization: this.state.specialization, 
                                experience: this.state.experience,
                                type: this.state.type,
                                payment: this.state.payment,
                                images: arr,
                                creatorid: this.id,
                                datecreated: new Date().getTime(),
                                privacy: this.privacy,
                                status: "Open",
                                keywords: this.state.keywords,
                                requests: 0,
                                serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                            }).then((data)=>{
                                firebase.database().ref().child("errands").child(this.id).child(data.id).set({
                                    errandid: data.id,
                                    status: 'open',
                                    serverdate: firebase.database.ServerValue.TIMESTAMP,
                                    creatorid: this.id,
                                    privacy: this.privacy
                                })
                            }).then(()=>{
                                this.setState({loading: false})
                                if(this.privacy){
                                    this.props.navigation.goBack()
                                }
                                else {
                                    this.props.navigation.goBack()
                                }
                            })
                        }
                        else if(this.receiver!=null){
                            console.log("Receiver ", this.receiver)
                            firebase.firestore().collection("errands").add({
                                title: this.state.title,
                                description: this.state.description,
                                address: this.state.address,
                                postcode: this.state.postcode,
                                city: this.state.city,
                                countrystate: this.state.countrystate,
                                country: this.state.country, 
                                field: '-', 
                                specialization: '-', 
                                experience: '-',
                                type: this.state.type,
                                payment: this.state.payment,
                                images: arr,
                                creatorid: this.id,
                                datecreated: new Date().getTime(),
                                privacy: this.privacy,
                                status: "Pending",
                                receiverid: this.receiver,
                                keywords: this.state.keywords,
                                serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                            }).then((data)=>{
                                firebase.database().ref().child("errands").child(this.id).child(data.id).set({
                                    errandid: data.id,
                                    status: 'open',
                                    serverdate: firebase.database.ServerValue.TIMESTAMP,
                                    creatorid: this.id,
                                    privacy: this.privacy,
                                    request: true,
                                }).then(()=>{
                                    firebase.database().ref().child("errands").child(this.receiver).child(data.id).set({
                                        errandid: data.id,
                                        status: 'open',
                                        serverdate: firebase.database.ServerValue.TIMESTAMP,
                                        creatorid: this.id,
                                        privacy: this.privacy,
                                        request: true,
                                        new: true,
                                    }).then(()=>{
                                        const key = firebase.database().ref().child("notifications").child(this.receiver).push().key
                                        firebase.database().ref().child("notifications").child(this.receiver).child(key).set({
                                            id: key,
                                            type: 'errand received',
                                            serverdate: firebase.database.ServerValue.TIMESTAMP,
                                            errandid: data.id,
                                            date: new Date().getTime(),
                                            new: true,
                                        })
                                    })
                                })
                            }).then(()=>{
                                this.setState({loading: false})
                                if(this.privacy){
                                    this.props.navigation.goBack()
                                }
                                else {
                                    this.props.navigation.goBack()
                                }
                            })
                        }
                    }
                })
            })
        }
    }

    setPreferences() {
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
            firebase.database().ref().child("userpreferences").child(this.id).child("fields").child(this.state.field).update({
                views: firebase.database.ServerValue.increment(1)
            })
            firebase.database().ref().child("userpreferences").child(this.id).child("specializations").child(this.state.specialization).update({
                views: firebase.database.ServerValue.increment(1)
            })
            firebase.database().ref().child("userpreferences").child(this.id).child("experiences").child(this.state.experience).update({
                views: firebase.database.ServerValue.increment(1)
            })
        })
    }

    deleteImage(){
        const arr = this.state.images
        arr.splice(this.state.index, 1)
        this.setState({images: arr, delete: false})
    }
    
    deleteKeyword(){
        const arr = this.state.keywords
        arr.splice(this.state.keywordindex, 1)
        this.setState({keywords: arr, deletekw: false})
    }

    pickImage() {
        ImagePicker.launchImageLibraryAsync({
            mediaType: 'photo',
            height: 400,
            width: 300,
        }).then(async (response)=> { 
            if(response.uri!=null){
                const arr = this.state.images
                arr.push(response.uri)
                this.setState({images: arr})
            }
            console.log(response.uri)
        })  
    }

    validateTitle(title) {
        if(title.length < 15 || title.length > 100 || (!title.replace(/\s/g, '').length)) {
            console.log("Invalid errand title")
            this.getToast("error","Invalid Detail","Please make sure that the title has 15 - 100 characters")
            return false
        }
        else {
            console.log("Valid Details")
            return true
        }
    }
    validateDescription(desc) {
        if(desc.length < 20 || desc.length > 1000 || (!desc.replace(/\s/g, '').length)) {
            console.log("Invalid errand description")
            this.getToast("error","Invalid Detail","Please make sure that the description has 20 to 1000 characters")
            return false
        }
        else {
            console.log("Valid Details")
            return true
        }
    }
    validateAddress(address){
        if((address.length < 8) || (address.length > 100) || (!address.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            this.getToast("error","Invalid Detail","Please make sure that the address is correct")
            return false
        }
        else{
            return true
        }
    }
    validatePostcode(postcode){
        if((postcode.length < 4) || (postcode.length > 15) || (!postcode.replace(/\s/g, '').length) || (/\s/.test(postcode)) ){
            console.log("Invalid Information")
            this.getToast("error","Invalid Detail","Please make sure that the postcode is correct")
            return false
        }
        else{
            return true
        }
    }
    validateCommon(common){
        if((common.length < 1) || (common.length > 50) || (!common.replace(/\s/g, '').length)){
            console.log("Invalid Information")
            this.getToast("error","Invalid Detail","Please make sure that all of the details are correct")
            return false
        }
        else{
            return true
        }
    }
    
    getItems(field){
        if(field=='Field : -'){
            return this.empty
        }
        else if(field=='Entertainment'){
            return this.ent
        }
        else if(field=='Software Engineering'){
            return this.softeng
        }
        else if(field=='Art'){
            return this.art
        }
        else if(field=='Architecture and Engineering'){
            return this.arch
        }
        else if(field=='Digital Art'){
            return this.digiart
        }
        else if(field=='Business Management'){
            return this.buss
        }
        else if(field=='Media and Communications'){
            return this.media
        }
        else if(field=='Education'){
            return this.edu
        }
        else if(field=='Repair and Maintenance'){
            return this.repair
        }
        else if(field=='Healthcare'){
            return this.health
        }
        else if(field=='Literature'){
            return this.liter
        }
        else {
            return this.empty
        }
    }
    
    setField(option){
        console.log(option)
        if(option!='Field : -'){
            this.setState({field: option, specialization: 'Specialization : -'})
        }
    }
    setSpecial(option){
        console.log(option)
        if(option!='Specialization : -'){
            this.setState({specialization: option})
        }
    }
    setExpe(option){
        console.log(option)
        if(option!='Experience : -'){
            this.setState({experience: option})
        }
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
    section: {
        paddingTop: 10,
        marginBottom: 5,
        width: width*0.9,
    },
    header: {
        fontSize: 13,
        marginBottom: 3,
    },
    textinput: {
        fontSize: 15,
        alignSelf: 'flex-start',
        padding: 5,
        width: width*0.9,
        backgroundColor: '#d6d6d6',
    },
    picker: {
        backgroundColor: '#c7c8c9',
    },
    pickeritem: {
        fontSize: 15,
    },
    imagessection: {
        backgroundColor: 'white', 
        width: width*0.9, 
        height: width*0.3
    },
    image: {
        height: width*0.2,
        width: width*0.3,
        backgroundColor: '#ededed'
    },
    uploadbtn: {
        backgroundColor: '#43e327', 
        alignSelf:'center', 
        width: width*0.4, 
        height: 50, 
        paddingTop: 3, 
        marginTop: 10, 
        marginBottom: 30, 
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 5,
    },
})

export default CreateErrands