define([
	'marionette',
	'views/pages',
    'collections/shipments',
    'collections/containers',
    'collections/dewars',
    'models/shipment',
    'models/dewar',
    "views/table",
    "collections/samples",
    "collections/experimentplanfakes/datacollectionplans",
    "collections/experimentplanfakes/samplecollectionplans",
    "collections/experimentplanfakes/detectors",
    "collections/experimentplanfakes/scanparametersmodels",
    "collections/experimentplanfakes/scanparametersservices",
    "modules/types/xpdf/samples/views/samplelisttableview",
    'utils',
    "utils/table",
    'tpl!templates/types/xpdf/assign/assign.html',
    'jquery-ui',
    ], function(
    		Marionette,
    		Pages,
    		Shipments,
    		Containers,
    		Dewars,
    		Shipment,
    		Dewar,
    		TableView,
    		Samples,
    		DataCollectionPlans,
    		SampleCollectionPlans,
    		Detectors,
    		Axes,
    		ParamServices,
    		SampleListTableView,
    		utils,
    		table,
    		template
    		) {

            
    
    var ContainerView = Marionette.CompositeView.extend({
        template: _.template('<span class="r"><a class="button button-notext showcontainer" title="Click to select this sample changer" href="#"><i class="fa fa-chevron-down"></i> <span>Select Container</span></a><a class="button button-notext" title="Click to view container contents" href="/containers/cid/<%=CONTAINERID%>"><i class="fa fa-search"></i> <span>View Container</span></a></span><h1><%=NAME%></h1>'),
        className: function() { return  'container' + (this.getOption('assigned') ? ' assigned' : '') },
        
        events: {
        	"click a.showcontainer": "showContainer",
        },
        
        showContainer: function() {
        	this.trigger("cv:show");
        },
        
    });
            
            
            
    // List of Dewars in Shipment
    var DewarView = Marionette.CompositeView.extend({
        template: _.template('<h1 class="clearfix"><%=CODE%><span class="r deactivate"></span></h1><div class="containers clearfix"></div>'),
        className: function() {
            var classes = 'dewar clearfix'
            if (this.model.get('DEWARSTATUS') == 'processing') classes += ' active'
            
            return classes
        },
        
        childView: ContainerView,
        
        initialize: function(options) {
            this.collection = this.model.get('CONTAINERS')
        },
        
        onRender: function() {
            this.$el.show()
        },
        
        onChildviewCvShow: function(container) {
        	this.selectedContainer = container.model.get("CONTAINERID");
        	this.trigger("dv:showcontainer");
        },
    });
            
            
    // List of Shipments
    var ShipmentView = Marionette.CompositeView.extend({
        template: _.template('<h1><%=SHIPPINGNAME%></h1>'),
        childView: DewarView,
        className: 'shipment',
        
        initialize: function(options) {
            this.collection = this.model.get('DEWARS')
        },
        
        onChildviewDvShowcontainer: function(dewar) {
        	this.selectedContainer = dewar.selectedContainer;
        	this.trigger("sv:showcontainer");
        },
    });
            
            
            
    // Sample Changer Positions
    var PositionView = Marionette.CompositeView.extend({
        className:'bl_puck',
        template: _.template('<%=id%><div class="ac"></div>'),
        
        childView: ContainerView,
        childViewOptions: {
            assigned: true,
        },
        childViewContainer: '.ac',
        
        initialize: function(options) {
            this.collection = new Containers()
            this.assigned = options.assigned
            this.listenTo(this.assigned, 'change sync reset add remove', this.updateCollection, this)
            this.updateCollection()
        },
        
        updateCollection: function() {
            //console.log('update assigned', this.assigned)
            this.collection.reset(this.assigned.findWhere({ SAMPLECHANGERLOCATION: this.model.get('id').toString() }))
        },
        
        onRender: function() {
            this.$el.attr('id', 'blpos'+this.model.get('id'))
            
        },
        
    })
            
            
    var SampleChangerView = Marionette.CollectionView.extend({
        className: 'clearfix',
        childView: PositionView,
    })

            
            
    var View = Marionette.CompositeView.extend({
        template: _.template("<div id=\"unassigned\"></div>"),
        className: 'content',
        childView: ShipmentView,
        childViewContainer: '#unassigned',
        
        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit').toJSON(),
            }
        },
        
        refresh: function() {
//            this.assigned.fetch()
            this.containers.fetch()
        },
        
        initialize: function(options) {
            this.collection = new Shipments()
            
//            this.assigned = new Containers(null, { queryParams: { assigned: 1, bl: this.getOption('visit').get('BL') }, state: { pageSize: 9999 } })
//            this.assigned.fetch()
            
            this.containers = new Containers(null, { queryParams: { unassigned: this.getOption('visit').get('BL') }, state: { pageSize: 30, currentPage: options.page } })
            var self = this
            this.containers.fetch().done(function() {
                console.log(self.containers)
            })
            this.listenTo(this.containers, 'sync', this.generateShipments, this)
            
            this.paginator = new Pages({ collection: this.containers })
        },
        
        generateShipments: function() {
            console.log('generate shipments')
            var sids = _.uniq(this.containers.pluck('SHIPPINGID'))
            var shipments = []
            _.each(sids, function(sid) {
                var conts = new Containers(this.containers.where({ SHIPPINGID: sid }))
                
                var dids = _.uniq(conts.pluck('DEWARID'))
                var dewars = new Dewars()
                _.each(dids, function(did) {
                    var d = conts.findWhere({ DEWARID: did })
                    var dewar = new Dewar({
                        DEWARID: did,
                        CODE: d.get('DEWAR'),
                        DEWARSTATUS: d.get('DEWARSTATUS'),
                        CONTAINERS: new Containers(conts.where({ DEWARID: did }))
                    })
                    dewars.add(dewar)
                }, this)
                
                var shipment = new Shipment({
                    SHIPPINGID: sid,
                    SHIPPINGNAME: conts.at(0).get('SHIPMENT'),
                    DEWARS: dewars,
                })
                shipments.push(shipment)
            }, this)
            
            this.collection.reset(shipments)
        },
        
        
        onShow: function() {
//            this.$el.find('#assigned').append(this.scview.render().$el)
            this.$el.find('.page_wrap').append(this.paginator.render().$el)
            
        },
        
        onDestroy: function() {
            if (this.scview) this.scview.destroy()
            // hmm no destroy?
            //if (this.paginator) this.paginator.destroy()
        },
        
        onChildviewSvShowcontainer: function(shipment) {
        	this.selectedContainer = shipment.selectedContainer;
        	this.triggerMethod("v:showcontainer", shipment.selectedContainer);
        },
        
    });
    
    var OverView = Marionette.LayoutView.extend({
        
    	template: template,
    	className: "content",
    	
    	regions: {
    		shipments: ".shipments",
    		plans: ".plans",
    		sampletable: ".sampletable",
    		plantable: ".plantable",
    		planparam: ".planparam",
    	},
    	
    	onRender: function() {
    		var childView = new View({visit: this.getOption("visit")});
    		this.listenTo(childView, "v:showcontainer", this.showContainer);
    		this.shipments.show(childView);
    	},

    	// Show the details of a given container
    	showContainer: function(containerId) {
    		// Get the data for the view
    		var samples = new Samples({}, {containerID: containerId});
    		var self = this;
    		samples.fetch({
    			success: function(samples, response, options) {
    				console.log("assign.js:OverView.showContainer(): success fetching samples for container " + containerId);
    	    		self.sampletable.show(new SampleListView({collection: samples, containerId: containerId}));
    	    		self.showPlans(containerId, {ids: samples.pluck("BLSAMPLEID"), names: samples.pluck("NAME")});
    			},
    			error: function(samples, response, options) {
    				console.log("assign.js:OverView.showContainer(): error fetching samples for container " + containerId);
    			}
    		});
    		
    	},
    	
    	// Show all the data collection plans for a given sample changer
    	showPlans: function(containerId, sampleDetails) {
    		var plans = new SampleCollectionPlans();
    		plans.comparator = "ORDER";
    		this.fetchPlans(containerId, sampleDetails, 0, plans);
    	},
    	
    	// Fetch the plans for a sample in the changer, and add the models to
    	// the overall Collection
    	fetchPlans: function(containerId, sampleDetails, sampleIndex, planCollection) {
    		console.log("assign.js:OverView.fetchPlans(): sampleIndex = "+sampleIndex);
    		if (sampleIndex >= sampleDetails.ids.length)
				this.fetchPlanDetails(planCollection, 0, {containerId: containerId, sampleIds: sampleDetails.ids});
    		else {

    			var currentId = sampleDetails.ids[sampleIndex];
    			var currentName = sampleDetails.names[sampleIndex];

    			var plans = new SampleCollectionPlans({}, {sampleId: currentId});
    			var self=this;
    			plans.fetch({
    				success: function(plans, response, options) {
    					plans.each(function(model, index, collection) {
    						model.set({"SAMPLENAME": currentName.replace(/__/g, " ")});
    					});
    					planCollection.add(plans.models);
    					self.fetchPlans(containerId, sampleDetails, sampleIndex+1, planCollection);
    				},
    				error: function(plans, response, options) {
    					console.log("assign.js:OverView.fetchPlans(): Error getting data collection plans for sample "+currentId + ", " + currentName);
    					self.fetchPlans(containerId, sampleDetails, sampleIndex+1, planCollection);
    				},
    			});
    		}
    	},
    	
    	// Fetch the detectors and axes for all the plans
    	fetchPlanDetails: function(planCollection, planIndex, passHash) {
    		// Check if the fetching is done
    		if (planIndex >= planCollection.length)
    			this.fetchAxisServices(planCollection, passHash);
    		else {
    			// Fetch the details for the plan at planIndex
    			// Starting with the detectors
    			var planId = planCollection.at(planIndex).get("DIFFRACTIONPLANID");
    			var detectors = new Detectors({}, {dataCollectionId: planId});
    		var self = this;
    		detectors.fetch({
    			success: function(detectors, response, options) {
    				console.log("assign.js:OverView.fetchPlanDetails(): Added " + detectors.length + " detectors");
    				planCollection.at(planIndex).set({"DETECTORS": detectors});
    				self.fetchPlanAxes(planCollection, planIndex, passHash);
    			},
    			error: function(detectors, response, options) {
    				console.log("assign.js:OverView.fetchPlanDetails(): Error fetching detectors for data collection plan "+planId);
    				planCollection.at(planIndex).set({"DETECTORS": []});
    				self.fetchPlanAxes(planCollection, planIndex, passHash);
    			},
    		});
    		}
    	},    	

    	fetchPlanAxes: function(planCollection, planIndex, passHash) {
    		var planId = planCollection.at(planIndex).get("DIFFRACTIONPLANID");
    		var axes = new Axes({}, {dataCollectionPlanId: planId});
    		axes.comparator = "MODELNUMBER";
    		var self = this;
    		axes.fetch({
    			success: function(axes, response, options) {
    				console.log("assign.js:OverView.fetchPlanAxes(): Added " + axes.length + " scan axes");
    				planCollection.at(planIndex).set({"SCANMODELS": axes});
    				self.fetchPlanDetails(planCollection, planIndex+1, passHash);
    			},
    			error: function(axes, response, options) {
    				console.log("assign.js:OverView.fetchPlanAxes(): Error fetching scan parameter models for data collection plan "+planId);
    				planCollection.at(planIndex).set({"SCANMODELS": []});
    				self.fetchPlanDetails(planCollection, planIndex+1, passHash);
    			},
    		});
    	},

    	// Get the details of the service
    	fetchAxisServices: function(planCollection, passHash) {
    		var services = new ParamServices();
    		var self = this
    		services.fetch({
    			success: function(services, response, options) {
    				self.assignAxisServices(services, planCollection, passHash);
    			},
    			error: function(services, response, options) {
    				console.log("assign.js:OverView.fetchAxisServices(): Error getting scan parameter services");
    				self.showPlansFinale(passHash.containerId, passHash.sampleIds, planCollection);
    			},
    		});
    	},
    	
    	// Get the name of the scan service, stored on the scan parameter
    	// model as SERVICENAME
    	assignAxisServices: function(services, planCollection, passHash) {
    		planCollection.forEach(function(plan, index, plans) {
    			var axes = plan.get("SCANMODELS");
    			axes.forEach(function(scanModel, scanIndex, scanModels) {
    				var service = services.find(function(checkService) {
    					
    					var serviceId = checkService.get("SCANPARAMETERSSERVICEID");
    					var modelId = scanModel.get("SCANPARAMETERSSERVICEID")
    					return serviceId == modelId; 
    				});
    				scanModel.set({"SERVICENAME": service.get("NAME")});
    			});
    		});
    		
    		this.showPlansFinale(passHash.containerId, passHash.sampleIds, planCollection);
    	},
    	
    	// Having collected all the plans, show them
    	showPlansFinale: function(containerId, sampleIds, planCollection) {
//    		console.log("Assign:OverView.showPlansFinale: Found "+planCollection.length+" plans:", planCollection.pluck("DIFFRACTIONPLANID"), planCollection.pluck("SAMPLENAME"), planCollection.pluck("ORDER"));
    		// Set the  field which lists similar data collections (TODO)
    		planCollection.forEach(function(plan, index, plans) {

//    			console.log(plan);
    		});
    		
    		// Store the collection of plans for future reference
    		this.collection = planCollection;
    		
    		var planEvent = "plan:details";
    		// Show the table of data collection plans
    		if (this.collection.length > 0) {
    			this.$el.find("div.plantable").show();
    			this.$el.find("div.planparam").show();
    			this.$el.find("div.plandetails").hide();
    		
    			this.plantable.show(new PlanListView({
    				collection: planCollection, 
    				showPlanEvent: planEvent,
    				showPlanArgument: "ORDER"
    			}));
    			this.listenTo(app, planEvent, this.showPlanDetails);
    		} else {
    			this.$el.find("div.plantable").hide();
    			this.$el.find("div.planparam").hide();
    		}
    	},
    	
    	showPlanDetails: function(planOrdinal) {
    		console.log("assign.js:OverView.showPlanDetails(): show details for plan " + planOrdinal + " on ", this);
    		var plan = this.collection.find(function(plan) {return plan.get("ORDER") == planOrdinal});
    		console.log(plan);
			this.$el.find("div.plandetails").show();
    		this.planparam.show(new PlanDetailsView({model: plan}));
    	},
    	
        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit').toJSON(),
            }
        },

    });
    
    var SampleListView = Marionette.LayoutView.extend({
    	
    	regions: {
    		thetable: ".thetable",
    	},
    	
    	/*
    	 * options
    	 * options.collection: the collection of samples to be displayed
    	 * options.containerId: the id of the container to be displayed
    	 */
    	initialize: function(options) {
    		this.template = _.template("<h2>Sample Changer "+ options.containerId + "</h2>" +
    				"<a class=\"button button-notext\" href=\"/containers/cid/" + options.containerId + "\"><i class=\"fa fa-search\"></i></a>" + 
    				"<div class=\"thetable\"></div>");
    		if (options && options.collection) this.collection = options.collection;
    	},
    	
    	onShow: function() {
    		this.thetable.show(new SampleListTableView({collection: this.collection}));
    		
    	},
    });
    
    // View for the data collection plans in a sample holder
    var PlanListView = Marionette.LayoutView.extend({
    	
    	template: _.template("<h2 class=\"tabletitle\">Data Collection Plans</h2>" +
    			"<div class=\"thetable\"></div>"),
    	
    	regions: {
    		thetable: ".thetable",
    	},
    	
    	/*
    	 * options
    	 * options.collection: the collection of plans to be displayed
    	 * options.showPlanEvent: the event fired when an event is to be shown
    	 * options.showPlanArgument: the identifier for the selected plan
    	 */
    	initialize: function(options) {
    		if (options && options.collection) this.collection = options.collection;
    		if (options && options.showPlanEvent) this.showPlanEvent = options.showPlanEvent;
    		if (options && options.showPlanArgument) this.showPlanArgument = options.showPlanArgument;
    	},
    	
    	onShow: function() {
    		if (this.collection.length > 0) {
//    			this.$el.find("h2.tabletitle").show();
//    			this.$el.find("div.thetable").show();
    			this.thetable.show(new PlanListTableView({
    				collection: this.collection,
    				showPlanEvent: this.showPlanEvent,
    				showPlanArgument: this.showPlanArgument
    			}));
    		} else {
//    			this.$el.find("h2.tabletitle").hide();
//    			this.$el.find("div.thetable").hide();
    		}
    	},
    });
    
    var PlanListTableView = TableView.extend( {
    	backgrid: {
    	},
    	
    	modelEvents: {
    		"sort": "render",
    	},
    	
    	loading:true,

        deUnderscoreCell: table.TemplateCell.extend({
        	getTemplate: function() {
        		return this.model.get("SAMPLENAME").replace(/__/g, " ");
        	},
        }),
        
        ProcedureCell: table.TemplateCell.extend({
        	getTemplate: function() {
        		var detectors = this.model.get("DETECTORS");
        		var procedures = detectors.pluck("TYPE");
        		var procedureString = procedures.join(" & ");
        		return procedureString;
        	},
        }),

        ScanCell: table.TemplateCell.extend({
        	getTemplate: function() {
        		var scans = this.model.get("SCANMODELS");
        		var services = scans.pluck("SERVICENAME");
        		var serviceString = services.join(", ");
        		return (serviceString.length > 0) ? serviceString : "(No scan)";
        	},
        }),
        
        SssCell: table.TemplateCell.extend({
        	getTemplate: function() {
        		
        		var scans = this.model.get("SCANMODELS");
        		var ssss = scans.map(function(scanModel, index, scanModels) {
        			// Prefer array to incomplete start:stop:step, but not to a complete triplet
        			if (scanModel.get("ARRAY").length == 0 || (
        					scanModel.get("START").length > 0 &&
        					scanModel.get("STOP").length > 0 &&
        					scanModel.get("STEP").length > 0)) {
            			return scanModel.get("START") + ":" + scanModel.get("STOP") + ":" + scanModel.get("STEP");
        			} else {
        				var despace = scanModel.get("ARRAY").replace(/ /g, "");
        				var arrayStrings = despace.split(",");
        				return "[" + arrayStrings[0] + ",...," + arrayStrings[arrayStrings.length-1] + "]";
        			}
        			
        		});
        		
        		var sssString = ssss.join(", ");
        		return sssString;
        	},
        }),

        ButtonCell: table.TemplateCell.extend({
        	events: {
        		"click button.copy": "doCopy",
        		"click button.up": "doMoveUp",
        		"click button.down": "doMoveDown",
        		"click button.remove": "doDelete",
        	},
        	getTemplate: function() {
        		return "" +
        		"<button type=\"button\" class=\"button button-notext copy\" title=\"Copy plan to end\"><i class=\"fa fa-copy\"></i></button>" + 
        		"<button " + ((this.model.get("ORDER") == 1) ? "disabled" : "") + " type=\"button\" class=\"button button-notext up\" title=\"Move up\"><i class=\"fa fa-arrow-up\"></i></button>" +
        		"<button " + ((this.model.get("ORDER") == this.nPlans) ? "disabled" : "") + " type=\"button\" class=\"button button-notext down\" title=\"Move down\"><i class=\"fa fa-arrow-down\"></i></button>" +
        		"<button type=\"button\" class=\"button button-notext remove\" title=\"Remove plan\"><i class=\"fa fa-remove\"></i></button>";
        	},
        	doCopy: function(event) {
        		this.parentTable.doCopy(this.model, this);
        	},
        	doMoveUp: function(event) {
        		this.parentTable.moveUp(this.model.get("ORDER"));
        	},
        	doMoveDown: function(event) {
        		this.parentTable.moveDown(this.model.get("ORDER"));
        	},
        	doDelete: function(event) {
        		this.parentTable.doRemove(this.model, this.decrementNPlans);
        	},
        	incrementNPlans: function() {
        		this.nPlans += 1;
        	},
        	decrementNPlans: function() {
        		this.nPlans -= 1;
        	},
        }),
        // Callback functions for the above cell
        doCopy: function(model, cell) {
    		console.log("Copying plan " + model.get("ORDER") + " from ", cell);
        	
        },
        moveUp: function(order) {
        	if (order != 1) {
        		this.movePlan(order, -1);
        	}
        },
        moveDown: function(order) {
        	if (order != this.collection.length) {
        		this.movePlan(order, +1);
        	}
        },
        doRemove: function(model, cell) {
    		console.log("Deleting plan " + model.get("ORDER") + " at ", cell);

        },
        movePlan: function(order, moveBy) {
        	// swap the plans with order order and order+moveBy
        	var otherOrder = (parseInt(order, 10) + parseInt(moveBy, 10)).toLocaleString();
        	var model1 = this.collection.findWhere({"ORDER": order});
        	var model2 = this.collection.findWhere({"ORDER": otherOrder});
        	model2.set({"ORDER": order});
        	model1.set({"ORDER": otherOrder});
        	
        	this.collection.sort();
        },
        
        /*
    	 * options
    	 * options.showPlanEvent: the event fired when an event is to be shown
    	 * options.showPlanArgument: the identifier for the selected plan
    	 */
    	initialize: function(options) {
    		
    		var self = this;
    		
    		this.columns = [
        		{ name: "ORDER", label: "", cell: "string", editable: false},
//        		{ name: "DIFFRACTIONPLANID", label: "ID", cell: "string", editable: false},
        		{ name: "SAMPLENAME", label: "Sample", cell: this.deUnderscoreCell, editable: false},
        		{ name: "DETECTORS", label: "Procedure", cell: this.ProcedureCell, editable: false},
        		{ name: "SCANMODELS", label: "Axes", cell: this.ScanCell, editable: false},
        		{ name: "SCANMODELS", label: "Scan values", cell: this.SssCell, editable: false},
        		{ name: "WAVELENGTH", label: "Wavelength (Å)", cell: "string", editable: false},
        		{ name: "BUTTONS", label: "", cell: this.ButtonCell.extend({
        			nPlans: options.collection.length,
        			parentTable: self,
        		}), editable: false},
        	];
    		
    		this.backgrid.row = table.ClickableRow.extend({
    			event: options.showPlanEvent,
    			argument: options.showPlanArgument,
    		});
    		
			TableView.prototype.initialize.apply(this, [options]);
    	},
    	
    });
    
    var PlanDetailsView = Marionette.LayoutView.extend({
    	className: "content",
    	
    	regions: {
    		detectortable: ".detectortable",
    		axistable: ".axistable",
    	},
    	
    	template: _.template("<h1>Plan Details</h1>" + 
    	        "<ul>" + 
    	        "<li><span class=\"label\">Instance</span><span><%=SAMPLENAME%></span></li>" +
    	        "<li><span class=\"label\">Wavelength (Å)</span><span><%=WAVELENGTH%></span></li>" +
    	        "<li><span class=\"label\">Mono. bandwidth</span><span><%=MONOBANDWIDTH%></span></li>" +
    	        "<li><span class=\"label\">Beam size (mm)</span><span><%=PREFERREDBEAMSIZEX%></span><span>×</span><span><%=PREFERREDBEAMSIZEY%></span></li>" +
    	        "</ul>" +
    	        "<h2>Detectors</h2>" +
    	        "<div class=\"detectortable\"></div>" +
    	        "<h2 class=\"scantitle\">Scan axes</h2>"+
    	        "<div class=\"axistable\"></div>"
    	        
    	 ),
    	 
    	 initialize: function(options) {
    		 this.model = options.model;
    	 },
    	 
    	 onRender: function() {
    		this.detectortable.show(new DetectorView({collection: this.model.get("DETECTORS"), pages: false}));
    		if (this.model.get("SCANMODELS").length > 0) {
    			this.$el.find("h3.scantitle").show();
    			this.$el.find("div.axistable").show();
    			this.axistable.show(new AxisView({collection: this.model.get("SCANMODELS"), pages:false}));
    		} else {
    			this.$el.find("h3.scantitle").hide();
    			this.$el.find("div.axistable").hide();
    		}

    	 },
    	
    });
    
    var DetectorView = TableView.extend({
    	columns: [
    		{name: "TYPE", label: "Type", cell: "string", editable: false},
    		{name: "MANUFACTURER", label: "Manufacturer", cell: "string", editable: false},
    		{name: "MODEL", label: "Model", cell: "string", editable: false},
    		{name: "DISTANCE", label: "Distance (mm)", cell: "string", editable: true},
    		{name: "EXPOSURETIME", label: "Exposure time (s)", cell: "string", editable: true},
    		{name: "ORIENTATION", label: "Orientation (0, 45°)", cell: "string", editable: true},
    	],
    	
    });
    
    var AxisView = TableView.extend({
    	initialize: function(options) {
    	
    	this.columns = [
    		{name: "MODELNUMBER", label: "Order", cell: "string", editable: false},
    		{name: "SERVICENAME", label: "Service", cell: "string", editable: false},
    		{name: "START", label: "Start:", cell: "string", editable: true},
    		{name: "STOP", label: "Stop:", cell: "string", editable: true},
    		{name: "STEP", label: "Step", cell: "string", editable: true},
    		{name: "ARRAY", label: "Array values", cell: ParameterArrayCell, editable: true},
    	];

    	TableView.prototype.initialize.apply(this, [options]);
    	
    	},
    });
    
//    var SssEditCell = table.TemplateCell.extend({
//    	getTemplate: function() {
//    		var scanModel = this.model;
//    			return scanModel.get("START") + ":" + scanModel.get("STOP") + ":" + scanModel.get("STEP");
//    	}});

    var ParameterArrayCell = table.TemplateCell.extend({
    	getTemplate: function() {

    		var scanModel = this.model;
    		if (scanModel.get("ARRAY").length != 0) {
    			var despace = scanModel.get("ARRAY").replace(/ /g, "");
    			var arrayStrings = despace.split(",");
    			return "[" + arrayStrings[0] + ",...," + arrayStrings[arrayStrings.length-1] + "]";
    		} else {
    			return ""
    		}
    	},

    });
    
    
	return OverView;
});