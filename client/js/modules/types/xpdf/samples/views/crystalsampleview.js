/**
 * View a Crystal as an XPDF sample
 */

define([
	"marionette",
	"utils/editable",
	"modules/types/xpdf/samples/views/crystalphasetable",
	"models/protein",
	"collections/proteins",
	"collections/samples",
	"modules/types/xpdf/samples/views/samplelisttableview",
	"modules/types/xpdf/utils/componentmudex",
	"modules/types/xpdf/utils/manglingeditable",
	"utils/table",
	"tpl!templates/types/xpdf/samples/crystalsampleview.html"
	], function(
		Marionette,
		Editable,
		CrystalPhaseTable,
		Phase,
		Phases,
		Instances,
		InstanceListTable,
		ComponentMudex,
		Mangler,
		table,
		template
	) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		events: {
			"click a.newinstance": "newInstance",
		},
		
		regions: {
			phaseTable: ".phasetable",
			instanceTable: ".instancetable",
		},
		
		initialize: function(options) {
			this.mudex = new ComponentMudex(this.model);
			
			this.collection = this.mudex.getComponents();
			
			Backbone.Validation.bind(this);
			if (!this.model.has("NAME")) this.model.set({"NAME": "NULL"});
			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
		},
		
		onRender: function() {
			var edit = new Editable({model: this.model, el: this.$el});
			edit.create("NAME", "text");
			edit.create("THEORETICALDENSITY", "text");
			
			var mangler = new Mangler({model:this.model, el:this.$el});
			mangler.create("UNMANGLEDNAME", "NAME", / /g, "__");
			
			// Table of phases
			this.phaseTable.show(new CrystalPhaseTable({collection: this.collection}));
			
			// Table of instances
			var instances = new Instances();
			var sampleId = this.model.get("CRYSTALID");
			var instanceTable = this.instanceTable;
			
			var instanceRow = table.ClickableRow.extend({
				event: "samples:view",
				argument: "BLSAMPLEID",
				cookie:true,
			});
			
			instances.fetch({data: {crid: sampleId},
				success: function(collection, response, options) {
					console.log("Found " + collection.length + " instances of sample " + sampleId);
					instanceTable.show(new InstanceListTable({collection: collection, hideNewInstance: true, row: instanceRow}));
				},
				error: function(collection, response, options) {
					console.log("Error fetching instances of sample " + sampleId);
				},
			});
		},
		
		newInstance: function(e) {
			e.preventDefault();
			app.trigger("instance:create", this.model.get("CRYSTALID"));
		},
	});
});