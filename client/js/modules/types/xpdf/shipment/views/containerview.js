/*
 * View an XPDF sample changer
 */

define([
        "marionette",
        "modules/shipment/views/container",
        "modules/types/xpdf/shipment/views/instancetable",
        "modules/types/xpdf/shipment/collections/stagetypes"
        ], function(
        		Marionette,
        		GenericContainerView,
        		InstanceTableView,
        		PlateTypes
        		) {
	return GenericContainerView.extend({
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
        	console.log("Showing XPDF container");
        	this.type = PlateTypes.findWhere({ name: this.model.get('CONTAINERTYPE') })
            if (this.type.get("capacity") > 1) {
    			this.table.show(new InstanceTableView({collection: this.samples}));
            } else {
            	this.table.show(new SingleSample({samples: this.samples}));
            }
		}
	
	});
});