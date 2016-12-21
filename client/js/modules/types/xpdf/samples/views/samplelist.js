/**
 *  The sample list for XPDF proposals
 */

define(["marionette",
        "modules/samples/views/list",
        "views/table",
        "utils/table",
        "models/proposal",
        "modules/types/xpdf/samples/views/newemptysample",
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
		 * options.phaseId; An optional argument to selecta phase. This will
		 * result in the abundance of the given phase in each sample being
		 * shown.
		 */				
         initialize: function(options) {
        	 this.collection = options.collection;
        	 if (_.contains(options, "phaseId"))
        		 this.phaseId = options["phaseId"];
        	 else
        		 this.phaseId = "None";
         },
         
         onRender: function() {
        	 this.wrap.show(new SampleListTableView({collection: this.collection, phaseId: this.phaseId}))
         },
         
         newSample: function() {
        	 // This page lists samples from all visits in this proposal. Get the most recent visit.
        	 var prop = new Proposal({PROPOSAL: app.prop});
        	 prop.fetch({
        		 success: function(model, response, options) {
        			 var visitString = prop.get("PROPOSAL")+"-"+prop.get("VCOUNT");
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