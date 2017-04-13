/**
 * Fake Model for ScanParametersService
 */

define([
	"backbone",
	"jquery.mockjax",
	], function(
			Backbone,
			mockjax
	) {
	
	var Service = Backbone.Model.extend({
		idAttribute: "SCANPARAMETERSSERVICEID",
		urlRoot: "/scanparam/service",
	});
	
	mockjax([
		{
			url: "scanparam/service/1",
			responseText: {
				SCANPARAMETERSSERVICEID: "1",
				NAME: "Hot air blower",
				DESCRIPTION: "A hot air blower, capable of operating from room temperature to 600 K.",
			},
		}, {
			url: "scanparam/service/2",
			responseText: {
				SCANPARAMETERSSERVICEID: "2",
				NAME: "Cryostat",
				DESCRIPTION: "A cooler capable of operating between 77 K and 20 K below room temperature.",
			},
		},
	]);
	
	return Service;
});