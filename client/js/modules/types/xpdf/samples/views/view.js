/**
 *  The Sample view class for XPDF proposals
 */

define(["marionette",
        "utils/editable",
        "collections/datacollections",
        "modules/dc/views/getdcview",
        "collections/phasecollection",
        "modules/types/xpdf/samples/views/proteinlist",
        "tpl!templates/types/xpdf/sample.html"
        ], function(Marionette,
        		Editable,
        		DCCol,
        		GetDCView,
        		PhaseCollection,
        		PhaseView,
        		template) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			history: '.history',
			phases: ".phases",
		},
		
		initialize: function(options) {
			// bind the validation
			// Backbone.Validation.bind(this);
			
			// Data collections for this sample, that is where the sample ID 
			// (sid) mathches that of this sample
			this.dcs = new DCCol(null, { queryParams: {sid: this.model.get("BLSAMPLEID"), pp:5} });
			this.dcs.fetch();
			
			this.phaseCollection = new PhaseCollection();
			this.phaseCollection.fetch();
			
		},
		
		onRender: function() {
			// Create the editable fields
			// Name
			// Comment
			// Code
			var edit = new Editable( { model: this.model, el: this.$el });
			edit.create("NAME", "text");
			edit.create("COMMENTS", "text");
			edit.create("CODE", "text");
			
			// Show the Data Collections in the history region
			this.history.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true}));
			
			// Show the phases in the "phases" region
			this.phases.show(new PhaseView({ model: this.model, collection: this.phaseCollection}));
		}
		
	});
});