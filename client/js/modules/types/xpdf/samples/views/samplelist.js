/**
 *  The sample list for XPDF proposals
 */

define(["marionette",
        "modules/samples/views/list",
        "views/table",
        "utils/table",
        "models/proposal",
        "modules/types/xpdf/samples/views/newsample",
        "modules/types/xpdf/samples/views/samplelisttableview",
        "tpl!templates/types/xpdf/samples/samplelist.html"
        ], function(Marionette,
        		SampleList,
        		TableView,
        		table,
        		Proposal,
        		newEmptySample,
        		SampleListTableView,
        		template) {
	
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
		
		/*
		 * options:
		 * options.collection: the collection of samples to show in the list
		 * options.phaseId: an optional argument to select a phase. This will
		 * result in the abundance of the given phase in each sample being
		 * shown.
		 * options.noButton: do not display the "+ New Sample" button.
		 * options.hideNewInstance: hide the "Create new instance" column
		 */				
         initialize: function(options) {
        	 
        	 this.collection = options.collection;
        	 if (_.contains(options, "phaseId"))
        		 this.phaseId = options["phaseId"];
        	 else
        		 this.phaseId = "None";
        	 
        	 if (options["row"] !== undefined) {
        		 this.row = options["row"];
        	 } else {
        		 this.row = table.ClickableRow.extend({
        				event: 'samples:view',
        				argument: 'BLSAMPLEID',
        				cookie: true,
        			});
        	 }
        	 
        	 if (options["noButton"]) {
        		 this.template = _.template("<h1>Samples</h1>\n<p class=\"help\">This page shows sample associated with the currently selected XPDF proposal</p>\n<div class=\"filter type\"></div>\n<div class=\"wrapper\"></div>");
        	 }
        	 
        	 if (options["hideNewInstance"])
        		 this.hideNewInstance = true;
        	 else
        		 this.hideNewInstance = false;
        	 
         },
         
         onRender: function() {
        	 this.wrap.show(new SampleListTableView({collection: this.collection, phaseId: this.phaseId, row: this.row, hideNewInstance: this.hideNewInstance}));
        		 
         },
       
         newSample: function() {
        	 // This page lists samples from all visits in this proposal. Get the most recent visit.
        	 var prop = new Proposal({PROPOSAL: app.prop});
        	 prop.fetch({
        		 success: function(model, response, options) {
        			 var visitString = prop.get("PROPOSAL")+"-"+prop.get("VCOUNT");
        			 newEmptySample.run({"visitId": visitString});
        		 },
        		 error: function(model, response, options) {
        			 console.log("Could not get proposal data.");
        		 },
        	 });
         }
	});
	
	return module;
});