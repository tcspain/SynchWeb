/**
 * A class to draw the editable table of phases in the XPDF sample page. 
 */

define(["jquery",
        "marionette",
        "views/table",
        "utils/table",
        "models/sample",
        "jquery.editable",
        ], function(
        		$,
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
			var removedPhaseId = this.model.get("PROTEINID");
			var theSample = this.sample;
			removePhase(theSample, removedPhaseId);
		},
	});
	
	var GotoCell = table.TemplateCell.extend({
		getTemplate: function() {
			return "<a class=\"button button-notext gotolink\" title=\"Go to Phase\" href=\"/proteins/pid/<%=PROTEINID%>\"><i class=\"fa fa-share\"></i></a>";
		},
	});
	
	var AbundanceCell = table.TemplateCell.extend({
		getTemplate: function() {
			return "<div class=\"abundance editable "+this.model.get("PROTEINID")+"\">Click to edit</div>";
		},
		
		
		setAbundance: function(event) {
			console.log("Setting abundance for "+this.model.get("PROTEINID")+" in sample"+this.sampleId);
		}
		
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
			               {name: "ABUNDANCE", label: "Fraction", cell: AbundanceCell.extend({sampleId: options.sampleId, sample: options.sample}), editable: false},
			               {name: "REMOVE", label: "Remove", cell: RemoveCell.extend({sampleId: options.sampleId, sample: options.sample,}), editable: false},
			               {name: "GOTO", label: "Phase Details", cell: GotoCell, editable: false},
	                  ];
			TableView.prototype.initialize.apply(this, [options]);
		},
		
        // Set the row to be clickable, and for the click to display
        // the phase information page
//        backgrid: {
//        	row: table.ClickableRow.extend({
//        		event: "proteins:view",
//        		argument: "PROTEINID",
//        		cookie: true,
//        	}),
//        },

		onRender() {
        	TableView.prototype.onRender.apply(this, []);
			// Set up the editable abundance cell as soon as the DOM can handle it
			var view = this;
			console.log("TableView.extend.onRender()");
			$(function() {
				console.log("Readying AbundanceCell");
				console.log("$.editable"+$.editable);
				
				view.$(".abundance").editable(function(value, settings) {
					console.log("Value="+value);
					console.log(settings);
					return value;
				}, {
					type: "text",
					submit: "OK",
					tooltip: "Click to edit",

				});
			});
        },
	});
});