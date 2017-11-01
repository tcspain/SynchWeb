/*
 * Get the default container of a visit, creating it if necessary.
 */

define([
	"models/container",
	"collections/containers",
    "models/proposal"
	], function(
			Container,
			Containers,
			Proposal
	) {

	var defaultContainer = {
			/*
			 * callback is a one-argument function, taking the default containerId for the visit.
			 * context is an object providing context for the callback
			 */
			getDefaultContainer: function(callback, context) {
				this._getVisit(this._getSpecialContainer, null, "_default", callback, context);
			},

			getContainerContainer: function(callback, context) {
				this._getVisit(this._getSpecialContainer, null, "_containers", callback, context);
			},
			
			// Currently: get the last visit. More refined approaches may be required later
			_getVisit: function(callback, dewarCallback, name, finalCallback, finalContext) {
				var prop = new Proposal({PROPOSAL: app.prop});
				prop.fetch({
					success: function(model, response, options) {
						var visitString = prop.get("PROPOSAL")+"-"+prop.get("VCOUNT");
						var containerName = visitString + name;
						callback(visitString, containerName, finalCallback, finalContext);
					},
					error: function(model, response, options) {
						console.log("Could not get proposal data.");
					},
				});
			},
			
//			_getDefaultDewar: function(visitId, containerName, successCallback, finalCallback, finalContext) {
//				var self = this;
//				
//				var defaultDewar = new DefaultDewar();
//				defaultDewar.visitId = visitId;
//				defaultDewar.fetch({
//					success: function(dewar) {
//						console.log("new sample dewar obtained");
//						successCallback(containerName, dewar.get("DEWARID"), finalCallback, finalContext);
//					},
//					error: function() {
//						app.bc.reset([bc, {title: "Error" }]);
//						app.message({ title: "Error", message: "The default dewar for this visit could not be created."});
//					},
//				});
//			},

			
			// find the first container with the special name that is in the given dewar.
			_getSpecialContainer: function(visit, name, callback, context) {

				var visitContainers = new Containers();
				visitContainers.fetch({
					data: {visit: visit},
					success: function(containers, response, options) {
						if (containers.length <= 0) {
							console.log("defaultContainer._getSpecialContainer: no containers found.");
							createContainer(name, visit, callback, context);
						}
						var specialContainer = containers.find(function(container){
							return container.get("NAME") === name
							});
						
						if (typeof specialContainer === "undefined") {
							console.log("defaultContainer._getSpecialContainer: no containers found.");
							createContainer(name, visit, callback, context);
						}

						callback(specialContainer, context);
							
					},
					error: function(collection, response, options) {
						console.log("defaultContainer._getSpecialContainer: error getting containers for dewar " + dewarId + ": " + response);
						createContainer(name, visit, callback, context);
					},
				});
				
				
			},
			
	};

	var createContainer = function(name, visit, callback, context) {
		// Create a default container
		var defaultContainer = new Container();
		// set some values for this model
		var defaultParameters = {
				"NAME": name,
				"CAPACITY": "0",
				"CONTAINERTYPE": "box",
		};
		defaultContainer.set(defaultParameters);

		Backbone.ajax({
			url: app.apiurl+"/shipment/dewars/default",
			data: {visit: visit},
			success: function(did) {
				defaultContainer.set({"DEWARID": did});
				defaultContainer.save({},{
					success: function(model, response, options) {
						callback(model, context);
					},
					error: function(model, response, options) {
						console.log("defaultContainer: Error saving container " + name + " for visit " + visit);
					}
				});
			},
			error: function() {
				console.log("defaultContainer: Could not get default dewar for visit " + visit);
			},
		});
		
	};
	
	var DefaultDewar = Backbone.Model.extend({
		idAttribute: "DEWARID",
		url: function() {
			return "/shipment/dewars/default?visit="+this.visitId; 
		},
	})
	
	return defaultContainer;
	
});