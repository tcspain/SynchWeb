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
			
			this.model.initialize(); // Is this a terrible idea?
			
			// Data collections for this sample, that is where the sample ID 
			// (sid) mathches that of this sample
			this.dcs = new DCCol(null, { queryParams: {sid: this.model.get("BLSAMPLEID"), pp:5} });
			this.dcs.fetch();
			
			this.phaseCollection = new PhaseCollection();
			
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
			
			// Get the models for all the phases, more or less in parallel
			this.getAllPhases(this.drawPhaseTable);
			
			// Show the add phases hidden form in the "newphase" region
			this.newphase.show(new NewPhaseView({"CRYSTALID" : this.model.get("CRYSTALID")}));
			
		},
		
		// draw the table of all contained phases
		drawPhaseTable: function(self) {
			self.phases.show(new PhaseTableView({ collection: self.phaseCollection, loading: true, sampleId: self.model.get("BLSAMPLEID")}));
		},

		// Get all the phases into the phase collection, and then do something.
		// The something is successFunction, which takes one argument, intended
		// to be a pointer to this view.
		getAllPhases: function(successFunction) {
			// Get the IDs of the primary phase and all secondary components
			var primaryID = this.model.get("PROTEINID");
			var phaseIDs;
			var self = this;
			
			this.model.updateComponentIds();
			phaseIDs = this.model.get("COMPONENTIDS");
			
			// Add the primary phase to the front of the list
			phaseIDs.unshift(primaryID);
			
			// For each ID, fetch the data, and add to the phase collection
			_.each(phaseIDs, function(element, index, list) {
				var phase = new Phase({PROTEINID: element});
				phase.fetch({
					success: function() {
						self.phaseCollection.add(phase);
						// if the number of collected phases is equal to the
						// number desired, fire the success function
						if (self.phaseCollection.length == list.length) {
							successFunction(self);
						}
					},
					error: function() {
						console.log("Could not get phase information for "+element);
					}
				});
			}, {});
			
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