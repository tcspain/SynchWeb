/**
 * XPDF phase list
 */

define(["marionette",
        "modules/samples/views/proteinlist"
        ], function(Marionette,
        		ProteinList) {
	
	return ProteinList.extend({
		title: "Phase",
		
		columns: [
			{name: "NAME", label: "Name", cell: "string", editable: false},
			{name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
			{name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
			{name: "COMPOSITION", label: "Composition", cell: "string", editable: false},
//			{name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
			{name: "ABUNDANCE", label: "Fraction", cell: "string", editable: false},
		],
	
		hiddenColumns: [],
		
		intialize: function(options) {
//			ProteinList.initialize(options);
			console.log("Init XPDF phase list");
			// Mostly a copy-paste of the base class initialize() 
			if (app.mobile()) {
				_.each(this.getOption('hiddenColumns'), function(v) {
					columns[v].renderable = false;
				});
			}

			console.log(options);
			// Allow some flexibility in the row type
			var row = (typeof (options.row) == "undefined") ?
					table.ClickableRow.extend({
						event: 'proteins:view',
						argument: 'PROTEINID',
						cookie: true,
			  }) : 
				  options.row;

			
			var self = this;
			this.table = new TableView({ collection: options.collection, columns: this.getOption('columns'), tableClass: 'proposals', filter: 's', search: options.params && options.params.s, loading: true, 
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