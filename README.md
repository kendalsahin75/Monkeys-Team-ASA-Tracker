  

# react-native-monkey-tracker

  

  

Monkeys Team ASA Tracker

  

MMP for Apple Search Ads...

  

## Installation

  

  

```sh

npm install react-native-monkey-tracker

  

npx pod-install OR cd ios && pod install

```

  

You should add **Privacy - Tracking Usage Description** info.plist

```sh

<key>NSUserTrackingUsageDescription</key>

<string>App would like to access IDFA for tracking purpose</string>

```

## Usage

```js


import  MonkeyTracker  from  "react-native-monkey-tracker";

  
// You should call init first.

// You can get APP_KEY from monkeysteam.com


MonkeyTracker.init(APP_KEY: string,  appUserId:any,  deviceId:string  ,DEBUG:boolean);

//If device id is null, MT-Tracker will find it self.
  

// Purchase event for each purchase.

MonkeyTracker.purchase(receipt: string,  product_id: string,  price: number,  currency: string);

// Events

MonkeyTracker.sendEvent(event_name: string,  properties: object)

```

This package allows you to track all events and purchases that come from Apple Search Ads.

Monkeys-ASA-Tracker is **alpha** now.

  

**If you want to test it, please contact us.**

## Ads
Rewarded
```sh

import  { Rewarded, ShowRewarded }  from  "react-native-monkey-tracker/Rewarded.js"

await MonkeyTracker.getRewardedAds() //Call this function after init

<Rewarded 
	reward={  async  ()  =>  {
		Alert.alert("REWARD");
		await MonkeyTracker.getRewardedAds()
	}}
	adClose={  async  ()  =>  {
		Alert.alert("AD CLOSE");
		await MonkeyTracker.getRewardedAds()
	}}
/>

```
Intersettial
```sh

import  { Intersettial, ShowIntersettial }  from  "react-native-monkey-tracker/Intersettial.js"

await MonkeyTracker.getInterstitial() //Call this function after init

<Intersettial
	onClose={  async  ()  =>  {
		Alert.alert("Close INter");
		await MonkeyTracker.getInterstitial();
	}}
	onClick={  async  ()  =>  {
		Alert.alert("Click inter");
		await MonkeyTracker.getInterstitial();
	}}
/>
```
Banner
```sh

import  { Banner }  from  "react-native-monkey-tracker/Banner.js"

<Banner  />

```


  

## License

MIT