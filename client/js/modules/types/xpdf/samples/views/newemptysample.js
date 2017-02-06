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
			run : function(visitId) {
				// Define the objects for the new entities
//				var newSample = new Sample();
//				var newPhase = new Phase();
				console.log("A new sample would have been created for visit "+visitId);
				this.assignDefaultContainer(visitId);
				
			},

			assignDefaultContainer : function(visitId) {
				// assign the default container for the visit.
				// Cribbed from add_container_visit() in the shipment module controller
				var newSample = new Sample();
				newSample.set({"NAME": "newxpdfsample"});
				
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/dewars/default",
					data: {visit: visitId},
					success: function(dewarId) {
						console.log("new sample dewar obtained");
						self.actuallyAssignDefaultContainer(newSample, dewarId, visitId);	
					},
					error: function() {
						app.bc.reset([bc, {title: "Error" }]);
						app.message({ title: "Error", message: "The default dewar for this visit could not be created."});
					},
				});
				console.log("Fired default container trigger");
			},

			// With the default dewar for this proposal, get the default
			// container for this visit. Also, check default containers exist
			// for all visits. 
			actuallyAssignDefaultContainer : function(newSample, dewarId, visitId) {
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/containers/did/"+dewarId,
					success: function(containers) {
						var defaultContainer;
						console.log(containers.data.length+" default container(s) obtained for dewar "+dewarId);
						console.log("containers.data is "+containers.data);
						if (containers.total != 0) {
							// The returned data is not a collection of models,
							// but an array of objects, since we made an Ajax
							// call, not a proper Backbone fetch.
							console.log("containers.data[0] is "+containers.data[0]);
							console.log("containers.data[0][\"CONTAINERID\"] is "+containers.data[0]["CONTAINERID"]);
							console.log("containers.data[0][\"VISIT\"] is "+containers.data[0]["VISIT"]);

							// Place the sample in the default container of the
							// proposal. If this container does not exist, then
							// create it
							defaultContainer = _.find(containers.data, function(container) { return container["VISIT"] == null; });

						}
						if (defaultContainer == null) {
							console.log("no default container");
						
							// Create a default container
							defaultContainer = new Container();
							// set some values for this model
							var defaultParameters = {"PROPOSALID" : app.prop,
									"NAME": app.proposal.get("PROPOSALNUMBER")+"_default",
									"CAPACITY": "1000000",
									"CONTAINERTYPE": "box",
									"DEWARID": dewarId,
//									"CONTAINERID": "999999999",
							};
							defaultContainer.set(defaultParameters);
							defaultContainer.save({},{
								success: function(model, response, options) {
									self.setDefaultContainerId(newSample, model);
								},
								error: function(model, response, options) {
									console.log("Error saving default container for proposal "+app.prop);
								}
							});
						} else {
							self.setDefaultContainerId(newSample, defaultContainer);
						}

					},
					error: function() {
						console.log("Did not get containers for dewar "+dewarId);
					}
				});
				
			},
			
			setDefaultContainerId: function(newSample, defaultContainer) {
				// The data is not a collection of models, but an array of
				// objects, since we earlier made an Ajax call, not a proper
				// Backbone fetch.
				console.log("Setting sample container to containerId "+defaultContainer["CONTAINERID"]);
				newSample.set({"CONTAINERID": defaultContainer["CONTAINERID"]});
				this.assignDefaultLocation(newSample);
			},
			
			assignDefaultLocation : function(newSample) {
				newSample.set({"LOCATION": "0"});
				this.addDefaultPhase(newSample);
				
			},
			
			addDefaultPhase : function(newSample) {
				var self = this;
				var newPhase = new Phase();
				newPhase.set({"ACRONYM": "newxpdfphase"});
				newPhase.set({"PROPOSALID": app.prop});
				newPhase.save({}, {
					success: function(model, response, options){
						var newPhaseId = model.get("PROTEINID");
						newSample.set({PROTEINID: newPhaseId});
						newSample.set({ABUNDANCE: 0.0});
						self.assignNewSample(newSample);
					},
					error: function(model, response, options){
						console.log("Error setting phase on new XPDF sample");
					},
//					newSample: newSample, 
				})
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
//				sampleId = "374695";
				console.log("Navigating to new sample page");
				app.trigger("samples:view", sampleId);
			},
	}
	
});