/**
 * The Sample list for XPDF
 */
define(["marionette",
        "tpl!templates/types/xpdf/samples/list.html"], function(Marionette, template) {
	return Marionette.ItemView.extend({
		template: template,
	});
});