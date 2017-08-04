const ActivityDetection = require("nativescript-activity-detection");

const {createViewModel} = require("./viewModel");

const viewModel = createViewModel();

var activityDetection = ActivityDetection.getInstance();
var listView;


function onNavigatingTo(args) {
	var page = args.object;
	listView = page.getViewById("log");
	page.bindingContext = viewModel;

	activityDetection.on(ActivityDetection.activityEvent, function (eventData) {
		var activityName = getActivityName(eventData.activity.type);
		var activityConfidence = eventData.activity.confidence;

		addEntry(`${activityName}; Confidence: ${activityConfidence}%`);
	});
}

function addEntry(text) {
	viewModel.entries.splice(0, 0, text);
	listView.scrollToIndex(viewModel.entries.length - 1);
}


function getActivityName(activityType) {
	switch (activityType) {
		case ActivityDetection.TYPE.IN_VEHICLE:
			return "In vehicle";
		case ActivityDetection.TYPE.ON_BICYCLE:
			return "On bicycle";
		case ActivityDetection.TYPE.ON_FOOT:
			return "On foot";
		case ActivityDetection.TYPE.STILL:
			return "Standing still";
		case ActivityDetection.TYPE.UNKNOWN:
			return "Unknown";
		case ActivityDetection.TYPE.RUNNING:
			return "Running";
		case ActivityDetection.TYPE.WALKING:
			return "Walking";
		case ActivityDetection.TYPE.TILTING:
			return "Tilting";
	}
}

module.exports = {
	onNavigatingTo: onNavigatingTo,

	start: function () {
		addEntry("--- Start ---");
		activityDetection.start();
	},

	stop: function () {
		activityDetection.stop();
		addEntry("--- Stop ---");
	}
};
