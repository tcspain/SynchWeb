/**
 *  The sample list for XPDF proposals
 */

define(["marionette",
        "modules/samples/views/list",
        "views/table",
        "utils/table",
        "models/proposal",
        "modules/types/xpdf/samples/views/newemptysample",
        "tpl!templates/types/xpdf/samples/samplelist.html"
        ], function(Marionette,
        		SampleList,
        		TableView,
        		table,
        		Proposal,
        		newEmptySample,
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
				},
				
		events: {
			"click #new_sample": "newSample",
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
         },
         
         newSample: function() {
        	 // This page lists samples from all visits in this proposal. Get the most recent visit.
        	 var prop = new Proposal({PROPOSAL: app.prop});
        	 prop.fetch({
        		 success: function(model, response, options) {
        			 var visitString = prop.get("PROPOSAL")+"-"+prop.get("VCOUNT");
        			 console.log("New sample for visit "+visitString);
        			 newEmptySample.run(visitString);
        		 },
        		 error: function(model, response, options) {
        			 console.log("Could not get proposal data.");
        		 },
        	 });
         }
	});
	
	return module;
});