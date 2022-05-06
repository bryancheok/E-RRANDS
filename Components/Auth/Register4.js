import React, { Component } from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker';
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import "firebase/compat/storage";
import Dialog from "react-native-dialog";
import Toast from 'react-native-toast-message';

const {height} = Dimensions.get('window');
const width = Dimensions.get('window').width;

export class Register4 extends Component{
    constructor(props){
        super(props)
        
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

        this.state = {
            field: '0', 
            specialization: '0', 
            experience: '0', 
            loading: false
        };
    }
    
    render(){
        return (
            <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center'}}>
                
                <View style={{alignSelf: 'center', height: 15, flexDirection: 'row', marginBottom: height*0.1}}>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                    <View style={{backgroundColor: '#ffb947', width: width*0.25, flex:1}}></View>
                </View>

                <View style={styles.dropdown}>
                    <Picker
                        selectedValue={this.state.field}
                        onValueChange={this.setField}>
                            {this.fields.map((item,i)=>{
                                return <Picker.Item label={item} value={i} key={i}/>
                            })}
                    </Picker>
                </View>
                
                <View style={styles.dropdown}>
                    <Picker
                        selectedValue={this.state.specialization}
                        onValueChange={this.setSpecial}>
                            {this.getItems(this.fields[this.state.field]).map((item,i)=>{
                                return <Picker.Item label={item} value={i} key={i}/>
                            })}
                    </Picker>
                </View>

                <ExperienceDrop state={this.state} experiences={this.experiences} setParent={opt => this.setState({experience: opt})}/>
                
                <View style={styles.btncontainer}>
                    <TouchableOpacity
                        onPress={() => this.register()}
                    ><Icon
                        name='check'
                        style={{fontSize: 50, borderRadius: 50, backgroundColor: '#47b0ff', padding: 20, marginBottom: 20}}
                    ></Icon></TouchableOpacity>
                </View>

                <Dialog.Container visible={this.state.loading} contentStyle={{height: 100}}><ActivityIndicator animating={this.state.loading} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
            </ScrollView>
        )
    }

    checkInfo() {
        const { field, specialization, experience } = this.state;

        if( field=='0' || specialization=='0' || experience=='0' ){
            Toast.show({
                type: 'error',
                text1: 'Invalid Info',
                text2: 'Please ensure all options are filled'
            })
            console.log(field,specialization,experience) 
            return false
        }

        else {
            console.log(field,specialization,experience)
            return true
        }
    }

    register() {
        const username = this.props.route.params.username;
        const email = this.props.route.params.email;
        const password = this.props.route.params.password;
        const realname = this.props.route.params.realname;
        const phone = this.props.route.params.phone;
        const address = this.props.route.params.address;
        const postcode = this.props.route.params.postcode;
        const city = this.props.route.params.city;
        const countrystate = this.props.route.params.countrystate;
        const country = this.props.route.params.country;
        const details = this.props.route.params.details;
        if(this.checkInfo()){
            console.log('true')
            const field = this.fields[this.state.field]
            const specialization = this.getItems(this.fields[this.state.field])[this.state.specialization]
            const experience = this.experiences[this.state.experience]
            console.log(field,specialization,experience)
            this.setState({loading: true})
            firebase.auth().createUserWithEmailAndPassword(email,password).then((result) => {

                firebase.firestore().collection("users")
                    .doc(firebase.auth().currentUser.uid)
                    .set({
                        username,
                        email,
                        realname,
                        phone,
                        address,
                        postcode,
                        city,
                        countrystate,
                        country,
                        details,
                        field,
                        specialization,
                        experience,
                        reting: 0,
                        reviews: 0,
                        serverdate: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                console.log(result)
            })
            .catch((error) => {
                console.log(error)
            }).then(() => {
                this.setState({loading: false})
                const registerdateString = firebase.auth().currentUser.metadata.creationTime.substring(5,16);
                const registerdate = new Date().getTime()
                const id = firebase.auth().currentUser.uid;
                firebase.storage().ref('/images/Default Images/blankprofile.png').getDownloadURL().then((image) => 
                    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                        registerdateString,
                        registerdate,
                        image,
                        id,
                    })
                )
            })
        }
        else{
            console.log('false')
        }
    }

    getItems(field) {
        if (field == 'Entertainment'){     
            return this.ent;
        }
        else if(field == 'Software Engineering'){
            return this.softeng;
        }
        else if(field == 'Art'){ 
          return this.art;
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
            return this.empty;
        }
    }

    setField = (option) => {
        if(option!=0){
            //callback to use setState mutated value, new value is actually in new pending state
            this.setState({field: option});
            this.setState({specialization: '0'});
        }
    }  
    setSpecial = (option) => {
        if(option!=0){
            //callback to use setState mutated value, new value is actually in new pending state
            this.setState({specialization: option});
        }
    }
}

class ExperienceDrop extends Component{
    constructor(props){
        super(props)
        this.state = {experience: props.state.experience};
        this.experiences = props.experiences;
    }
    render(){
        return(
            <View style={styles.dropdown}>
                    <Picker
                        selectedValue={this.state.experience}
                        onValueChange={this.setExpe}>
                            {this.experiences.map((item,i)=>{
                                return <Picker.Item label={item} value={i} key={i}/>
                            })}
                    </Picker>
            </View>
        )
    }
    setExpe = (option) => {
        if(option!=0){
            //callback to use setState mutated value, new value is actually in new pending state
            this.setState({experience: option},() => {this.props.setParent(this.state.experience);});
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
    dropdown: {
        marginTop: 50,
        alignSelf: 'center',
        width: width*0.65,
        marginBottom: 5,
        backgroundColor: '#c7c8c9',
        borderRadius: 15,
    },
    btncontainer: {
        alignSelf: 'center',
        marginTop: height*0.05,
        flexDirection: 'row',
    },
})

export default Register4