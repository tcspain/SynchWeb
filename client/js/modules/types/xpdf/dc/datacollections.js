/**
 * The view of all data collections for XPDF
 */
define([
        "modules/dc/datacollections",
        "modules/types/gen/dc/dclist",
        "modules/types/xpdf/samples/views/newemptysample",
        "tpl!templates/types/xpdf/dc/dclist.html",
        ],
function(
		DataCollections,
		DCList,
		newEmptySample,
		template) {
	return DataCollections.extend({
		dcListView: DCList,
		template: template,
		filters: false,
		sampleChanger: false,
		
		events : {
            "click #new_sample": "newSample",
		},
	
		newSample: function() {
			newEmptySample.run(this.model.get('VISIT'));
		}
	});
});