/**
 * Fake Collection for the ScanParametersServices
 */

define([
	"backbone.paginator",
	"jquery.mockjax",

	"models/experimentplanfakes/scanparametersservice",
	], function(
			PageableCollection,
			mockjax,
			ScanParametersService
	) {
		var Services = PageableCollection.extend({
			model: ScanParametersService,
			url: "/scanparam/service",
			state: {
				pageSize: 5,
			},
		});
		
		mockjax({
			url: "/api/scanparam/service",
			responseText: [
				{
					SCANPARAMETERSSERVICEID: "1",
					NAME: "Hot air blower",
					DESCRIPTION: "A hot air blower, capable of operating from room temperature to 600 K.",
				}, {
					SCANPARAMETERSSERVICEID: "2",
					NAME: "Cryostat",
					DESCRIPTION: "A cooler capable of operating between 77 K and 20 K below room temperature.",
				},
			],
		});
		
		return Services;
});