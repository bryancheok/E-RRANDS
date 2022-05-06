import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, LogBox, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import Dialog from "react-native-dialog";
import _ from 'lodash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { NavigationContainer, getFocusedRouteNameFromRoute, NavigationContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';

import firebase from 'firebase/compat/app';
import 'firebase/compat';
import Register1 from './Components/Auth/Register1';
import Register2 from './Components/Auth/Register2';
import Register3 from './Components/Auth/Register3';
import Register4 from './Components/Auth/Register4';
import PasswordRecovery from './Components/Auth/PasswordRecovery';
import Login from './Components/Auth/Login';
import Errands from './Components/BrowsePage/Errands';
import CreateErrands from './Components/BrowsePage/CreateErrands';
import ErrandDetails from './Components/BrowsePage/ErrandDetails';
import CreateRequest from './Components/BrowsePage/CreateRequest';
import Requests from './Components/BrowsePage/Requests';
import RequestDetail from './Components/BrowsePage/RequestDetail';
import Profile from './Components/SocialPage/Profile';
import Feeds from './Components/FeedPage/Feeds';
import FeedDetails from './Components/FeedPage/FeedDetails';
import CreateFeed from './Components/FeedPage/CreateFeed';
import Gallery from './Components/SocialPage/Gallery';
import RelatedUsers from './Components/SocialPage/RelatedUsers';
import FindUser from './Components/SocialPage/FindUser';
import Notifications from './Components/SocialPage/Notifications';
import ViewProfile from './Components/ViewProfile';
import ViewGallery from './Components/ViewGallery';
import Chat from './Components/Chat';
import Messages from './Components/Messages';
import GlobalChatPage from './Components/GlobalChat/GlobalChatPage';
import CreateReview from './Components/BrowsePage/CreateReview';
import UserReviews from './Components/UserReviews';

LogBox.ignoreLogs(['Setting a timer']);
// LogBox.ignoreAllLogs();
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyAbHMGYA8BGHhOf2doQf3RK0TB_QU3eaXA",
  authDomain: "e-rrands-5ef27.firebaseapp.com",
  databaseURL: "https://e-rrands-5ef27-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "e-rrands-5ef27",
  storageBucket: "e-rrands-5ef27.appspot.com",
  messagingSenderId: "511680154159",
  appId: "1:511680154159:web:99e9df4e34b3e7220b94da",
  measurementId: "G-Q455LWNRLM"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const height = Dimensions.get('window').height;
//const TopTab = createMaterialTopTabNavigator();

export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      initializing: true,
      old: false,
    }

    this.firebaseauth = firebase.auth().onAuthStateChanged((user) => {
      // if(this.state.initializing){
      //   this.setState({initializing: false})
      // }
      if(user){
        console.log("AUTHSTATE", user)
        this.setState({user: user})
      }
      else {
        console.log("NO USER")
        this.setState({user: null})
      }
    })
  }

  componentDidMount() {

    // firebase.auth().signInWithEmailAndPassword('bryancheok123@gmail.com','123456').catch((error) => {
    //   console.log(error)
    // });
    // firebase.database().ref().child('test').on('value',snapshot => { console.log('Read Database : ' , snapshot.val()) });
    // firebase.firestore().collection('test').doc('test').onSnapshot(documentSnapshot => {
    //   console.log('Firestore read: ' , documentSnapshot.data());
    // })
    // firebase.firestore()
    // .collection('users')
    // .where('username','==','Bryancheok')
    // .get()
    // .then(querySnapshot => {
    //   console.log('Total users: ', querySnapshot.size);
    
    //   querySnapshot.forEach(documentSnapshot => {
    //     console.log('User ID: ', documentSnapshot.id);
    //   });
    // });
    // firebase.storage().ref('/images/Default Images/').listAll().then((result)=>{
    //     result.items.forEach(ref => {
    //         console.log(ref.fullPath.replace('images/Default Images/',''));
    //       });
    // })
    // firebase.storage().ref('/images/').listAll().then((result)=>{
    //       result.prefixes.forEach(ref => {
    //         console.log(ref.fullPath.replace('images/',''));
    //       });
    // })
    // firebase.storage().ref('/images/User Images/User Gallery/fKD6afFGS2bITGZ06PMo3eSdeQr2/0.pr7hi5ihil7.jpg').getMetadata().then((data)=>{console.log(data)})

    firebase.firestore().collection("build").doc("1").get().then((data)=>{
      if(data.data().buildno!="1.1"){
        this.setState({old: true})
      }
    })
  }
  
  componentWillUnmount() {
    this.firebaseauth()
  }

  render(){
    if(this.state.old){
      return (
        <View>
          <Dialog.Container visible={true}>
              <Dialog.Title>No entry</Dialog.Title>
              <Dialog.Description>This build is an old version.</Dialog.Description>
          </Dialog.Container>
        </View>
      )
    }
    else {
      // if(this.state.initializing){
      //   return null
      // }
      if(!this.state.user){
        return (
          LoginPage()
        );
      }
      else{
        return(
          ProfileDrawer()
        )
      }
    }
  }
}

function LoginPage() {
  return(
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" />
      <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        <Stack.Screen name="User Details" component={Register1}/>
        <Stack.Screen name="Personal Details" component={Register2}/>
        <Stack.Screen name="Description" component={Register3}/>
        <Stack.Screen name="Skills" component={Register4}/>
        <Stack.Screen name="Reset Password" component={PasswordRecovery}/>
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  )
}

const arr = ["","NONE","Browse","Progress","Global","Global Chat","Browse Page","Feeds","Social","Other Users"]

const getTitleVisibility = (route) => {
  const name = getFocusedRouteNameFromRoute(route) ?? 'NONE'
  if(!arr.includes(name)){
    return false
  }
  else {
    return true
  }
}

const getTabBarVisibility = (route) => {
  const name = getFocusedRouteNameFromRoute(route) ?? 'NONE'
  console.log("NOW AT", name)
  if(!arr.includes(name)){
    return 'none'
  }
  else {
    return 'flex'
  }
}

function ProfileDrawer() {
  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" />
      <Drawer.Navigator initialRouteName='Home' drawerContent={(props) => <CustomDrawer {...props}/>}>
        <Drawer.Screen name="Home" component={Main} options={{headerShown: false}}/>
        <Drawer.Screen name="Profile" component={ProfilePage} options={({route,navigation})=>({headerShown: getDrawerShown(route),headerLeft: ()=>(<View></View>), headerRight: ()=>(
        <View style={{flexDirection: 'row'}}>
          <Icon
            name='account-circle'
            style={{fontSize: 30, marginRight: 20}}
            onPress={()=>navigation.toggleDrawer()}
          ></Icon>
        </View>
      )})}/>
        <Drawer.Screen name="Gallery" component={Gallery} options={({navigation})=>({headerLeft: ()=>(<View></View>), headerRight: ()=>(
        <View style={{flexDirection: 'row'}}>
          <Icon
            name='account-circle'
            style={{fontSize: 30, marginRight: 20}}
            onPress={()=>navigation.toggleDrawer()}
          ></Icon>
        </View>
      )})}/>
        <Drawer.Screen name="Notifications" component={NotificationsPage} options={({route, navigation})=>({headerShown: getDrawerShown(route),headerLeft: ()=>(<View></View>), headerRight: ()=>(
        <View style={{flexDirection: 'row'}}>
          <Icon
            name='account-circle'
            style={{fontSize: 30, marginRight: 20}}
            onPress={()=>navigation.toggleDrawer()}
          ></Icon>
        </View>
      )})}/>
      </Drawer.Navigator>
      <Toast />
    </NavigationContainer>
  )
}

const headerarr = ['View Profile','Reviews','View Gallery','Chat','Create Private Errand','Reviews','Errand Details','Create Request','Requests','Request Detail','Review','Reviews']
const getDrawerShown = (route) => {
  const name = getFocusedRouteNameFromRoute(route)
  console.log(name)
  if(headerarr.includes(name)){
    return false
  }
  else return true
}

const differenceInDays = (a, b) => {
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

class CustomDrawer extends Component {
  constructor(props){
    super(props);
    this.user = firebase.auth().currentUser.uid
    this.state = {
      img: '',
      username: '',
      date: '',
    }
    let start = 0
    firebase.database().ref().child("notifications").child(this.user).on('value',snapshot=>{
      if(snapshot.exists()){
        if(snapshot.numChildren() > start){
          start = snapshot.numChildren()
          snapshot.forEach((data)=>{
            if(data.val().new!=null && data.val().new){
              Toast.show({
                text1: 'Notification',
                text2: 'You have unread notification'
              })
            }
          })
        }
      }
    })
    this.readimage = firebase.firestore().collection("users").doc(this.user).onSnapshot((doc)=>{
      this.setState({
        img: doc.data().image,
        username: doc.data().username,
        date: doc.data().registerdate,
      })
    })
  }
  render(){
    return (
      <DrawerContentScrollView {...this.props}>
        <Image
          source={{uri: this.state.img ? this.state.img : null}}
          style={{height: height*0.2, width: height*0.2, borderRadius: 100, alignSelf: 'center',marginTop: 10, marginBottom: 10}}
          resizeMethod='resize'
          resizeMode='cover'
        ></Image>
        <Text style={{alignSelf: 'center'}}>Welcome, {this.state.username}!</Text>
        <Text style={{alignSelf: 'center', marginBottom: 10, fontSize: 12}}>Joined {differenceInDays(new Date().getTime(),this.state.date)}</Text>
        <DrawerItemList {...this.props} />
        <TouchableOpacity 
          style={{marginLeft: 20, marginTop: height*0.4, marginBottom: height*0.02}}
          onPress={()=>this.signOut(this.props)}
        ><View style={{flexDirection: 'row'}}><Text style={{color: '#ff0303',marginRight: 5}}>Sign Out</Text><Icon style={{fontSize: 20, color: '#ff0303'}} name='exit-run'></Icon></View></TouchableOpacity>
      </DrawerContentScrollView>
    )
  }

  signOut(props){
    this.readimage()
    firebase.database().ref().child("notifications").child(this.user).off('value')
    firebase.database().ref().child("notifications").child(this.user).orderByChild("serverdate").off('value')
    firebase.database().ref().child("errands").child(this.user).off('value')
    firebase.database().ref().child("relatedusers").child(this.user).child("pending").off('value')
    firebase.database().ref().child("savederrands").child(this.user).off('value')
    firebase.database().ref().child("errands").child(this.user).orderByChild("serverdate").off('value')   
    firebase.database().ref().child("likedfeeds").child(this.user).off('value')
    firebase.database().ref().child("relatedusers").child(this.user).child("pending").off('value')
    firebase.database().ref().child("globalchat").limitToLast(30).off('value')
    firebase.auth().signOut().then(() => {
        if(firebase.auth().currentUser==null){
            console.log("Logged Out")
            props.navigation.closeDrawer()
        }
        else{
            console.log("Failed Log Out")
        }
    });
  }
}

function getHeaderProfileIcon(navigation){
  return (
    <View style={{flexDirection: 'row'}}>
      <Icon
        name='account-circle'
        style={{fontSize: 30, marginRight: 20}}
        onPress={()=>navigation.toggleDrawer()}
      ></Icon>
    </View>
  )
}

function getFeedCreatorIcon(navigation, route){
  return (
    <TouchableOpacity
      onPress={()=>navigation.navigate("View Profile",{id: route.params.creatorid})}
      >
      <Image
        style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#47ff50', marginRight: 10}}
        source={{uri: route.params.creatorimage ? route.params.creatorimage:null}}
        resizeMethod='scale'
        resizeMode='cover'
      ></Image>
    </TouchableOpacity>
  )
}

function getHeaderUserChatIcon(navigation,id,semipermission) {
  if(semipermission){
    return (
      <View>
        <Icon
            name='forum-outline'
            style={{fontSize: 30, marginRight: 10}}
            onPress={()=>navigation.navigate("Chat", {id: id})}
        ></Icon>
      </View>
    )
  }
}

function getHeaderUserErrandIcon(navigation,id,username,permission) {
  if(permission){
    return (
      <View>
        <Icon
          name='briefcase-account-outline'
          style={{fontSize: 30, marginRight: 10}}
          onPress={()=>navigation.navigate("Create Private Errand", {privacy: false, receiver: id, username: username})}
        ></Icon>
      </View>
    )
  }
}

function getBottomTabIcon(name,size,color) {
  if(name == 'briefcase-outline'){
    return <ProgressIcon name={name} size={size} color={color}/>
  }
  else if(name == 'account-group-outline'){
    return <RelatedUsersIcon name={name} size={size} color={color}/>
  }
  else {
    return <Icon name={name} color={color} size={size}/>
  }
}

class ProgressIcon extends Component {
  constructor(props){
    super(props);

    this.name = this.props.name;
    this.size = this.props.size;
    this.color = this.props.color;

    this.state = {
      new: false,
    }
  }

  componentDidMount() {
    this.notifyProgress()
  }

  render(){
    if(this.state.new){
      return (
        <View>
          <Icon name='circle-small' style={{fontSize: 50, position: 'absolute', bottom: -5, color: '#ff0303'}}/>
          <Icon name={this.name} color={this.color} size={this.size}/>
        </View>
      )
    }
    else {
      return(
        <Icon name={this.name} color={this.color} size={this.size}/>
      )
    }
  }

  notifyProgress(){
    firebase.database().ref().child("errands").child(firebase.auth().currentUser.uid).on('value',snapshot=>{
      let notif = false
      if(snapshot.exists()){
        snapshot.forEach(data=>{
          if(data.val().new){
            notif = true
          }
          if(notif){
            this.setState({new: true})
          }
          else {
            this.setState({new: false})
          }
        })
      }
      else {
        this.setState({new: false})
      }
    })
  }
}

class RelatedUsersIcon extends Component {
  constructor(props){
    super(props);

    this.name = this.props.name;
    this.size = this.props.size;
    this.color = this.props.color;

    this.state = {
      new: false,
    }
  }

  componentDidMount() {
    this.notifyProgress()
  }

  render(){
    if(this.state.new){
      return (
        <View>
          <Icon name='circle-small' style={{fontSize: 50, position: 'absolute', bottom: -5, color: '#ff0303'}}/>
          <Icon name={this.name} color={this.color} size={this.size}/>
        </View>
      )
    }
    else {
      return(
        <Icon name={this.name} color={this.color} size={this.size}/>
      )
    }
  }

  notifyProgress(){
    firebase.database().ref().child("relatedusers").child(firebase.auth().currentUser.uid).on('value',snapshot=>{
      if(snapshot.exists()){
        if(snapshot.hasChild("pending")){
          this.setState({new: true})
        }
        else {
          this.setState({new: false})
        }
      }
      else {
        this.setState({new: false})
      }
    })
  }
}

function getErrandUsers(route,navigation) {
  if(route.params.hiredimage!=null){
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={()=>navigation.navigate("View Profile", {id: route.params.creatorid})}
          >
          <Image
            style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#47ff50', marginRight: 10}}
            source={{uri: route.params.creatorimage ? route.params.creatorimage:null}}
            resizeMethod='scale'
            resizeMode='cover'
          ></Image>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>navigation.navigate("View Profile", {id: route.params.hiredid})}
          >
          <Image
            style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#52b1ff', marginRight: 10}}
            source={{uri: route.params.hiredimage ? route.params.hiredimage:null}}
            resizeMethod='scale'
            resizeMode='cover'
          ></Image>
        </TouchableOpacity>
      </View>
    )
  }
  else if(route.params.hiredimage==null && route.params.receiverimage!=null){
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={()=>navigation.navigate("View Profile", {id: route.params.creatorid})}
          >
          <Image
            style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#47ff50', marginRight: 10}}
            source={{uri: route.params.creatorimage ? route.params.creatorimage:null}}
            resizeMethod='scale'
            resizeMode='cover'
          ></Image>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>navigation.navigate("View Profile", {id: route.params.receiverid})}
          >
          <Image
            style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#ffb847', marginRight: 10}}
            source={{uri: route.params.receiverimage ? route.params.receiverimage:null}}
            resizeMethod='scale'
            resizeMode='cover'
          ></Image>
        </TouchableOpacity>
      </View>
    )
  }
  else {
    return (
      <TouchableOpacity
        onPress={()=>navigation.navigate("View Profile", {id: route.params.creatorid})}
        >
        <Image
          style={{height: 30, width: 30, borderRadius: 20, borderWidth: 2, borderColor: '#47ff50', marginRight: 10}}
          source={{uri: route.params.creatorimage ? route.params.creatorimage:null}}
          resizeMethod='scale'
          resizeMode='cover'
        ></Image>
      </TouchableOpacity>
    )
  }
}

function Main() {
  return(
    <MenuProvider>
      <BottomTab.Navigator initialRouteName="Progress" screenOptions={{tabBarHideOnKeyboard: true, tabBarActiveBackgroundColor: '#fcfcfc', tabBarActiveTintColor: '#ff8b26', tabBarInactiveTintColor: '#8a8a8a', tabBarInactiveBackgroundColor: '#fcfcfc' }}>
        <BottomTab.Screen name="Progress" component={BrowseProgressErrands} options={({route, navigation})=>({ tabBarStyle: {display: getTabBarVisibility(route)}, headerShown: getTitleVisibility(route) ,tabBarIcon: ({ color, size }) => (getBottomTabIcon('briefcase-outline',size,color)), headerRight: ()=>(
          getHeaderProfileIcon(navigation)
        )})}/>
        <BottomTab.Screen name="Browse" component={BrowseErrands} options={({route, navigation})=>({tabBarStyle: {display: getTabBarVisibility(route)}, headerShown: getTitleVisibility(route) ,tabBarIcon: ({ color, size }) => (getBottomTabIcon('briefcase-search',size,color)), headerRight: ()=>(
          getHeaderProfileIcon(navigation)
        )})}/>
        <BottomTab.Screen name="Feeds" component={BrowseFeed} options={({route, navigation})=>({ tabBarStyle: {display: getTabBarVisibility(route)}, headerShown: getTitleVisibility(route) ,tabBarIcon: ({ color, size }) => (getBottomTabIcon('rss',size,color)), headerRight: ()=>(
          getHeaderProfileIcon(navigation)
        )})}/>
        <BottomTab.Screen name="Global" component={GlobalChat} options={({route, navigation})=>({tabBarStyle: {display: getTabBarVisibility(route)}, headerShown: getTitleVisibility(route) ,tabBarIcon: ({ color, size }) => (getBottomTabIcon('chat-outline',size,color)), headerRight: ()=>(
          getHeaderProfileIcon(navigation)
        )})}/>
        <BottomTab.Screen name="Social" component={RelatedUsersPage} options={({route, navigation})=>({ tabBarStyle: {display: getTabBarVisibility(route)}, headerShown: getTitleVisibility(route) ,tabBarIcon: ({ color, size }) => (getBottomTabIcon('account-group-outline',size,color)), headerRight: ()=>(
          <View style={{flexDirection: 'row'}}>
            <Icon
              name='forum-outline'
              style={{fontSize: 30, marginRight: 20}}
              onPress={()=>navigation.navigate("Chats")}
            ></Icon>
            <Icon
              name='account-circle'
              style={{fontSize: 30, marginRight: 20}}
              onPress={()=>navigation.toggleDrawer()}
            ></Icon>
          </View>
        )})}/>
      </BottomTab.Navigator>
    </MenuProvider>
  )
}

function BrowseErrands() {
  return(
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Browse Page" component={Errands} initialParams={{page: 'main'}} options={{headerShown: false}}/>
      <Stack.Screen name="Create Errand" component={CreateErrands}/>
      <Stack.Screen name="Errand Details" component={ErrandDetails} options={({route,navigation})=>({title: '', headerRight:()=>(
        <View style={{flexDirection: 'row'}}>
          {getErrandUsers(route,navigation)}  
        </View>
      )})}/>
      <Stack.Screen name="Create Request" component={CreateRequest}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
          <View style={{flexDirection: 'row'}}>
            {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
            {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
          </View>
        )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Requests" component={Requests}/>
      <Stack.Screen name="Request Detail" component={RequestDetail} options={{title: ''}}/>
      <Stack.Screen name="Review" component={CreateReview}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function BrowseProgressErrands() {
  return(
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Browse" component={Errands} initialParams={{page: 'progress'}} options={{headerShown: false}}/>
      <Stack.Screen name="Create Errand" component={CreateErrands}/>
      <Stack.Screen name="Errand Details" component={ErrandDetails} options={({route,navigation})=>({title: '', headerRight:()=>(
        <View style={{flexDirection: 'row'}}>
          {getErrandUsers(route,navigation)}  
        </View>
      )})}/>
      <Stack.Screen name="Create Request" component={CreateRequest}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
        <View style={{flexDirection: 'row'}}>
          {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
          {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
        </View>
      )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Requests" component={Requests}/>
      <Stack.Screen name="Request Detail" component={RequestDetail} options={{title: ''}}/>
      <Stack.Screen name="Review" component={CreateReview}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function BrowseFeed() {
  return(
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Browse" component={Feeds} initialParams={{type: 'browse'}} options={{headerShown: false}}/>
      <Stack.Screen name="Details" component={FeedDetails} options={({route,navigation})=>({title: '', headerRight:()=>(
        <View>
          {getFeedCreatorIcon(navigation,route)}
        </View>
      )})}/>
      <Stack.Screen name="Create Feed" component={CreateFeed}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
          <View style={{flexDirection: 'row'}}>
            {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
            {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
          </View>
        )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function GlobalChat() {
  return(
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Global Chat" component={GlobalChatPage} options={{headerShown: false}}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
          <View style={{flexDirection: 'row'}}>
            {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
            {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
          </View>
        )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function RelatedUsersPage() {
  return(
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Other Users" component={RelatedUsers} initialParams={{type: 'added'}} options={{headerShown: false}}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
        <View style={{flexDirection: 'row'}}>
          {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
          {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
        </View>
      )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Find User" component={FindUser}/>
      <Stack.Screen name="Chats" component={Messages} options={{title: 'Messages'}}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function ProfilePage() {
  return (
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Drawer.Screen name="Profile Page" component={Profile} options={{headerShown: false}}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}

function NotificationsPage() {
  return (
    <Stack.Navigator screenOptions={{animation: 'fade_from_bottom'}}>
      <Stack.Screen name="Notifications Page" component={Notifications} options={{headerShown: false, title: 'Notifications'}}/>
      <Stack.Screen name="View Profile" component={ViewProfile} options={({route,navigation})=>({title: route.params.header, headerRight:()=>(
          <View style={{flexDirection: 'row'}}>
            {getHeaderUserChatIcon(navigation,route.params.id,route.params.semiperm)}
            {getHeaderUserErrandIcon(navigation,route.params.id,route.params.username,route.params.perm)}
          </View>
        )})}/>
      <Stack.Screen name="View Gallery" component={ViewGallery} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Chat" component={Chat} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Create Private Errand" component={CreateErrands} options={({route})=>({title: route.params.header})}/>
      <Stack.Screen name="Errand Details" component={ErrandDetails} options={({route,navigation})=>({title: '', headerRight:()=>(
          <View style={{flexDirection: 'row'}}>
            {getErrandUsers(route,navigation)}  
          </View>
      )})}/>
      <Stack.Screen name="Create Request" component={CreateRequest}/>
      <Stack.Screen name="Requests" component={Requests}/>
      <Stack.Screen name="Request Detail" component={RequestDetail} options={{title: ''}}/>
      <Stack.Screen name="Review" component={CreateReview}/>
      <Stack.Screen name="Reviews" component={UserReviews}/>
    </Stack.Navigator>
  )
}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

export default App