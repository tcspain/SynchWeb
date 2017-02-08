/**
 * The "Add Container" view for XPDF experiments 
 */

define([
        "marionette",
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
		success: function() {
			var self = this;
			
			// Save the new CONTAINERID and the assigned position in the container
			this.samples.each(function(s) {
				s.set({CONTAINERID: this.model.get("CONTAINERID")}, {silent: true}, this);
				s.save({
					CONTAINERID: this.model.get("CONTAINERID"),
					LOCATION: s.get("LOCATION"),
				}, {patch: true});
			});
			
			
		}
	});
});