/**
 *  The code to create a new sample, and navigate the app to it
 */

define([
        "models/protein",
        "models/sample",
        "models/container"
        ],
        function(
        		Phase,
        		Sample,
        		Container
        		) {
	/* The first step is to create the new sample and phase */
	return newSample = {
			/*
			 * sampleOptions
			 * name: (optional, defaults to "newxpdfsample") name of the new
			 * 		sample.
			 * phaseId: (optional, defaults to creating a new phase) phaseId of
			 * 			 the primary phase of the new sample.
			 * visitId: the visit to add the new sample to.
			 */
			run : function(sampleOptions) {
				this.assignDefaultContainer(sampleOptions);
			},

			assignDefaultContainer : function(sampleOptions) {
				// assign the default container for the visit.
				// Cribbed from add_container_visit() in the shipment module controller
				var newSample = new Sample();
				
				if (sampleOptions.name)
					newSample.set({"NAME": sampleOptions.name});
				else
					newSample.set({"NAME": "newxpdfsample"});
				
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/dewars/default",
					data: {visit: sampleOptions.visitId},
					success: function(dewarId) {
						sampleOptions.dewarId = dewarId;
						self.actuallyAssignDefaultContainer(newSample, sampleOptions);	
					},
					error: function() {
						app.bc.reset([bc, {title: "Error" }]);
						app.message({ title: "Error", message: "The default dewar for this visit could not be created."});
					},
				});
			},

			// With the default dewar for this proposal, get the default
			// container for this visit. Also, check default containers exist
			// for all visits. 
			actuallyAssignDefaultContainer : function(newSample, sampleOptions) {
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/containers/did/"+sampleOptions.dewarId,
					success: function(containers) {
						var defaultContainer;
						if (containers.total != 0) {
							// The returned data is not a collection of models,
							// but an array of objects, since we made an Ajax
							// call, not a proper Backbone fetch.

							// Place the sample in the default container of the
							// proposal. If this container does not exist, then
							// create it
							defaultContainerObject = _.find(containers.data, function(container) { return container["VISIT"] == null; });

							// Convert the object (hash of attributes) version
							// of the default container to the SynchWeb model
							// of a Container
							defaultContainer = new Container(defaultContainerObject);
														
						}
						if (defaultContainer == null) {
							console.log("no default container");
						
							// Create a default container
							defaultContainer = new Container();
							// set some values for this model
							var defaultParameters = {"PROPOSALID" : app.prop,
									"NAME": app.proposal.get("PROPOSALNUMBER")+"_default",
									"CAPACITY": "0",
									"CONTAINERTYPE": "box",
									"DEWARID": sampleOptions.dewarId,
//									"CONTAINERID": "999999999",
							};
							defaultContainer.set(defaultParameters);
							defaultContainer.save({},{
								success: function(model, response, options) {
									self.setDefaultContainerId(newSample, model, sampleOptions);
								},
								error: function(model, response, options) {
									console.log("Error saving default container for proposal "+app.prop);
								}
							});
						} else {
							self.setDefaultContainerId(newSample, defaultContainer, sampleOptions);
						}

					},
					error: function() {
						console.log("Did not get containers for dewar "+sampleOptions.dewarId);
					}
				});
				
			},
			
			setDefaultContainerId: function(newSample, defaultContainer, sampleOptions) {
				// The data is not a collection of models, but an array of
				// objects, since we earlier made an Ajax call, not a proper
				// Backbone fetch.
				var defaultContainerId = defaultContainer.get("CONTAINERID");
				newSample.set({"CONTAINERID": defaultContainerId});
				this.assignDefaultLocation(newSample, sampleOptions);
			},
			
			assignDefaultLocation : function(newSample, sampleOptions) {
				newSample.set({"LOCATION": "0"});
				this.addDefaultPhase(newSample, sampleOptions);
				
			},
			
			addDefaultPhase : function(newSample, sampleOptions) {
				var self = this;
				
				if (sampleOptions.phaseId) {
					newSample.set({"PROTEINID": sampleOptions.phaseId});
					newSample.set({"ABUNDANCE": 1.0});
					self.assignNewSample(newSample)
				} else {
					var newPhase = new Phase();
					newPhase.set({"ACRONYM": "xpdfphase"});
					newPhase.set({"PROPOSALID": app.prop});
					newPhase.save({}, {
						success: function(model, response, options){
							var newPhaseId = model.get("PROTEINID");
							newSample.set({"PROTEINID": newPhaseId});
							newSample.set({"ABUNDANCE": 1.0});
							self.assignNewSample(newSample);
						},
						error: function(model, response, options){
							console.log("Error setting phase on new XPDF sample");
						},
//						newSample: newSample, 
					})
				}
			},
			
			assignNewSample : function(newSample) {
				var self = this;
				newSample.save({}, {
					success: function(model, response, options) {
						var sampleId = model.get("BLSAMPLEID");
						self.navigateToNewSample(sampleId);
					},
					error: function(model, response, options) {
						console.log("Error saving phase on new XPDF sample");
						
					}
				})
			},
			
			navigateToNewSample : function(sampleId) {
				console.log("Navigating to new sample page");
				app.trigger("samples:view", sampleId);
			},
	}
	
});