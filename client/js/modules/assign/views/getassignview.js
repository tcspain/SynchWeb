/**
 *  Select view for the assign module based on proposal type
 */

define([
	"views/getview",
	
	"modules/assign/views/selectvisit",
	"modules/assign/views/assign",

	"modules/types/xpdf/assign/views/selectvisit",
	"modules/types/xpdf/assign/views/assign",
], function(
		GetView,
		
		SelectVisitView,
		AssignView,
		
		XpdfSelectVisitView,
		XpdfAssignView
		) {
	return {
		AssignView : new GetView({
			views: {
				mx: AssignView,
//				xpdf: XpdfAssignView,
			},
			default: AssignView,
		}),
		
		SelectVisitView: new GetView({
			views: {
				mx: SelectVisitView,
//				xpdf: XpdfSelectVisitView,
			},
			default: SelectVisitView,
		}),
	};
});