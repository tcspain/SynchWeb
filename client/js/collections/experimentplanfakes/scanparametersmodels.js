/**
 * Fake Collection for scan parameters
 */

define([	
	"backbone.paginator",
	"jquery.mockjax",
	
	"models/experimentplanfakes/scanparametersmodel",
	], function(
			PageableCollection,
			mockjax,
			
			ScanParametersModel
	) {
	var ScanParametersCollection = PageableCollection.extend({
		dataCollectionPlanId: null,
		model: ScanParametersModel,
		url: function() {
			return "/scanparam" + (this.dataCollectionPlanId ? "/dcplan/"+this.dataCollectionPlanId : "");
		},
		
		state: {
			pageSize: 15,
		},
		
		/*
		 * options
		 * options.dataCollectionPlanId: The collection will hold the scan
		 * parameters for this data collection plan.
		 */
		initialize: function(models, options) {
			if (models && models.length > 0) this.models = models;
			if (options && options.dataCollectionPlanId) this.dataCollectionPlanId = options.dataCollectionPlanId;
		}
	});
	
	// Parameter Models by DataCollectionPlan
	mockjax([
		{
			url: "/api/scanparam/dcplan/1",
			responseText: [
				{
					SCANPARAMETERSMODELID: "1",
					SCANPARAMETERSSERVICEID: "1",
					DATACOLLECTIONPLANID: "1",
					MODELNUMBER: "1",
					START: "",
					STOP: "",
					STEP: "",
					ARRAY: "400, 450, 475, 600, 620, 630, 640, 650", // 400 K to 600 K in uneven steps
				},
				],
		}, {
			url: "/api/scanparam/dcplan/2",
			responseText: [
			],
		}, {
			url: "/api/scanparam/dcplan/3",
			responseText: [
				{
					SCANPARAMETERSMODELID: "2",
					SCANPARAMETERSSERVICEID: "1",
					DATACOLLECTIONPLANID: "3",
					MODELNUMBER: "1",
					START: "400",
					STOP: "650",
					STEP: "50",
					ARRAY: "", // 400 K to 650 K in 50 K steps
				}, {
					SCANPARAMETERSMODELID: "3",
					SCANPARAMETERSSERVICEID: "2",
					DATACOLLECTIONPLANID: "3",
					MODELNUMBER: "2",
					START: "80",
					STOP: "200",
					STEP: "20",
					ARRAY: "", // Why run the cryo and the blower at the same time?
				},
			],
		}, {
			url: "/api/scanparam/dcplan/4",
			responseText: [
				{
					SCANPARAMETERSMODELID: "4",
					SCANPARAMETERSSERVICEID: "1",
					DATACOLLECTIONPLANID: "4",
					MODELNUMBER: "1",
					START: "400",
					STOP: "650",
					STEP: "50",
					ARRAY: "", // 400 K to 650 K in 50 K steps
				},
			],

		},
		]);
	
	// All scanParametersModels
	mockjax({
		url: "/api/scanparam",
		type: "GET",
		responseText: [
			{
				SCANPARAMETERSMODELID: "1",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "1",
				MODELNUMBER: "1",
				START: "",
				STOP: "",
				STEP: "",
				ARRAY: "400, 450, 475, 600, 620, 630, 640, 650", // 400 K to 600 K in 25 K steps
			}, {
				SCANPARAMETERSMODELID: "2",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "3",
				MODELNUMBER: "1",
				START: "400",
				STOP: "650",
				STEP: "50",
				ARRAY: "", // 400 K to 650 K in 50 K steps
			}, {
				SCANPARAMETERSMODELID: "3",
				SCANPARAMETERSSERVICEID: "2",
				DATACOLLECTIONPLANID: "3",
				MODELNUMBER: "2",
				START: "80",
				STOP: "200",
				STEP: "20",
				ARRAY: "", // Why run the cryo and the blower at the same time?
			}, {
				SCANPARAMETERSMODELID: "4",
				SCANPARAMETERSSERVICEID: "1",
				DATACOLLECTIONPLANID: "4",
				MODELNUMBER: "1",
				START: "400",
				STOP: "650",
				STEP: "50",
				ARRAY: "", // 400 K to 650 K in 50 K steps
			},
		],
	});
	
	
	
	return ScanParametersCollection;
	
});
