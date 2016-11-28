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
	
	var removePhase = function(sample, phaseId) {
		// Excuse me, Mr. Sample while I interfere with your intimate components
		// Get the primary and component phase IDs
		var sampleComponentIds = sample.get("COMPONENTIDS");
		var primaryPhaseId = sample.get("PROTEINID");
		
		// If there is only a primary phase, then do not remove anything.
		if (sampleComponentIds.length <= 0)
			return;
		
		var saveParameters = {};
		
		// Choose between primery and component phase to be removed
		if (primaryPhaseId === phaseId) {
			// Remove the primary phase, and replace by the first component phase 
		
			// Get the ID of the first component. Assign it to
			// removed Phase component, so that is can be
			// subsequently removed from the components
			phaseId = sample.get("COMPONENTIDS")[0];
			saveParameters.PROTEINID = phaseId;
			// saveParameters.PRIMARYAMOUNT = theSample.get("COMPONENTAMOUNTS")[0];
		}
			
		if (_.contains(sampleComponentIds, phaseId.toString())) {
			// Wrapper for splice to return the spliced array
			var removeReturn = function(array, index) {
				if (!$.isArray(array))
					return null;
				array.splice(index, 1);
				return array;
			};
			
			var componentIndex = _.indexOf(sampleComponentIds, phaseId.toString());
			
			saveParameters.COMPONENTIDS = removeReturn(sample.get("COMPONENTIDS"), componentIndex);
			saveParameters.COMPONENTACRONYMS = removeReturn(sample.get("COMPONENTACRONYMS"), componentIndex);
			saveParameters.COMPONENTAMOUNTS = removeReturn(sample.get("COMPONENTAMOUNTS"), componentIndex);
			// Save the sample with the component removed
			sample.save(saveParameters, {});
		}
			
		
	};
	
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
					removePhase(theSample, removedPhaseId);
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