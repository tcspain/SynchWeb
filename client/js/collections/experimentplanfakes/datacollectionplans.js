/**
 * Fake Collection for the data collection plans
 */

define([
	"backbone.paginator",
	"jquery.mockjax",
	
	"models/experimentplanfakes/datacollectionplan",
	], function(
			PageableCollection,
			mockjax,
			DataCollectionPlan
	) {
	var DCPlans = PageableCollection.extend({
		model: DataCollectionPlan,
		url: "/dcplan",
		
		state: {
			pageSize: 15,
		},

	});
	
	/*
	 * mockjax({
	 * 		url: "/api/dcplan/sample/...
	 * 		responseText: [
	 * 		]
	 * });
	 */
	
	mockjax({
		url: "/api/dcplan",
		responseText: [
			{
				DIFFRACTIONPLANID: "1",
				WAVELENGTH: "0.163",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			}, {
				DIFFRACTIONPLANID: "2",
				WAVELENGTH: "0.207",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			}, {
				DIFFRACTIONPLANID: "3",
				WAVELENGTH: "0.207",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			}, {
				DIFFRACTIONPLANID: "4",
				WAVELENGTH: "0.288",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			},
		]
	});

	return DCPlans;
});