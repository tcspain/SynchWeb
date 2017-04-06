/**
 * List of available detectors
 */

define([
	"marionette",
	"views/table",
	"/collections/experimentplanfakes/detectors",
	"tpl!templates/types/xpdf/assign/detectors.html"
	], function(
			Marionette,
			TableView,
			Detectors,
			template
	) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		regions: {wrap: ".wrapper"},
		
		initialize: function(options) {
			
			var columns = [
				{name: "TYPE", label: "Detector Type", cell: "string", editable: false},
				{name: "MANUFACTURER", label: "Manufacturer", cell: "string", editable: false},
				{name: "COMPOSITION", label: "Composition", cell: "string", editable: false},
				];

			var self  = this;
			this.table = new TableView({
				collection: options.collection,
				columns: columns,
				/* row: ClickableRow */
			});
		},
		
		onRender: function() {
			this.wrap.show(this.table);
		}
			
	});
});