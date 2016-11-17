/**
 * The view for the model dialog to choose a phase from which to copy the
 * parameters
 */

define([
        "views/dialog",
        "collections/proteins",
        "utils/table",
        "modules/types/xpdf/samples/views/proteinlist",
        "tpl!templates/types/xpdf/samples/copyphase.html"
        ], function(
        		DialogView,
        		Phases,
        		table,
        		PhaseList,
        		template
        		) {

	var selectARow = table.ClickableRow.extend({
		event: "proteins:select",
		argument: "PROTEINID",
		cookie: true,
	});
	
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

			this.phases = new Phases();
			this.phases.fetch().done( function() {
				self.phaseList.show(new PhaseList({collection: self.phases, row: selectARow}));
			});
			this.listenTo(this.phaseList, "proteins:select", this.doSelect)
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
			app.trigger("copyPhaseRegio:success");
		},
	});
});