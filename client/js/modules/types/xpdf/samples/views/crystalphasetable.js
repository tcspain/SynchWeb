/**
 * Given a collection of phases, draw a view that displays the phases, allows
 * addition or removal and editing of their abundance.
 */

define([
	"marionette",
	"utils/table",
	"views/table",
	"views/dialog",
	"collections/proteins",
	"modules/types/xpdf/samples/views/linkphaseview",
    "modules/types/xpdf/samples/views/proteinlist",
	"tpl!templates/types/xpdf/samples/crystalphasetable.html"
	], function(
			Marionette,
			table,
			TableView,
			DialogView,
			Phases,
			LinkPhaseView,
			PhaseList,
			template
	) {
	
	var OverView = Marionette.LayoutView.extend({
		template: template,
		regions: {
			table: ".table",
		},
		events: {
			"click a.addphase": "addPhase",
			"click a.newphase": "addNewPhase",
		},
		
		initialize: function(options) {
			this.collection = options.collection;
		},
		
		onRender: function() {
			this.table.show(new PhaseTableView({collection: this.collection}));
		},
		
		addPhase: function(e) {
			e.preventDefault();
			console.log("Add existing phase");
			app.dialog.show(new LinkPhaseView({collection: this.collection}));
		},

		
		addNewPhase: function(e) {
			e.preventDefault();
			console.log("Add new phase");
		},
		
		
	});
	
	var GotoCell = table.TemplateCell.extend({
		getTemplate: function() {
			return "<a class=\"button button-notext gotolink\" title=\"Go to Phase\" href=\"/phases/pid/<%=PROTEINID%>\"><i class=\"fa fa-share\"></i></a>";
		},
	});

	var RemoveCell = table.TemplateCell.extend({
		events: {
			"click a.remlink": "doRemove",
		},
		
		getTemplate: function() {
			return "<a class=\"button button-notext remlink\" title=\"Remove Phase\" href=\"#\"><i class=\"fa fa-remove\"></i></a>";
		},

		doRemove: function(event) {
			this.collection.remove(this.model.get("PROTEINID"));
		},
	});
	
	var PhaseTableView = TableView.extend({
		/*
		 * options:
		 * options.collection
		 * 					collection of phases to display and edit
		 */
		initialize: function(options) {
			this.columns = [
				{ name: "PROTEINID", label: "Id", cell: "string", editable: false },
				{ name: "NAME", label: "Name", cell: "string", editable: false },
				{ name: "SEQUENCE", label: "Composition", cell: "string", editable: false },
				{ name: "ABUNDANCE", label: "Fraction", cell: "string", editable: true },
				{ name: "REMOVE", label: "Remove", cell: RemoveCell.extend({collection: options.collection}), editable: false},
				{ name: "GOTO", label: "Phase details", cell: GotoCell, editable: false },
			];
			TableView.prototype.initialize.apply(this, [options]);

		},
	});
	
	return OverView;
});