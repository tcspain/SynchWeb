/**
 * A class to draw the editable table of phases in the XPDF sample page. 
 */

define([
        "marionette",
        "views/table",
        "utils/table",
        "models/sample"
        ], function(
        		Marionette,
        		TableView,
        		table,
        		Sample
        		) {	
	
	var RemoveCell = table.TemplateCell.extend({
		events: {
			"click a.remlink": "doRemove",
		},
		
		getTemplate: function() {
			return "<a class=\"button button-notext remlink\" title=\"Remove Phase\" href=\"#\"><i class=\"fa fa-remove\"></i></a>";
		},

		doRemove: function(event) {
			console.log("Removing phase "+this.model.get("PROTEINID")+" from "+this.sampleId);

			var theSample = new Sample();
			theSample.set({"BLSAMPLEID": this.sampleId});
			var removedPhaseId = this.model.get("PROTEINID");
			theSample.fetch({
				success: function(model, response, options) {
					
					// Excuse me, Mr. Sample while I interfere with your intimate components
					// Get the primary and component phase IDs
					var sampleComponentIds = theSample.get("COMPONENTIDS");
					var primaryPhaseId = theSample.get("PROTEINID");
					
					// If there is only a primary phase, then do not remove anything.
					if (sampleComponentIds.length <= 0)
						return;
					
					var saveParameters = {};
					
					// Choose between primery and component phase to be removed
					if (primaryPhaseId === removedPhaseId) {
						// Remove the primary phase, and replace by the first component phase 
					
						// Get the ID of the first component. Assign it to
						// removed Phase component, so that is can be
						// subsequently removed from the components
						removedPhaseId = theSample.get("COMPONENTIDS")[0];
						saveParameters.PROTEINID = removedPhaseId;
						// saveParameters.PRIMARYAMOUNT = theSample.get("COMPONENTAMOUNTS")[0];
					}
						
						
						
					if (_.contains(sampleComponentIds, removedPhaseId.toString())) {
						// Wrapper for splice to return the spliced array
						var removeReturn = function(array, index) {
							if (!$.isArray(array))
								return null;
							array.splice(index, 1);
							return array;
						};
						
						var componentIndex = _.indexOf(sampleComponentIds, removedPhaseId.toString());
						
						saveParameters.COMPONENTIDS = removeReturn(theSample.get("COMPONENTIDS"), componentIndex);
						saveParameters.COMPONENTACRONYMS = removeReturn(theSample.get("COMPONENTACRONYMS"), componentIndex);
						saveParameters.COMPONENTAMOUNTS = removeReturn(theSample.get("COMPONENTAMOUNTS"), componentIndex);
						// Save the sample with the component removed
						theSample.save(saveParameters, {});
					}
						
				},
				error: function(model, response, options){
					// Cannot get the sample with that ID? Do nothing
				}
			
			});
		
		},
	});
	
	return TableView.extend({
		

		initialize: function(options) {
			this.columns= [
			               {name: "PROTEINID", label: "Code", cell: "string", editable: false},
			               {name: "NAME", label: "Name", cell: "string", editable: false},
			               {name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
			               {name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
			               {name: "SEQUENCE", label: "Composition", cell: "string", editable: false},
//			               {name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
			               {name: "ABUNDANCE", label: "Fraction", cell: "string", editable: true},
			               {name: "REMOVE", label: "Remove", cell: RemoveCell.extend({sampleId: options.sampleId,}), editable: false},
	                  ];
			TableView.prototype.initialize.apply(this, [options]);
		},
		
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