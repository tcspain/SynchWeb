/**
 * XPDF phase list
 */

define(["marionette",
        "modules/samples/views/proteinlist"
        ], function(Marionette,
        		ProteinList) {
	
	return ProteinList.extend({
		title: "Phase",
		
		columns: [
			{name: "NAME", label: "Name", cell: "string", editable: false},
			{name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
			{name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
			{name: "COMPOSITION", label: "Composition", cell: "string", editable: false},
//			{name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
			{name: "ABUNDANCE", label: "Fraction", cell: "string", editable: false},
		],
	
		hiddenColumns: [],
		
		intialize: function(options) {
			ProteinList.initialize(options);
		},
	})
});