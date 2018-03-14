/* globals CMMotionActivityManager, NSOperationQueue */
const {ActivityDetectionBase, activityEvent} = require("./index.common");

var instance;

const ACTIVITY_TYPE = {
	IN_VEHICLE: "automotive",
	ON_BICYCLE: "cycling",
	WALKING: "walking",
	STILL: "stationary",
	UNKNOWN: "unknown",
	RUNNING: "running"
};

class ActivityDetection extends ActivityDetectionBase {
	constructor() {
		super();

		if (!CMMotionActivityManager.isActivityAvailable()) {
			console.error("Activity detection is not available on this device. ");
			return;
		}

		this.activityManager = new CMMotionActivityManager();
	}

	start() {
		if (!this.activityManager) {
			return;
		}

		this.activityManager.startActivityUpdatesToQueueWithHandler(NSOperationQueue.mainQueue, function (activity) {
			this.notifyActivity(getActivityType(activity), activity.confidence * 50);
		}.bind(this));
	}

	stop() {
		if (!this.activityManager) {
			return;
		}
		this.activityManager.stopActivityUpdates();
	}
}

function getActivityType(activity) {
	if (activity.stationary) {
		return ACTIVITY_TYPE.STILL;
	}

	if (activity.walking) {
		return ACTIVITY_TYPE.WALKING;
	}

	if (activity.running) {
		return ACTIVITY_TYPE.RUNNING;
	}

	if (activity.automotive) {
		return ACTIVITY_TYPE.IN_VEHICLE;
	}

	if (activity.cycling) {
		return ACTIVITY_TYPE.ON_BICYCLE;
	}

	return ACTIVITY_TYPE.UNKNOWN;
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
