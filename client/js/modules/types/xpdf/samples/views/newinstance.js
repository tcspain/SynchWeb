/**
 * A whole page View to allow the user to define a new XPDF instance from a sample
 */

define([
	"marionette",
	"views/form",
	"models/sample",
	"collections/samples",
	"modules/types/xpdf/utils/containerinstances",
	"modules/types/xpdf/samples/views/containerview",
	"tpl!templates/types/xpdf/samples/newinstance.html"
	],
	function(
			Marionette,
			FormView,
			Instance,
			Instances,
			ContainerInstances,
			ContainerView,
			template
	) {
	
	return FormView.extend({
		template: template,
		
		regions: {
			containerview: ".container-view",
		},
		
		events: {
			"change input.packingfraction": "onChangePacking",
		},
		
		initialize: function(options) {
			this.sampleName = options.sampleModel.get("NAME");
			this.theoreticalDensity = options.sampleModel.get("THEORETICALDENSITY");
			this.containers = new Instances();
			this.listenTo(this.containers, "add", this.onContainersUpdate);
			this.updateContainers();
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

		// update the collection of containers availabler to encapsulate the new instance
		updateContainers: function() {
			var self = this;
			var containerInstances = ContainerInstances.getContainers({
				success: function(collection, response, options) {
					console.log("Found " + collection.length + " containers");
					// update the collection of containers without changing the reference
					self.containers.reset()
					// Will fire the add listener
					self.containers.add(collection.models);
				},
				error: function(collection, response, options) {
					console.log("Error getting containers");
				},
			});
		},

		// Add the list of available containers to the interface 
		onContainersUpdate: function() {
			console.log("Redraw container stuff");
			this.containerview.show(new ContainerView({containers: this.containers}));
		},
	
	});
	
});