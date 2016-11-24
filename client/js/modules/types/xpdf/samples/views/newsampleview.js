/**
 *  A FormView for a hidden form to make a generic new XPDF sample
 */

define(["marionette",
        "models/protein",
        "models/sample",
        "tpl!templates/types/xpdf/samples/newsample.html"],
        function(Marionette,
        		Phase,
        		Sample,
        		template) {

	return Marionette.LayoutView.extend({
		template: template,
		
		// Define the submit type in the UI
		ui: {
			submit: "[type=submit]",
		},
		// set the onSubmit function to handle the a click on the submit button
		events: {
			"click @ui.submit": "onSubmit",
		},
		
        constructor: function(options) {
            console.log("Setup new XPDF sample view");
        	FormView.__super__.constructor.call(this, options)
        	this.dummySample = new Sample();
        	this.dummyPhase = new Phase();
        	
        },
        

        onSubmit: function(event) {
			event.preventDefault();
			console.log("New sample would have been submitted!");
			this.dummyPhase.set({"ACRONYM" : "newxpdfphase",});
			var response = this.dummyPhase.save({}, {
				success: function(model, response, options) {
					console.log("Dummy phase save successful");
					console.log("New phase ID:"+model.get("PROTEINID"));
					options.createDummySample(model.get("PROTEINID"));
				},
				error: function(model, response, options) {
					console.log("Dummy phase save failed");

				},
				createDummySample: this.createDummySample,
				dummySample: this.dummySample,
			});
		},

		createDummySample: function(dummyPhaseId) {
			this.dummySample.set({
				"ACRONYM" : "newxpdfsample",
				"NAME" : "newxpdfsample",
				"PROTEINID" : dummyPhaseId,
				"LOCATION" : "0",
				"CONTAINERID" : "0",
				});
			var response = this.dummySample.save( {}, {
				success: function(model, response, options) {
					console.log("Dummy sample save successful");
					console.log("New sample ID:"+model.get("BLSAMPLEID"));
					app.trigger("sample:view", model.get("BLSAMPLEID"));
				},
				error: function(model, response, options) {
					console.log("Dummy sample save failed");
				},
				
			});
		},
	});

	
	
	
	
	
//	return FormView.extend({
//		template:template,
//	
//		createModel: function() {
//			this.model = new Sample();
//		},
//		
//		success: function(model, response, options) {
//			console.log("Success adding a new XPDF sample", this.model);
//			app.trigger("sample:view", model.get("BLSAMPLEID"));
//		}
//	})
});