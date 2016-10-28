/**
 *  class defining the view for an XPDF phase (component)
 */
define(["marionette",
        "utils/editable",
        "collections/samples", // generic sample collection for now
        "tpl!templates/types/xpdf/phase.html",
        ], function(Marionette,
        		Editable,
        		Samples,
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
		},
		
		events: {
			
		},
		
		initialize: function(options) {
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
			edit.create("ACRONYM", "text");
			edit.create("COMPOSITION", "text");
			edit.create("DENSITY", "text");
		
            // Prevent cyclic dependency
            var GetSampleView = require('modules/samples/views/getsampleview')
 
			this.samplesRegio.show(GetSampleView.SampleList.get(app.type, {collection: this.samples, noPageUrl:true, noFilterUrl: true, noSearchUrl: true}));

		},
	})
});