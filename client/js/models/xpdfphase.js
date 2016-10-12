/**
 *  A Mock extension of the protein moddel, providing mock data initialization,
 *  and some extra fields 
 */

define(["models/protein"], function(Protein) {
	return Protein.extend({
		initialize: function(name) {
			switch(name) {
			case "BTO":
				this.set({
					"NAME": "Barium Titanate",
					"ACRONYM": "BTO",
					"MOLECULARMASS": 233.192,
					"ABUNDANCE": 1.0,
					"XDENSITY": 6.02,
					"COMPOSITION": "BaO3Ti",
				});
				break;
			case "CaTO":
				this.set({
					"NAME": "Calcium Titanate",
					"ACRONYM": "CaTO",
					"MOLECULARMASS": 135.943,
					"ABUNDANCE": 1.0,
					"XDENSITY": 3.98,
					"COMPOSITION": "CaO3Ti",
				})
				break;
			default:
			};
		},
		// Make fetch do nothing
		fetch: function() {},
		
	});
});