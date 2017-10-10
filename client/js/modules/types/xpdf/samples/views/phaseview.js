/**
 *  class defining the view for an XPDF phase (component)
 */
define(["marionette",
        "utils/editable",
        "collections/crystals",
        "modules/types/xpdf/samples/views/molecularmass",
        "modules/types/xpdf/samples/views/copyphaseview",
        "modules/types/xpdf/samples/views/addcif",
        "modules/types/xpdf/samples/views/crystalsamplelist",
        "tpl!templates/types/xpdf/samples/phase.html",
        ], function(Marionette,
        		Editable,
        		Samples,
        		MolecularMassView,
        		CopyPhaseView,
        		AddCIFView,
        		SampleList,
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
            "click a.addcif": "addCIF",

		},
		
		modelEvents: {
			"sync" : "render",
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
			
			// Crystallographic information: unit cell params, CIF files
			
		},
		
		onRender: function() {
			var self = this;
			var edit = new Editable({ model: this.model, el: this.$el });
			edit.create("NAME", "text");
//			edit.create("ACRONYM", "text");
			edit.create("SEQUENCE", "text");
			edit.create("DENSITY", "text");
		
			this.samplesRegio.show(new SampleList({collection: this.samples, noPageUrl:true, noFilterUrl: true, noSearchUrl: true, hideButton: true, }));

            this.molecularmass.show(new MolecularMassView({model: this.model}));
            
		},
		
		// Open a modal dialog to allow selection of a phase to copy details
		// from
		copyPhase: function() {
			var copyPhaseView = new CopyPhaseView({ model: this.model, onSuccess: this.refreshPhase });
			app.dialog.show(copyPhaseView);
		},
		
		// Open a modal dialog to allow selection of a CIF to associate with
		// the phase
		addCIF: function() {
			var view = new AddCIFView({pid: this.model.get("PROTEINID")});
			this.listenTo(view, "pdb:success", this.getCIFs);
			app.dialog.show(view);
		},
		
		getCIFs: function() {
			this.pdbs.fetch();
		},
		
		// Fetch the model and re-render the view
		refreshPhase: function() {
			this.model.fetch();
		}
	});
});