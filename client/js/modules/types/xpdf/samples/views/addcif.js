/**
 * Dialog to upload a CIF file to be associated with an XPDF sample.
 */

define([
        "backbone",
        "views/dialog",
        "modules/types/xpdf/samples/models/cif",
        "tpl!templates/types/xpdf/samples/addcif.html",
        "backbone-validation",
        ], function(
        		BackBone,
        		DialogView,
        		Cif,
        		template
        		) {
	return DialogView.extend({
		template: template,
		className: "form",
		title: "Add CIF to phase",
		
		ui: {
			prog: ".progress",
		},
		
		events: {
			"change input": "validateField",
			"keyup input": "validateField", 
		},
		
		buttons: {
			"Add": "addCif",
			"Cancel": "closeDialog",
		},
		
		addCif: function() {
			this.ui.prog.show();
			
			var vals = {};
			vals.pdb_file = this.$el.find("input[name=cif_file]")[0].files[0];
			this.model.set(vals);
			
			var self = this;
			if (this.model.isValid(true)) {
				this.model.save({}, {
					success: function(xhr, model, options) {
						self.closeDialog();
						self.ui.prog.hide();
						self.trigger("pdb:success");
					},
					error: function(xhr, model, options) {
						self.trigger("error", xhr, model, options);
					},
				});
			}
		},
		
		updateProgress: function(value) {
			// The progress bar is inherited by the model from wfile.js
			this.ui.prog.progressbar({"value": value});
		},
		
		initialize: function(options) {
			this.model = new Cif({"PROTEINID": options.pid});
			this.setupValidation();
			this.listenTo(this.model, "model:progress", this.updateProgress, this);
			
//			this.cifs  = new Cifs();
//			var self = this;
//			this.cifs.fetch().done(function() {
//			  self.ui.exist.html(self.pdbs.html(self.cifs.opts())
//			})
		},
		
		onRender: function() {
			
			// zero the progress bar and hide it
			this.ui.prog.progressbar({value: 0});
			this.ui.prog.hide();
		},
		
		validateField: function(e) {
			var attr = $(e.target).attr("name");
			// validate the first file, if files exist, or the value if they do not
			var val = e.target.files ? e.target.files[0] : $(e.target).val();
			// perform the validation, get the result
			var error = this.model.preValidate(attr, val);
			if (error)
				this.invalid(e.target, error);
			else
				this.valid(e.target);
		},
		
		// add and remove classes to get the red highlighting on an error, and add the error message span.
		invalid: function(attr, error) {
			$(attr).removeClass("fvalid").addClass("ferror");
			if (!$(attr).siblings("span.errormessage").length)
				$(attr).after("<span class=\"errormessage ferror\">"+error+"</span>");
			else
				$(attr).siblings("span.errormessage").text(error);
		},
		
		// add and remove classes to remove the red highlighting when there is no error, and remove the error message span. 
		valid: function(attr) {
			$(attr).removeClass("ferror").addClass("fvalid").siblings("span.errormessage").remove();
		},
		
		setupValidation: function() {
			Backbone.Validation.unbind(this);
			Backbone.Validation.bind(this, {
				selector: "name",
				valid: function(view, attr) {
					// name is here the name of the input element.
					view.valid(view.$el.find("[name="+attr+"]"));
				},
				invalid: function(view, attr, error) {
					view.invalid(view.$el.find("[name="+attr+"]"), error);
				},
			});
		}
	});
});