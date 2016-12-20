/*
 * Base class for the modal dialog phase lists. The derived class function ActivateMe should define what happens when the OK button is pressed
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
		title: "Select a phase",
			
		regions: {
			phaseList: ".phaselist",
		},
		
		buttons: {
			"OK": "onOK",
			"Cancel": "closeDialog",
		},
		
		/*
		 * options:
		 * options.model: the target model of the modal dialog
		 * options.onSuccess: a function to execute on the successful completion of the selection.
		 * options.onError: a function to execute on the failure of the selection
		 */
		initialize: function(options) {
			var self = this;
			this.model = options.model;
			
			// The Backgrid row class
			var selectARow = Backgrid.Row.extend({
				events: {
					"click": "onClick",
				},
				
				onClick: function(event) {
					self.doSelect(this.model.get("PROTEINID"));
				}
			});
			this.phases = new Phases();
			this.phases.fetch().done(function() {
				self.phaseList.show(new PhaseList({collection: self.phases, row: selectARow}));
			});
			this.onSuccess = options.onSuccess;
			this.onError = options.onError;
		},
		
		doSelect: function(proteinId) {
			this.selectedPhase = proteinId;
		},
		
		doActivate: function() {
			console.log("phasePopupView.doActivate()");
			console.log(this);
//			this.activate()
			this.closeDialog();
		},

	});
});