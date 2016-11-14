/**
 * A class to draw the editable table of phases in the XPDF sample page. 
 */

define([
        "marionette",
        "views/table",
        "utils/table"
        ], function(
        		Marionette,
        		TableView,
        		table
        		) {	
	return TableView.extend({
		columns: [
                  {name: "PROTEINID", label: "Code", cell: "string", editable: false},
                  {name: "NAME", label: "Name", cell: "string", editable: false},
                  {name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
                  {name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
                  {name: "SEQUENCE", label: "Composition", cell: "string", editable: false},
//      			{name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
                  {name: "ABUNDANCE", label: "Fraction", cell: "string", editable: false},
                  ],
                  
                  // Set the row to be clickable, and for the click to display
                  // the phase information page
                  backgrid: {
                	  row: table.ClickableRow.extend({
                			  event: "proteins:view",
                			  argument: "PROTEINID",
                			  cookie: true,
                			  }),
                  },
	});
});