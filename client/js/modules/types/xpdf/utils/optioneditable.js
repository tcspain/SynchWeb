/**
 * An extension of utils/editable that will optionally not validate the data,
 * and optionally not save the data to the backing store (database).
 */

define([
        "jquery",
        "utils/editable"
        ], function(
        		$,
        		Editable
        		) {
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

		/*
		 * options:
		 * options.nosave: set to true to not save the edited model to the backing store.
		 * options.novalidation: set to true to not validate (or pre-validate) the 
		 */
		initialize: function(options) {
			this.nosave = options.nosave;
			this.novalidation = options.novalidation;
			
			 Editable.prototype.initialize.apply(this, [options]);

		},
		
		create: function(attr, type, options, refetch) {
		
			var submit = function(value, settings) {
                this.model.set(attr, value);
                
                if (!this.novalidation)
                	console.log("valid ?", this.model.isValid(true), attr, "changed", this.model.changedAttributes());
                
                if (!this.nosave) {
                	var self = this
                	this.model.save(this.model.changedAttributes(), { patch: true,
                		success: function() {
                			if (refetch) self.model.fetch();
                		},
                		error: function(model, response, options) {
                			console.log("editable error", model, "xhr", response, "opts", options);
                		}
                	});

                	return refetch ? "" : _.escape(value);
                } else { 
                	return "";
                }

			};
		
			var onsubmit = function(settings, td) {
				if (!this.novalidate) {
	                var invalid = this.model.preValidate(attr, $('[name=value]', td).val())
	                
	                if (invalid) {
	                    $('input,select', td).addClass('ferror')
	                    if ($('.errormessage', td).length) $(td).children('form').append('<span class="errormessage ferror">'+invalid+'</span>')
	                } else {
	                    $('input,select', td).removeClass('ferror')
	                    $('.errormessage', td).remove()
	                }
	                
	                return invalid ? false: true
				} else {
					// No validation? The data must be okay, then
					return true;
				}
				
			};
			
			this.el.find("."+attr).editable(submit.bind(this), $.extend({}, defaults, types[type], options, {onsubmit: onsubmit.bind(this), attr: attr, model: this.model})).addClass("editable");

		},
	});
});

