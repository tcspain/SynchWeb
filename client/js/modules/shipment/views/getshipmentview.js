/*
 * Select views for the shipment module based on proposal type.
 */

define ([
         "views/getview",
         
         "modules/shipment/views/shipment",
         "modules/shipment/views/container",
         "modules/shipment/views/containerplate",
         "modules/shipment/views/containeradd",
         "modules/shipment/views/dewarreg",
         
         "modules/types/xpdf/shipment/views/shipment",
         "modules/types/xpdf/shipment/views/stageadd",
         "modules/types/xpdf/shipment/views/dewarreg",
         ], function(
        GetView,
        
        ShipmentView,
        ContainerView,
        ContainerPlateView,
        ContainerAddView,
        DewarRegView,
        
        XpdfShipmentView,
        XpdfStageAdd,
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
		
		ContainerPlateView: new GetView({
//			views: {
//				mx: ContainerPlateView,
//				xpdf: ContainerPlateView,
//			},
			default: ContainerPlateView,
		}),
		
		ContainerView: new GetView({
			default: ContainerView,
		}),
		
		ContainerAddView: new GetView({
			views: {
				xpdf: XpdfStageAdd,
			},
			default: ContainerAddView,
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