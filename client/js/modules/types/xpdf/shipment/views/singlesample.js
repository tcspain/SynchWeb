/*
 * Details of a single sample for XPDF experiments. A very cut-down copy of the samples:sample view
 */
define([
        "marionette",
        "models/sample",
        "models/protein",
        "collections/proteins",
        "modules/types/xpdf/shipment/views/instancedialog",
        "views/table",
        "utils/table",
        "tpl!templates/types/xpdf/shipment/singlesample.html"
        ], function(
        		Marionette,
        		Sample,
        		Phase,
        		PhaseCollection,
        		InstanceDialog,
        		TableView,
        		table,
        		template
        ) {
	
	var AbundanceCell = table.TemplateCell.extend({
		getTemplate: function() {
			var abundance = this.abundanceMap[this.model.get("PROTEINID")];
			if (Number.isNaN(Number.parseFloat(abundance)))
					abundance = "-";
						
			return "<div class=\"abundance editable "+this.model.get("PROTEINID")+"\">"+abundance+"</div>";
		},
	});


	var PhaseTableView = TableView.extend({
		
		initialize: function(options) {
			var abundanceMap = makeAbundanceMap(options.sample);
			
			this.columns = [
			                {name: "NAME", label: "Name", cell: "string", editable: false},
			                {name: "SEQUENCE", label: "Composition", cell: "string", editable: false},
			                {name: "ABUNDANCE", label: "Fraction", cell: AbundanceCell.extend({sampleId: options.sampleId, sample: options.sample, abundanceMap: abundanceMap}), editable: false},
			                ];
			TableView.prototype.initialize.apply(this, [options]);
			
		},
		
	});
	
	// make a map between the phase IDs and the abundance in the sample
	var makeAbundanceMap = function(sample) {
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
	};
	
	return Marionette.LayoutView.extend({
		className: "single",
		template: template,
		
		regions: {
			phases: ".phases",
		},
		
		events: {
			"click a.selectinstance": "openDialog",
		},
		
		/*
		 * initialize options
		 * samples: A list of all the samples the user will be able to choose from
		 * sample: The sample defined in the container already
		 */
		initialize: function(options) {
			// Samples the user can choose from
			this.samples = options.samples;
			// the sample described, if present
			this.model = (_.has(options, "sample")) ? 
					options.sample :
						new Sample();
			
			this.model.set({"COMPOSITION": "N/A"});

			this.listenTo(this.model, "select:success", this.refreshSample);
			
			// The sample is not being edited, so get the phases on 
			// initialization (also change, but that is not done here).
			// Get the models for all the phases, asynchronously
//			this.getAllPhases(this.drawPhaseTable); // Too much recursion

		},
		
		onRender: function() {
			var self = this;
			this.getAllPhases({success: this.drawPhaseTable});
			
		},
		
		drawPhaseTable: function(self) {
			self.phases.show(new PhaseTableView({collection: self.phaseCollection, sample: self.model}));
			
		},
		
		getAllPhases: function(phaseOptions) {
			var primaryId = this.model.get("PROTEINID");
			var phaseIds;
			var self = this;
			
			this.model.updateComponentIds();
			phaseIds = this.model.get("COMPONENTIDS").slice();
			// Add the primary phase ID to the front of the list
			phaseIds.unshift(primaryId);
			
			// Make the map between phase ID and abundance in this sample
			this.abundanceMap = makeAbundanceMap(this.model);
			this.phaseCollection = new PhaseCollection();
			// For each Id get the composition 
			_.each(phaseIds, function(element, index, list) {
				var phase = new Phase({PROTEINID: element});
				phase.fetch({
					success: function(model, response, options) {
						self.phaseCollection.add(phase);
						// If all the phases have been collected, run the success function
						if (self.phaseCollection.length == list.length) {
							phaseOptions.success(self);
						}
					},
					error: function() {
						console.log("Could not get phase information for "+element);
					}
				});
			}, {});
		},
		
		// open the instance selection dialog to change the instance 
		openDialog: function() {
			var instanceSelectView = new InstanceDialog({model: this.model, onSuccess: this.onSelect});
			app.dialog.show(instanceSelectView);
		},
		
		// copy the details of the selected phase to the holding phase
		onSelect: function(targetModel, selectedModel) {
			targetModel.set({
				"BLSAMPLEID" : selectedModel.get("BLSAMPLEID"),
				"PROTEINID": selectedModel.get("PROTEINID"),
				"ABUNDANCE": selectedModel.get("ABUNDANCE"),
				"NAME": selectedModel.get("NAME"),
				"ACRONYM": selectedModel.get("ACRONYM"),
				"COMMENTS": selectedModel.get("COMMENTS"),
				"components": selectedModel.get("components")
			});
			targetModel.trigger("select:success");
		},
		
		refreshSample: function() {
			console.log("Refreshing sample!");
			this.render();
		},
	});
});