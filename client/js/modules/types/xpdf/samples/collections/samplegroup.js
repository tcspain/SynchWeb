/**
 *  A collection of sample group members
 */

define([
	"backbone.paginator",
	"modules/types/xpdf/samples/models/samplegroupmember",
	], function(
			PageableCollection,
			Member
	) {
	return PageableCollection.extend({
	
		model: Member,
		url: "/sample/groups",
		
		mode: "server",
		
		state: {
			pageSize: 100,
		},
		
		comparator: function(m) {
			return parseInt(m.get("ORDER"));
		},
		
		parseRecords: function(r, options) {
			return r.data;
		}
		
	});
});