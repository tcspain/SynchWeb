/**
 * The view for the model dialog to choose a phase from which to copy the
 * parameters
 */

define([
        "backgrid",
        "views/dialog",
        "models/protein",
        "collections/proteins",
        "utils/table",
        "modules/types/xpdf/samples/views/proteinlist",
        "tpl!templates/types/xpdf/samples/copyphase.html"
        ], function(
        		Backgrid,
        		DialogView,
        		Phase,
        		Phases,
        		table,
        		PhaseList,
        		template
        		) {

	return DialogView.extend({
		template: template,
		className: "form",
		title: "Select a phase to copy from",
		
		regions: {
			phaseList: ".phaselist",
		},
		
		buttons: {
			"OK": "doCopy",
			"Cancel": "closeDialog",
		},
		
		initialize: function(options) {
			var self = this;
			this.model = options.model;

			// The Backgrid row class
			var selectARow = Backgrid.Row.extend({
				events:{
					"click": "onClick",
				},
				
				onClick: function(e) {
					self.doSelect(this.model.get("PROTEINID"));
				}
			});
			
			this.phases = new Phases();
			this.phases.fetch().done( function() {
				self.phaseList.show(new PhaseList({collection: self.phases, row: selectARow}));
			});
			
			this.onSuccess = options.onSuccess;

			// Get all phases for the current proposal
			//			this.allPhases =
		},
		
		onRender: function() {
		},
		
		doSelect: function(proteinId) {
			console.log("Selected pid"+proteinId);
			this.selectedProtein = proteinId;
		},
		
        doCopy: function() {
        	var self = this;
        	console.log("copyphaseview:doCopy");
        	self.closeDialog();
        	
        	var sourcePhase = new Phase();
        	sourcePhase.set({"PROTEINID": this.selectedProtein,});
        	sourcePhase.fetch({
        		success: function() {
        			self.copyData(sourcePhase);
        		},
        		error: function() {
        			console.log("Could not get source phase, pid=" + self.selectedProtein);
        		}
        	});
        	
		},
		
		copyData : function(sourcePhase) {
        	console.log("Copying from source phase id "+sourcePhase.get("PROTEINID")+" to target phase id "+this.model.get("PROTEINID"));
        	
        	// Copy the actual data across
        	var copyProperties = ["NAME", "ACRONYM", "MOLECULARMASS", "SEQUENCE"];
        	this.model.save({
        		"NAME": sourcePhase.get("NAME"),
        		"ACRONYM": sourcePhase.get("ACRONYM"),
        		"MOLECULARMASS": sourcePhase.get("MOLECULARMASS"),
        		"SEQUENCE": sourcePhase.get("SEQUENCE"),
        	}, {patch: true});
        	
//			app.trigger("copyPhaseRegio:success");
        	this.onSuccess();

		}
	});
});