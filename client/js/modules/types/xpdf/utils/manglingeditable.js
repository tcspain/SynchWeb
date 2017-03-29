/**
 * An extension of the SynchWeb Editable class that allows the model value and
 * the displayed value to be different.
 * Developed to allow spaces in sample names. May not be useful elsewhere.
 */

define([
        "jquery",
        "utils/editable"
        ], function(
        		$,
        		Editable
        		) {
	var mangleValue = function(value, searchvalue, newvalue) {
		return value.replace(searchvalue, newvalue); 
	};

	// From editable
	var defaults = {
		submit: "Ok",
		style: "display: inline",
	};
	
    var types = {
            date: {
                type: 'datepicker',
                onblur: 'ignore',
                datepicker: { dateFormat: 'dd-mm-yy' },
            },
            
            text: {
                width: '100px',
                height: '20px',
                type: 'text',
            },
            
            textlong: {
                width: '180px',
                height: '25px',
                type: 'text',
            },
            
            markdown: {
                type: 'textarea',
                rows: 5,
                onblur: 'ignore',
                callback: function(value, settings) {
                    $(this).html(markdown.toHTML(value))
                },
                data: function(value,settings) {
                    return settings.model.get(settings.attr)
                },
            },

            textarea: {
                type: 'textarea',
                rows: 5,
                onblur: 'ignore',
            },
            
            select: {
                type: 'select',
                onblur: 'ignore',
                callback: function(value, settings) {
                    $(this).html(_.result(settings, 'data')[value]);
                }
            },
            
            autocomplete: {
                type: 'autocomplete',
                onblur: 'ignore',
            },
            
            datetime: {
                type: 'datetime',
                onblur: 'ignore',
            }
        };


	return Editable.extend({
		
		
		
		create: function(displayAttr, modelAttr, searchvalue, newvalue, options, refetch) {
			// This class only mangles text
			var type = "text";
			
			var submit = function(value, settings){
				var mangledValue = mangleValue(value, searchvalue, newvalue);
				this.model.set(modelAttr, mangledValue);
				console.log("valid?", this.model.isValid(true), modelAttr, "changed?", this.model.changedAttributes());
				var self = this;
				this.model.save(this.model.changedAttributes(), {patch: true,
					success: function() {
						if (refetch) self.model.fetch();
					},
					error: function(a, b, c) {
						console.log("Mangling editable error", a, "XHR", b, "opts", c);
					},	
				});
				
				return refetch ? "" : _.escape(value);
			};
			
			var onsubmit = function(settings, td) {
				var unmangledValue = $('[name=value]', td).val();
				var mangledValue = mangleValue(unmangledValue, searchvalue, newvalue);
				
				var invalid = this.model.preValidate(modelAttr, mangledValue);
				
				if (invalid) {
					$("input,select", td).addClass("ferror");
					if ($(".errormessage", td).length) $(td).children("form".append("<span class=\"errormessage ferror\">"+invalid+"</span>"));
				} else {
					$("input,select", td).removeClass("ferror");
					$(".errormessage", td).remove();
				}
				
				return invalid ? false : true;
			}
			
			this.el.find("."+displayAttr).editable(submit.bind(this), $.extend({}, defaults, types[type], options, {onsubmit: onsubmit.bind(this), attr: displayAttr, model: this.model})).addClass("editable");
		}
	});
});