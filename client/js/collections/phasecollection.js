/**
 * A Collection of the phases making up an XPDF sample. Mock version.
 */

define (["underscore",
         "backbone",
         "backbone.paginator",
         "models/xpdfphase"],
         function(_,
        		 Backbone,
        		 PageableCollection,
        		 xpdfPhase) {
	return PageableCollection.extend({
		model: xpdfPhase,
		
		state: {
			pageSize: 15,
		},
				
		/* Mock data fetching */
		fetch: function() {
			var model = this;
			var bto = new xpdfPhase("BTO");
			var cato = new xpdfPhase("CaTO");
			
			bto.set("ABUNDANCE", 0.9);
			cato.set("ABUNDANCE", Math.round((1.0-bto.get("ABUNDANCE"))*1000)/1000);
			model.add(bto);
			model.add(cato);
		},
	
		
	});
});