import * as React from 'react';

import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { MonkeyTracker, TostRewarded, TostIntersettial, TostBanner } from 'react-native-monkey-tracker';
const { Rewarded, ShowRewarded } = TostRewarded;
const { Intersettial, ShowIntersettial } = TostIntersettial;

export default function App() {
  
  MonkeyTracker.init("MONKEY-TRACKER-ydsf2hs1kmomn671", 123, "", true).then( async () => {
    // await MonkeyTracker.getRewardedAds()
    await MonkeyTracker.getInterstitial();
  })

  // MonkeyTracker.getStoreFront();

  return (
    <View style={styles.container}>
      <Text>Result:</Text>
      <TouchableOpacity onPress={ async () => { 
        await ShowIntersettial();
       }}>
        <Text>
          Click
        </Text>
      </TouchableOpacity>
      <Banner />
      <Intersettial
        onClose={ async () => {
          Alert.alert("Close INter");
          await MonkeyTracker.getInterstitial();
        }}
        onClick={ async () => {
          Alert.alert("Click inter");
          await MonkeyTracker.getInterstitial();
        }}
      />
      <Rewarded
        reward={ async () => {
          Alert.alert("REWARD");
          await MonkeyTracker.getRewardedAds()
        }}
        adClose={ async () => {
          Alert.alert("AD CLOSE");
          await MonkeyTracker.getRewardedAds()
        }}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
