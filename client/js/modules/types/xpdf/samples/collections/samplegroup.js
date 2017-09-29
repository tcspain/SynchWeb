/**
 *  A collection of sample group members
 */

define([
	"backbone",
	"backbone.paginator",
	"modules/types/xpdf/samples/models/samplegroupmember",
	], function(
			Backbone,
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
		},
		
		// The interface to the PHP API dictates that we save one-by-one. If no
		// BLSampleId is stored, then retrieve it from the saving of the first
		// model.
		save: function(options) {
			// No models? models deletions not done here
			if (this.length < 1)
				return;
			// Special case for the first BLSample (the actual sample instance,
			// usually), to get the BLSampleGroupId, if not yet defined.
			var offset = 0;
			if (!this.groupId) {
				var self = this;
				this.at(offset).set({"ORDER": String(offset)});
				this.at(offset).save({}, {
					save: function(model, response, options) {
						self.groupId = model.get("BLSAMPLEGROUPID");
						self.offset++;
						self._saveContainers();
					},
					error: function(model, response, options) {
						console.log("Could not save sample to sample group: ", response);
					},
				});
			} else {
				this._saveContainers();
			}
		},

		// group Id should have been set
		_setGroupId: function() {
			this.each(function(model, index, collection) {
				model.set({"BLSAMPLEGROUPID": this.groupId});
			});
		},
		
		// saves the containers from this.offset to the end of the list
		_saveContainers: function() {
			this.offset = this.reduce(function(offset, model, index, collection) {
				model.set({
					"ORDER": String(offset),
					"BLSAMPLEGROUPID": this.groupId
					});

				model.save({}, {
					error: function(model, response, options) {
						console.log("Could not save instance to sample group: ", response);
					},
				});
				return offset++;
			});
		},
		
		
		
	});
});