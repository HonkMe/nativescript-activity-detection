const application = require('application');

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const ActivityRecognition = com.google.android.gms.location.ActivityRecognition;
const ActivityRecognitionResult = com.google.android.gms.location.ActivityRecognitionResult;
const DetectedActivity = com.google.android.gms.location.DetectedActivity;

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
			if (ActivityRecognitionResult.hasResult(intent)) {
				var result = ActivityRecognitionResult.extractResult(intent);
				var activity = result.getMostProbableActivity();
				var activityType = activity.getType();

				// var list = result.getProbableActivities();
				// for (let f = 0; f < list.size(); f++) {
				// 	let activity = list.get(f);
				// 	let activityType = activity.getType();
				// 	instance.notifyActivity(activityType, activity.getConfidence());
				// }
				// instance.notifyActivity(ACTIVITY_TYPE.UNKNOWN, 99.9);

				instance.notifyActivity(activityType, activity.getConfidence());
			}
		}
	}
});

class ActivityDetection extends ActivityDetectionBase {
	constructor() {
		super();
		this.context = application.android.context;

		var intent = new android.content.Intent(this.context, me.surdu.ActivityIntentService.class);
		this.activityReconPendingIntent = android.app.PendingIntent.getService(this.context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
	}

	connectToGooleAPI() {
		return new Promise(function (resolve, reject) {
			let api = new GoogleApiClient.Builder(this.context)
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

	start() {
		this.connectToGooleAPI()
		.then(function (api) {
			ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates(api, 0, this.activityReconPendingIntent);
			api.disconnect();
		}.bind(this))
		.catch(function (err) {
			console.error(err.stack);
		});
	}

	stop() {
		this.connectToGooleAPI()
		.then(function (api) {
			ActivityRecognition.ActivityRecognitionApi.removeActivityUpdates(api, this.activityReconPendingIntent);
			api.disconnect();
		}.bind(this))
		.catch(function (err) {
			console.error(err.stack);
		});
	}
}

module.exports = {
	getInstance: function () {
		if (!instance) {
			instance = new ActivityDetection();
		}

		return instance;
	},

	TYPE: ACTIVITY_TYPE,
	activityEvent: activityEvent,
};
