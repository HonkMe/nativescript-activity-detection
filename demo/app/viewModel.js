const Observable = require("data/observable");
const {ObservableArray} = require("data/observable-array");

function createViewModel() {
	var viewModel = new Observable.fromObject({
		entries: new ObservableArray([])
	});

	return viewModel;
}

exports.createViewModel = createViewModel;
