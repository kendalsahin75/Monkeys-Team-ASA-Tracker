import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import Video from 'react-native-video';
import { strings } from "../localization";
import Clipboard from '@react-native-community/clipboard';

import { observer } from 'mobx-react/native';
import {MonkeyTracker} from "../index";

import AdStore from "./AdStore";

const CloseButton = ({ closePress }) => {
  return (
    <TouchableOpacity onPress={ async () => {
      AdStore.closeInterstitial();
      closePress();
    }} style={styles.closeButton}>
      <Image style={styles.closeIcon} source={require("../assets/cancel.png")} />
    </TouchableOpacity>
  )
}

export const ShowIntersettial = async () => {
  return new Promise(async (resolve, reject) => {
    const { interstitials } = AdStore;
    if (interstitials.length === 0) {
      return reject({ status: false, message: "AD NOT LOADED!" });
    }
    AdStore.setShowInterstitial();
    return resolve({ status: true, message: "" });
  })
}

export const Intersettial = observer(({onClose, onClick}) => {
  const { interstitial, userId } = AdStore;
  if(!interstitial){
    return null;
  }
  const { contentType, contentUrl } = interstitial;
  if( contentType === "VIDEO" ){
    return(
      <TouchableOpacity onPress={ () => {
        onClick();
        Clipboard.setString(interstitial.targetUrl+"?userId="+userId);
        Linking.openURL(interstitial.targetUrl).catch((err) =>{});
      }} style={ styles.container }>
        <Video
          key={"intersettial"} 
          source={{ uri: contentUrl }}   
          autoplay
          onError={(error) => {
            console.log("onError", error)
          }}
          resizeMode="contain"
          onEnd={() => {
            
          }}
          onProgress={({ seekableDuration, currentTime }) => {
            
          }}
          style={styles.video}
        />
        <CloseButton closePress={ async () => { 
          await AdStore.sendEvent("client/ads/events/close","POST",{id:interstitial.id});
          onClose();
        }}/>
      </TouchableOpacity>
    )
  }else{
    return(
      <TouchableOpacity onPress={ async () => {
        onClick();
        await AdStore.sendEvent("client/ads/events/click","POST",{id:interstitial.id});
        Clipboard.setString(interstitial.targetUrl+"?userId="+userId);
        Linking.openURL(interstitial.targetUrl).catch((err) =>{});
      }} style={ styles.container }>
        <Image
          key={"intersettialImage"} 
          source={{ uri: contentUrl }}
          style={[styles.video,{resizeMode:"contain"}]}
        />
        <CloseButton closePress={ async () => {
          await AdStore.sendEvent("client/ads/events/close","POST",{id:interstitial.id});
          onClose();
        }}/>
      </TouchableOpacity>
    )
  }  
})

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)"
  },
  video: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 25,
    height: 25,
    tintColor: "white"
  }
});