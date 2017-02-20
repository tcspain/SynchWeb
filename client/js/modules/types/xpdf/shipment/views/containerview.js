/*
 * View an XPDF sample changer
 */

define([
        "marionette",
        "modules/shipment/views/container",
        "modules/shipment/views/plate",
        "modules/types/xpdf/shipment/views/instancetable",
        "modules/types/xpdf/shipment/views/singlesample",
        "modules/types/xpdf/shipment/collections/stagetypes"
        ], function(
        		Marionette,
        		GenericContainerView,
        		PlateView,
        		InstanceTableView,
        		SingleSample,
        		PlateTypes
        		) {
	return GenericContainerView.extend({
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
        	console.log("Showing XPDF container");
        	this.type = PlateTypes.findWhere({ name: this.model.get('CONTAINERTYPE') });

        	if (this.type.get("capacity") > 1) {
                this.$el.find('.puck').css('width', '50%')
                // this.puck.$el.width(this.puck.$el.parent().width()/2)
                this.puck.show(new PlateView({ collection: this.samples, type: this.type }))
            } 

            if (this.type.get("capacity") != 1) {
    			this.table.show(new InstanceTableView({collection: this.samples}));
            } else {
            	this.table.show(new SingleSample({sample: this.samples.at(0)}));
            }
		}
	
	});
});