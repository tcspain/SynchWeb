/**
 * Recursively view and edit containers
 */

define([
	"marionette",
	"models/sample",
	"collections/samples",
	"tpl!templates/types/xpdf/samples/containerview.html"
	], function(
			Marionette,
			Instance,
			Instances,
			template
	){
	
	var ContainerView = Marionette.LayoutView.extend({
		className: "container-view-inner",
		template: template,

		regions: {
			containerDetails: "div.container-details",
			encapContainer: "div.encapsulating",
			containerName: "span.container-name",
		},
		
		events: {
			"change select.container-select": "_selectContainer"
		},
		
		/*
		 * options:
		 * options.offset: the layer at which the container lies
		 * For new sample groups:
		 * options.containers: list of available containers
		 * For existing sample groups:
		 * options.collection: array of containers to display
		 */
		initialize: function(options) {
			console.log("ContainerView:", options);
			this.offset = options.offset;
			if (options.collection) {
				this.collection = options.collection;
				this.model = options.collection.at(this.offset);
				this.containers = new Instances();
				this.isNew = false;
			} else {
				this.collection = new Instances();
				this.model = null;
				this.containers = options.containers;
				this.isNew = true;
			}
			this.containerProperties = {};
		},
		
		onRender: function() {
			if (this.isNew)
				this._renderNew();
			else
				this._renderExisting();
		},
		
		_renderNew: function() {
			// Get the elements associated with this container
			// TODO Cope with multiple containers. Make sure to select only
			// this container's elements
			this.select = this.$el.find("select.container-select")[0];

			var addedTrueContainers = new Instances();
			// Add 'form' containers, to define the shape of un contained samples. Might still be in a furnace
			if (this.offset == 1) {
				var nyOption = document.createElement("option");
				// Add a Block Form as an option for the first level of containers
				nyOption.value= "block-form";
				nyOption.text = "Block Form";
				this.select.add(nyOption);
				// Add Block Form properties (hard coded, currently)
				this.containerProperties[nyOption.value] = {
						"DIMENSION1": "Height",
						"DIMENSION2": "Width",
						"DIMENSION3": "Thickness",
				};
				addedTrueContainers.add(this.containers.where({"ISSHAPING": true}));
			} else {
				addedTrueContainers.add(this.containers.where({"ISSHAPING": false}));
			}
			console.log(addedTrueContainers);
			addAllToSelect(addedTrueContainers, "", {select: this.select, properties: this.containerProperties});
		},
		
		_renderExisting: function() {
			this.$el.find("select.container-select")[0].style.display = "none";

			this.container = new Instance();
			this.container.set({"BLSAMPLEID": this.model.get("BLSAMPLEID")});
			var drawRegion = this.containerDetails;
			this.container.fetch({
				success: function(model, response, options) {
					console.log(model);
					drawRegion.show(new ContainerDetails({model: model}));
				},
				failure: function(model, response, options) {
					console.log("Could not retrieve details for container " + model.get("BLSAMPLEID"));
				}
			});
			// Show ecapsulating containers
			if (this.offset+1 < this.collection.length) {
				this.encapContainer.show(new ContainerView({collection: this.collection, offset: this.offset+1}))
			}
		},
		
		_selectContainer: function(e) {
			console.log("Selected container " + this.select.value);
			var value = this.select.value;
			if (value === "nothing") {
				this.containerDetails.reset();
			} else if (value.match(/-form$/)) {
				this.containerDetails.show(new PseudoContainerView({properties: this.containerProperties[value]}));
			} else {
				this.containerDetails.show(new TrueContainerView({properties: this.containerProperties[value]}));
			}
			
			this.encapContainer.show(new ContainerView({containers: this.containers, offset: this.offset+1}));
		},
	
	});

	var TrueContainerView = Marionette.LayoutView.extend({
		className: "true-container",
		
		template: _.template("<div class=\"form=\"><ul>" + 
				"<li><span class=\"label\">Container ID</span><span class=\"BLSAMPLEID\"><%=BLSAMPLEID%></span>" + 
				"<li><span class=\"label\">Sample Dimensions</span><span class=\"SAMPLEDIMENSIONS\"><%=SAMPLEDIMENSIONS%></span>" + 
				"<li><span class=\"label\">Container Material</span><span class=\"CONTMATERIAL\"><%=CONTMATERIAL%></span>" + 
				"<li><span class=\"label\">Container Density</span><span class=\"CONTDENSITY\"><%=CONTDENSITY%></span>" + 
				"</ul></div>"
				),

		initialize: function(options) {
			console.log(options.properties);
			this.model = new Backbone.Model(options.properties);
		},
	});
	
	var PseudoContainerView = Marionette.LayoutView.extend({
		className: "pseudo-container",
		
		template: _.template("<div class=\"form\"><ul>" + 
		"<li><span class=\"label DIMENSION1\"><%=DIMENSION1%></span><input type=\"text\" name=\"SIZE1\"></input> mm</li>" + 
		"<li><span class=\"label DIMENSION1\"><%=DIMENSION2%></span><input type=\"text\" name=\"SIZE2\"></input> mm</li>" + 
		"<li><span class=\"label DIMENSION1\"><%=DIMENSION3%></span><input type=\"text\" name=\"SIZE3\"></input> mm</li>" + 
		"</ul></div>"),
		
		initialize: function(options) {
			console.log(options.properties);
			this.model = new Backbone.Model(options.properties);
		},
		
	});
	
	var ContainerDetails = Marionette.LayoutView.extend({
		template: _.template("<div class=\"form\">" + 
				"<ul>" + 
				"<li><span class=\"label\">Name</span><span class=\"NAME\"><%=NAME%></span></li>" +
				"</ul>" + 
		"</div>"),
		
		/*
		 * options:
		 * model: a sample model of the container instance
		 */
		initialize: function(options) {
			this.model = options.model;
		},
	});
	
	var addAllToSelect = function(collection, response, options) {
		var select = options.select;
		var containerProperties = options.properties;
		collection.each(function(element, index, collection) {
			var nyOption = document.createElement("option");
			nyOption.text = element.get("NAME");
			// TODO get dynamically
			containerProperties[element.get("NAME")] = {
					"BLSAMPLEID": element.get("BLSAMPLEID"),
					"SAMPLEDIMENSIONS": "0.3 mm dia × 20 mm",
					"CONTMATERIAL": "Quartz",
					"CONTDENSITY": "2.6 g cm⁻³",
			};
			select.add(nyOption);
		});
	};
	
	return ContainerView;
});