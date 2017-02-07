/**
 * View to create a new instance of an XPDF sample
 */
define([
        "backgrid",
        "views/dialog",
        "views/table",
        "models/sample",
        "collections/samples",
//        "modules/types/xpdf/samples/views/samplelist",
        "utils/table"
        ], function(
        		BackGrid,
        		DialogView,
        		TableView,
        		Container,
        		Containers,
        		table
        ) {
	var ContainerList = Marionette.LayoutView.extend({
		className: "content",
		template: _.template("<div class=\"wrapper\"></div>"),
		regions: {"wrap": ".wrapper"},
		title:  "Container",
		columns: [
		          {name: "NAME", label: "Name", cell: "string", editable: false},
		          {name: "ACRONYM", label: "Acronym", cell: "string", editable: false},
		          ],
		initialize: function(options) {
			var self = this;
			
			var row;
			if (typeof (options.row) == "undefined") {
				row = table.ClickableRow.extend({
						event: "samples:view",
						argument: "BLSAMPLEID",
						cookie: true,
			  });
			  } else {
				  row = options.row;
			  }

			
			self.table = new TableView({collection: options.collection, columns: this.getOption("columns"), filter: "s", search: options.params && options.params.s, loading: true,
			backgrid: {
				row: row,
				
			},
			});
		},
		onRender: function() {
			this.wrap.show(this.table);
		}
	});
	
	return DialogView.extend({
		template:"<div class=\"form\">" +
		"<div class=\"containerlist\"><\div>" +
		"</div>",
		className: "form",
		title: "Select a container",
		
		regions: {
			containerList: ".containerlist",
		},
		
		buttons: {
			"OK": "doInstancing",
			"Cancel": "closeDialog",
			},
		
		initialize: function(options) {
			var self = this;
			this.model = options.model;
			var selectARow = BackGrid.Row.extend({
				events: {
					"click": "onClick",
				},
				onClick: function(e) {
					self.doSelect(this.model.get("BLSAMPLEID"));
				}
			});
			this.containers = new Containers();
			this.containers.fetch().done( function() {
				self.containerList.show(new ContainerList({collection: self.containers, row: selectARow}));
			});
			this.onSuccess = options.onSuccess;
		},
		
		onRender: function() {
		},

		doSelect: function(containerId) {
			console.log("Selected container ID:"+containerId);
			this.selectedContainer = containerId;
		},

		doInstancing: function() {
			var self = this;
			self.closeDialog();
			
			var sourceSample = self.model;
			var sinkInstance = new Container();
			
			// Do the instancing: copy data from the source to the sink
			
			console.log("instancing sample "+this.model.get("BLSAMPLEID")+" with container "+this.selectedContainer);

			sinkInstance.save({
				"NAME": sourceSample.get("NAME")+"-instance",
				"CRYSTALID": sourceSample.get("CRYSTALID"),
				"PROTEINID": sourceSample.get("PROTEINID"),
				"ABUNDANCE": sourceSample.get("ABUNDANCE"),
				"CONTAINERID": sourceSample.get("CONTAINERID"),
				"LOCATION": sourceSample.get("LOCATION"),
				"COMMENTS": sourceSample.get("COMMENTS")+"***INSTANCE in "+this.selectedContainer+"***",
				"COMPONENTIDS": sourceSample.get("COMPONENTIDS"),
				"COMPONENTAMOUNTS": sourceSample.get("COMPONENTAMOUNTS"),
			}, {
				success: function(model, response, options) {
//					console.log("instance CrystalId was "+sinkInstance.get("CRYSTALID"));
//					sinkInstance.save({"CRYSTALID": sourceSample.get("CRYSTALID")}, {
//						success: function(model, response, options) {
//							console.log("instance CrystalId saved as "+model.get("CRYSTALID"));
					var instanceId = model.get("BLSAMPLEID");
					app.trigger("samples:view", instanceId);
//						},
//						error: function(model, response, options) {
//							console.log("Error setting CRYSTALID");	
//						},
//					});
				},
				error: function(model, response, options) {
					console.log("Error saving instance of sample");
				}
			});
		}
	});

	
});
