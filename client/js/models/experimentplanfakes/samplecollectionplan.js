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
	});
	
	// No mockjax
	
	return SamplePlan;
	
});