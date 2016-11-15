/**
 * A FormView for a hidden form to make a new generic phase for XPDF samples. 
 */

define(["marionette",
        "models/protein",
        "tpl!templates/types/xpdf/samples/newphase.html"],
        function(Marionette,
        		Protein,
        		template) {
	return FormView.extend({
		template:template,
		
		initialize: function(options) {
			if ("CRYSTALID" in options) {
				this.crystalId = options["CRYSTALID"];
				console.log("New phase will be created connected to crystal "+this.crystalId);
			}
		},
		
		createModel: function() {
			this.model = new Protein();
		},
		
		success: function(model, response, options) {
			console.log("Success adding new XPDF phase", this.model);
			var newPhaseId = this.model.get("PROTEINID");
			if ("crystalId" in this)
				console.log("New phase would be associated with crystalId "+this.crystalId);

			// Make the AJAX request to add the component to the sample
			Backbone.ajax({
				url: app.apiurl+"/sample/components",
				type:"POST",
				data: {"COMPONENTID": newPhaseId,
					"BLSAMPLETYPEID": this.crystalId,
					"ABUNDANCE": 0},
					success: function(blshcId) {
						console.log(newPhaseId+" sucessfully associated with "+this.crystalId);
					},
					error: function() {
						console.log("Could not associate "+newPhaseId+" with "+this.crystalId);
					}
			});
						
			app.trigger("proteins:view", model.get("PROTEINID"));
		}
	})
});