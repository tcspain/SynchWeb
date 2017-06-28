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
		blSampleId: null,
		model: DataCollectionPlan,
		url: function() {
			return "/dcplan" + (this.blSampleId ? "/sample/" + this.blSampleId : "");
		},
		
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

	
	mockjax({
		url: /^\/api\/dcplan\/sample\/([\d]*)$/,
		urlParams: ["sampleId"],
		response: function(settings) {
			if (settings.sampleId === "398867") 
				return [
					{
						DIFFRACTIONPLANID: "1",
						WAVELENGTH: "0.163",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "1",
					}, {
						DIFFRACTIONPLANID: "2",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "3",
					},
					];
			else if (settings.sampleId === "398869")
				return [
					{
						DIFFRACTIONPLANID: "2",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "2",
					}, {
						DIFFRACTIONPLANID: "3",
						WAVELENGTH: "0.207",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "4",
					},
					];
			else if (settings.sampleId === "398865")
				return [
					{
						DIFFRACTIONPLANID: "4",
						WAVELENGTH: "0.288",
						PREFERREDBEAMSIZEX: "0.07",
						PREFERREDBEAMSIZEY: "0.07",
						MONOBANDWIDTH: "0.1",
						ORDER: "5",
					},
					];
			else
				return [];
		},
	});
});