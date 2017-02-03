/*
 * A table of the instances in an XPDF sample changer.
 */

define([
        "backgrid",
        "collections/samples",
        "modules/types/xpdf/samples/views/samplelist",
        "views/table",
        "utils/table",
        "tpl!templates/types/xpdf/samples/copyphase.html"

        ], function(
        Backgrid,
        Instances,
        InstanceList,
        TableView,
        table,
        template
        ) {

	var InstanceDialog = DialogView.extend({
		template: template,
		className: "form",
		title: "Select an instance",
		
		regions: {
			instanceList: ".phaselist",
		},
		
		buttons: {
			"OK": "assignInstance",
			"Cancel": "closeDialog",
		},
		
		initialize: function(options) {
			var self = this;
			this.model = options.model;

			this.row = Backgrid.Row.extend({
				events: {
					"click": "onClick",
				},

				onClick: function(event) {
					self.doSelect(this.model);
				}
			});
			this.instances = new Instances();
			this.instances.fetch().done(function() {
				self.instanceList.show(new InstanceList({collection: self.instances, row: self.row, noNewSample: true}));
			});
			this.onSuccess = options.onSuccess;
			this.onError = options.onError;
			},
			
			doSelect: function(instance) {
				this.selectedInstance = instance;
			},
			
			assignInstance: function() {
				var self = this;
				self.closeDialog();
				
				// copy the attributes of the selected instance model to the
				// one held in the table of contained instances
				this.model.set({
					"BLSAMPLEID" : this.selectedInstance.get("BLSAMPLEID"),
					"PROTEINID": this.selectedInstance.get("PROTEINID"),
					"ABUNDANCE": this.selectedInstance.get("ABUNDANCE"),
					"NAME": this.selectedInstance.get("NAME"),
					"ACRONYM": this.selectedInstance.get("ACRONYM"),
					"COMMENTS": this.selectedInstance.get("COMMENTS"),
					"components": this.selectedInstance.get("components")
				});
			}
			
	
	});
	
	var ClickableRow = Backgrid.Row.extend({
		events: {
			"click": "onClick",
		},
		onClick: function(e) {

			var locco = this.model.get("LOCATION");
			console.log("Selecting for pointer at "+locco);
			var instanceSelectView = new InstanceDialog({model: this.model});
			app.dialog.show(instanceSelectView);
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