define([
        "marionette",
        "views/form",
        "models/protein",
        "tpl!templates/types/xpdf/samples/phaseadd.html"
        ], function(
        		Marionette,
        		FormView,
        		Phase,
        		template
        ) {
	return  FormView.extend({
		template:template,
		
		createModel: function() {
			this.model = new Phase();
		},
		
		success: function(model, response, options) {
			console.log("Successfully added phase", this.model);
			app.trigger("proteins:view", model.get("PROTEINID"));
		},
		
		initialize: function(options) {
		},
		
		onRender: function(options) {
		
			var acronym = this.$el.find("input.acronym");
			
			var millis = (new Date()).getTime();
			acronym.val("xpdf"+millis.toString());
			console.log("acronym", acronym, " at " + millis + " ms");
		},
	});
});