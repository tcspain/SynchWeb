/**
 * A Small view too display the molecular mass of a sample
 */

define([
        "marionette",
        "utils/phasecompositor",
        "tpl!templates/types/xpdf/samples/molecularmass.html"
        ], function(
        		Marionette,
        		phaseCompositor,
        		template
        		) {
	
	
	return Marionette.LayoutView.extend({
		template: template,
		initialize: function(options) {
			this.model = options.model;
			this.checkAndUpdateMolecularMass();
		},
		
		onRender: function() {
			this.checkAndUpdateMolecularMass()
		},
		
		checkAndUpdateMolecularMass: function() {
			if (this.model.get("SEQUENCE") === null) {
				// Do nothing
			} else {
				var currentMolecularMass = this.model.get("MOLECULARMASS");
				var molecularMass = phaseCompositor.massOfCompositionHash(phaseCompositor.mapFormula(this.model.get("SEQUENCE")));
				if (currentMolecularMass != molecularMass)
					this.model.save({"MOLECULARMASS": molecularMass}, {patch:true});
			}
		},
	});
});