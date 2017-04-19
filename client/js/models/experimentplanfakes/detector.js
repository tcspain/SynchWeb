/**
 * Fake model for Detectors
 */

define([	
	"backbone",
	"jquery.mockjax",
	], function(
			Backbone,
			mockjax
	) {
	var Detector = Backbone.Model.extend({
		idAttribute: "DETECTORID",
		urlRoot: "/detector",

	});
		
	mockjax([
		{
			url: "/api/detector/1",
			responseText: {
				DETECTORID: "1",
				TYPE: "PDF",
				MANUFACTURER: "Perkin-Elmer",
				MODEL: "4K",
				DISTANCEMIN: "0.3",
				DISTANCEMAX: "3.0",
				DENSITY: "4.5",
				COMPOSITION: "CsI",
			},
		}, {
			url: "/api/detector/2",
			responseText: {
				DETECTORID: "2",
				TYPE: "Bragg",
				MANUFACTURER: "Perkin-Elmer",
				MODEL: "4K",
				DISTANCEMIN: "0.3",
				DISTANCEMAX: "3.0",
				DENSITY: "4.5",
				COMPOSITION: "CsI",
			},
		},

		]);
		
	return Detector;
});