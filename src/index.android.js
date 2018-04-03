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

    if (this.apiClient) {

      this.apiClient.connect();
    }
	}

	stop() {
    if (this.apiClient && ActivityRecognition && ActivityRecognition.ActivityRecognitionApi) {
      ActivityRecognition.ActivityRecognitionApi.removeActivityUpdates(this.apiClient, this.activityReconPendingIntent);

    }
	}

	onConnected() {
    if (this.apiClient && ActivityRecognition && ActivityRecognition.ActivityRecognitionApi) {
      ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates(this.apiClient, 0, this.activityReconPendingIntent);
    }
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
