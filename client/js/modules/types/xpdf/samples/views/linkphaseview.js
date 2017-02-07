/**
 * A modal dialog to link an already defined phase into a sample
 */
define([
        "modules/types/xpdf/samples/views/phasepopupview",
        ], function(
        		PhasePopUpView
        ) {
	return PhasePopUpView.extend({
		onOK: function() {
			this.closeDialog();
			var components = this.model.get("components");
			// Check is this phase already is part of the sample. Do nothing if it is.
			if ( (this.selectedPhase == this.model.get("PROTEINID")) || _.contains(components.pluck("PROTEINID"), this.selectedPhase)) {
				console.log("Phase "+this.selectedPhase+" is already part of sample "+this.model.get("BLSAMPLEID"));
				return;
			}
			console.log("Adding phase "+this.selectedPhase+" to sample "+this.model.get("BLSAMPLEID"));
			// Get the sum of all the existing abundnaces
			var currentAbundances = components.pluck("ABUNDANCE");
			var totalAbundance = _.reduce(currentAbundances, function(memo, bun) {return memo+parseFloat(bun);}, parseFloat(this.model.get("ABUNDANCE")));
			if (!Number.isFinite(totalAbundance)) totalAbundance = 0.0;
			// The new abundance takes the sum to 1.0, unless that would
			// violate the constraints of the abundance being between 0.0 and 1.0
			var newAbundance = Math.min(1.0, Math.max(1.0-totalAbundance, 0.0)).toFixed(3);
			// Add the phase, with the calculated abundance
			components.add({"PROTEINID": this.selectedPhase, "ABUNDANCE": newAbundance});
			this.model.save();
		},
		
	
	});
});