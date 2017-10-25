/**
 * A dialog version of the phase addition page.
 */

define([
	"modules/types/xpdf/samples/views/phaseadd",
	
	], function(
			PhaseAddView
	) {
	
	var PhaseAddDialog = PhaseAddView.extend({
		
		initialize: function(options) {
			if (options.collection)
				this.collection = options.collection;
			
			PhaseAddView.prototype.initialize.apply(this, options);
		},
		
		success: function(model, response, options) {
			console.log("Successfully added phase", model);
			this.closeDialog();
			
			// calculate the new abundance for the model
			var currentAbundances = this.collection.pluck("ABUNDANCE");
			var totalAbundance = _.reduce(currentAbundances, function(memo, bun) {return memo+parseFloat(bun);}, 0.0);
			if (!Number.isFinite(totalAbundance)) totalAbundance = 0.0;
			var nyAbundance = Math.min(1.0, Math.max(1.0-totalAbundance, 0.0)).toFixed(3);
			nyAbundance = nyAbundance.toString();
			
			model.set({"ABUNDANCE": nyAbundance});
			
			this.collection.add(model);
			
		},

		// Dialog destruction functions copied from dialog.js
        onDestroy: function() {
            if (this.getOption('view')) this.getOption('view').destroy()
        },
        
        closeDialog: function(e) {
            if (this.getOption('view')) this.getOption('view').destroy()
            this.trigger('close')
            app.dialog.hideDialog()
            app.dialog.empty()
        },

		
	});
	
	return PhaseAddDialog;
	
});