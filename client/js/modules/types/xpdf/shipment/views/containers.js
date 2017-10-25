/**
 * XPDF implementation of the container list view
 */

define([
	"utils/table",
	"views/table",
	"views/filter",
	"modules/shipment/views/containers",
	], function(
			table,
			TableView,
			FilterView,
			ContainersView
	) {
	
	var ClickableRow = table.ClickableRow.extend({
		event: 'container:show',
		argument: 'CONTAINERID',
		cookie: true,
	});
	  
	var XpdfContainersView = ContainersView.extend({
		initialize: function(options) {
			var columns = [
				{ name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
                { name: 'BARCODE', label: 'Barcode', cell: 'string', editable: false },
                { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
                { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
                { name: 'DCCOUNT', label: '# DCs', cell: 'string', editable: false },
                { name: 'CONTAINERTYPE', label: 'Type', cell: 'string', editable: false },
			];

			var filters = [];
			
			columns[2].renderable = false;
			if (options.barcode) {
				columns[1].renderable = false;
				columns[2].renderable = true;
			}

			this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'containers', filter: 's', search: options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: 'No containers found' } });

			this.ty = new FilterView({
				url: !options.noFilterUrl,
				collection: options.collection,
				value: options.params && options.params.ty,
				name: 'ty',
				filters: filters
			});

			this.listenTo(this.ty, 'selected:change', this.updateCols);

		},
	});
	
	return XpdfContainersView;
});