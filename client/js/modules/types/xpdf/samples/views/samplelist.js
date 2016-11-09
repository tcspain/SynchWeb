/**
 *  The sample list for XPDF proposals
 */

define(["marionette",
        "modules/samples/views/list",
        "views/table",
        "utils/table",
        "modules/types/xpdf/samples/views/newsampleview",
        "tpl!templates/types/xpdf/samples/samplelist.html"
        ], function(Marionette,
        		SampleList,
        		TableView,
        		table,
        		NewSampleView,
        		template) {
	
	  var ClickableRow = table.ClickableRow.extend({
		    event: 'samples:view',
		    argument: 'BLSAMPLEID',
		    cookie: true,
		  })
	
	var module = Marionette.LayoutView.extend({
		className: "content",
		template: template,
		regions: {
			wrap: ".wrapper",
			newsample: ".newsample"
				},
				
		filters:[],
				
		columns: [
		          { name: "NAME", label: "Name", cell: "string", editable: false},
		          { name: "ACRONYM", label: "ID", cell: "string", editable: false },
		          { name: "COMMENTS", label: "Comments", cell: "string", editable: false },
		          { name: "COMPOSITION", label: "Composition", cell: "string", editable: false },
		          { name: "DENSITY", label: "Density", cell: "string", editable: false},
		          ],
		
		 hiddenColumns: [],
		          
         initialize: function(options) {
        	 var self = this;

        	 // This is one hell of a table view
        	 this.sampleTable = new TableView( {
        		 collection: options.collection,
        		 columns: this.getOption("columns"),
        		 loading: true,
        		 backgrid: {
        			 row: ClickableRow, 
        			 emptyText: function() { return self.collection.fetched ? "No samples found" : "Retrieving samples"}
        		 },
        	 });
         },
         
         onRender: function() {
        	 this.wrap.show(this.sampleTable);
        	 this.newsample.show(new NewSampleView());
         }
	});
	
	return module;
});