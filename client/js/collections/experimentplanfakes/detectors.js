/**
 * Fake collection for detectors
 */

define([
	"backbone.paginator",
	"jquery.mockjax",
	
	"models/experimentplanfakes/detector",
	], function(
			PageableCollection,
			mockjax,
			Detector
	) {
	var Detectors = PageableCollection.extend({
		dataCollectionId: null,
		model: Detector,
		url: function() {
			return "/detector" + (this.dataCollectionId ? "/dcplan/"+this.dataCollectionId : "");
		},
		
		state: {
			pageSize: 5,
		},
	});
	
	mockjax({
		url: "/api/detector/dcplan/*",
		responseText: [
			{				
				DETECTORID: "1",
				TYPE: "PDF",
				MANUFACTURER: "Perkin-Elemer",
				MODEL: "4K",
				DISTANCEMIN: "0.3",
				DISTANCEMAX: "3.0",
				DENSITY: "4.5",
				COMPOSITION: "CsI",
			},
		]
	});

	mockjax({
		url: "/api/detector",
		responseText: [
			{				
				DETECTORID: "1",
				TYPE: "PDF",
				MANUFACTURER: "Perkin-Elemer",
				MODEL: "4K",
				DISTANCEMIN: "0.3",
				DISTANCEMAX: "3.0",
				DENSITY: "4.5",
				COMPOSITION: "CsI",
			},
			{				
				DETECTORID: "2",
				TYPE: "Bragg",
				MANUFACTURER: "Perkin-Elemer",
				MODEL: "4K",
				DISTANCEMIN: "0.3",
				DISTANCEMAX: "3.0",
				DENSITY: "4.5",
				COMPOSITION: "CsI",
			},
		]
	});
	
	return Detectors;
	
});