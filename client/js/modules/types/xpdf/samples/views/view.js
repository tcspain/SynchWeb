/**
 *  The Sample view class for XPDF proposals
 */

define(["marionette",
        "tpl!templates/types/xpdf/sample.html"
        ], function(Marionette,
        		template) {
	return Marionette.LayoutView.extend({
		className: "content",
		template: template,
	});
});