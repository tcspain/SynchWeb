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
				baseUrl += "?BLSAMPLEID=" + this.get("BLSAMPLEID");
				baseUrl += (this.has("BLSAMPLEGROUPID")) ? "&BLSAMPLEGROUPID=" + this.get("BLSAMPLEGROUPID") : "";
				baseUrl += (this.has("TYPE")) ? "&TYPE=" + this.get("TYPE") : "";
				baseUrl += (this.has("ORDER")) ? "&ORDER=" + this.get("ORDER") : "";
			}
			return baseUrl;
			
		},
		
	});
});