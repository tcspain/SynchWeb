/*
 * Utility functions to mux-demux between primary component + component array
 * and a single collection.
 */ 

define([
], function(
		) {
	var clazz = {
			initialize: function(model) {
				this.model = model;
				this.allComponents = this.muxModel(this.model);
				this.listenTo(this.allComponents, "change add remove reset", this.updateAllComponents);
				this.beSilent = false;
			},
			
			setBeSilent: function(nowBeSilent) {
				this.beSilent = Boolean(nowBeSilent);
			},
			
			updateAllComponents: function() {
				this.demuxModel(this.model, this.allComponents, this.beSilent);
			},
			
			getAllComponents: function() {
				return this.allComponents;
			}
			
			mux: function(primaryId, primaryAbundance, primaryAcronym, componentIds, componentAbundances, componentAcronyms) {
				var ids = [primaryId].concat(componentIds);
				var acronyms = [primaryAcronym].concat(componentAcronyms);
				var abundances = [primaryAbundance].concat(componentAbundances);
				
				var components = _.map(ids, function(id, i) {
					return {
						PROTEINID: id,
						ACRONYM: acronyms[i],
						ABUNDANCE: ( (i < abs.length) ? abs[i] : 0),
					};
				});
				
				return components;
			},
			
			muxModel: function(model) {
				return this.mux(model.get("PROTEIN"), model.get("ABUNDANCE"), model.get("ACRONYM"),
						model.get("COMPONENTIDS") || [], model.get("COMPONENTACRONYMS") || [], model.get("COMPONENTAMOUNTS") || []);
			},
			
			demuxModel: function(model, allComponents, beSilent) {
				var primary = allComponents[0];
				var primaryId = primary["PROTEINID"];
				var primaryAcronym = primary["ACRONYM"];
				var primaryAbundance = primary["ABUNDANCE"];
				
				// Set any primary parameters that have changed 
				if (primaryId != model.get("PROTEINID"))
					model.set({"PROTEINID": primaryId});
				if (primaryAcronym != model.get("ACRONYM"))
					model.set({"ACRONYM": primaryAcronym});
				if (primaryAbundance != model.get("ABUNDANCE"))
					model.set({"ABUNDANCE": primaryAbundance});

				// set the components, regardless of whether they have changed
				var components = allComponents.slice(1, allComponents.length);
				
				model.set({
					"COMPONENTIDS": components.pluck("PROTEINID"),
					"COMPONENTACRONYMS": components.pluck("ACRONYM"),
					"COMPONENTABUNDANCES": components.pluck("ABUNDANCE"),
				});
				
				if (beSilent === "undefined")
					if (this.beSilent == null || this.beSilent === "undefined") {
						beSilent = this.beSilent;
					} else {
						beSilent = false;
					}
				
				if (!beSilent && model.changedAttributes())
					model.save(model.changedAttributes);
			}
	};
	
	return clazz;
});