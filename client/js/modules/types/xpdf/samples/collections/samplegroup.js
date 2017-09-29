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
			console.log("SampleGroup.save:", this, options);
			// No models? models deletions not done here
			if (this.length < 1)
				return;
			// Special case for the first BLSample (the actual sample instance,
			// usually), to get the BLSampleGroupId, if not yet defined.
			this.offset = 0;
			if (!this.groupId) {
				var self = this;
				this.at(this.offset).set({"ORDER": String(this.offset)});
				this.at(this.offset).save({}, {
					success: function(model, response, options) {
						self.groupId = model.get("BLSAMPLEGROUPID");
						self.offset++;
						console.log("SampleGroup.save.save:", self);
						self._saveContainers();
					},
					error: function(model, response, options) {
						console.log("Could not save sample to sample group: ", response);
					},
					type: "POST",
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
			console.log("SampleGroup._saveContainers", this);
			var groupId = this.groupId;
			this.offset = this.reduce(function(offset, model, index, collection) {
				if (index < offset)
					return offset;
				
				model.set({
					"ORDER": String(offset),
					"BLSAMPLEGROUPID": groupId
					});
				console.log("SampleGroup._saveContainers.reduce:", model, collection);
				model.save({}, {
					error: function(model, response, options) {
						console.log("Could not save instance to sample group: ", response);
					},
					type: "POST",
				});
				return offset+1;
			}, this.offset);
		},
		
		
		
	});
});