
import { NativeModules, Platform } from 'react-native';
import Axios from "axios";
import type { Method } from "./types";
import AdStore from "./index/AdStore";
import Clipboard from '@react-native-community/clipboard';

const Native_MonkeyTracker = NativeModules.MonkeyTracker;

const BASE_URL = `https://tracker.monkeysteam.com/`;

class _MonkeyTracker {
  private APP_KEY = "";
  private USER_IDFA = { idfa: "not_registered_yet", attribution: false };
  private DEVICE_ID = "";
  private IS_DEBUG = false;
  // private API_USER = {};
  private APP_USER_ID = null;
  private REWARDED_AD = null;
  private INTERSTITIAL = null;
  private BANNER = null;


  init = (APP_KEY: string, appUserId: any, deviceId: string, DEBUG = false) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!APP_KEY) {
          console.warn("APP_KEY required!");
          return reject(false);
        }
        if (appUserId) {
          this.APP_USER_ID = appUserId
        }
        this.IS_DEBUG = DEBUG;
        if (deviceId) {
          this.DEVICE_ID = deviceId;
        } else {
          const device_id = await Native_MonkeyTracker.getDeviceId();
          this.DEVICE_ID = device_id;
        }
        
        this.APP_KEY = APP_KEY;
        
        if (DEBUG) {
          console.log("Monkeys Team Debug Mode Active");
          console.log(`App Key Setted -> ${APP_KEY}`);
          console.log(`Device ID -> ${this.DEVICE_ID}`);
        }

        const { trackingStatus } = await Native_MonkeyTracker.getTrackingStatus();
        if (trackingStatus === 3) {
          await this.userIDFA();
        }
        
        const logResp = await this.login();
        return resolve(logResp);
      } catch (e) {
        await this.login();
        return resolve(false);
      }
    })
  }

  userIDFA = (try_count = 1) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userIDFA = await Native_MonkeyTracker.getIDFA();
        if (this.IS_DEBUG) {
          console.log(`User IDFA Info`);
          console.log(userIDFA);
        }
        if (!userIDFA.permission) {
          if (this.IS_DEBUG) {
            console.log("User Tracker Permission Not Auth...");
          }
          this.USER_IDFA.idfa = "LAT_ON";
          resolve(true);
          await this.login()
        } else {
          if (!userIDFA.attribution && Platform.OS !== "android") {
            if (this.IS_DEBUG) {
              console.log("Attribution api fail...");
              console.log("Attribution api request will send 20 secs later.");
              console.log("Try count -> " + try_count);
            }
            if (try_count < 5) {
              let _try_count = try_count + 1;
              setTimeout(async () => {
                try {
                  const resp = await this.userIDFA(_try_count);
                  if (resp) {
                    resolve(true);
                    await this.login()
                  } else {
                    resolve(false);
                    await this.login()
                  }
                } catch (e) {
                  resolve(false);
                  await this.login()
                }
              }, 20000)
            } else {
              if (this.IS_DEBUG) {
                console.log("Attribution api fail...");
              }
              resolve(false);
              await this.login()
            }
          } else {
            this.USER_IDFA = userIDFA;
            await this.login()
            resolve(true);
          }
        }
      } catch (e) {
        console.warn(e);
        return reject(false);
      }
    })
  }

  purchase = async (receipt: string, product_id: string, price: number, currency: string) => {
    const { isTestFlight } = await Native_MonkeyTracker.isTestFlight();
    await this.sendSDKRequest("client/event/trackPurchase", "POST", {
      receipt,
      product_id,
      price,
      currency,
      sandbox: isTestFlight
    });
  }

  getRewardedAds = async () => {
    try {
      const { data } = await this.sendSDKRequest("client/ads", "POST", {
        adType: "REWARDED"
      });
      if (data.done) {
        const { ad } = data;
        console.log(ad);
        AdStore.setRewarded(ad);
        // _setRewarded(ad);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getInterstitial = async () => {
    try {
      const { data } = await this.sendSDKRequest("client/ads", "POST", {
        adType: "INTERSTITIAL"
      });
      console.log(data);
      if (data.done) {
        const { ad } = data;
        AdStore.setInterstitial(ad);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getBannerAds = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.sendSDKRequest("client/ads", "POST", {
          adType: "BANNER"
        });
        if (data.done) {
          const { ad } = data;
          resolve(ad);
        }
      } catch (e) {
        reject(e);
      }
    })
  }

  sendEvent = async (event_name: string, properties: object) => {
    if (!this.APP_KEY) {
      console.warn("INIT must be call before send event");
      return false;
    }
    if (this.IS_DEBUG) {
      console.log(`${event_name} event is sending...`)
      console.log(`${properties}`);
    }
    await this.sendSDKRequest("client/event", "POST", {
      eventName: event_name,
      eventValue: properties
    });
    console.log(`${event_name} event has done...`)
    return true;
  }

  subStatus = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await this.sendSDKRequest("client/purchase/check", "GET", {});
        if (data.done) {
          resolve(data.subscriber)
        } else {
          reject()
        }
      } catch (error) {
        console.log(error);
        reject()
      }
    })
  }

  restoreSub = async (receipt: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { isTestFlight } = await Native_MonkeyTracker.isTestFlight();
        const { data } = await this.sendSDKRequest("client/purchase/restore", "POST", {
          sandbox: isTestFlight,
          receipt
        });
        resolve(data)
      } catch (error) {
        console.log(error);
        reject()
      }
    })
  }

  private login = () => {
    return new Promise(async (resolve) => {
      try {
        let attribution = null, idfa = null;
        if (this.USER_IDFA) {
          attribution = this.USER_IDFA.attribution;
          idfa = this.USER_IDFA.idfa;
        }
        const storefront = await this.getStoreFront();
        const appVersion = await Native_MonkeyTracker.getAppVersion();
        const osVersion = await Native_MonkeyTracker.getOSVersion();
        const body = {
          deviceId: this.DEVICE_ID,
          sdkKey: this.APP_KEY,
          idfa,
          appUserId: this.APP_USER_ID,
          attribution,
          storefront,
          platform: Platform.OS,
          osVersion,
          appVersion,
        };
        console.log("body",body);
        const { data } = await this.sendSDKRequest("client/auth/handshake", "POST", body);
        Axios.defaults.headers.common['Authorization'] = data.token;
        AdStore.setUserId(data.user.id);
        AdStore.setSendEvent(this.sendSDKRequest);
        if (this.IS_DEBUG) {
          console.log(data);
          console.log("User Token Setted");
          console.log(data.token);
        }

        if (data.firstOpen) {
          const has_url = await Clipboard.hasURL();
          if (has_url) {
            const url = await Clipboard.getString();
            if (url.startsWith(data.baseUrl)) {
              await this.sendSDKRequest("client/ads/events/conversion", "POST", {
                url
              });
            }
          }
        }
        // this.API_USER = data.user;
        resolve(data.user);
      } catch (e) {
        resolve(false);
      }
    })
  }

  private getStoreFront() {
    return Native_MonkeyTracker.getDeviceCountry();
  }

  private sendSDKRequest = (_url: string, method: Method, data: object, headers: object = {}) => {
    const url = BASE_URL + _url;
    console.log("REQUEST", _url);
    return Axios({
      baseURL: url,
      method,
      data,
      headers
    })
  }
}

export const MonkeyTracker = new _MonkeyTracker();
