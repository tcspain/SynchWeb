/**
 *  class defining the view for an XPDF phase (component)
 */
define(["marionette",
        "utils/editable",
        "collections/samples", // generic sample collection for now
        "modules/types/xpdf/samples/views/molecularmass",
        "modules/types/xpdf/samples/views/copyphaseview",
        "tpl!templates/types/xpdf/samples/phase.html",
        ], function(Marionette,
        		Editable,
        		Samples,
        		MolecularMassView,
        		CopyPhaseView,
        		template) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		showContainers: true,
		regions: {
//			cif: ".cif",
			samplesRegio: ".samples",
//			dc: ".datacollections",
//			containers: ".containers",
			molecularmass: ".molecularmass",
			copyPhaseRegio: ".copyphase",
		},
		
		events: {
            "click a.copyphase": "copyPhase",

		},
		
		initialize: function(options) {
			console.log("phaseview:initialize");
			Backbone.Validation.bind(this);

            // get all samples containing this phase
			this.samples = new Samples();
			this.samples.state.pageSize = 5;
			this.samples.queryParams.pid = this.model.get("PROTEINID");
			this.samples.fetch();
			
			// Data collections
			
			// Formula mass calculation
			this.model.set({"MOLECULARMASS" : 9001});
			
			// Crystallographic information: unit cell params, CIF files
			
		},
		
		onRender: function() {
			var self = this;
			var edit = new Editable({ model: this.model, el: this.$el });
			edit.create("NAME", "text");
			edit.create("ACRONYM", "text");
			edit.create("SEQUENCE", "text");
			edit.create("DENSITY", "text");
		
            // Prevent cyclic dependency
            var GetSampleView = require('modules/samples/views/getsampleview')
 
			this.samplesRegio.show(GetSampleView.SampleList.get(app.type, {collection: this.samples, noPageUrl:true, noFilterUrl: true, noSearchUrl: true}));

            this.molecularmass.show(new MolecularMassView({model: this.model}));
            
		},
		
		// Open a modal dialog to allow selection of a phase to copy details
		// from
		copyPhase: function() {
			console.log("phaseview:copyPhase");
			var copyPhaseView = new CopyPhaseView({ model: this.model });
			this.listenTo(copyPhaseView, "copyPhaseRegio:success", this.refreshPhase);
			app.dialog.show(copyPhaseView);
		},

		// Fetch the model and re-render the view
		refreshPhase: function() {
//			this.model.fetch();
			this.render();
		}
	});
});