/*
 * Select views for the shipment module based on proposal type.
 */

define ([
         "views/getview",
         
         "modules/shipment/views/shipment",
         "modules/shipment/views/containers",
         "modules/shipment/views/container",
         "modules/shipment/views/containerplate",
         "modules/shipment/views/containeradd",
         "modules/shipment/views/dewarreg",
         
         "modules/types/xpdf/shipment/views/shipment",
         "modules/types/xpdf/shipment/views/containers",
         "modules/types/xpdf/shipment/views/containerview",
         "modules/types/xpdf/shipment/views/containerplateview",
         "modules/types/xpdf/shipment/views/stageadd",
         "modules/types/xpdf/shipment/views/dewarreg",
         ], function(
        GetView,
        
        ShipmentView,
        ContainersView,
        ContainerView,
        ContainerPlateView,
        ContainerAddView,
        DewarRegView,
        
        XpdfShipmentView,
        XpdfContainersView,
        XpdfContainerPlateView,
        XpdfContainerView,
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
			views: {
				mx: ContainerPlateView,
				xpdf: XpdfContainerPlateView,
			},
			default: ContainerPlateView,
		}),
		
		ContainersView: new GetView({
			views: {
				xpdf: XpdfContainersView,
			},
			default: ContainersView,
		}),
		
		ContainerView: new GetView({
			views: {
				xpdf: XpdfContainerView,
			},
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