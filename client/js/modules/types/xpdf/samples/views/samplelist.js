/**
 *  The sample list for XPDF proposals
 */

define(["marionette",
	"backgrid",
	"modules/samples/views/list",
	"views/table",
	"utils/table",
	"views/dialog",
	"models/proposal",
	"collections/crystals",
	"modules/types/xpdf/samples/views/newsample",
	"modules/types/xpdf/samples/views/samplelisttableview",
	"modules/types/xpdf/samples/views/crystalsamplelist",
	"modules/types/xpdf/samples/views/instancedialog",
	"tpl!templates/types/xpdf/samples/samplelist.html"
	], function(Marionette,
			Backgrid,
			InstanceList,
			TableView,
			table,
			DialogView,
			Proposal,
			Samples,
			newEmptySample,
			InstanceListTableView,
			XSampleList,
			InstanceDialog,
			template) {
	
	var module = Marionette.LayoutView.extend({
		className: "content",
		template: template,
		regions: {
			wrap: ".wrapper",
				},
				
		events: {
			"click a.new_sample": "newInstance",
		},
				
		filters:[],
		
		/*
		 * options:
		 * options.collection: the collection of instances to show in the list
		 * options.phaseId: an optional argument to select a phase. This will
		 * result in the abundance of the given phase in each sample being
		 * shown.
		 * options.noButton: do not display the "+ New Instance" button.
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
        		 this.template = _.template("<h1>Instances</h1>\n<p class=\"help\">This page shows instances associated with the currently selected XPDF proposal</p>\n<div class=\"filter type\"></div>\n<div class=\"wrapper\"></div>");
        	 }
        	 
        	 if (options["hideNewInstance"])
        		 this.hideNewInstance = true;
        	 else
        		 this.hideNewInstance = false;
        	 
         },
         
         onRender: function() {
        	 this.wrap.show(new InstanceListTableView({collection: this.collection, phaseId: this.phaseId, row: this.row, hideNewInstance: this.hideNewInstance}));
        		 
         },
       
         newInstance: function(e) {
        	 e.preventDefault();
        	 console.log("New Instance button!");
        	 
        	 app.dialog.show(new SampleDialog({
        		 success: function(sample) {
        			 app.trigger("instance:create", sample.get("CRYSTALID"));
        		 },
        		 error: function(model, response, options) {
        			 console.log("Could not get proposal data.");
        		 },
        		 
        	 }));
         },
	});
	
	
	
	// Dialog to choose a new sample to instatiate
	var SampleDialog = DialogView.extend({
		template: "<div class=\"form\">" + 
			"<div class=\"samplelist\"></div>" + 
			"</div>",
		className: "sampledialog",
		title: "Select a sample to instantiate",
		
		regions: {
			sampleList: ".samplelist",
		},
		
		//
		// options:
		// options.success: the callback function to use when a sample has been
		// 		successfully selected: function(targetModel, selectedModel). 
		initialize: function(options) {
			var viewRegion = this.sampleList;
			
			var self = this;
			
			var row = Backgrid.Row.extend({
				events: {
					"click": "onClick",
				},
				
				onClick: function(event) {
					self.doSelect(this.model);
				},
			});
			
			var samples = new Samples();
			samples.fetch({
				success: function(collection, response, options) {
					viewRegion.show(new XSampleList({collection: collection, row: row, hideButton: true}));
				},
				error: function(collection, reponse, options) {
					console.log("InstanceList.SampleDialog.samples.fetch: error fetching samples" + response);
				},
			});
			
			this.success = options.success;
			this.error = options.error;
		},
		
		doSelect: function(sample) {
			this.closeDialog();
			this.success(sample);
		},
	});

	
	return module;

});