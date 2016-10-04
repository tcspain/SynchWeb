/**
 * The Sample list for XPDF
 */
//define(["marionette",
//        "tpl!templates/types/xpdf/samples/list.html"], function(Marionette, template) {
//	return Marionette.ItemView.extend({
//		template: template,
//	});
//});

define(['modules/samples/views/list',
        'utils/table'],
        function(SampleList, table) {
	
	return SampleList.extend({
	    template: '<div><h1>XPDF Samples</h1><p class="help">This page shows sample associated with the currently selected XPDF proposal</p><div class="ra"><a class="button" href="/proteins/add"><i class="fa fa-plus"></i> Add Sample</a></div><div class="filter type"></div><div class="wrapper"></div></div>',
		filters: [
		          { id: 'DC', name: 'Data Collected'},
		          ],

        columns: [
                  //{ name: 'BLSAMPLEID', label: 'ID', cell: 'string', editable: false },
                  { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                  { name: 'ACRONYM', label: 'Component', cell: 'string', editable: false },
                  { name: 'COMPONENTACRONYMS', label: 'Components', cell: 'string', editable: false },
                  // { name: 'SPACEGROUP', label: 'Spacegroup', cell: 'string', editable: false },
                  { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                  { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
                  { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },

                  { name: 'CONTAINER', label: 'Container', cell: 'string', editable: false },
                  // { label: 'Snapshot', cell: table.TemplateCell, test: 'DCID', editable: false, template: '<img class="img" src="'+app.apiurl+'/image/id/<%=DCID%>" /> <img class="img" src="'+app.apiurl+'/image/id/<%=DCID%>/n/2" />' },
                  { label: 'Snapshot', cell: SampleList.SnapshotCell, editable: false },
                  // { name: 'SC', label: 'SCs', cell: 'string', editable: false },
                  // { name: 'SCRESOLUTION', label: 'Res', cell: 'string', editable: false },
                  // { name: 'DC', label: 'DCs', cell: 'string', editable: false },
                  // { name: 'DCRESOLUTION', label: 'Res', cell: 'string', editable: false },
                  { label: 'Status', cell: SampleList.StatusCell, editable: false },
                  { label: ' ', cell: table.ProjectCell, itemname: 'NAME', itemid: 'BLSAMPLEID', itemtype:'sample', editable: false },
                  { name: "CODE", label: "Code", cell: "string", editable: false },
                  ],

        hiddenColumns: [2,3,4,5,6,7,9],

		// Can this be empty?
	});
});