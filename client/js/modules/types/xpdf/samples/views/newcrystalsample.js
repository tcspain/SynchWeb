/**
 * A view to define a new XPDF sample (ISPyB Crystal) from a combination of
 * phases
 */

define([
	"views/form",
	"models/crystal",
	"tpl!templates/types/xpdf/samples/newcrystalsample.html"
	], function(
			FormView,
			Crystal,
			template
	) {
	return FormView.extend({
		template: template,
		
		createModel: function() {
			this.model = new Crystal();
		},
		
		success: function(model, response, options) {
			console.log("Successfully added crystal", this.model);
			app.trigger("crystals:view", model.get("CRYSTALID"));
		},
		
		initialize: function(options) {
			
		},

		onSubmit: function(e) {
			// get the phases from the phase table
			
			// add them to the model
			
			// call FormView.onSubmit()
			FormView.prototype.onSubmit.apply(this, e);
		}
		
	});
});