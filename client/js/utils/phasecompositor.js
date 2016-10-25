/**
 * A class providing functions to combine several phases into one sample
 */

define(["underscore"],
		function(_) {
	return {
		densityComposite: function(phaseCollection) {
			var totalMass = phaseCollection.reduce(function(memo, phase) {return memo +  phase.get("ABUNDANCE")}, 0.0);
			var totalVolume = phaseCollection.reduce(function(memo, phase) {return memo + phase.get("ABUNDANCE")/phase.get("XDENSITY")}, 0.0);
			return totalMass/totalVolume;
		},
		
		/*
		 * Composes the chemical composition of the models into a single
		 * composition string.
		 */
		compositionComposite: function(phaseCollection) {
			var totalFimi = 0;
//			var elements = {};
			// iterate over all phases
			var elementsAndFimi = phaseCollection.reduce(function(localElementMemo, phaseModel, key, list) {
				
				/* decode the composition in the phase, and return the
				 * weighted elemental abundances (moles per unit mass) and the
				 * weighting
				 */
				var result = this.weightedComposition(phaseModel);
				// Increment the weighting sum
				console.log(phaseModel.get("COMPOSITION")+" fi/mi:" + result.fimi.toString());
				localElementMemo.totalFimi += result.fimi;
				// Add the weighted atoms to the list
				_.each(result.elements, function(value, key, list) {
					console.log(key+": "+value.toString());
				});
				console.log(phaseModel.get("COMPOSITION")+": "+"compositionComposite:reduce:localElements:"+localElementMemo.elements.toString());

				localElementMemo.elements = _.reduce(result.elements, function(memo, value, key, list) {
					console.log(phaseModel.get("COMPOSITION")+": "+"compositionComposite:reduce:reduce: found "+key.toString()+", "+value.toString());
					if (key in memo) {
						console.log(key.toString()+" already present in the sample!");
						memo[key] += value;
					} else {
						memo[key] = value;
					}
					return memo;
				}, localElementMemo.elements);
				
				console.log("Totalling the accumulated elements"+"("+Object.keys(localElementMemo.elements).length.toString()+" found)"+":");
				_.each(localElementMemo.elements, function(value, key, list) {
						console.log("total "+key+": "+value.toString());
					});
				return localElementMemo;
			},
			{"elements": {}, "totalFimi":0, },
			{
				"weightedComposition": this.weightedComposition,
				"flattenBrackets": this.flattenBrackets,
				"mapFormula": this.mapFormula,
				"stringifyElementHash": this.stringifyElementHash,
				"allTheElements": this.allTheElements,
			});
			/* Normalize the elemental abundances to the total number of moles
			 * per unit mass.
			 * */
			_.each(elementsAndFimi.elements, function(value, key, list) {
				list[key] = value/this.totalFimi;
			}, {"totalFimi": elementsAndFimi.totalFimi, });			
			// Compose the chemical formula.
			return this.stringifyElementHash(elementsAndFimi.elements);
		},
		
		flattenBrackets: function(bracketedFormula) {
			return bracketedFormula;
		},
		
		/*
		 * Convert a (bracketless) chemical formula to a hash map of element
		 * to number of atoms
		 */
		mapFormula: function(formula) {
			var elementNumberPattern = /[A-Z][a-z]?[0-9]*/g;
			var elementSymbolPattern = /[A-Z][a-z]?/;
			var numberPattern = /[0-9]+/;
			var elements = formula.match(elementNumberPattern);
			console.log(formula+" number of elements = " + elements.length);
			_.each(elements, function(element, index, list) {
				console.log("Element " + index.toString() + " is " + element);
			});
			
			// Each element of the 'elements' array consists of an element symbol, and possibly a number
			var compositionHash = _.reduce(elements, 
					function(memo, parsee) {
				var element = parsee.match(elementSymbolPattern)[0];
				var number = 1
				if (parsee.match(numberPattern) != null)
					number = parsee.match(numberPattern)[0];
				console.log(element + " " + number);
				if (this.allTheElements.indexOf(element) != -1) {
					console.log("Found an element! "+ element);
					memo[element] = ((element in memo) ? memo[element] : 0) + parseInt(number);
				}
				console.log("Number of elements added: " + _.keys(memo).length);
				return memo;
			}, {}, {"allTheElements": this.allTheElements});
			
			console.log("Expansion of the hash:");
			_.each(compositionHash, function(value, key, list) {
				console.log(key + " " + value.toString());
			}, {"allTheElements": this.allTheElements});
			return compositionHash;
		},
		
		/* Compose the chemical formula string from the hash array of
		 * elements. Follows the Hill system.
		 */
		stringifyElementHash: function(elementHash) {
			var formula = "";
			if ("C" in elementHash) {
				formula = this.addElementToString(formula, "C", elementHash);
				elementHash.delete("C");
				if ("H" in elementHash) {
					formula = this.addElementToString(formula, "H", elementHash);
					elementHash.delete("H");
				}
			}
			// Get the list of remaining keys, and sort alphabetically.
			var allElements = _.keys(elementHash);
			allElements.sort();
			formula = _.reduce(elementHash, function(memo, value, key, list) {
				return this.addElementToString(memo, key, list)
			}, formula, {
				"addElementToString": this.addElementToString,
				elementHash,
			});
			return formula;
		},
		
		addElementToString: function(formula, element, elementHash) {
			formula += element;
			formula += "<sub>"+elementHash[element].toFixed(3)+"</sub>";
			return formula;
		},
		
		/*
		 * Calculates the mass of a composition hash, mapping elements to the
		 * number of atoms
		 */
		massOfCompositionHash: function(compoHash) {
			_.reduce(compoHash,
					function(memo, value, key) {
				return memo + elementMasses[key] * value;
			}, 0.0);
		},
				
		weightedComposition: function(phaseModel) {
			// Mass fraction, weighted by formula mass
			var fimi = phaseModel.get("ABUNDANCE")/phaseModel.get("MOLECULARMASS");
			// Get the number of each element present
			var elementNumbers = this.mapFormula(this.flattenBrackets(phaseModel.get("COMPOSITION")));
			
			_.each(elementNumbers, function(value, key, list) {
				console.log("weightedComposition: key = "+key.toString()+", unweighted value = "+list[key].toString());
				list[key] *= fimi;
				console.log("weighted value = "+list[key].toString());
			}, {"fimi": fimi});

			return {"elements": elementNumbers, "fimi": fimi};
		},
		
		allTheElements: [
		                 "H", "He",
		                 "Li", "Be", "B", "C", "N", "O", "F", "Ne",
		                 "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
		                 "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
		                 "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe",
		                 "Cs", "Ba", "La", 
		                 					"Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
		                					"Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",
		                 "Fr", "Ra", "Ac",
		                      				"Th", "Pa", "U", "Ne", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm"
		                 ],
		                 
		 elementMasses: {
			 "H": 1.0080, "He": 4.003,
			 "Li": 6.94, "Be": 9.012, "B": 10.81, "C": 12.01, "N": 14.01, "O": 16.00, "F": 19.00, "Ne": 20.18,
			 "Na": 22.99, "Mg": 24.31, "Al": 26.98, "Si": 28.09, "P": 30.97, "S": 32.06, "Cl": 35.45, "Ar": 39.95,
			 "K": 39.10, "Ca": 40.08, "Sc": 44.96, "Ti":47.87, "V": 50.94, "Cr": 52.00, "Mn": 54.94, "Fe":55.85, "Co":58.93, "Ni": 58.69, "Cu": 63.55, "Zn": 65.38, "Ga": 69.72, "Ge": 72.63, "As": 74.92, "Se": 78.97, "Br":79.90, "Kr": 83.80,
			 "Rb": 84.47, "Sr": 87.62, "Y": 88.91, "Zr": 91.22, "Nb": 92.91, "Mo": 95.95, "Tc": 97.91, "Ru": 101.07, "Rh": 102.91, "Pd": 106.42, "Ag": 107.87, "Cd": 112.41, "In": 114.82, "Sn": 118.71, "Sb": 121.76, "Te":127.60, "I": 126.90, "Xe": 131.29,
			 "Cs": 132.91, "Ba": 137.33, "La": 138.91,
			 											"Ce": 140.12, "Pr": 140.91, "Nd": 144.24, "Pm": 144.91, "Sm": 150.36, "Eu": 151.96, "Gd": 157.25, "Tb": 158.93, "Dy":162.50, "Ho": 164.93, "Er":167.26, "Tm": 168.93, "Yb": 173.05, "Lu": 174.97,
			 											"Hf": 178.49, "Ta": 180.95, "W": 183.84, "Re": 186.21, "Os":190.23, "Ir":192.22, "Pt": 195.08, "Au": 196.97, "Hg": 200.59, "Tl": 204.38, "Pb": 207.2, "Bi": 208.98, "Po": 208.98, "At": 209.99, "Rn": 222.02,
			 "Fr": 223.02, "Ra": 226.03, "Ac": 227.03,
			 											"Th": 232.04, "Pa": 231.04, "U":238.03, "Np":237.05, "Pu": 244.06, "Am": 243.06, "Cm": 247.07, "Bk": 247.07, "Cf": 251.08, "Es": 252.08, "Fm": 257.10,
		 },               
	}
});