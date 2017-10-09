/**
 * View a Collection of Crystals as XPDF samples
 */

define([
	"marionette",
	"views/table",
	"utils/table",
	"tpl!templates/types/xpdf/samples/crystalsamplelist.html",
	], function(
			Marionette,
			TableView,
			table,
			template
	) {
	var module = Marionette.LayoutView.extend( {
		className: "content",
		template: template,
		regions: {
			tablewrap: ".table",
		},
		
		initialize: function(options) {
			this.collection = options.collection;
			if (options.row) this.row = options.row;
			
			if (options.hideButton) this.hideButton = options.hideButton;
		},
	
		onRender: function() {
			var options = {};
			if (this.row) options.row = this.row;
			options.collection = this.collection;
			
			if (this.hideButton) {
				var crystalButton = this.$el.find("a.newcrystal")
				console.log("Crystal sample list number of buttons = " + crystalButton.size());
				if (crystalButton.size() > 0)
					crystalButton[0].style.display = "none";
			}
			
			this.tablewrap.show(new CrystalListView(options));
		},
		
	});
	
	// Classes for the cells of the list table
	var SampleNameCell = table.TemplateCell.extend({
		getTemplate: function() {
			if (this.model.get("NAME") == null)
				return "<div>NULL</div>";
			return "<div>"+this.model.get("NAME").replace(/__/g, " ")+"</div>";
		},
	});
	
	var CompositionCell = table.TemplateCell.extend({
		getTemplate: function() {
			return "<div>Not yet calculated</div>";
		},
	});
	
	var NPhaseCell = table.TemplateCell.extend({
		getTemplate: function() {
			var components = this.model.get("COMPONENTIDS") || [];
			var nComponents = (components.length+1).toString();
			return "<div>" + nComponents + "</div>";
		},
	});

	var CrystalListView = TableView.extend({
		
		backgrid: {
			row: table.ClickableRow.extend({
				event: "crystals:view",
				argument: "CRYSTALID",
				cookie: true,
			}),
		},
		
		loading: true,
		
		/*
		 * options:
		 * options.collection: collection of cystals to display as XPDF samples
		 */
		initialize: function(options) {
			this.collection = options.collection;
			console.log("Table collection: ", this.collection);
			
			this.columns = [
				{ name: "NAME", label: "Name", cell: SampleNameCell, editable: false },
				{ name: "COMPOSITION", label: "Composition", cell: CompositionCell, editable: false },
				{ name: "THEORETICALDENSITY", label: "Density", cell: "string", editable: false },
				{ name: "NPHASES", label: "# Phases", cell: NPhaseCell, editable: false },
			];

			if (options.row)
				this.backgrid.row = options.row;
			
			TableView.prototype.initialize.apply(this, [options]);
		},
	});
	
	return module;
});