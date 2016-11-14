/**
 *  class defining the view for an XPDF phase (component)
 */
define(["marionette",
        "utils/editable",
        "collections/samples", // generic sample collection for now
        "modules/types/xpdf/samples/views/molecularmass",
        "tpl!templates/types/xpdf/samples/phase.html",
        ], function(Marionette,
        		Editable,
        		Samples,
        		MolecularMassView,
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
		},
		
		events: {
			
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
			console.log("this.model.MOLECULARMASS is "+this.model.get("MOLECULARMASS"));
			this.model.set({"MOLECULARMASS" : 9001});
			console.log("this.model.MOLECULARMASS is "+this.model.get("MOLECULARMASS"));
			
			// Crystallographic information: unit cell params, CIF files
			
		},
		
		onRender: function() {
			console.log("phaseview:onRender");
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
		onAttach: function() {
			console.log("phaseview:onAttach");
		},
		onShow: function() {
			console.log("phaseview:onShow");
		},
		onDomRefresh: function() {
			console.log("phaseview:onDomRefresh");
		},
		onAddChild: function() {
			console.log("phaseview:onAddChild");
		},
		onDestroy: function() {
			console.log("phaseview:onDestroy");
		}
	});
});