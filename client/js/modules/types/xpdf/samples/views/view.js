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
			
			this.model.initialize(); // This is a terrible idea?
			
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

			// Get the models for all the phases, more or less in parallel
			this.getAllPhases(this.drawPhaseTable);
			
//			var primaryPhase = new Phase({PROTEINID: this.model.get("PROTEINID")});
//			primaryPhase.fetch({
//				success: function() {
//					self.phaseCollection.add(primaryPhase);
//					self.phaseCollection.add(self.model.get("Components"));
//					self.drawPhaseTable();
//				},
//				error: function() {
//					console.log("Could not get primary phase for "+self.model.get("BLSAMPLEID"));
//				},
//			});
			
			// Show the add phases hidden form in the "newphase" region
			this.newphase.show(new NewPhaseView({"CRYSTALID" : this.model.get("CRYSTALID")}));
			
		},
		
		drawPhaseTable: function(self) {
			console.log("Drawing phase table");
			self.phases.show(new PhaseTableView({ collection: self.phaseCollection, loading: true}));
		},
		
		getAllPhases: function(successFunction) {
			// Get the IDs of the primary phase and all secondary components
			var primaryID = this.model.get("PROTEINID");
			var phaseIDs;
			var self = this;
			
			this.model.updateComponentIds();
			phaseIDs = this.model.get("COMPONENTIDS");
			
			phaseIDs.unshift(primaryID);
			console.log("Found "+phaseIDs.length+" components");
			
			// For each ID, fetch the data, and add to the phase collection
			_.each(phaseIDs, function(element, index, list) {
				var phase = new Phase({PROTEINID: element});
				phase.fetch({
					success: function() {
						self.phaseCollection.add(phase);
						if (self.phaseCollection.length == list.length) {
							console.log("Success! Found all phases");
							successFunction(self);
						}
						console.log("Would add phase "+element+" to the phase table for sample "+self.model.get("BLSAMPLEID"));
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