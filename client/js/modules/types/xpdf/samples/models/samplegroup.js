/**
 * Model for a sample group
 */

define([
	], function(
			) {
	return Backbone.Model.extend({
		idAttribute: "BLSAMPLEGROUPID",
		urlRoot: "/groups",
		
		
	});
});