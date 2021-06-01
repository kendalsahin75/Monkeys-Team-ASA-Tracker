import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import Video from 'react-native-video';
import { strings } from "../localization";
import Clipboard from '@react-native-community/clipboard';

import { observer } from "mobx-react"
import {MonkeyTracker} from "../index";

import AdStore from "./AdStore";

import { isIphoneWithNotch } from "../helpers";


export class Banner extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      banner:null
    }
  }

  callBanner = () => {
    return new Promise((resolve) => {
      MonkeyTracker.getBannerAds().then((r) => {
        resolve(r);
      }).catch((e) => {
        setTimeout(async () => {
          const _banner = this.callBanner();
          resolve(_banner)
        },2000)
      });
    })
  }

  componentDidMount(){
    this.callBanner().then( async (banner) => {
      await AdStore.sendEvent("client/ads/events/view","POST",{id:banner.id});
      this.setState({
        banner
      })
    })
  }

  render() {
    const { banner } = this.state;
    const { style, imageStyle } = this.props;
    const { userId } = AdStore;
    if(banner){
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={ async () => {
          await AdStore.sendEvent("client/ads/events/click","POST",{id:banner.id});
          Clipboard.setString(banner.targetUrl+"?userId="+userId);
          Linking.openURL(banner.targetUrl).catch((err) =>{});
        }} style={ [styles.container, style] }>
          <Image style={[styles.imageStyle, imageStyle]} source={{uri: banner.contentUrl}}/>
        </TouchableOpacity>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: isIphoneWithNotch ? 30 : 0,
    height: 50,
  },
  imageStyle: {
    position:"absolute",
    left:0,
    right:0,
    top:0,
    bottom:0,
    resizeMode:"contain"
  }
});