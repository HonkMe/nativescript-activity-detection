const {Observable} = require("data/observable");

const activityEvent = "activity-event";

class ActivityDetectionBase extends Observable {
	constructor() {
		super();
	}

	notifyActivity(type, confidence) {
		this.notify({
			eventName: activityEvent,
			activity: {
				type: type,
				confidence: confidence
			}
		});
	}
}

module.exports = {
	ActivityDetectionBase: ActivityDetectionBase,
	activityEvent: activityEvent
};
