/**
 * A view to define a new XPDF sample (ISPyB Crystal) from a combination of
 * phases
 */

define([
	"views/form",
	"models/crystal",
	"collections/proteins",
	"modules/types/xpdf/samples/views/crystalphasetable",
	"tpl!templates/types/xpdf/samples/newcrystalsample.html"
	], function(
			FormView,
			Crystal,
			Phases,
			CrystalPhaseTable,
			template
	) {
	return FormView.extend({
		template: template,
		
		regions: {
			phase_table: ".phase_table",
		},
		
		createModel: function() {
			this.model = new Crystal();
		},
		
		success: function(model, response, options) {
			console.log("Successfully added crystal", this.model);
			app.trigger("crystals:view", model.get("CRYSTALID"));
		},
		
		initialize: function(options) {
			
		},

		onSubmit: function(e) {
			// get the phases from the phase table
			
			// add them to the model
			
			// call FormView.onSubmit()
			FormView.prototype.onSubmit.apply(this, e);
		},
		
		onRender: function(e) {
			this.phase_table.show(new CrystalPhaseTable({collection: new Phases()}));
		}
		
	});
});