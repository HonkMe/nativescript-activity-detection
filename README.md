# nativescript-activity-detection

NativeScript plugin to recognize user's activity (motion) like walking, running or in vehicle.

## Installation

```
tns plugin add nativescript-activity-detection
```

## Usage

```js
var activityDetection = ActivityDetection.getInstance();

activityDetection.on(ActivityDetection.activityEvent, function (eventData) {
	var activityType = eventData.activity.type;
	var activityConfidence = eventData.activity.confidence;

	...
});

activityDetection.start();

```
You can take a peek in the [demo app's controller](demo/app/main-page.js) for a complete example.

## Demo

After cloning or downloading the repo, go into `src` folder and run:

```
npm run clean
npm run <platform>
```

Where `platform` in eighter `ios` or `android`.

Please note that it's `npm run` not `tns run`.
