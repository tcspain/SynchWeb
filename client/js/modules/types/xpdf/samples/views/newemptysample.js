/**
 *  The code to create a new sample, and navigate the app to it
 */

define([
        "models/protein",
        "models/sample",
        ],
        function(
        		Phase,
        		Sample
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
//						this.newSample.set({"CONTAINERID": containerId});
						console.log("new sample dewar obtained");
						self.actuallyAssignDefaultContainer(newSample, dewarId);	
					},
					error: function() {
						app.bc.reset([bc, {title: "Error" }]);
						app.message({ title: "Error", message: "The default dewar for this visit could not be created."});
					},
//					"newSample": newSample,
				});
				console.log("Fired default container trigger");
			},
			
			actuallyAssignDefaultContainer : function(newSample, dewarId) {
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/containers/did/"+dewarId,
					success: function(containerIds) {
						console.log(containerIds.data.length+" default container(s) obtained for dewar "+dewarId);
						console.log("containerIds.data is "+containerIds.data);
						console.log("containerIds.data[0] is "+containerIds.data[0]);
						console.log("containerIds.data[0][\"CONTAINERID\"] is "+containerIds.data[0]["CONTAINERID"]);
						newSample.set({"CONTAINERID": containerIds.data[0]["CONTAINERID"]});
						self.assignDefaultLocation(newSample);
					},
					error: function() {
						console.log("Did not get containers for dewar "+dewarId);
					}
				});
				
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
						self.assignNewSample(newSample);
					},
					error: function(model, response, options){
						console.log("Error setting phase on new XPDF sample");
					},
					newSample: newSample, 
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