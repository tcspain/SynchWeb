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
		"Diamond__Anvil__Cell",

	];
	
	var nonshapingContainer = [
		"Furnace",
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
	
	var filterInstances = function(allInstances, response, options) {
		var shapingCollection = new Instances();
		var nonShapingCollection = new Instances();
		var containers = new Instances();

		_.each(shapingContainer, function(targetContainerName, index, list) {
			// Find the first instance with each name
			var firstInstance = allInstances.find(function(candidateContainer) {
				return candidateContainer.get("NAME") == targetContainerName;
			});
			// set the flag as to whether the container dictates the shape of the sample
			firstInstance.set({"ISSHAPING": true});
			containers.add(firstInstance);
		});
		_.each(nonshapingContainer, function(targetContainerName, index, list) {
			// Find the first instance with each name
			var firstInstance = allInstances.find(function(candidateContainer) {
				return candidateContainer.get("NAME") == targetContainerName;
			});
			// set the flag as to whether the container dictates the shape of the sample
			firstInstance.set({"ISSHAPING": false});
			containers.add(firstInstance);
		});

		
		options.success(containers, response, options);
	};
	
	return ContainerInstances;
});