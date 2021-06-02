import * as React from 'react';

import { observable, action, decorate } from 'mobx';
import { Banner } from "./Banner";

class AdStore {

  rewardeds = [];
  rewarded = null;

  interstitials = [];
  interstitial = null;

  userId = null;

  sendEvent = null;

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

decorate(AdStore,{
  rewarded: observable,
  rewardeds: observable,
  interstitial: observable,
  interstitials: observable,
  userId: observable,
  sendEvent: observable,
  setSendEvent: action,
  setUserId: action,
  setRewarded: action,
  closeRewarded: action,
  setInterstitial: action,
  setShowInterstitial: action,
  closeInterstitial: action,
  setShowRewarded: action
})