import React, { Component, useState , memo } from 'react'
import { View, Text, RefreshControl, TextInput, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated, FlatList } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase/compat';
import "firebase/compat/firestore";
import RBSheet from "react-native-raw-bottom-sheet";
import { Picker } from '@react-native-picker/picker';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers} from 'react-native-popup-menu';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export class Errands extends Component{
    constructor(props){
        super(props);

        this.page= this.props.route.params.page,
        this.id = firebase.auth().currentUser.uid;
        this.privacy = true;
        
        this.fields = ['None'].concat(['Entertainment','Software Engineering','Art','Architecture and Engineering','Digital Art','Business Management','Media and Communications','Education','Repair and Maintenance','Healthcare','Literature'].sort());
        this.experiences = ['None','Novice','Intermediate','Expert'];
        this.empty = ['None'];
        this.ent = ['None'].concat(['Streaming','Gaming','Vocalist','Film-maker','Voice-Acting','Instrumentalist'].sort()).concat(['Others']);
        this.softeng = ['None'].concat(['Web Designer','App Developer','Cybersecurity','Game Designer'].sort()).concat(['Others']);
        this.art = ['None'].concat(['Origami','Drawing','Figure Modeling','Fashion Designer','Photographer'].sort()).concat(['Others']);
        this.digiart = ['None'].concat(['Graphic Designer','UI Designer','3D Printing'].sort()).concat(['Others']);
        this.arch = ['None'].concat(['Architect','Civil Engineer','Landscape Architect','Sustainable Designer','Biomedical Engineer'].sort()).concat(['Others']);
        this.buss = ['None'].concat(['Marketing Assistant','Accountant','Personal Finance Advisor'].sort()).concat(['Others']);
        this.media = ['None'].concat(['Journalist','Copywriter','Event Planner','Social Media Manager','Social Media Influencer','Virtual Assistant','Community Manager'].sort()).concat(['Others']);
        this.edu = ['None'].concat(['Teacher','Home-Tutor','Online-Tutor'].sort()).concat(['Others']);
        this.repair = ['None'].concat(['Plumber','Electrical Technician','Carpenter'].sort()).concat(['Others']);
        this.health = ['None'].concat(['Nurse','Certified Physician','Veterinarian','Dental Specialist','Therapist','Personal Trainer','Beauty Advisor'].sort()).concat(['Others']);
        this.liter = ['None'].concat(['Writer','Proof-Reader','Translator','Transcriptionist'].sort()).concat(['Others']);
        this.type = ['None','Remote','Local'];

        this.state = {
            type: '',
            errand: {
                id: '',
                title: '',
                date: '',
                field: '',
                specialization: '',
                experience: '',
                type: '',
                payment: '',
                status: '',
                keywords: [],
            },
            savederrands: [],
            saved: [],
            errands: [],

            refresh: false,
            open: false,
            self: false,
            other: false,
            private: false,
            complete: false,
            cancel: false,
            close: false,
            requests: false,

            field: 'None',
            specialization: 'None',
            experience: 'None',
            errandtype: 'None',
            
            preferfield: '',
            
            max: 0,
            limit: 10,
        }
    }

    componentDidMount(){
        firebase.database().ref().child("savederrands").child(this.id).on('value',snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((data)=>{
                    arr.push(data.val().errandid)
                })
                this.setState({savederrands: arr})
            }
            else {
                this.setState({savederrands: arr})
            }
        })

        firebase.database().ref().child("userpreferences").child(firebase.auth().currentUser.uid).child("fields").orderByChild("views").limitToLast(1).once('value',snapshot=>{
            if(snapshot.exists()){
                snapshot.forEach(data=>{
                    if(data.val().views > 30){
                        this.setState({preferfield: data.key})
                    }
                })
            }
        }).then(()=>{
            if(this.page=='main'){
                this.setState({type: 'browse'}, ()=>this.readErrands())
            }
            else {
                this.setState({type: 'in progress'}, ()=>this.readErrands())
            }
        })
    }

    componentWillUnmount() {
        firebase.database().ref().child("savederrands").child(this.id).off('value')
        firebase.database().ref().child("errands").child(this.id).off('value')
        firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").off('value')        
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

    readErrands(){
        this.setState({saved: [], errands: []})
        firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").off('value')
        if(this.state.type=='browse'){
            this.readDefaultErrands()
        }
        else if(this.state.type=='saved'){
            this.readSavedErrands()
        }
        else if(this.state.type=='history'){
            this.readErrandsHistory()
        }
        else if(this.state.type=='in progress'){
            this.readErrandsInProgress()
        }
        else if(this.state.type=='pending'){
            this.readPendingErrands()
        }
        this.setState({refresh: false})
    }

    readDefaultErrands() {
        const ref = firebase.firestore().collection("errands").where("privacy","==",true).where("status","==","Open").orderBy("requests","desc")
        const arr = []
        if(this.state.field == 'None' && this.state.specialization == 'None' &&this.state.experience == 'None' &&this.state.errandtype == 'None'){
            firebase.firestore().collection("errands").where("privacy","==",true).where("status","==","Open").where("field","==",this.state.preferfield).orderBy("serverdate","desc").get().then(doc=>{
                firebase.firestore().collection("errands").where("privacy","==",true).where("status","==","Open").where("field","!=",this.state.preferfield).get().then(doc2=>{
                    if(!doc.empty || doc2.empty){
                        this.setState({max: doc.size},console.log(this.state.max))
                    }
                    else if(doc.empty || !doc2.empty){
                        this.setState({max: doc2.size},console.log(this.state.max))
                    }
                    else if(!doc.empty || !doc2.empty){
                        this.setState({max: doc.size + doc2.size},console.log(this.state.max))
                    }
                    else {
                        this.setState({max: 0},console.log(this.state.max))
                    }
                }).then(()=>{
                    firebase.firestore().collection("errands").where("privacy","==",true).where("status","==","Open").where("field","==",this.state.preferfield).orderBy("serverdate","desc").limit(this.state.limit/2).get().then((querySnapshot)=>{
                        console.log("Reading Default Errands")
                        this.setState({saved: [], errands: []})
                        if(querySnapshot!=null){
                            querySnapshot.forEach(documentSnapshot=>{
                                this.setState({
                                    errand:{
                                        id: documentSnapshot.id,
                                        title: documentSnapshot.data().title,
                                        datecreated: documentSnapshot.data().datecreated,
                                        field: documentSnapshot.data().field,
                                        specialization: documentSnapshot.data().specialization,
                                        experience: documentSnapshot.data().experience,
                                        type: documentSnapshot.data().type,
                                        payment: documentSnapshot.data().payment,
                                        status: documentSnapshot.data().status,
                                        keywords: documentSnapshot.data().keywords,
                                    }
                                })
                                arr.push(this.state.errand)
                            })
                            this.setState({errands: arr, saved: arr})
                        }
                    }).then(()=>{
                        firebase.firestore().collection("errands").where("privacy","==",true).where("status","==","Open").where("field","!=",this.state.preferfield).limit(this.state.limit/2).get().then((querySnapshot)=>{
                            if(querySnapshot!=null){
                                querySnapshot.forEach(documentSnapshot=>{
                                    this.setState({
                                        errand:{
                                            id: documentSnapshot.id,
                                            title: documentSnapshot.data().title,
                                            datecreated: documentSnapshot.data().datecreated,
                                            field: documentSnapshot.data().field,
                                            specialization: documentSnapshot.data().specialization,
                                            experience: documentSnapshot.data().experience,
                                            type: documentSnapshot.data().type,
                                            payment: documentSnapshot.data().payment,
                                            status: documentSnapshot.data().status,
                                            keywords: documentSnapshot.data().keywords,
                                        }
                                    })
                                    arr.push(this.state.errand)
                                })
                                this.setState({errands: arr, saved: arr})
                            }
                        })
                    })
                })
            })
        }
        else {
            const sortfield = this.sortAlgo("field",this.state.field,ref)
            const sortspec = this.sortAlgo("specialization",this.state.specialization,sortfield)
            const sortex = this.sortAlgo("experience",this.state.experience,sortspec)
            const sorttype = this.sortAlgo("type",this.state.errandtype,sortex)
    
            sorttype.get().then((querySnapshot)=>{
                if(!querySnapshot.empty){
                    this.setState({max: querySnapshot.size})
                }
                else {
                    this.setState({max: 0})
                }
            })
    
            const finaltype = sorttype.limit(this.state.limit)
            
            finaltype.get().then((querySnapshot)=>{
                const arr = []
                console.log("Reading Default Errands")
                this.setState({saved: [], errands: []})
                if(querySnapshot!=null){
                    querySnapshot.forEach(documentSnapshot=>{
                        this.setState({
                            errand:{
                                id: documentSnapshot.id,
                                title: documentSnapshot.data().title,
                                datecreated: documentSnapshot.data().datecreated,
                                field: documentSnapshot.data().field,
                                specialization: documentSnapshot.data().specialization,
                                experience: documentSnapshot.data().experience,
                                type: documentSnapshot.data().type,
                                payment: documentSnapshot.data().payment,
                                status: documentSnapshot.data().status,
                                keywords: documentSnapshot.data().keywords,
                            }
                        })
                        arr.push(this.state.errand)
                    })
                    this.setState({errands: arr, saved: arr})
                }
            })
        }
    }

    sortAlgo(attr,sort,ref) {
        if(sort!='None'){
            return ref.where(attr,"==",sort)
        }
        else {
            return ref
        }
    }
    
    readSavedErrands() {
        firebase.database().ref().child("savederrands").child(this.id).once('value',snapshot=>{
            const arr = []
            if(snapshot.exists()){
                snapshot.forEach((doc)=>{
                    firebase.firestore().collection("errands").doc(doc.val().errandid).get().then((data)=>{
                        if(data!=null){
                            if(data.data().status=="Open"){
                                this.setState({
                                    errand:{
                                        id: data.id,
                                        title: data.data().title,
                                        datecreated: data.data().datecreated,
                                        field: data.data().field,
                                        specialization: data.data().specialization,
                                        experience: data.data().experience,
                                        type: data.data().type,
                                        payment: data.data().payment,
                                        status: data.data().status,
                                        keywords: data.data().keywords,
                                    }
                                })
                                arr.push(this.state.errand)
                                this.setState({errands: arr, saved: arr})
                            }
                        }
                    })
                })
            }
            else {
                this.setState({errands: arr, saved: arr})
            }
        })
    }

    readErrandsHistory(){
        if(this.state.complete){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='completed' && data.val().creatorid==this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='completed' && data.val().creatorid!=this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='completed'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(this.state.cancel){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='cancelled' && data.val().creatorid==this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='cancelled' && data.val().creatorid!=this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='cancelled'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(this.state.close){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='closed' && data.val().creatorid==this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='closed' && data.val().creatorid!=this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='closed'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(this.state.open){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='open' && data.val().creatorid==this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='open' && data.val().creatorid!=this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='open'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(!this.state.complete && !this.state.cancel && !this.state.close && !this.state.open){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            arr1.push(data.val().errandid)
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
    }

    readErrandsInProgress(){
        if(this.state.complete){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && data.val().status=='pending complete'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && data.val().status=='pending complete'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                if(this.state.self){
                    firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                        const arr = []
                        const arr1 = []
                        if(snapshot.exists()){
                            snapshot.forEach((data)=>{
                                if(data.val().status=='pending complete'){
                                    arr1.push(data.val().errandid)
                                }
                            })
                            const arr2 = arr1.reverse()
                            arr2.forEach((id)=>{
                                this.readErrandsType(id,arr)
                            })
                        }
                        else {
                            this.setState({errands: arr, saved: arr})
                        }
                    })
                }
            }
        }
        else if(this.state.cancel){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && data.val().status=='pending cancel'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && data.val().status=='pending cancel'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                if(this.state.self){
                    firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                        const arr = []
                        const arr1 = []
                        if(snapshot.exists()){
                            snapshot.forEach((data)=>{
                                if(data.val().status=='pending cancel'){
                                    arr1.push(data.val().errandid)
                                }
                            })
                            const arr2 = arr1.reverse()
                            arr2.forEach((id)=>{
                                this.readErrandsType(id,arr)
                            })
                        }
                        else {
                            this.setState({errands: arr, saved: arr})
                        }
                    })
                }
            }
        }
        else if(!this.state.complete && !this.state.cancel){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && (data.val().status=='pending complete' || data.val().status=='pending cancel' || data.val().status=='in progress')){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && (data.val().status=='pending complete' || data.val().status=='pending cancel' || data.val().status=='in progress')){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").once('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().status=='pending complete' || data.val().status=='pending cancel' || data.val().status=='in progress'){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
    }

    readPendingErrands() {
        if(this.state.private){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && data.val().privacy==false && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && data.val().privacy==false && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().privacy==false && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(this.state.requests){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && data.val().privacy && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && data.val().privacy && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().privacy && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
        else if(!this.state.private && !this.state.requests){
            if(this.state.self){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid==this.id && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().creatorid!=this.id && data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
            else if(!this.state.self && !this.state.other){
                firebase.database().ref().child("errands").child(this.id).orderByChild("serverdate").on('value',snapshot=>{
                    const arr = []
                    const arr1 = []
                    if(snapshot.exists()){
                        snapshot.forEach((data)=>{
                            if(data.val().request){
                                arr1.push(data.val().errandid)
                            }
                        })
                        const arr2 = arr1.reverse()
                        arr2.forEach((id)=>{
                            this.readErrandsType(id,arr)
                        })
                    }
                    else {
                        this.setState({errands: arr, saved: arr})
                    }
                })
            }
        }
    }

    readErrandsType(id,arr){
        firebase.firestore().collection("errands").doc(id).get().then((documentSnapshot)=>{
            if(documentSnapshot!=null){
                this.setState({
                    errand:{
                        id: documentSnapshot.id,
                        title: documentSnapshot.data().title,
                        datecreated: documentSnapshot.data().datecreated,
                        field: documentSnapshot.data().field,
                        specialization: documentSnapshot.data().specialization,
                        experience: documentSnapshot.data().experience,
                        type: documentSnapshot.data().type,
                        payment: documentSnapshot.data().payment,
                        status: documentSnapshot.data().status,
                        keywords: documentSnapshot.data().keywords,
                    }
                })
                arr.push(this.state.errand)
                this.setState({errands: arr, saved: arr})
            }
        })
    }

    render(){
        return (
            <View style={{flex:1, minWidth: width}}>

                {this.getHeading()}

                <FlatList
                    initialNumToRender={3}
                    ListHeaderComponent={
                        <View>
                            {this.getSorting()}
                
                            {this.sortOptions()}

                            {this.getEmpty()}
                        </View>
                    }
                    data={this.state.errands}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.setState({refresh: true, limit: 10}, ()=>this.readErrands())}
                        />
                    }
                    ListFooterComponent={
                        <View>
                            {this.getLoadMore()}
                        </View>
                    }
                    renderItem={({item,i})=>
                        <Errand key={i} item={item} type={this.state.type} like={this.getStar(item.id)} navigation={this.props.navigation}/>
                    }
                    keyExtractor={(item, index) => item.id.toString()}
                ></FlatList>   

                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
                    height={height*0.6}
                    openDuration={250}
                    customStyles={{
                        container: {
                            padding: 20,
                        }
                    }}
                    >
                    <View>
                        {this.getSort()}
                    </View>
                </RBSheet>

            </View>
        )
    }

    getLoadMore() {
        if(this.state.errands.length < this.state.max && this.state.type=='browse'){
            return (
                <TouchableOpacity
                    onPress={()=>this.setState({limit: this.state.limit + 10}, ()=>this.readErrands())}
                ><Text style={{padding: 10, alignSelf: 'center', backgroundColor: 'white', borderRadius: 10, marginTop: 10, marginBottom: 10}}>More</Text></TouchableOpacity>
            )
        }
    }

    getHeading() {
        if(this.page=='main'){
            return (
                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({
                            type: 'browse',
                            refresh: false,
                            open: false,
                            self: false,
                            other: false,
                            private: false,
                            complete: false,
                            limit: 10,
                            cancel: false}, ()=>this.readErrands())}
                    >
                    <Text style={{color: this.state.type=='browse' ? '#4a9df0': 'black', fontSize: this.state.type=='browse' ? 16:14}}>Browse</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({
                            type: 'saved',
                            refresh: false,
                            open: false,
                            self: false,
                            other: false,
                            private: false,
                            complete: false,
                            cancel: false}, ()=>this.readErrands())}
                    ><Text style={{color: this.state.type=='saved' ? '#4a9df0': 'black', fontSize: this.state.type=='saved' ? 16:14}}>Saved</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else if(this.page=='progress'){
            return (
                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({
                            type: 'in progress', 
                            refresh: false,
                            open: false,
                            self: false,
                            other: false,
                            private: false,
                            complete: false,
                            cancel: false}, ()=>this.readErrands())}
                    >
                    <Text style={{color: this.state.type=='in progress' ? '#4a9df0': 'black', fontSize: this.state.type=='in progress' ? 16:14}}>In Progress</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({
                            type: 'pending', 
                            refresh: false,
                            open: false,
                            self: false,
                            other: false,
                            private: false,
                            complete: false,
                            cancel: false}, ()=>this.readErrands())}
                    ><Text style={{color: this.state.type=='pending' ? '#4a9df0': 'black', fontSize: this.state.type=='pending' ? 16:14}}>Pending</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                        style={styles.navbar}
                        onPress={()=>this.setState({
                            type: 'history', 
                            refresh: false,
                            open: false,
                            self: false,
                            other: false,
                            private: false,
                            complete: false,
                            cancel: false}, ()=>this.readErrands())}
                    >
                    <Text style={{color: this.state.type=='history' ? '#4a9df0': 'black', fontSize: this.state.type=='history' ? 16:14}}>History</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    getSorting(){
        if(this.state.type=='browse'){
            return (
                <View style={styles.browse}>
                    <Icon name='tune' style={{fontSize:30, marginRight: 30, color: '#ff8717'}} onPress={() => this.RBSheet.open()}></Icon>
                    <Icon name='plus-circle-outline' style={{fontSize:30, marginRight: 20, color: '#3e85f0'}} onPress={()=>this.toCreateErrand()}></Icon>
                </View>
            )
        }
    }

    sortOptions(){
        if(this.state.type=='history'){
            return (
                <ScrollView horizontal={true} style={{paddingTop: 5}}>

                    <View style={{paddingLeft: 20, paddingRight: 20,flexDirection: 'row'}}>
                        <Menu>
                            <Text>From:</Text>
                            <MenuTrigger customStyles={{triggerWrapper:{alignSelf: 'flex-start', marginRight: 10}}}>
                                <Text style={{width: 100, textAlign: 'center', backgroundColor: '#949494', paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>{this.getFrom()}</Text>
                            </MenuTrigger>
                            <MenuOptions optionsContainerStyle={{marginTop: 40, width: 80, borderRadius: 10, padding: 10}}>
                                <MenuOption customStyles={{optionText:{color: this.getFromWho(1)}}} text='All' onSelect={()=>this.setState({self: false, other: false}, ()=>this.readErrands())}></MenuOption>
                                <MenuOption customStyles={{optionText:{color: this.getFromWho(2)}}} text='Me' onSelect={()=>this.setState({self: true, other: false}, ()=>this.readErrands())}></MenuOption>
                                <MenuOption customStyles={{optionText:{color: this.getFromWho(3)}}} text='Others' onSelect={()=>this.setState({self: false, other: true}, ()=>this.readErrands())}></MenuOption>
                            </MenuOptions>
                        </Menu>
                        
                        <TouchableOpacity
                            onPress={()=>this.setState({complete: !this.state.complete, cancel: false, close: false, open: false}, ()=>this.readErrands())}
                        ><Text style={{marginTop: 20, marginRight: 10, backgroundColor: this.getStyle(this.state.complete), marginBottom: 10, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Completed</Text></TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>this.setState({cancel: !this.state.cancel, complete: false, close: false, open: false}, ()=>this.readErrands())}
                        ><Text style={{marginTop: 20, marginRight: 10, backgroundColor: this.getStyle(this.state.cancel), paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Cancelled</Text></TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>this.setState({cancel: false, complete: false, close: false, open: !this.state.open}, ()=>this.readErrands())}
                        ><Text style={{marginTop: 20, marginRight: 10, backgroundColor: this.getStyle(this.state.open), paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Open</Text></TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>this.setState({cancel: false, complete: false, close: !this.state.close, open: false}, ()=>this.readErrands())}
                        ><Text style={{marginTop: 20, backgroundColor: this.getStyle(this.state.close), paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Closed</Text></TouchableOpacity>
                    </View>

                </ScrollView>
            )
        }
        else if(this.state.type=='in progress'){
            return (
                <ScrollView horizontal={true} style={{paddingTop: 5}}>

                    <View style={{paddingLeft: 20, paddingRight: 20,flexDirection: 'row'}}>
                    <Menu>
                        <Text>From:</Text>
                        <MenuTrigger customStyles={{triggerWrapper:{alignSelf: 'flex-start', marginRight: 10}}}>
                            <Text style={{width: 100, textAlign: 'center', backgroundColor: '#949494', paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>{this.getFrom()}</Text>
                        </MenuTrigger>
                        <MenuOptions optionsContainerStyle={{marginTop: 40, width: 80, borderRadius: 10, padding: 10}}>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(1)}}} text='All' onSelect={()=>this.setState({self: false, other: false}, ()=>this.readErrands())}></MenuOption>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(2)}}} text='Me' onSelect={()=>this.setState({self: true, other: false}, ()=>this.readErrands())}></MenuOption>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(3)}}} text='Others' onSelect={()=>this.setState({self: false, other: true}, ()=>this.readErrands())}></MenuOption>
                        </MenuOptions>
                    </Menu>

                    <TouchableOpacity
                        onPress={()=>this.setState({cancel: false, complete: !this.state.complete}, ()=>this.readErrands())}
                    ><Text style={{marginTop: 20, marginRight: 10, backgroundColor: this.getStyle(this.state.complete), marginBottom: 10, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>To Complete</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this.setState({cancel: !this.state.cancel, complete: false}, ()=>this.readErrands())}
                    ><Text style={{marginTop: 20, backgroundColor: this.getStyle(this.state.cancel), marginBottom: 10, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>To Cancel</Text></TouchableOpacity>
                    </View>

                </ScrollView>
            )
        }
        else if(this.state.type=='pending'){
            return (
                <ScrollView horizontal={true} style={{paddingTop: 5}}>
                    
                    <View style={{paddingLeft: 20, paddingRight: 20,flexDirection: 'row'}}>
                    <Menu>
                        <Text>From:</Text>
                        <MenuTrigger customStyles={{triggerWrapper:{alignSelf: 'flex-start', marginRight: 10}}}>
                            <Text style={{width: 100, textAlign: 'center', backgroundColor: '#949494', paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>{this.getFrom()}</Text>
                        </MenuTrigger>
                        <MenuOptions optionsContainerStyle={{marginTop: 40, width: 80, borderRadius: 10, padding: 10}}>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(1)}}} text='All' onSelect={()=>this.setState({self: false, other: false}, ()=>this.readErrands())}></MenuOption>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(2)}}} text='Me' onSelect={()=>this.setState({self: true, other: false}, ()=>this.readErrands())}></MenuOption>
                            <MenuOption customStyles={{optionText:{color: this.getFromWho(3)}}} text='Others' onSelect={()=>this.setState({self: false, other: true}, ()=>this.readErrands())}></MenuOption>
                        </MenuOptions>
                    </Menu>
                
                    <TouchableOpacity
                        onPress={()=>this.setState({private: !this.state.private, requests: false}, ()=>this.readErrands())}
                    ><Text style={{marginTop: 20, marginRight: 10, backgroundColor: this.getStyle(this.state.private), marginBottom: 10, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Private Errands</Text></TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this.setState({private: false, requests: !this.state.requests}, ()=>this.readErrands())}
                    ><Text style={{marginTop: 20, backgroundColor: this.getStyle(this.state.requests), marginBottom: 10, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, alignSelf: 'flex-start', borderRadius: 10}}>Requested Errands</Text></TouchableOpacity>
                
                    </View>
                    
                </ScrollView>
            )
        }
    }

    getFromWho(item){
        if(item == 2 && this.state.self){
            return 'black'
        }
        else if(item == 3 && this.state.other){
            return 'black'
        }
        else if(item == 1 && !this.state.other && !this.state.self){
            return 'black'
        }
        else {
            return '#a6a6a6'
        }
    }

    getFrom(){
        if(this.state.self){
            return 'Me'
        }
        else if(this.state.other){
            return 'Others'
        }
        else {
            return 'All'
        }
    }
    
    getStyle(bool) {
        if(bool){
            return '#949494'
        }
        else {
            return '#dbdbdb'
        }
    }
    
    getEmpty() {
        if(this.state.errands.length < 1){
            return (
                <Text style={{width: width, textAlign: 'center', marginTop: 50}}>No errands found</Text>
            )
        }
    }
    
    toCreateErrand() {
        this.props.navigation.navigate("Create Errand", {privacy: true})
    }
    
    getSort() {
        return (
            <ScrollView>
                <Text style={styles.filterheader}>Field</Text>
                <View style={this.getFilterBtn(this.state.field)}>
                    <Picker
                        selectedValue={this.state.field}
                        onValueChange={(option)=>this.setState({field: option, specialization: 'None'})}>
                            {this.fields.map((item,i)=>{
                                    return <Picker.Item style={styles.pickeritem} label={item} value={this.fields[i]} key={i}/>
                            })}
                    </Picker>
                </View>

                <Text style={styles.filterheader}>Specialization</Text>
                <View style={this.getFilterBtn(this.state.specialization)}>
                    <Picker
                        selectedValue={this.state.specialization}
                        onValueChange={(option)=>this.setState({specialization: option})}>
                            {this.getItems(this.state.field).map((item,i)=>{
                                return <Picker.Item style={styles.pickeritem} label={item} value={this.getItems(this.state.field)[i]} key={i}/>
                            })}
                    </Picker>
                </View>

                <Text style={styles.filterheader}>Recommended Experience</Text>
                <View style={this.getFilterBtn(this.state.experience)}>
                    <Picker
                        selectedValue={this.state.experience}
                        onValueChange={(option)=>this.setState({experience: option})}>
                            {this.experiences.map((item,i)=>{
                                return <Picker.Item style={styles.pickeritem} label={item} value={this.experiences[i]} key={i}/>
                            })}
                    </Picker>
                </View>

                <Text style={styles.filterheader}>Type</Text>
                <View style={this.getFilterBtn(this.state.errandtype)}>
                    <Picker       
                        selectedValue={this.state.errandtype}
                        onValueChange={(option)=>this.setState({errandtype: option})}>
                            {this.type.map((item,i)=>{
                                    return <Picker.Item style={styles.pickeritem} label={item} value={this.type[i]} key={i}/>
                            })}
                    </Picker>
                </View>
                <TouchableOpacity
                    onPress={()=>{
                        this.setState({limit: 10},()=>{
                            this.readErrands() 
                        })
                        this.RBSheet.close()
                    }}
                ><Text style={styles.filterbtn}>Filter</Text></TouchableOpacity>
            </ScrollView>
        )
    }

    getFilterBtn(check) {
        if(check=="None"){
            return {
                backgroundColor: '#cfcfcf',
                borderRadius: 10,
                marginBottom: 5,
                marginTop: 3,
            }
        }
        else {
            return {
                backgroundColor: '#f2a157',
                borderRadius: 10,
                marginBottom: 5,
                marginTop: 3,
            }
        }
    }

    getItems(field){
        if(field=='None'){
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

    getStar(id) {
        if(this.state.savederrands.includes(id)){
            return true
        }
        else {
            return false
        }
    }
}

class Errand extends Component {
    constructor(props){
        super(props);

        this.item = this.props.item;
        this.id = firebase.auth().currentUser.uid;
        this.navigation = this.props.navigation;
        this.state = {
            type: this.props.type,
            like: this.props.like,
        }
    }

    render() {
        return (
            <View>
                <TouchableOpacity
                    onPress={()=>this.viewErrandDetails(this.item.id)}>
                    <View style={styles.errand}>
                        <Text numberOfLines={1} style={{fontSize: 12, alignSelf: 'flex-end', padding: 5, borderRadius: 10, maxWidth: width*0.35, textAlign: 'right', backgroundColor: this.getStatusColor(this.item.status)}}>{this.item.status}</Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text numberOfLines={3} style={styles.title}>{this.item.title}</Text>
                            {this.getStar(this.item.id)}
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View>
                                <Text numberOfLines={1} style={styles.date}>Posted {this.differenceInDays(new Date().getTime(),this.item.datecreated)}</Text>
                                
                                <View style={{flexDirection: 'row', marginBottom: 5}}>
                                    <View style={{marginRight: 10, maxWidth: width*0.4}}>
                                        <Text style={styles.field}>Field </Text>
                                        <Text numberOfLines={2} style={this.item.field=='-'? {fontSize: 14, fontWeight: 'bold', padding: 5,}:styles.infofield}>{this.item.field}</Text>
                                    </View>
                                    <View style={{maxWidth: width*0.4}}>
                                        <Text style={styles.specialization}>Specialization </Text>
                                        <Text numberOfLines={2} style={styles.infosmall}>{this.item.specialization}</Text>
                                    </View>
                                </View>

                                <Text style={styles.experience}>Recommended experience </Text>
                                <Text numberOfLines={1} style={{fontSize: 14, fontWeight: 'bold', color: this.getExpeColor(this.item.experience)}}>{this.item.experience}</Text>

                                <Text numberOfLines={1} style={styles.type}>Type </Text>
                                <Text numberOfLines={1} style={styles.info}>{this.item.type}</Text>

                                <Text numberOfLines={1} style={styles.payment}>Payment</Text>
                                <Text numberOfLines={1} style={styles.pay}>MYR $</Text>
                                <Text numberOfLines={1} style={styles.number}>{this.item.payment}</Text>
                            </View>

                            <Icon
                                name='dots-horizontal'
                                style={styles.moredetail}
                                onPress={()=>this.viewErrandDetails(this.item.id)}
                            ></Icon>
                        </View>
                        
                        {this.getKeywords(this.item)}
                        
                    </View>
                </TouchableOpacity>

                <View style={styles.split}>
                    <View style={{borderBottomWidth: 0.2, borderBottomColor: '#919191'}}></View>    
                </View>
            </View>
        )
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

    getStar(id) {
        if(this.state.like==true){
            return this.unSaveStar(id)
        }
        else {
            return this.saveStar(id)
        }
    }

    unSaveStar(id) {
        if(this.state.type=='browse' || this.state.type=='saved'){
            return (
                <Icon
                    name='heart'
                    style={styles.unstar}
                    onPress={()=>this.unSaveErrand(id)}
                ></Icon>
            )
        }
    }

    saveStar(id) {
        if(this.state.type=='browse' || this.state.type=='saved'){
            return (
                <Icon
                    name='heart-outline'
                    style={styles.star}
                    onPress={()=>this.saveErrand(id)}
                ></Icon>
            )
        }
    }

    getKeywords(item){
        if(item.keywords.length > 0){
            return (
                <ScrollView
                    style={{height: height*0.05, backgroundColor: 'white', width: width*0.95, borderRadius: 10}}
                    horizontal={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                >
                    {item.keywords.map((item,index)=>{
                        return (
                            <Text key={index} style={{textAlign: 'center', backgroundColor: '#d6d6d6', borderRadius: 10, padding: 5, marginLeft: 5, marginRight: 5}}>{item}</Text>
                        )
                    })}
                </ScrollView>
            )
        }
    }

    viewErrandDetails(id) {
        this.navigation.navigate("Errand Details", {errandid: id, type: this.state.type})
    }

    saveErrand(id) {
        this.setState({like: true})
        firebase.database().ref().child("savederrands").child(this.id).child(id).set({
            errandid: id,
        })
    }

    unSaveErrand(id) {
        this.setState({like: false})
        firebase.database().ref().child("savederrands").child(this.id).child(id).remove()
    }

    getStatusColor(name){
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

    getExpeColor(ex) {
        if(ex=='Novice'){
            return '#ffe75c'
        }
        else if(ex=='Intermediate'){
            return '#66ff3b'
        }
        else if(ex=='Expert'){
            return '#5ca5ff'
        }
    }
}

const styles = StyleSheet.create({
    filterbtn:{ 
        alignSelf: 'flex-end',
        marginRight: 10,
        marginTop: height*0.02,
        backgroundColor: '#f2a157',
        padding: 5,
        fontSize: height*0.03,
        borderRadius: 10,
        color: 'white',
    },
    filterheader: {
        textDecorationLine: 'underline'
    },
    navigation: {
        flexDirection: 'row',
        alignSelf: 'center',
        height: 50,
        borderBottomWidth: 0.5,
        borderColor: '#9a9b9c',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    navbar: {
        alignSelf: 'center',
        alignItems: 'center',
        flex: 1,
    },
    browse: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 10,
        alignSelf: 'flex-end',
        marginBottom: 5,
        borderColor: '#9a9b9c',
    },
    errand: {
        width: width,
        padding: 10,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
    },
    split: {
        height: width*0.02,
        width: width*0.95,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    star: {
        fontSize: 30,
        position: 'absolute',
        top: 10,
        right: 10,
        color: '#a6a6a6'
    },
    unstar: {
        fontSize: 30,
        position: 'absolute',
        top: 10,
        right: 10,
        color: '#fff71f',
    },
    moredetail: {
        fontSize: 30,
        position: 'absolute',
        bottom: 5,
        right: 10,
    },
    title: {
        fontSize: 20,
        paddingRight: width*0.15,
        fontWeight: 'bold'
    },
    date: {
        fontSize: 12,
        paddingRight: width*0.15,
        marginBottom: 10,
    },
    field: {
        fontSize: 12,
        color: '#9c9c9c'
    },
    specialization: {
        fontSize: 12,
        color: '#9c9c9c'
    },
    experience: {
        fontSize: 12,
        color: '#9c9c9c',
    },
    info: {
        fontSize: 14,
    },
    infofield: {
        fontSize: 15,
        fontWeight: 'bold',
        //padding: 5,
        borderRadius: 10,
        //backgroundColor: '#ffa057',
        color: '#0059b8'
    },
    infosmall: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    type: {
        fontSize: 12,
        color: '#9c9c9c',
        marginTop: 10,
    },
    payment: {
        marginTop: 10,
        fontSize: 14,
        paddingRight: 60,
        color: '#9c9c9c',
    },
    pay: {
        fontSize: 12,
        paddingRight: 60,
    },
    number: {
        fontSize: 16,
        paddingRight: 60,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
})

export default memo(Errands)