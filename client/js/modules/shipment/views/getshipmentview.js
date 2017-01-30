/*
 * Select views for the shipment module based on proposal type.
 */

define ([
         "views/getview",
         
         "modules/shipment/views/shipment",
         "modules/shipment/views/dewarreg",
         
         "modules/types/xpdf/shipment/views/shipment",
         "modules/types/xpdf/shipment/views/dewarreg",
         ], function(
        GetView,
        
        ShipmentView,
        DewarRegView,
        
        XpdfShipmentView,
        XpdfDewarRegView
         ) {
	
	return {

		ShipmentView : new GetView({
			views: {
				mx: ShipmentView,
				xpdf: XpdfShipmentView,
			},
			default: ShipmentView,
		}),
		
		DewarRegView : new GetView({
			views: {
				mx: DewarRegView,
				xpdf: XpdfDewarRegView,
			},
			default: DewarRegView,
		}),
		
	}
});