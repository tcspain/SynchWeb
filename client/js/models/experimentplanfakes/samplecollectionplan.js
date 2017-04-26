/**
 * Data collection plans on a sample. Differs from the other data collection
 * plan model by the idAttribute used. 
 */

define([
	"backbone",
	"jquery.mockjax",
	], function(
			Backbone,
			mockjax
	) {
	var SamplePlan = Backbone.Model.extend({
		idAttribute: "ORDER",

		validation: {
			WAVELENGTH: {
				required: false,
				pattern: "number",
			},
			PREFERREDBEAMSIZEX: {
				required: false,
				pattern: "number",
			},
			PREFERREDBEAMSIZEY: {
				required: false,
				pattern: "number",
			},
			MONOBANDWIDTH: {
				required: false,
				pattern: "number",
			},
			DIFFRACTIONPLANID: {
				required: true,
				pattern: "digits",
			},
		},
		
	});
	
	// No mockjax
	
	return SamplePlan;
	
});