/**
 * Return all the container instnaces associated with this proposal, and check
 * whether an instance is a container associated with this proposal.
 */

define([
	"collections/samples",
	],
	function(
		Instances
	) {
	var ContainerInstances = {
			/*
			 * options:
			 * options.success: success function to call after getting the containers.
			 * 		success(collection, response, options)
			 * options.error: error function to call whilst getting the containers.
			 * 		error(collection, response, options)
			 */
			getContainers: function(options) {
				// fetch all the instances
				var filterSuccess = options.success
				var instances = new Instances();
				instances.state.pageSize = 1000;
				instances.fetch({
					success: function(collection, response, options) {
						filterInstances(collection, response, {
							success: filterSuccess,
							error: function(collection, response, options) {
								console.log("Error filtering instances. How did you even manage this?");
							},
						});
					},
					error: function(collection, response, options) {
						console.log("Could not retrieve container instances", response);
					},
				});
			},
			
			isContainer: function(instance) {
				return isAContainer(instance);
			},
			
			isShaping: function(instance) {
				return isShaping(instance);
			},
			
			isNonShaping: function(instance) {
				return isNonShaping(instance);
			},
	};
	
	
	
	
	
	// current method of determining containers: Match names with a hard-coded set.
	// TODO: implement a better method of determining containerhood
	var shapingContainer = [
		"0p3mm_capillary",
	];
	
	var nonshapingContainer = [
		"Diamond Anvil Cell",
	];
	
	var isAContainer = function(container) {
		return isShaping(container) || isNonShaping(container);
	};
	
	var isShaping = function(container) {
		return _.contains(shapingContainer, container.get("NAME"));
	};
	
	var isNonShaping = function(container) {
		return _.contains(nonshapingContainer, container.get("NAME"));
	}
	
	var filterInstances = function(collection, response, options) {
		var filterFunction = isAContainer;
		var shapingCollection = new Instances();
		var nonShapingCollection = new Instances();
		shapingCollection.add(collection.filter(isShaping));
		nonShapingCollection.add(collection.filter(isNonShaping));
		shapingCollection.each(function(element, index, collection) {
			element.set({"ISSHAPING": true});
		});
		nonShapingCollection.each(function(element, index, collection) {
			element.set({"ISSHAPING": false});
		});
		// convert the array to a collection
		var containers = new Instances();
		containers.add(shapingCollection.models);
		containers.add(nonShapingCollection.models);
		options.success(containers, response, options);
	};
	
	return ContainerInstances;
});