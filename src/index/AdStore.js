import * as React from 'react';

import { observable, action, decorate } from 'mobx';
import { Banner } from "./Banner";

class AdStore {

  @observable rewardeds = [];
  @observable rewarded = null;

  @observable interstitials = [];
  @observable interstitial = null;

  @observable userId = null;

  @observable sendEvent = null;

  @observable pressAction = false;

  @observable time = 0;

  @action setSendEvent(sendEvent){
    this.sendEvent = sendEvent;
  }

  @action setUserId(userId){
    this.userId = userId;
  }

  @action setRewarded(rewarded) {
    this.rewardeds.push(rewarded);
  }

  @action closeRewarded(){
    this.rewarded = null;
  }

  @action setInterstitial(interstitial) {
    this.interstitials.push(interstitial);
  }

  @action setShowInterstitial(){
    this.interstitial = this.interstitials.shift();
    this.sendEvent("client/ads/events/view","POST",{id:this.interstitial.id}).then(() => {});
  }

  @action closeInterstitial(){
    this.interstitial = null;
  }

  @action setShowRewarded(){
    this.rewarded = this.rewardeds.shift();
    console.log(this.rewarded);
    this.sendEvent("client/ads/events/view","POST",{id:this.rewarded.id}).then(() => {});
  }

  @action setPressAction(pressAction){
    this.pressAction = pressAction;
  }

  @action setTime(time){
    this.time = time;
  }

}

const adStore = new AdStore();
export default adStore;