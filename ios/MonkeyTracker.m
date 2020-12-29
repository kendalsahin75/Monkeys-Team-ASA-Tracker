#import "MonkeyTracker.h"

#import <AdSupport/ASIdentifierManager.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <iAd/ADClient.h>
#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>

@implementation MonkeyTracker

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getIDFA:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if(@available(iOS 14,*)) {
    [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {
        if (status == ATTrackingManagerAuthorizationStatusDenied) {
            //Logic when authorization status is denied
            resolve(@{@"permission":@false});
        } else if (status == ATTrackingManagerAuthorizationStatusAuthorized) {
            NSUUID *identifier = [[ASIdentifierManager sharedManager] advertisingIdentifier];
            if ([[ADClient sharedClient] respondsToSelector:@selector(requestAttributionDetailsWithBlock:)]) {
                [[ADClient sharedClient] requestAttributionDetailsWithBlock:^(NSDictionary *attributionDetails, NSError *error) {
                    if(error == nil) {
                        resolve(@{ @"idfa": [identifier UUIDString], @"attribution": attributionDetails, @"permission":@true });
                    }else{
                        resolve(@{ @"idfa": [identifier UUIDString], @"permission":@true });
                    }
                }];
            }else{
                resolve(@{ @"idfa": [identifier UUIDString], @"permission":@true });
            }
        } else if (status == ATTrackingManagerAuthorizationStatusNotDetermined) {
            resolve(@{@"permission":@false});
        }  else if (status == ATTrackingManagerAuthorizationStatusRestricted) {
            resolve(@{@"permission":@false});
        }
    }];
  }else{
    if([[ASIdentifierManager sharedManager] isAdvertisingTrackingEnabled]){
      NSUUID *identifier = [[ASIdentifierManager sharedManager] advertisingIdentifier];
      if ([[ADClient sharedClient] respondsToSelector:@selector(requestAttributionDetailsWithBlock:)]) {
      [[ADClient sharedClient] requestAttributionDetailsWithBlock:^(NSDictionary *attributionDetails, NSError *error) {
        if(error == nil) {
          resolve(@{ @"idfa": [identifier UUIDString], @"attribution": attributionDetails, @"permission":@true });
        }else{
          NSLog(@"%@", error);
          resolve(@{ @"idfa": [identifier UUIDString], @"permission":@true });
        }
      }];
      }else{
        resolve(@{ @"idfa": [identifier UUIDString], @"permission":@true });
      }
    }
  }
}

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UIDevice *device = [UIDevice currentDevice];
  NSString  *currentDeviceId = [[device identifierForVendor]UUIDString];
  resolve(currentDeviceId);
}

RCT_EXPORT_METHOD(getDeviceCountry:(RCTPromiseResolveBlock)resolve){
    NSLocale *locale;
    SKProduct *baseProduct = nil; // replace as applicable
    if (baseProduct) {
        locale = baseProduct.priceLocale; // from the user's credit card on iTunes
    } else {
        locale = [NSLocale currentLocale]; // from user preferences
    }
    NSString *countryCode = [locale objectForKey:NSLocaleCountryCode];
    resolve(countryCode);
}

@end
