/**
 * The view of all data collections for XPDF
 */
define([
        "modules/dc/datacollections",
        "modules/types/gen/dc/dclist",
        "modules/types/xpdf/samples/views/newsamplefromphasepopup",
        "tpl!templates/types/xpdf/dc/dclist.html",
        ],
function(
		DataCollections,
		DCList,
		newSampleFromPhasePopupView,
		template) {
	return DataCollections.extend({
		dcListView: DCList,
		template: template,
		filters: false,
		sampleChanger: false,
		
	});
});