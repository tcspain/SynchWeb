/*
 * Get the default container of a visit, creating it if necessary.
 */

define([
	"models/container",
    "models/proposal"
	], function(
			Container,
			Proposal
	) {

	var defaultContainer = {
			/*
			 * visitId is the database identifier from the Database.
			 * Callback is a one-argument function, taking the default containerId for the visit. 
			 */
			getDefault: function(callback) {
				this.getVisit(this.getDefaultDewar, this.getDefaultContainer, callback);
			},

			getVisit: function(callback, dewarCallback, finalCallback) {
				var prop = new Proposal({PROPOSAL: app.prop});
				prop.fetch({
					success: function(model, response, options) {
						var visitString = prop.get("PROPOSAL")+"-"+prop.get("VCOUNT");
						callback(visitString, dewarCallback, finalCallback);
					},
					error: function(model, response, options) {
						console.log("Could not get proposal data.");
					},
				});
			},
			
			getDefaultDewar: function(visitId, successCallback, finalCallback) {
				var self = this;
				Backbone.ajax({
					url: app.apiurl+"/shipment/dewars/default",
					data: {visit: visitId},
					success: function(dewarId) {
						console.log("new sample dewar obtained");
						successCallback(dewarId, visitId, finalCallback);	
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
			getDefaultContainer : function(dewarId, visitId, successCallback) {
				var self = this;
				
				Backbone.ajax({
					url: app.apiurl+"/shipment/containers/did/"+dewarId,
					success: function(containers) {
						var defaultContainer;
						console.log(containers.data.length+" default container(s) obtained for dewar "+dewarId);
						console.log("containers.data is "+containers.data);
						if (containers.total != 0) {
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
									"DEWARID": dewarId,
//									"CONTAINERID": "999999999",
							};
							defaultContainer.set(defaultParameters);
							defaultContainer.save({},{
								success: function(model, response, options) {
									successCallback(model);
								},
								error: function(model, response, options) {
									console.log("Error saving default container for proposal "+app.prop);
								}
							});
						} else {
							successCallback(defaultContainer);
						}

					},
					error: function() {
						console.log("Did not get containers for dewar "+dewarId);
					},
				});
			},
	};
	
	return defaultContainer;
	
});