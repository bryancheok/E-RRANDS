import React, { useState } from 'react'
import { Text, View, ScrollView, StyleSheet, TextInput, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'firebase/compat'
import Dialog from "react-native-dialog";
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient'

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState();
    const [logging, setLogging] = useState(false);

    return (
        <ScrollView style={{flex:1, minWidth: width, alignSelf: 'center'}}>
          
          <LinearGradient
            start={{x: 0.0, y: 0.55}} end={{x: 0.5, y: 2.0}}
            locations={[0,0.5,0.6]}
            colors={['#ebebeb', '#ffbe82', '#ffad61']}
            style={styles.linearGradient}>
              <View>
                <Text style={styles.title}>E-RRANDS</Text>

                <View style={styles.input}>
                  <View style={styles.textbox}>
                    <TextInput
                      keyboardType='email-address'
                      placeholder="email"
                      onChangeText={(email) => setEmail( email.trim() )}
                    ></TextInput>
                  </View>
                  <View style={styles.textbox}>
                    <TextInput
                      placeholder="password"
                      secureTextEntry={true}
                      onChangeText={(password) => setPassword( password )}
                    ></TextInput>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={()=>navigation.navigate("Reset Password")}
                ><Text style={{textDecorationLine: 'underline',alignSelf: 'center', color: '#a6a6a6'}}>Forgot Password ?</Text></TouchableOpacity>

                <View style={styles.container}>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("User Details")}>
                      <LinearGradient 
                        start={{x: 0.0, y: 0.05}} end={{x: 0, y: 2.0}}
                        locations={[0,0.5,0.6]}
                        colors={['#bad8ff', '#5ca3ff', '#4290f5']}
                        style={styles.regbutton}>
                        <Text style={{fontSize: 20, color: 'white', marginRight: 10}}>Register</Text>
                      </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => login()}>
                      <LinearGradient 
                        start={{x: 0.0, y: 0.05}} end={{x: 0, y: 2.0}}
                        locations={[0,0.5,0.6]}
                        colors={['#ffd196', '#ffb659', '#f5a742']}
                        style={styles.logbutton}>
                          <Text style={{fontSize: 20, color: 'white', marginRight: 10}}>Login</Text>
                          <Icon
                            name='login'
                            style={{fontSize: 30, color: 'white'}}
                          ></Icon>
                      </LinearGradient>
                  </TouchableOpacity>

                </View>
              </View>
          </LinearGradient>  

          <Dialog.Container visible={logging} contentStyle={{height: 100}}><ActivityIndicator animating={logging} color='#ff8f45' size={'large'} style={styles.loading}></ActivityIndicator></Dialog.Container> 
          
        </ScrollView>
    )

    function login(){
      if(firebase.auth().currentUser==null){
        console.log("No Current User")
      }
      else{
        console.log("Current User Exists")
      }
      setLogging(true)
      firebase.auth().signInWithEmailAndPassword(email, password)
          .then((result) => {
              setLogging(false)
              console.log(result);
              firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                lastlogin: new Date().getTime(),
                lastloginserver: firebase.firestore.FieldValue.serverTimestamp(),
              })
          })
          .catch((error) => {
              console.log(error)
              if(error.code != null){
                setLogging(false)
                Toast.show({
                  type: 'error',
                  text1: 'Invalid Email or Password',
                  text2: 'Please make sure that the e-mail or password is correct'
                })
              }
          })

      firebase.auth().onAuthStateChanged(user => {
          setUser(user);
      });
    }

    // function signout(){
    //     firebase.auth().signOut().then(() => {
    //       if(firebase.auth().currentUser==null){
    //         console.log("Logged Out")
    //       }
    //       else{
    //         console.log("Failed Log Out")
    //       }
    //     });
    // }
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
    linearGradient: {
      flex: 1,
      height: height,
      paddingLeft: 15,
      paddingRight: 15,
      borderRadius: 5
    },
    title: {
      alignSelf: 'center',
      marginTop: height*0.2,
      fontSize: 50, 
      fontWeight: 'bold',
      color: '#ff7e33',
    },
    input: {
      marginTop: 60,
      alignSelf: 'center',
    },
    textbox:{
      marginBottom: 40,
      padding: 10,
      width: width*0.55,
      height: 50,
      backgroundColor: '#c9c8c5',
      borderRadius: 20,
    },
    container: {
      flexDirection: 'row',
      alignSelf: 'center',
      marginTop: 50,
      marginBottom: 20
    },
    regbutton: {
      borderRadius: 20,
      backgroundColor: '#4290f5',
      padding: 20,
    },
    logbutton: {
      borderRadius: 20,
      marginLeft: 30,
      flexDirection: 'row',
      backgroundColor: '#f5a742',
      padding: 20,
    }
});


export default Login;