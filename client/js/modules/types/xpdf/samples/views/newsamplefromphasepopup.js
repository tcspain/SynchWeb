/**
 * A dialog to initiate the creation of a new sample, either from an existing
 * phase, or with a new one.
 */

define([
        "modules/types/xpdf/samples/views/phasepopupview",
        "modules/types/xpdf/samples/views/newsample"
        ], function(
        		PhasePopUpView,
        		newSample
     ) {
	return PhasePopUpView.extend({
		
		initialize: function(options) {
			PhasePopUpView.prototype.initialize.apply(this, [options]);
			this.visitId = options.visitId;
			this.buttons["New Phase"] = "onNewPhase";	
		},
		
		onOK: function() {
			this.closeDialog();
			console.log("New sample from phase "+this.selectedPhase+" on visit "+this.visitId);
			newSample.run({"visitId": this.visitId, "phaseId": this.selectedPhase});
		},
		
		onNewPhase: function() {
			this.closeDialog();
			console.log("New sample from new phase on visit "+this.visitId);
			newSample.run({"visitId": this.visitId});
		}
	});
});