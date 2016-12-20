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
			console.log("linkphase.activate() with sample "+this.model.get("BLSAMPLEID")+" and phase "+this.selectedPhase);
			this.closeDialog();
			var components = this.model.get("components");
			// Get the sum of all the existing abundnaces
			var currentAbundances = components.pluck("ABUNDANCE");
			console.log("Current abundances:");
			console.log(currentAbundances);
			var totalAbundance = _.reduce(currentAbundances, function(memo, bun) {return memo+parseFloat(bun);}, parseFloat(this.model.get("ABUNDANCE")));
			// The new abundnace takes the sum to 1.0, unless that would
			// violate the constraints of the abundance being between 0.0 and 1.0
			console.log("Total abundance: "+totalAbundance);
			var newAbundance = Math.min(1.0, Math.max(1.0-totalAbundance, 0.0)).toFixed(3);
			console.log("New abundance will be "+newAbundance);
			// Add the phase, with the calculated abundance
			components.add({"PROTEINID": this.selectedPhase, "ABUNDANCE": newAbundance});
			this.model.save();
		},
		
	
	});
});