import { Alert, NativeModules } from 'react-native';
import Axios from "axios";
import type { Method } from "./types";

const { MonkeyTracker } = NativeModules;

const BASE_URL = `https://tracker.monkeysteam.com/`;
class _MonkeyTracker {
  private APP_KEY = "";
  private USER_IDFA = {idfa:"not_registered_yet", attribution:false};
  private DEVICE_ID = "";
  private IS_DEBUG = false;
  // private API_USER = {};
  private APP_USER_ID = null;


  init = (APP_KEY: string, appUserId:any ,DEBUG=false) => {
    return new Promise( async (resolve,reject) => {
      try{
        if(!APP_KEY){
          console.warn("APP_KEY required!");
          return reject(false);
        }
        if(appUserId){
          this.APP_USER_ID = appUserId
        }
        this.IS_DEBUG = DEBUG;
        const device_id = await MonkeyTracker.getDeviceId();
        await this.userIDFA();
        this.DEVICE_ID = device_id;
        this.APP_KEY = APP_KEY;
        await this.login();
        if(DEBUG){
          console.log("Monkeys Team Debug Mode Active");
          console.log(`App Key Setted -> ${APP_KEY}`);
          console.log(`Device ID -> ${this.DEVICE_ID}`);
        }
        return resolve(true);
      }catch(e){
        await this.login();
        return resolve(false);
      }
    })
  }

  userIDFA = (try_count=1) => {
    return new Promise( async (resolve,reject) => {
      try{
        const userIDFA = await MonkeyTracker.getIDFA();
        if(this.IS_DEBUG){
          console.log(`User IDFA Info`);
          console.log(userIDFA);
        }
        if(!userIDFA.permission){
          if(this.IS_DEBUG){
            console.log("User Tracker Permission Not Auth...");
          }
          this.USER_IDFA.idfa = "LAT_ON";
          resolve(true);
        }else{
          if(!userIDFA.attribution){
            if(this.IS_DEBUG){
              console.log("Attribution api fail...");
              console.log("Attribution api request will send 20 secs later.");
              console.log("Try count -> "+try_count);
            }
            if(try_count < 5){
              let _try_count = try_count + 1;
              setTimeout( async () => {
                try{
                  const resp = await this.userIDFA(_try_count);
                  if(resp){
                    resolve(true);
                  }else{
                    resolve(false);
                  }
                }catch(e){
                  resolve(false);
                }
              },20000)
            }else{
              if(this.IS_DEBUG){
                console.log("Attribution api fail...");
              }
              resolve(false);
            }
          }else{
            this.USER_IDFA = userIDFA;
            resolve(true);
          }
        }
      }catch(e){
        console.warn(e);
        return reject(false);
      }
    })
  }

  purchase = async (receipt: string, product_id: string, price: number, currency: string) => {
    await this.sendSDKRequest("client/event/trackPurchase","POST",{
      receipt,
      product_id,
      price,
      currency
    });
  }

  sendEvent = async (event_name: string, properties: object) => {
    if(!this.APP_KEY) {
      console.warn("INIT must be call before send event");
      return false;
    }
    if(this.IS_DEBUG){
      console.log(`${event_name} event is sending...`)
      console.log(`${properties}`);
    }
    await this.sendSDKRequest("client/event","POST",{
      eventName:event_name,
      eventValue:properties
    });
    console.log(`${event_name} event has done...`)
    return true;
  }

  private login = () => {
    return new Promise(async (resolve) => {
      try{
        let attribution = null, idfa = null;
        if(this.USER_IDFA){
          attribution = this.USER_IDFA.attribution;
          idfa = this.USER_IDFA.idfa;
        }
        const storefront = await this.getStoreFront();
        const body = {
          deviceId:this.DEVICE_ID,
          sdkKey:this.APP_KEY,
          idfa,
          appUserId:this.APP_USER_ID,
          attribution,
          storefront,
        };
        const { data } = await this.sendSDKRequest("client/auth/handshake","POST",body);
        Axios.defaults.headers.common['Authorization'] = data.token;
        if(this.IS_DEBUG){
          console.log("User Token Setted");
          console.log(data.token);
        }
        // this.API_USER = data.user;
        resolve(true);
      }catch(e){
        resolve(false);
      }
    })
  }

  private getStoreFront(){
    return MonkeyTracker.getDeviceCountry();
  }

  private sendSDKRequest = (_url:string,method:Method,data:object) => {
    const url = BASE_URL+_url;
    return Axios({
      baseURL:url,
      method,
      data
    })
  }
}


const monkeyTracker = new _MonkeyTracker();
export default monkeyTracker;