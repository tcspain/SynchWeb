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
        "modules/types/xpdf/utils/phasecompositor",
        "modules/types/xpdf/utils/manglingeditable",
        "modules/types/xpdf/samples/views/newphaseview",
        "modules/types/xpdf/samples/views/phasetableview",
        "modules/types/xpdf/samples/views/createinstance",
        "modules/types/xpdf/samples/views/linkphaseview",
        "tpl!templates/types/xpdf/samples/sample.html",
        ], function(Marionette,
        		Editable,
        		DCCol,
        		GetDCView,
        		Phase,
        		PhaseCollection,
//        		TableView,
        		oldPhaseCompositor,
        		phaseCompositor,
        		Mangler,
        		NewPhaseView,
        		PhaseTableView,
        		CreateInstanceView,
        		LinkPhaseView,
        		template) {
	
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		regions: {
			history: '.history',
			makeInstance: ".makeinstance",
			xpdfContainer: ".xpdfcontainer",
//			density: ".density",
		},
		
		events: {
			"click a.gotosample": "goToSample",
		},
		
		modelEvents: {
			"sync" : "render",
		},
		
		initialize: function(options) {
			// bind the validation
			Backbone.Validation.bind(this);
			
			this.model.initialize(); // Is this a terrible idea?
			
			// Data collections for this sample, that is where the sample ID 
			// (sid) matches that of this sample
			this.dcs = new DCCol(null, { queryParams: {sid: this.model.get("BLSAMPLEID"), pp:5} });
			this.dcs.fetch();
			
			this.phaseCollection = new PhaseCollection();
			this.model.set({"COMPOSITION": "N/A"});
			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
			
		},

		onBeforeRender: function() {
			/*string*/var truDensity = "";
			if (this.model.has("THEORETICALDENSITY") && this.model.has("PACKINGFRACTION")) {
				/*double*/var theoreticalDensity = Number.parseFloat(this.model.get("THEORETICALDENSITY"));
				/*double*/var packingFraction = Number.parseFloat(this.model.get("PACKINGFRACTION"));
				
				if (theoreticalDensity > 0.0 && packingFraction >= 0.0 && packingFraction <= 1.0) {
					/*double*/nTruDensity = theoreticalDensity*packingFraction;
					truDensity = nTruDensity.toLocaleString({}, {maximumFractionalDigits: 3});
				} 
			}
			this.model.set({"EXPERIMENTALDENSITY": truDensity});

			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
			
		},
		
		onRender: function() {
			var self = this;
			// Create the editable fields
			// Name
			// Comment
			// Code
			// Packing fraction
			var edit = new Editable( { model: this.model, el: this.$el });
			edit.create("NAME", "text");
			edit.create("COMMENTS", "text");
			edit.create("CODE", "text");
			edit.create("PACKINGFRACTION", "text");

			var mangler = new Mangler({model: this.model, el: this.$el});
			mangler.create("UNMANGLEDNAME", "NAME", / /g, "__");
			
			// Show the Data Collections in the history region
			this.history.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true}));
			
			// Get the models for all the phases, more or less in parallel
			this.getAllPhases(this.drawPhaseTable);
			
			// Show the add phases hidden form in the "newphase" region
//			this.newphase.show(new NewPhaseView({"CRYSTALID" : this.model.get("CRYSTALID")}));
			
//			var DensityView = Marionette.ItemView.extend({
//				template:"<span class=\"density\">N/A</span>",
//			});
//			
//			// Display the calculated density
//			this.density.show(new DensityView);
			
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
//			self.phases.show(new PhaseTableView({ collection: self.phaseCollection, loading: true, sampleId: self.model.get("BLSAMPLEID"), sample: self.model}));
			// We also want to update the composition once we have the
			// collection of phases:
			// Calculate the total density and composition, and display
			self.updateDensityComposition(true, true);

		},

		// Get all the phases into the phase collection, and then do something.
		// The something is successFunction, which takes one argument, intended
		// to be a pointer to this view.
		getAllPhases: function(successFunction) {
			// Get the IDs of the primary phase and all secondary components
			var primaryID = this.model.get("PROTEINID");
			var primaryAbundance = this.model.get("ABUNDANCE");
			var phaseIDs;
			var self = this;

			this.abundanceArray = [];

			this.model.updateComponentIds();
//			phaseIDs = this.model.get("COMPONENTIDS").slice();
			phaseIDs = this.model.get("components").pluck("PROTEINID");
			this.abundanceArray = this.model.get("components").pluck("ABUNDANCE");
			// Add the primary phase to the front of the list
			phaseIDs.unshift(primaryID);
			this.abundanceArray.unshift(primaryAbundance);
			
			// Make the map between PROTEINID and abundance in this sample
			this.abundanceMap = this.makeAbundanceMap(this.model); 
			
			this.phaseCollection = new PhaseCollection();
			// For each ID, fetch the data, and add to the phase collection
			_.each(phaseIDs, function(element, index, list) {
				var phase = new Phase({PROTEINID: element});
				phase.fetch({
					success: function() {
						self.phaseCollection.add(phase, {at: index});
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
//		showInstance: function() {
//			var makeInstanceView = new CreateInstanceView({model: this.model});
//			app.dialog.show(makeInstanceView);
//		},
		
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
					var oldDensity = this.model.get("THEORETICALDENSITY");
//					var density = oldPhaseCompositor.densityComposite(this.phaseCollection);
					var density = phaseCompositor.composeDensity(this.phaseCollection, this.abundanceArray);
					var roundedDensity = density;
					if (oldDensity != roundedDensity) {
						this.model.set("THEORETICALDENSITY", roundedDensity);
						this.model.save();
						isChanged = true;
					}
				}
				if (doComposition) {
					var oldComposition = this.model.get("COMPOSITION");
//					var composition = oldPhaseCompositor.compositionComposite(this.phaseCollection, this.abundanceMap);
					var composition = phaseCompositor.composeComposition(this.phaseCollection, this.abundanceArray, true);
					if (oldComposition != composition) {
						this.model.set({"COMPOSITION": composition});
						isChanged = true;
					}
				}
				if (isChanged) this.render();
			}
		},
		
//		// Link a pre-existing phase to this sample, selected from a modal dialog
//		linkPhase: function() {
//			var linkPhaseView = new LinkPhaseView({ model: this.model});
//			app.dialog.show(linkPhaseView);
//		},

		goToSample: function(e) {
			e.preventDefault();
			app.trigger("crystals:view", this.model.get("CRYSTALID"));
		},
	});
});