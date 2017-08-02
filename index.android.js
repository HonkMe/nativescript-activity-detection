const application = require('application');

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const ActivityRecognition = com.google.android.gms.location.ActivityRecognition;
const ActivityRecognitionResult = com.google.android.gms.location.ActivityRecognitionResult;
const DetectedActivity = com.google.android.gms.location.DetectedActivity;

const {isFunction} = require("./utils");

var instance;

class ActivityDetection {
	constructor() {
		this.callbacks = [];
		this.context = application.android.context;
	}

	start(context) {
		if (context) {
			this.context = context;
		}

		this.apiClient = new GoogleApiClient.Builder(this.context)
		.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks({
			onConnected: this.onConnected.bind(this),
			onConnectionSuspended: function() {
				console.error("Activity Detection: Connection SUSPENDED");
			}.bind(this)
		}))
		.addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener({
			onConnectionFailed: function() {
				console.error("Activity Detection: Connection FAILED");
			}.bind(this)
		}))
		.addApi(ActivityRecognition.API)
		.build();

		this.apiClient.connect();
	}

	handleIntent(intent) {
		if (ActivityRecognitionResult.hasResult(intent)) {
			var result = ActivityRecognitionResult.extractResult(intent);
			var activity = result.getMostProbableActivity();
			var activityType = activity.getType();

			for (let f = 0; f < this.callbacks.length; f++) {
				let callback = this.callbacks[f];
				if (isFunction(callback)) {
					callback({
						confidence: activity.getConfidence(),
						type: activityType
					});
				}
			}
		}
	}

	subscribe(callback) {
		this.callbacks.push(callback);
		return this.callbacks.length - 1;
	}

	unsubscribe(index) {
		this.callbacks.splice(index, 1);
	}

	onConnected() {
		com.pip3r4o.android.app.IntentService.extend("me.surdu.honkme.ActivityReconIntentService", {
			onHandleIntent: this.handleIntent.bind(this)
		});

		var intent = new android.content.Intent(this.context, me.surdu.honkme.ActivityReconIntentService.class);
		var activityReconPendingIntent = android.app.PendingIntent.getService(this.context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);

		ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates(this.apiClient, 0, activityReconPendingIntent);
	}
}

module.exports = {
	getInstance: function () {
		if (!instance) {
			instance = new ActivityDetection();
		}

		return instance;
	},

	IN_VEHICLE: DetectedActivity.IN_VEHICLE,
	ON_BICYCLE: DetectedActivity.ON_BICYCLE,
	ON_FOOT: 	DetectedActivity.ON_FOOT,
	STILL: DetectedActivity.STILL,
	UNKNOWN: DetectedActivity.UNKNOWN,
	RUNNING: DetectedActivity.RUNNING,
	WALKING: DetectedActivity.WALKING,
	TILTING: DetectedActivity.TILTING
};
