/**
 * View a Crystal as an XPDF sample
 */

define([
	"marionette",
	"modules/types/xpdf/samples/views/crystalphasetable",
	"models/protein",
	"collections/proteins",
	"modules/types/xpdf/utils/componentmudex",
	"tpl!templates/types/xpdf/samples/crystalsampleview.html"
	], function(
		Marionette,
		CrystalPhaseTable,
		Phase,
		Phases,
		ComponentMudex,
		template
	) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			phaseTable: ".phasetable",
		},
		
		initialize: function(options) {
			this.mudex = new ComponentMudex(this.model);
			
			this.collection = this.mudex.getComponents();
			
			Backbone.Validation.bind(this);
			if (!this.model.has("NAME")) this.model.set({"NAME": "NULL"});
			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
		},
		
		onRender: function() {
			this.phaseTable.show(new CrystalPhaseTable({collection: this.collection}))
		}
	});
});