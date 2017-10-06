/**
 * The "Add Container" view for XPDF experiments 
 */

define([
        "marionette",
        "models/sample",
        "collections/samples",
        "modules/shipment/views/containeradd",
        "modules/types/xpdf/shipment/views/instancetable",
        'modules/shipment/views/plate',
//        'modules/shipment/views/singlesample',
        "modules/types/xpdf/shipment/views/singlesample",
        "modules/types/xpdf/shipment/collections/stagetypes",
        "modules/imaging/views/screencomponentgroup",
        "tpl!templates/types/xpdf/shipment/stageadd.html",
//        'tpl!templates/shipment/sampletablenew.html',
//        'tpl!templates/shipment/sampletablerownew.html'
        ], function(
        		Marionette,
        		Sample,
        		Samples,
        		GenericContainerAdd,
        		InstanceTableView,
        	    PlateView,
        	    SingleSample,
        	    XpdfStageTypes,
        	    ScreenGroupView,
        	    template//,
//        		table,
//        		row
        ) {
	return GenericContainerAdd.extend({
		template: template,		
		
		// Override the plate types with the XPDF sample stages
		initialize: function(options) {
			GenericContainerAdd.prototype.initialize.apply(this, [options]);
			this.ctypes = XpdfStageTypes;
		},
		
		// Override the setType function with XPDF specific gubbins
		setType: function(e) {
			this.type = this.ctypes.findWhere({name: this.ui.type.val()});
			this.type.set({isSelected: true});
			this.model.set({
				CAPACITY: this.type.get("capacity"),
				CONTAINERTYPE: this.type.get("name"),
			});
			
			// Show type-specific elements
			// Treat sample changers seperately from single samples
			if (this.type.get("capacity") > 1) {
				this.puck.$el.css("width", app.mobile() ? "100%" : "50%");
	            this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
	            this.buildCollection();
  				this.stable = new InstanceTableView({collection: this.samples});
	            this.table.show(this.stable);
                this.single.empty();
                this.ui.pc.show()
			} else {
				this.puck.$el.css("width", app.mobile() ? "50%" : "25%");
				this.puck.empty();
                this.table.empty();
                this.buildCollection();
                if (typeof this.stable != "undefined") this.stable.destroy();
                this.singlesample = new SingleSample({ proteins: this.proteins, gproteins: this.gproteins, platetypes: this.ctypes, samples: this.samples });
                this.single.show(this.singlesample);
                this.ui.pc.hide()

			}
			
			// define the group before building the collection 
            this.group = new ScreenGroupView({ components: this.screencomponents, editable: false });
            this.grp.empty();
            this.$el.find('li.plate').show()
            this.$el.find('li.pcr').hide()

		},
		
		selectSample: function() {
		},
		
		// The callback for a successful save of the container to the database
		success: function(model, response, options) {
			var self = this;
			
			var validSamples = new Samples(this.samples.filter(function(sample) {return sample.get("BLSAMPLEID") > 0}));
			console.log("Ready to put "+validSamples.length+" samples into container "+model.get("CONTAINERID"));
			
			if (validSamples.length > 0) console.log("id attribute is "+validSamples.at(0).idAttribute);

			// Save the new CONTAINERID and the assigned position in the container
			validSamples.each(function(s) {
				s.set({CONTAINERID: model.get("CONTAINERID")}, {silent: true}, this);
			});
			
			validSamples.each(function(s) {
				if (s.get("BLSAMPLEID") > 0) {
					var ss = new Sample();
					ss.set({
						BLSAMPLEID: s.get("BLSAMPLEID"),
						CONTAINERID: model.get("CONTAINERID"),
						LOCATION: s.get("LOCATION"),
						});
					ss.save({
						CONTAINERID: model.get("CONTAINERID"),
						LOCATION: s.get("LOCATION"),
					}, {patch: true,
						success: function(model, response, options) {
							console.log("Sample "+model.get("BLSAMPLEID")+"successfully saved to container"+model.get("CONTAINERID")+" at position "+model.get("LOCATION"));
						},
						error: function(model, response, options) {
							console.log("Failed to save sample into container because reasons");
						}
					});
				}
			});

			app.trigger("container:show", model.get("CONTAINERID"));

		},
	});
});