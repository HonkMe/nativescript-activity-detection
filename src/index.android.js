const application = require('application');

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const ActivityRecognition = com.google.android.gms.location.ActivityRecognition;
const ActivityRecognitionResult = com.google.android.gms.location.ActivityRecognitionResult;
const DetectedActivity = com.google.android.gms.location.DetectedActivity;
const PendingIntent = android.app.PendingIntent;

const {ActivityDetectionBase, activityEvent} = require("./index.common");

const ACTIVITY_TYPE = {
	IN_VEHICLE: DetectedActivity.IN_VEHICLE,
	ON_BICYCLE: DetectedActivity.ON_BICYCLE,
	ON_FOOT: 	DetectedActivity.ON_FOOT,
	STILL: DetectedActivity.STILL,
	UNKNOWN: DetectedActivity.UNKNOWN,
	RUNNING: DetectedActivity.RUNNING,
	WALKING: DetectedActivity.WALKING,
	TILTING: DetectedActivity.TILTING
};

var instance;

com.pip3r4o.android.app.IntentService.extend("me.surdu.ActivityIntentService", {
	onHandleIntent: function (intent) {
		if (instance) {
			const activity = instance.extractActivity(intent);
			instance.notifyActivity(activity.type, activity.confidence);
		}
	}
});

class ActivityDetection extends ActivityDetectionBase {
	constructor() {
		super();
		this.context = application.android.context;

		const intent = new android.content.Intent(this.context, me.surdu.ActivityIntentService.class);
		this.activityIntent = PendingIntent.getService(this.context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
	}

	static getInstance() {
		if (!instance) {
			instance = new ActivityDetection();
		}

		return instance;
	}

	static extractActivity(intent) {
		const androidActivity = ActivityRecognitionResult.extractResult(intent);
		if (!androidActivity) {
			return;
		}

		const activity = androidActivity.getMostProbableActivity();

		// var list = androidActivity.getProbableActivities();
		// for (let f = 0; f < list.size(); f++) {
		// 	let activity = list.get(f);
		// 	let activityType = activity.getType();
		// 	instance.notifyActivity(activityType, activity.getConfidence());
		// }
		// instance.notifyActivity(ACTIVITY_TYPE.UNKNOWN, 99.9);

		return {
			type: activity.getType(),
			confidence: activity.getConfidence()
		};
	}

	connectToGooleAPI() {
		return new Promise(function (resolve, reject) {
			const api = new GoogleApiClient.Builder(this.context)
			.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks({
				onConnected: function () {
					resolve(api);
				}
			}))
			.addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener({
				onConnectionFailed: function() {
					reject(new Error("Google API connection failed"));
				}
			}))
			.addApi(ActivityRecognition.API)
			.build();

			api.connect();
		}.bind(this));
	}

	setHandler(className) {
		const intent = new android.content.Intent(this.context, className.class);
		this.activityIntent = PendingIntent.getService(this.context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
	}

	start() {
		this.connectToGooleAPI()
		.then(function (api) {
			ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates(api, 0, this.activityIntent);
			api.disconnect();
		}.bind(this))
		.catch(function (err) {
			console.error(err.stack);
		});
	}

	stop() {
		this.connectToGooleAPI()
		.then(function (api) {
			ActivityRecognition.ActivityRecognitionApi.removeActivityUpdates(api, this.activityIntent);
			api.disconnect();
		}.bind(this))
		.catch(function (err) {
			console.error(err.stack);
		});
	}
}

Object.defineProperty(ActivityDetection, 'ACTIVITY_TYPE', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: ACTIVITY_TYPE
});

Object.defineProperty(ActivityDetection, 'activityEvent', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: activityEvent
});

module.exports = ActivityDetection;
