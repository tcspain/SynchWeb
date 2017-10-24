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
		
		events: {
			"click a.newcrystal": "createCrystal",
		},
		
		initialize: function(options) {
			this.collection = options.collection;
			if (options.row) this.row = options.row;
			
			if (options.hideButton) this.hideButton = options.hideButton;

			this.hideNewInstance = false;
			if (options["hideNewInstance"] !== undefined)
				this.hideNewInstance = options["hideNewInstance"];

		},
	
		onRender: function() {
			var options = {};
			if (this.row) options.row = this.row;
			options.collection = this.collection;
			
			if (this.hideButton) {
				var crystalButton = this.$el.find("a.newcrystal")
				if (crystalButton.size() > 0)
					crystalButton[0].style.display = "none";
			}
			
			this.tablewrap.show(new CrystalListView(options));
		},
		
		
		createCrystal: function(e) {
			e.preventDefault();
			app.trigger("crystals:new");
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

	var NewInstanceCell = table.TemplateCell.extend({
		events: {
			"click a.instance": "goToInstancePage",
		},
		
		getTemplate: function() {
			return "<a class=\"button instance\" href=\"#\"><i class=\"fa fa-plus\"></i></a>";
		},
		
		goToInstancePage: function(e) {
			e.preventDefault();
			console.log("Making instance of "+this.model.get("CRYSTALID"));
			app.trigger("instance:create", this.model.get("CRYSTALID"));
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
	            { name: "NEWINSTANCE", label: "Create new instance", cell: NewInstanceCell, editable: false, renderable: !this.hideNewInstance },
			];

			if (options.row)
				this.backgrid.row = options.row;
			
			TableView.prototype.initialize.apply(this, [options]);
		},
	});
	
	return module;
});