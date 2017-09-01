/**
 * A view to define a new XPDF sample (ISPyB Crystal) from a combination of
 * phases
 */

define([
	"views/form",
	"models/crystal",
	"collections/proteins",
	"modules/types/xpdf/samples/views/crystalphasetable",
	"modules/types/xpdf/utils/componentmudex",
	"tpl!templates/types/xpdf/samples/newcrystalsample.html"
	], function(
			FormView,
			Crystal,
			Phases,
			CrystalPhaseTable,
			ComponentMudex,
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

		onRender: function(e) {
			this.mudex = new ComponentMudex(this.model);
			this.mudex.setSilence(true);
			this.phase_table.show(new CrystalPhaseTable({collection: this.mudex.getComponents()}));
		}
		
	});
});