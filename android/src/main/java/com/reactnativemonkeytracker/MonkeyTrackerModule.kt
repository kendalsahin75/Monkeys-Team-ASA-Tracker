package com.reactnativemonkeytracker

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.provider.Settings
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import android.os.Build;

data class TrackingStatus(val d: Int) {
    var trackingStatus: Int = d
}

class MonkeyTrackerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MonkeyTracker"
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun getDeviceId(promise: Promise) {
      val androidId = Settings.Secure.getString(getReactApplicationContext().getContentResolver(),Settings.Secure.ANDROID_ID)
      promise.resolve(androidId)
    }

    @ReactMethod
    fun getTrackingStatus(promise:Promise){
      val map = Arguments.createMap()
      map.putInt("trackingStatus",3)
      promise.resolve(map)
    }

    @ReactMethod 
    fun isTestFlight(promise:Promise){
      val map = Arguments.createMap();
      map.putBoolean("testFlight",false);
      promise.resolve(map)
    }

    @ReactMethod 
    fun getDeviceCountry(promise: Promise){
      val locale = getReactApplicationContext().getResources().getConfiguration().locale.getCountry();
      promise.resolve(locale);
    }

    @ReactMethod
    fun getAppVersion(promise:Promise){
      val pInfo = getReactApplicationContext().getPackageManager().getPackageInfo(getReactApplicationContext().getPackageName(), 0);
      val version = pInfo.versionName;
      promise.resolve(version);
    }

    @ReactMethod
    fun getOSVersion(promise:Promise){
      val v = Build.VERSION.RELEASE;
      promise.resolve(v);
    }

    

    @ReactMethod
    fun getIDFA(promise: Promise) {
        val adInfo = AdvertisingIdClient.getAdvertisingIdInfo(getReactApplicationContext());
        val _adInfo = Arguments.createMap()
        _adInfo.putNull("attribution")
        if (adInfo.isLimitAdTrackingEnabled()) {
            _adInfo.putBoolean("permission", false);
            _adInfo.putString("idfa", "");
        } else {
          _adInfo.putBoolean("permission", true);
          val idfa = adInfo.getId();
          _adInfo.putString("idfa", idfa);
        }
        promise.resolve(_adInfo);
    }

    
}
