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
	"modules/types/xpdf/utils/defaultcontainer",
	"tpl!templates/types/xpdf/samples/newinstance.html"
	],
	function(
			Marionette,
			FormView,
			Instance,
			Instances,
			ContainerInstances,
			ContainerView,
			defaultContainer,
			template
	) {
	
	var NewInstance = FormView.extend({
		template: template,
		
		regions: {
			containerview: ".container-view",
			density: ".density",
		},
		
		events: {
			"change input.packingfraction": "onChangePacking",
		},
		
		initialize: function(options) {
			this.sampleName = options.sampleModel.get("NAME");
			this.crystalId  = options.sampleModel.get("CRYSTALID");
			this.proteinId  = options.sampleModel.get("PROTEINID");
			this.abundance  = options.sampleModel.get("ABUNDANCE");
			this.theoreticalDensity = options.sampleModel.get("THEORETICALDENSITY");
			
			// Here 'container' is the XPDF container
			this.containers = new Instances();
			this.listenTo(this.containers, "add", this.onContainersUpdate);
			this.updateContainers();
			
		},
		
		createModel: function() {
			this.model = new Instance();
			console.log("createModel: default container ID is:" + this.defaultContainer);
			this.model.set({
				"CRYSTALID": this.crystalId,
				"PROTEINID": this.proteinId,
				"ABUNDANCE": this.abundance,
				"SAMPLENAME": this.sampleName,
				"PACKINGFRACTION": "1.0",
				"THEORETICALDENSITY": this.theoreticalDensity,
				"EXPERIMENTALDENSITY": this.theoreticalDensity,
				"LOCATION": "0",
			});

			// Here 'container' is the ISPyB container
			defaultContainer.getDefault(this.setContainer, {model: this.model});
			
		},
		
		setContainer(container, context) {
			var containerId = container.get("CONTAINERID");
			if (context.model)
				context.model.set({"CONTAINERID": containerId});
		},

		onChangePacking: function(e) {
			var valueStr = e.target.value;
			var nyPackingFraction = Number.parseFloat(valueStr);
			var theoreticalDensity = Number.parseFloat(this.model.get("THEORETICALDENSITY"));
			var nyDensity = nyPackingFraction * theoreticalDensity;
			this.model.set({
				"PACKINGFRACTION": valueStr,
				"EXPERIMENTALDENSITY": nyDensity});
			this.showDensityView(nyDensity, "g cm⁻³");
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
			if (this.isRendered == true)
				// offset of the first layer of container is 1, 0 being the sample itself
				this.containerview.show(new ContainerView({containers: this.containers, offset: 1}));
		},
		
		onRender: function() {
			this.isRendered = true;
			this.showDensityView(this.model.get("EXPERIMENTALDENSITY"), "g cm⁻³");
		},
		
		showDensityView: function(density, units) {
			this.density.show(new DensityView({value: density, units: units}));
			var densityDiv = this.$el.find("div.density");
			if (densityDiv.size() > 0) {
				densityDiv[0].style.display = "inline";
			}
		},
		
		success: function(model, response, options) {
			var nySample = model;
			
			// TODO: define the new sample group here
			
			
			
			app.trigger("samples:view", model.get("BLSAMPLEID"));
		},
	
	});
	
	var DensityView = Marionette.LayoutView.extend({
		className: "density",
		
		template: _.template("<%=VALUE%> <%=UNITS%>"),
		
		initialize: function(options) {
			this.model = new Backbone.Model({
				"VALUE": options.value,
				"UNITS": options.units,
			});
		},
		
		onRender: function(){
			console.log("rendering DensityView");
			var ownDiv = this.$el.find("div.density");
			if (ownDiv.size() > 0) {
				console.log("Setting density div style");
				ownDiv[0].style.display = "inline";
			}
		},
		
	});
	
	return NewInstance;
	
});