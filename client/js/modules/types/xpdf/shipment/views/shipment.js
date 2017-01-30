/*
 * Shipments for on-site XPDF proposals
 */

define([
        "modules/shipment/views/shipment",
        "tpl!templates/types/xpdf/shipment/shipment.html"
        ], function(
        		ShipmentView,
        		template
        		) {
	return ShipmentView.extend({
		template: template,
		
	});
});