/**
 * The XPDF sample view
 */
define(['modules/samples/views/view',
        'tpl!templates/types/xpdf/samples/sample.html'], function(SampleView, template) {
	
	console.log("Defining xpdf sample view")
	
	return SampleView.extend({
		template: template
	})
})