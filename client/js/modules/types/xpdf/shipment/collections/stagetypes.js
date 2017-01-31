/**
 * XPDF 'plate' types: sample changers and ordered sets of samples
 */
define([
        "backbone",
//        "modules/shipment/collections/platetypes",
        "modules/shipment/models/platetype",
        "utils/kvcollection"
        ], function(
        Backbone,
//        GenericPlateTypes,
        PlateType,
        KVCollection
        ) {
	
	var xpdfPlateTypes = [
	                      { name: "XpdfSampleChanger15", well_per_row: 15,
	                    	  drop_per_well_x: 1, drop_per_well_y:1,
	                    	  drop_height: 1, drop_width: 1,
	                    	  drop_offset_x: 0, drop_offset_y: 0,
	                    	  well_drop: -1,
	                    	  capacity: 15,
	                      },
	                      { name: "XpdfSampleChanger7", well_per_row: 7,
	                    	  drop_per_well_x: 1, drop_per_well_y:1,
	                    	  drop_height: 1, drop_width: 1,
	                    	  drop_offset_x: 0, drop_offset_y: 0,
	                    	  well_drop: -1,
	                    	  capacity: 7,
	                      },
	                      { name: "XpdfSingleSample", well_per_row: 1,
	                    	  drop_per_well_x: 1, drop_per_well_y:1,
	                    	  drop_height: 1, drop_width: 1,
	                    	  drop_offset_x: 0, drop_offset_y: 0,
	                    	  well_drop: -1,
	                    	  capacity: 1,
	                      },
	                      { name: "XpdfGasFlowCell", well_per_row: 1,
	                    	  drop_per_well_x: 1, drop_per_well_y:1,
	                    	  drop_height: 1, drop_width: 1,
	                    	  drop_offset_x: 0, drop_offset_y: 0,
	                    	  well_drop: -1,
	                    	  capacity: 1,
	                      },
	                      
	                      ];
	
//	return GenericPlateTypes.reset(xpdfPlateTypes);
	
    var PlateTypes = Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: PlateType,
      
        keyAttribute: "name",
        valueAttribute: "name",
        
        initialize: function(options) {
            this.on("change:isSelected", this.onSelectedChanged, this);
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get("isSelected") === true && !model._changing) {
                    model.set({isSelected: false}, { silent: true });
                }
            });
            console.log("trigger selected change");
            this.trigger("selected:change");
        },
        
        
    }));
    
    return new PlateTypes(xpdfPlateTypes);

})
