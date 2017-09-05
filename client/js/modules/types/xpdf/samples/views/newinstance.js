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
		
		initialize: function(options) {
			this.sampleName = options.sampleModel.get("NAME");
		},
		
		createModel: function() {
			this.model = new Instance();
			this.model.set({"SAMPLENAME": this.sampleName});
			
			// Set default values for the container model values
			this.model.set({"SIZE": "N/A",
				"CONTAINERMATERIAL": "",
				"CONTAINERDENSITY": "",
			});
		},
		
	});
	
});