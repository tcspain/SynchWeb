/**
 * Validation and upload model for CIF files
 */

define([
        "backbone",
        "models/wfile"
        ], function(
        		Backbone,
        		File
        		) {
	return Backbone.Model.extend(_.extend({}, {
		
		idAttribute: "PROTEINHASPDBID",
		urlRoot: "/sample/pdbs",
		
		// validate the CIF file name. Check the extension
		validation: {
			cif_file: function(v) {
				if(v) {
					var parts = v.name.split('.');
					var extension = parts[parts.length-1];
					if (extension.toLowerCase() != "cif") 
						return "Unrecognized file extension, expected .cif";
				}
			}
		},
	
		initialize: function(options) {
			this.pid = options.pid;
		},
	
		
	},
	// Backbone model mixin for uploading files
	File));
});