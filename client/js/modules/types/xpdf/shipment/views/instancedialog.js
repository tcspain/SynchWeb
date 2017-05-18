/*
 * The dialog for selecting an instnce when filling an XPDF container
 */

define([
        "backgrid",
        "collections/samples",
        "modules/types/xpdf/samples/views/samplelist",
        "tpl!templates/types/xpdf/samples/copyphase.html"
        ], function(
                Backgrid,
                Instances,
                InstanceList,
        		template
        		) {
	
	return DialogView.extend({
		template: template,
		className: "form",
		title: "Select an instance",
		
		regions: {
			instanceList: ".phaselist",
		},
		
		// initialize
		// options.model: The target model for the selection, used as an
		//		argument to the callback.
		// options.onSuccess: the callback function to use when an instance has
		// 		been successfully selected. function(target, selected) 
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
				this.closeDialog();
				this.onSuccess(this.model, instance);
			},
			
	});

});