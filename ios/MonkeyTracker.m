#import "MonkeyTracker.h"

#import <AdSupport/ASIdentifierManager.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <iAd/ADClient.h>

@implementation MonkeyTracker

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getIDFA:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if([[ASIdentifierManager sharedManager] isAdvertisingTrackingEnabled]) {
      NSUUID *identifier = [[ASIdentifierManager sharedManager] advertisingIdentifier];
    if ([[ADClient sharedClient] respondsToSelector:@selector(requestAttributionDetailsWithBlock:)]) {
    [[ADClient sharedClient] requestAttributionDetailsWithBlock:^(NSDictionary *attributionDetails, NSError *error) {
      resolve(@{ @"idfa": [identifier UUIDString], @"attribution": attributionDetails });
    }];
    }else{
      resolve(@{ @"idfa": [identifier UUIDString] });
    }
  }else{
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
              NSLog(@"%@", error);
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
  }
}

RCT_EXPORT_METHOD(getDeviceId:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UIDevice *device = [UIDevice currentDevice];
  NSString  *currentDeviceId = [[device identifierForVendor]UUIDString];
  resolve(currentDeviceId);
}

@end
