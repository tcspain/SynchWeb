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
		
		// Choose between primary and component phase to be removed
		if (primaryPhaseId === phaseId) {
			// Remove the primary phase, and replace by the first component phase 
		
			// Get the ID of the first component. Assign it to
			// removed Phase component, so that is can be
			// subsequently removed from the components
			phaseId = sample.get("COMPONENTIDS")[0];
			saveParameters.PROTEINID = phaseId;
			saveParameters.ABUNDANCE = sample.get("COMPONENTAMOUNTS")[0];
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
			var abundance = this.abundanceMap[this.model.get("PROTEINID")];
			if (Number.isNaN(Number.parseFloat(abundance)))
					abundance = "-";
						
			return "<div class=\"abundance editable "+this.model.get("PROTEINID")+"\">"+abundance+"</div>";
		},
	});
	
	return TableView.extend({
		

		initialize: function(options) {
			this.sampleId = options.sampleId;
			this.sample = options.sample;

			// create a map of proteinids to abundances
			var abundanceMap = this.makeAbundanceMap(this.sample);
			
			this.columns= [
			               {name: "PROTEINID", label: "Code", cell: "string", editable: false},
			               {name: "NAME", label: "Name", cell: "string", editable: false},
//			               {name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
//			               {name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
			               {name: "SEQUENCE", label: "Composition", cell: "string", editable: false},
			               {name: "DENSITY", label: "Density", cell: "string", editable: false},
			               {name: "ABUNDANCE", label: "Fraction", cell: AbundanceCell.extend({sampleId: options.sampleId, sample: options.sample, abundanceMap: abundanceMap}), editable: false},
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

		onRender: function() {
        	TableView.prototype.onRender.apply(this, []);
			// Set up the editable abundance cell as soon as the DOM can handle it
			var view = this;
			$(function() {
				view.$(".abundance").editable(function(value, settings) {
					// If there is a better way to get per-cell model parameters here, please change this
					var allClasses = this.classList;
					var idClass = _.without(allClasses, "abundance", "editable");
					var phaseId = (idClass)[0];
					var validatedValue = view.setAbundance(phaseId, value);
					return validatedValue;
				}, {
					type: "text",
					submit: "OK",
					tooltip: "Click to edit",

				});
			});
        },
        
        setAbundance: function(phaseId, abundance) {
        	
        	var componentAbundancesString = "COMPONENTAMOUNTS";
        	var validateAbundance = function(rawAbundance) {
        		var abundance = Number(rawAbundance);
        		return (abundance >= 0.0) && (abundance <= 1.0);
        	}

			// Check for primary phase
        	if (this.sample.get("PROTEINID") === phaseId) {
        		// Assign the new primary phase abundance, after validation
        		if (!validateAbundance(abundance))
        			return this.sample.get("ABUNDANCE");
        		
        		this.sample.set({"ABUNDANCE": abundance});
        		// Reset the validation error
        		this.sample.validationError = null; 
        		
        		this.sample.save({"ABUNDANCE": abundance}, {patch: true,
        			success: function(model, response, options) {
        				console.log("Set abundance on "+model.get("BLSAMPLEID")+" to "+model.get("ABUNDANCE"));
        			},
        			error: function(model, response, options) {
        				console.log("Failed to set abundance on "+model.get("BLSAMPLEID")+" due to "+response);
        			}
        		});
        		
        	} else {
        		
        		// Assign the new abundance to the correct model from the
        		// sample components collection, after validation
        		var targetPhase = this.sample.get("components").findWhere({PROTEINID: phaseId});
        		var oldAbundance = targetPhase.get("ABUNDANCE");
				if (!validateAbundance(abundance)) return oldAbundance;
        		targetPhase.set({"ABUNDANCE": abundance});
        		this.sample.save();        		
			}
			return abundance;
        },
        
        makeAbundanceMap: function(sample) {
        	var aMap = {};
        	var key;
        	var abundance;
        	// primary
        	key = sample.get("PROTEINID");
        	abundance = sample.get("ABUNDANCE");
        	aMap[key] = abundance;
        	
        	// components
        	var nComponents = sample.get("COMPONENTIDS").length;
        	for (i=0; i < nComponents; i++) {
        		key = sample.get("COMPONENTIDS")[i];
        		abundance = sample.get("COMPONENTAMOUNTS")[i];
        		aMap[key] = abundance;
        	}
        	
        	return aMap;
        }
	});
});