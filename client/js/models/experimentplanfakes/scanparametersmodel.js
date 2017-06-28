/**
 * Fake model for scan parameters
 */

define([	
	"backbone",
	"jquery.mockjax",
	], function(
			Backbone,
			mockjax
	) {
	var Parameters = Backbone.Model.extend({
		idAttribute: "SCANPARAMETERSMODELID",
		urlRoot: "/scanparam",
		
	});
	
	mockjax([
		{
			url: "/api/scanparam/1",
			responseText: {
				SCANPARAMETERSMODELID: "1",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "1",
				MODELNUMBER: "1",
				START: "400",
				STOP: "600",
				STEP: "25",
				ARRAY: "400 K to 600 K in 25 K steps",
			},
		}, {
			url: "/api/scanparam/2",
			responseText: {
				SCANPARAMETERSMODELID: "2",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "3",
				MODELNUMBER: "1",
				START: "400",
				STOP: "650",
				STEP: "50",
				ARRAY: "400 K to 650 K in 50 K steps",
		},
		}, {
			url: "/api/scanparam/3",
			responseText: {
				SCANPARAMETERSMODELID: "3",
				SCANPARAMETERSSERVICEID: "2",
				DATACOLLECTIONPLANID: "3",
				MODELNUMBER: "2",
				START: "80",
				STOP: "200",
				STEP: "20",
				ARRAY: "Why run the cryo and the blower at the same time?",
			},
		}, {
			url: "/api/scanparam/4",
			responseText: {
				SCANPARAMETERSMODELID: "4",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "4",
				MODELNUMBER: "1",
				START: "400",
				STOP: "650",
				STEP: "50",
				ARRAY: "400 K to 650 K in 50 K steps",
			},
		}
	]);
	
	return Parameters;
	
});