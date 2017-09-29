/**
 * Model for a member of a sample group
 */

define([
	], function(
			) {
	return Backbone.Model.extend({
		idAttribute: "ORDER",
		
		url: function() {
			var baseUrl = "/sample/groups";
			if (this.has("BLSAMPLEID")) {
				baseUrl += "?" + this.get("BLSAMPLEID");
				baseUrl += (this.has("TYPE")) ? "&" + this.get("TYPE") : "";
				baseUrl += (this.has("ORDER")) ? "&" + this.get("ORDER") : "";
			}
			return baseUrl;
			
		},
		
	});
});