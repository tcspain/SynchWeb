/**
 * The "Add Container" view for XPDF experiments 
 */

define([
        "marionette",
        "modules/shipment/views/containeradd",
        'modules/shipment/views/sampletable',
        'modules/shipment/views/plate',
        'modules/shipment/views/singlesample',
        "modules/types/xpdf/shipment/collections/stagetypes",
        "tpl!templates/types/xpdf/shipment/stageadd.html",
        'tpl!templates/shipment/sampletablenew.html',
        'tpl!templates/shipment/sampletablerownew.html'
        ], function(
        		Marionette,
        		GenericContainerAdd,
        	    SampleTableView,
        	    PlateView,
        	    SingleSample,
        	    XpdfStageTypes,
        		template,
        		table,
        		row
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
			console.log("Set XPDF stage type!");
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
				this.stable = new SampleTableView({ proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table, type: 'non-xtal' });
                this.table.show(this.stable);
                this.singlesample = new SingleSample({ proteins: this.proteins, gproteins: this.gproteins, platetypes: this.ctypes, samples: this.samples });
//                this.single.show(this.singlesample);
                this.single.empty()
                this.ui.pc.show()
			} else {
				this.puck.$el.css("width", app.mobile() ? "50%" : "25%");
                this.table.empty()
                if (typeof this.stable != "undefined") this.stable.destroy()
                this.singlesample = new SingleSample({ proteins: this.proteins, gproteins: this.gproteins, platetypes: this.ctypes, samples: this.samples });
                this.single.show(this.singlesample);
                this.ui.pc.hide()

			}
			
            this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
            this.buildCollection()
            this.grp.empty()
            this.$el.find('li.plate').show()
            this.$el.find('li.pcr').hide()

		},
	});
});