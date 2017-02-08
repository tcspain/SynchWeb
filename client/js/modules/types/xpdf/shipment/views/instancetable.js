/*
 * A table of the instances in an XPDF sample changer.
 */

define([
        "backgrid",
        "collections/samples",
        "modules/types/xpdf/samples/views/samplelist",
        "modules/types/xpdf/shipment/views/instancedialog",
        "views/table",
        "utils/table",
        "tpl!templates/types/xpdf/samples/copyphase.html"

        ], function(
        Backgrid,
        Instances,
        InstanceList,
        InstanceDialog,
        TableView,
        table,
        template
        ) {

	var ClickableRow = Backgrid.Row.extend({
		events: {
			"click": "onClick",
		},
		onClick: function(e) {

			var locco = this.model.get("LOCATION");
			console.log("Selecting for pointer at "+locco);
			var instanceSelectView = new InstanceDialog({onSuccess: this.onSelect});
			app.dialog.show(instanceSelectView);
		},
		onSelect: function(selectedModel) {
			// copy the attributes of the selected instance model to the
			// one held in the table of contained instances

			this.model.set({
				"BLSAMPLEID" : this.selectedModel.get("BLSAMPLEID"),
				"PROTEINID": this.selectedModel.get("PROTEINID"),
				"ABUNDANCE": this.selectedModel.get("ABUNDANCE"),
				"NAME": this.selectedModel.get("NAME"),
				"ACRONYM": this.selectedModel.get("ACRONYM"),
				"COMMENTS": this.selectedModel.get("COMMENTS"),
				"components": this.selectedModel.get("components")
			});

		}
	});
	
	
	var InstanceTableView = TableView.extend( {
		
		backgrid: {
			row: ClickableRow,
		},
		
		initialize: function(options) {
			// The input collection consists of the full set of instances for
			// the stage, even if several of them are null
			this.collection = options.collection;
			
			this.columns = [
			                {name: "LOCATION", label: "Location", cell: "string", editable: false},
			                {name: "NAME", label: "Name", cell: "string", editable: false},
			                {name: "ACRONYM", label: "Acronym", cell: "string", editable: false},
//			                {name: "COMPOSITION", label: "Composition", cell: "string", editable: false}
			                {name: "COMMENTS", label: "Comments", cell: "string", editable: false}
			                ];
			
			TableView.prototype.initialize.apply(this, [options]);
			
			this.pages = false;
		},
	
	});
	
	return InstanceTableView;
});