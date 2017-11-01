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
	"modules/types/xpdf/samples/collections/samplegroup",
	"modules/types/xpdf/samples/models/samplegroupmember",
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
			SampleGroup,
			SampleGroupMember,
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
			
			// get the (ISPyB) Container of (XPDF) containers
			defaultContainer.getContainerContainer(this.assignContainerContainer, {self: this});
		},
		
		assignContainerContainer: function(containerId, context) {
			context.self.containerContainer = containerId;
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
			defaultContainer.getDefaultContainer(this.setContainer, {model: this.model});
			
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
					console.log(collection.models);
					self.containers.add(collection.models);
				},
				error: function(collection, response, options) {
					console.log("Error getting containers");
				},
			});
		},

		// Add the list of available containers to the interface 
		onContainersUpdate: function() {
			if (this.isRendered == true) 
				// offset of the first layer of container is 1, 0 being the sample itself
				this.containerview.show(new ContainerView({containers: this.containers, offset: 1, isNew: true}));
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
			var nyInstance = model;
			
			console.log("New instance BLSAMPLEID: " + nyInstance.get("BLSAMPLEID"));
			
			// TODO: define the new sample group here
			var sampleGroup = new SampleGroup();
			var member = new SampleGroupMember();
			member.set({"BLSAMPLEID": this.model.get("BLSAMPLEID"),
					"TYPE": "sample",
					"GROUPORDER": "0",});
			sampleGroup.add(member);
			
			var containerIdArray = this.containerview.currentView.getContainerIDs();
			
			_.each(containerIdArray, function(containerId, index, ids) {
				console.log("containerIds[" + index + "]", containerId);
			});
			
			var containerContainer = this.containerContainer;
			
			// fetch all the BLSamples for this proposal
			var allInstances = new Instances();
			allInstances.state.pageSize = 10000;
			allInstances.fetch({
				success: function(collection, reponse, options) {
					_.each(containerIdArray, function(id, index, list) {
						// clonend: thing to be cloned
						var clonend = allInstances.findWhere({"BLSAMPLEID": id});
						// reset the ID, and set the container to the
						// container-container, with a location equal
						// to the total number of all instances 
						var clone = new Instance();
						var now = new Date();
						var nowString = now.getDate()+"-"+now.getMonth()+"-"+now.getYear();
						clone.set({
							"CRYSTALID": clonend.get("CRYSTALID"),
							"CONTAINERID": containerContainer.get("CONTAINERID"),
							"NAME": clonend.get("NAME"),
							"LOCATION": allInstances.length.toString(),
							"RECORDTIMESTAMP": nowString,
							"DIMENSION1": clonend.get("DIMENSION1"),
							"DIMENSION2": clonend.get("DIMENSION2"),
							"DIMENSION3": clonend.get("DIMENSION3"),
							"SHAPE": clonend.get("SHAPE"),
							"PACKINGFRACTION": clonend.get("PACKINGFRACTION"),
						});
						// Save the clone to get a new BLSampleId
						clone.save({},{
							success: function(model, repsonse, options) {
							var member = new SampleGroupMember();
							member.set({
								"BLSAMPLEID": model.get("BLSAMPLEID"),
								"TYPE": "container",
								"GROUPORDER": (index+1).toString(), // add one, since the smaple is at index 0
								});
							sampleGroup.add(member);
							// the same number of containers in the 
							// group as were returned by the nested
							// views, plus an additional member for the
							// sample.
							if (sampleGroup.length == containerIdArray.length+1)
								sampleGroup.save();
							// Navigate to the details page of the
							// sample, being the first member of the
							// group 
								app.trigger("samples:view", sampleGroup.at(0).get("BLSAMPLEID"));
							},
							error: function(model, response, options) {
								console.log("NewInstance: could not save cloned container: ", response);
							},
						});
					});
				},
				error: function(collection, response, options) {
					console.log("NewInstance: coould not fetch container instances to clone:", response);
				},
			})
			
//			app.trigger("samples:view", model.get("BLSAMPLEID"));
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