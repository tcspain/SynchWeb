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
	
	var SampleNameCell = table.TemplateCell.extend({
		getTemplate: function() {
			return "<div>"+this.model.get("NAME").replace(/__/g, " ")+"</div>"
		}
	});
	
	var NewInstanceCell = table.TemplateCell.extend({
		events: {
			"click a.instance": "goToInstancePage",
		},
		
		getTemplate: function() {
			return "<a class=\"button instance\" href=\"#\"><i class=\"fa fa-plus\"></i></a>";
		},
		
		goToInstancePage: function(e) {
			e.preventDefault();
			console.log("Making instance of "+this.model.get("CRYSTALID"));
			app.trigger("instance:create", this.model.get("CRYSTALID"));
		},
	});
	  
	return TableView.extend( {

		backgrid: {
		 },
		 loading: true,
		 
		 /*
		  * options:
		  * options.collection: collection of samples to display
		  * options.phaseId: phaseId to get the abundances of, or -1 for an
		  * 	undefined phase
		  * options.row: The row class to use
		  * options.hideNewInstance: hide the "Create new instance" column
		  */
		 initialize: function(options) {
			 this.collection = options.collection;

			 var hideNewInstance = false;
			 if (options["hideNewInstance"] !== undefined)
				 hideNewInstance = options["hideNewInstance"];
			 
			 this.columns = [
			            { name: "NAME", label: "Name", cell: SampleNameCell, editable: false},
//			            { name: "ACRONYM", label: "ID", cell: "string", editable: false },
			            { name: "COMMENTS", label: "Comments", cell: "string", editable: false },
//			            { name: "ABUNDANCE", label: "Phase Abundance", cell: "string", editable: false},
//			            { name: "COMPOSITION", label: "Composition", cell: "string", editable: false },
			            { name: "THEORETICALDENSITY", label: "Density", cell: "string", editable: false},
			            { name: "PACKINGFRACTION", label: "Packing", cell:"string", editable: false},
//			            { name: "NEWINSTANCE", label: "Create new instance", cell: NewInstanceCell, editable: false, renderable: !hideNewInstance },
			            ];

			 if (options["row"] !== undefined) this.backgrid.row = options.row;
			 
			 TableView.prototype.initialize.apply(this, [options]);
			 
		 }
	});
});