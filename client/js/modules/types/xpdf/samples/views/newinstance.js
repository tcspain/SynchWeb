/**
 * A whole page View to allow the user to define a new XPDF instance from a sample
 */

define([
	"marionette",
	"models/sample",
	"tpl!templates/types/xpdf/samples/newinstance.html"
	],
	function(
			Marionette,
			Instance,
			template
	) {
	
	return FormView.extend({
		template: template,
		
		events: {
			"change input.packingfraction": "onChangePacking",
		},
		
		initialize: function(options) {
			this.sampleName = options.sampleModel.get("NAME");
			this.theoreticalDensity = options.sampleModel.get("THEORETICALDENSITY");
		},
		
		createModel: function() {
			this.model = new Instance();
			this.model.set({
				"SAMPLENAME": this.sampleName,
				"PACKINGFRACTION": "1.0",
				"THEORETICALDENSITY": this.theoreticalDensity,
				"EXPERIMENTALDENSITY": this.theoreticalDensity,
				});
			
			// Set default values for the container model values
			this.model.set({"SIZE": "N/A",
				"CONTAINERMATERIAL": "",
				"CONTAINERDENSITY": "",
			});
		},
		
		onChangePacking: function(e) {
			var valueStr = e.target.value;
			var nyPackingFraction = Number.parseFloat(valueStr);
			var theoreticalDensity = Number.parseFloat(this.model.get("THEORETICALDENSITY"));
			var nyDensity = nyPackingFraction * theoreticalDensity;
			this.model.set({
				"PACKINGFRACTION": valueStr,
				"EXPERIMENTALDENSITY": nyDensity});
			this.render();
		},
		
	});
	
});