/**
 * Recursively view and edit containers
 */

define([
	"marionette",
	"tpl!templates/types/xpdf/samples/containerview.html"
	], function(
			Marionette,
			template
	){
	
	var ContainerView = Marionette.LayoutView.extend({
		template: template,

		events: {
//			"onchange select.container": selectContainer
		},
		
		/*
		 * options:
		 * options.containers: list of available containers
		 */
		initialize: function(options) {
			this.containers = options.containers;
			
			
			this.model = new Backbone.Model({
				// Set default values for the templated parameters 
				SAMPLEDIMENSIONS: "",
				PHASENAME: "",
				PHASEDENSITY: "",
				DIMENSION1: "",
				SIZE1: "",
				DIMENSION2: "",
				SIZE2: "",
				DIMENSION3: "",
				SIZE3: "",
			});
		},
		
		onBeforeRender: function() {
			var containerSelect = this.$el.find("select.container");
			
			var nyOption = document.createElement("option");
			// Add a Block Form as an option for the first level of containers
			nyOption.text = "Block Form";
			containerSelect.add(nyOption);
			
			var selectionAdder = addAllToSelect;
		},
	});
	
	var addAllToSelect = function(collection, response, options) {
		var select = options.select;
		collection.each(function(element, index, collection) {
			var nyOption = document.createElement("option");
			nyOption.text = element.get("NAME");
			select.add(nyOption);
		});
	};
	
	return ContainerView;
});