# react-native-monkey-tracker

Monkeys Team ASA Tracker

## Installation

```sh
npm install react-native-monkey-tracker
```

## Usage

```js
import MonkeyTracker from "react-native-monkey-tracker";

// ...

MonkeyTracker.init(APP_KEY: string, appUserId:any ,DEBUG:boolean);

MonkeyTracker.purchase(receipt: string, product_id: string, price: number, currency: string);

MonkeyTracker.sendEvent(event_name: string, properties: object)
```


## License

MIT
