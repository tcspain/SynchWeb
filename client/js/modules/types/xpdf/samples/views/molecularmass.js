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
			this.updateMolecularMass();
		},
		
		onRender: function() {
			this.updateMolecularMass();
		},
		
		updateMolecularMass: function() {
			this.model.set({"MOLECULARMASS": phaseCompositor.massOfCompositionHash(phaseCompositor.mapFormula(this.model.get("SEQUENCE")))});
			console.log("molecularmass:UpdateMolecularMass"+this.model.get("MOLECUALRMASS"));
		},
	});
});