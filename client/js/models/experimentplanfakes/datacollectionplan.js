/**
 * Fake model for the dataCollectionPlan table
 */

define([	
	"backbone",
	"jquery.mockjax",
	], function(
			Backbone,
			mockjax
	) {
	var DCPlan = Backbone.Model.extend({
		idAttribute: "DIFFRACTIONPLANID",
		urlRoot: "/dcplan",
		
	});
	
	mockjax([
		{
			url: "/api/dcplan/1",
			responseText: {
				DIFFRACTIONPLANID: "1",
				WAVELENGTH: "0.163",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			},
		}, {
			url: "/api/dcplan/2",
			responseText: {
				DIFFRACTIONPLANID: "2",
				WAVELENGTH: "0.207",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			},
		}, {
			url: "/api/dcplan/3",
			responseText: {
				DIFFRACTIONPLANID: "3",
				WAVELENGTH: "0.207",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			},
		}, {
			url: "/api/dcplan/4",
			responseText: {
				DIFFRACTIONPLANID: "4",
				WAVELENGTH: "0.288",
				PREFERREDBEAMSIZEX: "0.07",
				PREFERREDBEAMSIZEY: "0.07",
				MONOBANDWIDTH: "0.1",
			},
		},
		
	]);
	
	return DCPlan;
});