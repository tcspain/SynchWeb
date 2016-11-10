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
		
		createModel: function() {
			this.model = new Protein();
		},
		
		success: function(model, response, options) {
			console.log("Success adding new XPDF phase", this.model);
			app.trigger("proteins:view", model.get("PROTEINID"));
		}
	})
});