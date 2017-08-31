/*
 * Utility functions to mux-demux between primary component + component array
 * and a single collection.
 */ 

define([
	"models/protein",
	"collections/proteins",
	],
	function(
			Phase,
			Phases,
	) {
			
			// Start with the ComponentMudex constructor
			function ComponentMudex(model) {
				if (!(this instanceof ComponentMudex)) {
	throw new TypeError("ComponentMudex constructor cannot be called as a function.");
}
				
				_.extend(this, Backbone.Events);
				this.model = model;
				this.allComponents = muxModel(this.model);
				this.listenTo(this.allComponents, "change add remove reset", this.updateComponents);
				this.beSilent = false;
			};
			
			// define the object protoype, including the constructor
			ComponentMudex.prototype = {
					constructor: ComponentMudex,
			
					setSilence: function(nowBeSilent) {
						this.beSilent = Boolean(nowBeSilent);
					},

					updateComponents: function() {
						console.log("ComponentMudex: components in need of updating.");
						//						demuxModel(this.model, this.allComponents, this.beSilent);
					},
					
					getComponents: function() {
						return this.allComponents;
					},
					
			};
			
			var mux = function(primaryId, primaryAbundance, primaryAcronym, componentIds, componentAbundances, componentAcronyms) {
				
				// Arrays combining primary attributes with those of the components
				var ids = [primaryId].concat(componentIds);
				var acronyms = [primaryAcronym].concat(componentAcronyms);
				var abundances = [primaryAbundance].concat(componentAbundances);
				
				var components = new Phases();
				
				// Map from the indiviual arrays to a collection single array of objects 
				_.reduce(ids, function(collection, id, index, ids) {
					var phase = new Phase();
					phase.set({"PROTEINID": id,
						"ACRONYM": acronyms[index],
						"ABUNDANCE": (index < abundances.length) ? abundances[index] : 0
					});
				});
				
				return components;
			};
			
			var muxModel = function(model) {
				return mux(model.get("PROTEIN"), model.get("ABUNDANCE"), model.get("ACRONYM"),
						model.get("COMPONENTIDS") || [], model.get("COMPONENTACRONYMS") || [], model.get("COMPONENTAMOUNTS") || []);
			};
			
			var demuxModel = function(model, allComponents, beSilent) {
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
			};
	
			return ComponentMudex;
	
});