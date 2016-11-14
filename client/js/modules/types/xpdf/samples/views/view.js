/**
 *  The Sample view class for XPDF proposals
 */

define(["marionette",
        "utils/editable",
        "collections/datacollections",
        "modules/dc/views/getdcview",
        "models/protein",
        "collections/proteins", /*"collections/phasecollection",*/
//        "views/table",
        "utils/phasecompositor",
        "modules/types/xpdf/samples/views/newphaseview",
        "modules/types/xpdf/samples/views/phasetableview",
        "tpl!templates/types/xpdf/samples/sample.html",
        ], function(Marionette,
        		Editable,
        		DCCol,
        		GetDCView,
        		Phase,
        		PhaseCollection,
//        		TableView,
        		phaseCompositor,
        		NewPhaseView,
        		PhaseTableView,
        		template) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			history: '.history',
			phases: ".phases",
			newphase: ".newphase",
		},
		
		initialize: function(options) {
			// bind the validation
			Backbone.Validation.bind(this);
			
			// Data collections for this sample, that is where the sample ID 
			// (sid) mathches that of this sample
			this.dcs = new DCCol(null, { queryParams: {sid: this.model.get("BLSAMPLEID"), pp:5} });
			this.dcs.fetch();
			
			this.phaseCollection = new PhaseCollection();
			
//			this.phaseCollection.fetch(null, {queryParams: {sid: this.model.get("BLSAMPLEID"), pp:5} });

			// Calculate the total density and composition, and display
//			this.updateDensityComposition();
		},
		
		onRender: function() {
			var self = this;
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
//			this.phases.show(new PhaseView({ model: this.model, collection: this.phaseCollection}));

			var primaryPhase = new Phase({PROTEINID: this.model.get("PROTEINID")});
			primaryPhase.fetch({
				success: function() {
					self.phaseCollection.add(primaryPhase);
					self.phaseCollection.add(self.model.get("Components"));
					self.drawPhaseTable();
				},
				error: function() {
					console.log("Could not get primary phase for "+self.model.get("BLSAMPLEID"));
				},
			});
			
			// Show the add phases hidden form in the "newphase" region
			this.newphase.show(new NewPhaseView());
			
		},
		
		drawPhaseTable: function() {
//			var phaseColumns = [
//			                    {name: "PROTEINID", label: "Code", cell: "string", editable: false},
//			                    {name: "NAME", label: "Name", cell: "string", editable: false},
//			        			{name: "ACRONYM", label: "Identifier", cell: "string", editable: false},
//			        			{name: "MOLECULARMASS", label: "Molecular Mass", cell: "string", editable: false},
//			        			{name: "COMPOSITION", label: "Composition", cell: "string", editable: false},
////			        			{name: "XDENSITY", label: "Crys. Density", cell: "string", editable: false},
//			        			{name: "ABUNDANCE", label: "Fraction", cell: "string", editable: false},
//			                    ];
			
			this.phases.show(new PhaseTableView({ collection: this.phaseCollection, loading: true}));
		},
		
		
		updateDensityComposition: function() {
			if (this.phaseCollection.length > 0) { 
				var density = phaseCompositor.densityComposite(this.phaseCollection);
				var roundedDensity = this.roundXdp(density, 2);
				this.model.set("XDENSITY", roundedDensity);
			
				var composition = phaseCompositor.compositionComposite(this.phaseCollection);
				this.model.set("COMPOSITION", composition);
			}
		},
		
		/*
		 * Naive method of rounding to a set number of decimal places (not 
		 * significant figures).
		 */
		roundXdp: function(value, dp) {
			var dpp = Math.max(0, dp);
			var scaling = Math.pow(10, dpp);
			return Math.round(value*scaling)/scaling;
		}
	});
});