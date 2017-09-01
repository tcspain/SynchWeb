/**
 * A modal dialog to link an already defined phase into a sample
 */
define([
        "modules/types/xpdf/samples/views/phasepopupview",
        "models/protein",
        "collections/proteins"
        ], function(
        		PhasePopUpView,
        		Phase,
        		Phases
        ) {
	return PhasePopUpView.extend({
		onOK: function() {
			this.closeDialog();

			var collection = this.collection;
			// Remove all phases from the selection that already exist in the collection
			var filteredSelection = new Phases();
			filteredSelection.add(this.selection.difference(this.collection));
			
			if (filteredSelection.size() == 0) {
				console.log("No new phases to add to the collection.");
				return; 
			}
			
			console.log("Adding " + filteredSelection.size() + " phases to the collection.");
			
			var currentAbundances = this.collection.pluck("ABUNDANCE");
			var totalAbundance = _.reduce(currentAbundances, function(memo, bun) {return memo+parseFloat(bun);}, 0.0);
			if (!Number.isFinite(totalAbundance)) totalAbundance = 0.0;
			var newAbundance = Math.min(1.0, Math.max(1.0-totalAbundance, 0.0)).toFixed(3);
			newAbundance /= filteredSelection.size();
			newAbundance = newAbundance.toString();
			filteredSelection.each(function(phase, index, phases) {
				phase.set({"ABUNDANCE": newAbundance});
			});
			
			collection.add(filteredSelection.models);
			
		},
		
	
	});
});