import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import Video from 'react-native-video';
import { strings } from "../localization";
import Clipboard from '@react-native-community/clipboard';

import { observer } from "mobx-react"

import AdStore from "./AdStore";

export const ShowRewarded = async () => {
  return new Promise(async (resolve, reject) => {
    const { rewardeds } = AdStore;
    if (rewardeds.length === 0) {
      return reject({ status: false, message: "AD NOT LOADED!" });
    }
    AdStore.setShowRewarded();
    return resolve({ status: true, message: "" });
  })
}

const CloseButton = ({ closePress, pressAction, time }) => {
  return (
    <TouchableOpacity onPress={() => {
      if (pressAction) {
        closePress();
        return;
      }
      Alert.alert(
        strings.title,
        strings.description,
        [
          {
            text: strings.cancel,
            onPress: () => closePress(),
          },
          { style: "cancel", text: strings.close, onPress: () => { } }
        ]
      );
    }} style={styles.closeButton}>
      <Image style={styles.closeIcon} source={require("../assets/cancel.png")} />
    </TouchableOpacity>
  )
}

export const Rewarded = observer(({ style, adClose, reward }) => {
  const [pressAction, setPressAction] = useState(false)
  const [time, setTime] = useState(0)
  const { rewarded, userId } = AdStore;
  if (rewarded) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={ async () => {
        await AdStore.sendEvent("client/ads/events/click","POST",{id:rewarded.id});
        Clipboard.setString(rewarded.targetUrl+"?userId="+userId);
        Linking.openURL(rewarded.targetUrl).catch((err) =>{});
      }} style={[styles.container, style]}>
        <Video key={"rewarded"} source={{ uri: rewarded.contentUrl }}
          onError={(error) => {
            console.log("onError", error)
          }}               // Callback when video cannot be loaded
          resizeMode="contain"
          onEnd={ async () => {
            setPressAction(true);
            await AdStore.sendEvent("client/ads/events/reward","POST",{id:rewarded.id});
            reward();
          }}
          onProgress={({ seekableDuration, currentTime }) => {
            const _time = (seekableDuration - currentTime).toFixed(0)
            setTime(_time);
          }}
          style={styles.video} />
        <CloseButton pressAction={pressAction} closePress={ async () => {
          await AdStore.sendEvent("client/ads/events/close","POST",{id:rewarded.id});
          AdStore.closeRewarded();
          if (!pressAction) {
            adClose();
          }
          setPressAction(false);
        }} />
        <View style={styles.closeTimeContainer}>
          <Text style={styles.closeTime}>
            {time}
          </Text>
        </View>
      </TouchableOpacity>
    )

  } else {
    return null;
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
  image: {
    resizeMode: "contain",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
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
  closeTime: {

    color: "black",
    fontSize: 14,
  },
  closeTimeContainer: {
    position: "absolute",
    backgroundColor: "white",
    top: 50,
    right: 18,
    width: 25,
    height: 25,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
  },
  closeIcon: {
    width: 25,
    height: 25,
    tintColor: "white"
  }
});
