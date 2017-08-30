/**
 * View a Crystal as an XPDF sample
 */

define([
	"marionette",
	"modules/types/xpdf/samples/views/crystalphasetable",
	"models/protein",
	"collections/proteins",
	"tpl!templates/types/xpdf/samples/crystalsampleview.html"
	], function(
		Marionette,
		CrystalPhaseTable,
		Phase,
		Phases,
		template
	) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			phaseTable: ".phasetable",
		},
		
		initialize: function(options) {
			
			// create the collection of phases from the primary protein data 
			// and component arrays
			var phases = new Phases();
			
			var primary = new Phase();
			primary.set({"PROTEINID": this.model.get("PROTEINID"),
				"ACRONYM": this.model.get("ACRONYM"),
				"ABUNDANCE": this.model.get("ABUNDANCE"),
				});
			phases.push(primary);
			
			var componentIds = this.model.get("COMPONENTIDS");
			var componentAcs = this.model.get("COMPONENTACRONYMS");
			var componentAbs = this.model.get("COMPONENTAMOUNTS");
			var nComponents = componentIds.length;
			for (var iComponent = 0; iComponent < nComponents; iComponent++) {
				var component = new Phase();
				component.set({"PROTEINID": componentIds[iComponent],
					"ACRONYM": componentAcs[iComponent],
					"ABUNDANCE": componentAbs[iComponent],
				});
				phases.push(component);
			}
			
			this.collection = phases;
			
			Backbone.Validation.bind(this);
			if (!this.model.has("NAME")) this.model.set({"NAME": "NULL"});
			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
		},
		
		onRender: function() {
			this.phaseTable.show(new CrystalPhaseTable({collection: this.collection}))
		}
	});
});