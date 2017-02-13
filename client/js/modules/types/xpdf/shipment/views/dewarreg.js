/**
 * Registered dewars for XPDF are boxes of samples
 */

define([
        "marionette",
        "views/table",
        "utils/table",
        "collections/dewars",
        "tpl!templates/types/xpdf/shipment/dewarreg.html"
        ], function(
        		Marionette,
        		TableView,
        		table,
        		Dewars,
        		template
        		) {
	// ClickableRow?
	
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		regions: {wrap: ".wrapper"},
		
		templateHelpers: {
			STAFF: app.staff,
		},
		
		initialize: function(options) {
			var columns = [{name: "FACILITYCODE", label: "Box Code", cell: "string", editable: false},
			               {name: "LABNAME", label: "Lab Name", cell: "string", editable: false},
			               {name: "ADDRESS", label: "Address", cell: "string", editable: false},
			               ];
			
			var searchOptions = (options.params) ? options.params.s : null; 
			var theCollection = (options.collection) ? options.collection : new Dewars();
				
			this.table = new TableView({
				collection: theCollection,
				columns: columns,
				tableClass: "containers",
				filter: "s",
				search: searchOptions,
			});
		},
		
		onRender: function() {
			this.wrap.show(this.table);
		},
	});
});