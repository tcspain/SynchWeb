/**
 *  The table alone for the list of XPDF samples
 */

define([
        "views/table",
        "utils/table",
        ], function(
        		TableView,
        		table
        ) {
	var ClickableRow = table.ClickableRow.extend({
		event: 'samples:view',
		argument: 'BLSAMPLEID',
		cookie: true,
	});

	var AbundanceCell = table.TemplateCell.extend({
		initialize: function(options) {
			var phaseId = options.phaseId;
		},
	
		getAbundanceOfPhase: function() {
			var compo = this.model.get("components");
			if (this.model.get("PROTEINID") == this.phaseId)
				return this.model.get("ABUNDANCE");
			if (_.contains(_.pluck(this.model.get("components"), "PROTEINID"), this.phaseId)) {
				return "-"
			}
		}
	});
	  
	return TableView.extend( {

		backgrid: {
			 row: ClickableRow, 
		 },
		 loading: true,
		 
		 /*
		  * options:
		  * options.collection: collection of samples to display
		  * options.phaseId: phaseId to get the abundances of, or -1 for an
		  * 	undefined phase
		  */
		 initialize: function(options) {
			 this.collection = options.collection;

			 this.columns = [
			            { name: "NAME", label: "Name", cell: "string", editable: false},
			            { name: "ACRONYM", label: "ID", cell: "string", editable: false },
			            { name: "COMMENTS", label: "Comments", cell: "string", editable: false },
			            { name: "ABUNDANCE", label: "Phase Abundance", cell: "string", editable: false},
//			            { name: "COMPOSITION", label: "Composition", cell: "string", editable: false },
			            { name: "DENSITY", label: "Density", cell: "string", editable: false},
			            ];
			 this.hiddenColumns = [],

			 console.log(options);
			 
			 TableView.prototype.initialize.apply(this, [options]);
			 
		 }
	});
});