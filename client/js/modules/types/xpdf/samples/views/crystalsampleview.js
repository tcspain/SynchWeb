/**
 * View a Crystal as an XPDF sample
 */

define([
	"marionette",
	"tpl!templates/types/xpdf/samples/crystalsampleview.html"
	], function(
		Marionette,
		template
	) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
		
		
		initialize: function(options) {
			Backbone.Validation.bind(this);
			if (!this.model.has("NAME")) this.model.set({"NAME": "NULL"});
			this.model.set({"UNMANGLEDNAME": this.model.get("NAME").replace(/__/g, " ")});
		}
	});
});