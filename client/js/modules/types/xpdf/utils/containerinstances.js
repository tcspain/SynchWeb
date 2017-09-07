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
							}});
					},
					error: function(collection, response, options) {
						console.log("Could not retrieve container instances", response);
					},
				});
			},
			
			isContainer: function(instance) {
				return isAContainer(instance);
			},
	};
	
	
	
	
	
	// current method of determining containers: Match names with a hard-coded set.
	// TODO: implement a better method of deterining containerhood
	var containerNames = [
			"0p3mm_capillary",
			"Diamond Anvil Cell",
	];
	
	var isAContainer = function(container) {
		return _.contains(containerNames, container.get("NAME"));
	};
	
	var filterInstances = function(collection, response, options) {
		var containerArray = collection.filter(isAContainer);
		// convert the array to a collection
		console.log(containerArray);
		var containers = new Instances();
		containers.add(containerArray);
		options.success(containers, response, options);
	};
	
	return ContainerInstances;
});