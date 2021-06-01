import * as React from 'react';

import { makeAutoObservable } from "mobx"
import { Banner } from "./Banner";

class AdStore {

  rewardeds = [];
  rewarded = null;

  interstitials = [];
  interstitial = null;

  userId = null;

  sendEvent = null;

  constructor() {
    makeAutoObservable(this)
  }

  setSendEvent(sendEvent){
    this.sendEvent = sendEvent;
  }

  setUserId(userId){
    this.userId = userId;
  }

  setRewarded = async (rewarded) => {
    this.rewardeds.push(rewarded);
  }

  closeRewarded = () => {
    this.rewarded = null;
  }

  setInterstitial(interstitial) {
    this.interstitials.push(interstitial);
  }

  setShowInterstitial(){
    this.interstitial = this.interstitials.shift();
    this.sendEvent("client/ads/events/view","POST",{id:this.interstitial.id}).then(() => {});
  }

  closeInterstitial(){
    this.interstitial = null;
  }

  setShowRewarded(){
    this.rewarded = this.rewardeds.shift();
    this.sendEvent("client/ads/events/view","POST",{id:this.rewarded.id}).then(() => {});
  }

}

const adStore = new AdStore();
export default adStore;