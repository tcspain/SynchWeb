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
        "modules/types/xpdf/samples/views/createinstance",
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
        		CreateInstanceView,
        		template) {
	
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			history: '.history',
			phases: ".phases",
			newphase: ".newphase",
			makeInstance: ".makeinstance",
			xpdfContainer: ".xpdfcontainer",
		},
		
		events: {
			"click a.makeinstance": "showInstance",
		},
		
		modelEvents: {
			"sync" : "render",
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
			this.model.set({"COMPOSITION": "N/A"});
			
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
			
			// The instance information
			var sampleComment = this.model.get("COMMENT"); 
			if (!(new Boolean(sampleComment)) && sampleComment.includes("INSTANCE")) {
				this.xpdfContainer.show(new Marionette.LayoutView.extend({
					template:"<span class=\"thecontainer\">xx mm capillary</span>",
				}));
			}
			
		},
		
		// draw the table of all contained phases
		drawPhaseTable: function(self) {
			self.phases.show(new PhaseTableView({ collection: self.phaseCollection, loading: true, sampleId: self.model.get("BLSAMPLEID"), sample: self.model}));
			// We also want to update the composition once we have the
			// collection of phases:
			// Calculate the total density and composition, and display
			self.updateDensityComposition(false, true);

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
			phaseIDs = this.model.get("COMPONENTIDS").slice();
	        // Add the primary phase to the front of the list
			phaseIDs.unshift(primaryID);
			
			// Make the map between PROTEINID and abundance in this sample
			this.abundanceMap = this.makeAbundanceMap(this.model); 
			
			this.phaseCollection = new PhaseCollection();
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
		
		// Based on whether the ISPyB Sample is an XPDF instance, showing the 
		// details of the container if it is, and the button to select the 
		// container if it is not.
		// Currently, an instance has the word INSTANCE in its comment
		showInstance: function() {
			var makeInstanceView = new CreateInstanceView({model: this.model});
			app.dialog.show(makeInstanceView);
		},
		
		makeAbundanceMap: function(sample) {
        	var aMap = {};
        	var key;
        	var abundance;
        	// primary
        	key = sample.get("PROTEINID");
        	abundance = sample.get("ABUNDANCE");
        	aMap[key] = abundance;
        	
        	// components
        	var nComponents = sample.get("COMPONENTIDS").length;
        	for (i=0; i < nComponents; i++) {
        		key = sample.get("COMPONENTIDS")[i];
        		abundance = sample.get("COMPONENTAMOUNTS")[i];
        		aMap[key] = abundance;
        	}
        	
        	return aMap;
        },
		
		updateDensityComposition: function(doDensity, doComposition) {
			var isChanged = false;
			if (this.phaseCollection.length > 0) { 
				if (doDensity) {
					var oldDensity = this.model.get("XDENSITY");
					var density = phaseCompositor.densityComposite(this.phaseCollection);
					var roundedDensity = this.roundXdp(density, 2);
					if (oldDensity != roundedDensity) {
						this.model.set("XDENSITY", roundedDensity);
						isChanged = true;
					}
				}
				if (doComposition) {
					var oldComposition = this.model.get("COMPOSITION");
					var composition = phaseCompositor.compositionComposite(this.phaseCollection, this.abundanceMap);
					if (oldComposition != composition) {
						this.model.set({"COMPOSITION": composition});
						isChanged = true;
					}
				}
				if (isChanged) this.render();
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