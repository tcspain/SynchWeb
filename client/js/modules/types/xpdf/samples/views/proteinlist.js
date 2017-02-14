/**
 * XPDF phase list
 */

define(["marionette",
        "views/table",
        "utils/table",
        "collections/componenttypes",
        "modules/samples/views/proteinlist"
        ], function(Marionette,
        		TableView,
        		table,
        		ComponentTypes,
        		ProteinList) {
	
	return ProteinList.extend({
		title: "Phase",
		
		columns: [
			{name: "NAME", label: "Name", cell: "string", editable: false},
//			{name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
			{name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
			{name: "COMPOSITION", label: "Composition", cell: "string", editable: false},
//			{name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
			{name: "ABUNDANCE", label: "Fraction", cell: "string", editable: false},
			{name: "COMMENTS", label: "Comments", cell: "string", editable: false},
		],
	
		hiddenColumns: [],
		
		initialize: function(options) {
//			ProteinList.initialize(options);
			// Mostly a copy-paste of the base class initialize() 
			if (app.mobile()) {
				_.each(this.getOption('hiddenColumns'), function(v) {
					columns[v].renderable = false;
				});
			}

//			console.log(options);
			// Allow some flexibility in the row type
			var row;
			if (typeof (options.row) == "undefined") {
				row = table.ClickableRow.extend({
						event: 'proteins:view',
						argument: 'PROTEINID',
						cookie: true,
			  });
			  } else {
				  row = options.row;
			  }
			
			var self = this;
			this.table = new TableView({ collection: options.collection, columns: this.columns/*this.getOption('columns')*/, tableClass: 'proposals', filter: 's', search: options.params && options.params.s, loading: true, 
				backgrid: {
					row: row, 
					emptyText: function() { 
						return self.collection.fetched ? 'No '+self.getOption('title')+'s found' : 'Retrieving '+self.getOption('title')+'s'; 
					} 
				}, noPageUrl: options.noPageUrl, noSearchUrl: options.noSearchUrl });

			this.types = new ComponentTypes();
			this.tr = this.types.fetch();

		},
	})
});