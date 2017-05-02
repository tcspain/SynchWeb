define([
	'marionette',
	'views/pages',
	"views/dialog",
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
    "models/experimentplanfakes/datacollectionplan",
    "models/experimentplanfakes/samplecollectionplan",
    "models/experimentplanfakes/scanparametersmodel",
    "modules/types/xpdf/samples/views/samplelisttableview",
    'utils',
    "utils/table",
    "modules/types/xpdf/utils/optioneditable",
    'tpl!templates/types/xpdf/assign/assign.html',
    "backbone",
    "backgrid",
    "backbone-validation",
    'jquery-ui',
    ], function(
    		Marionette,
    		Pages,
    		DialogView,
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
    		DataCollectionPlan,
    		SampleCollectionPlan,
    		ScanParametersModel,
    		SampleListTableView,
    		utils,
    		table,
    		Editable,
    		template,
    		Backbone,
    		Backgrid
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
    	
    	events: {
    		"click button.savechanger": "doSaveChanger",
    	},
    	
    	onRender: function() {
    		var childView = new View({visit: this.getOption("visit")});
    		this.listenTo(childView, "v:showcontainer", this.showContainer);
    		this.shipments.show(childView);
    		// fetch the available scan parameter services, since this will not
    		// change during the lifetime of the view
    		this.services = new ParamServices();
    		this.services.fetch({
    			error: function(services, response, options) {
    				console.log("assign.js:OverView.onRender(): Error getting scan parameter services");
    			},
    		});
    		// Fetch the list of all available detectors. This will not change over the lifetime of the view (or probably the beamline). 
    		this.detectors = new Detectors();
    		this.detectors.fetch({
    			error: function(detectors, response, options) {
    				console.log("assign.js:OverView.onRender(): Error getting beamline detectors");
    			}
    		})
    	},

    	// Show the details of a given container
    	showContainer: function(containerId) {
    		this.containerId = containerId;
    		// Get the data for the view
    		this.samples = new Samples({}, {containerID: this.containerId});
    		// An array of SampleCollectionPlans collections, in order of the sample on the sample changer
    		this.plansBySample = [];
    		// A Collection of plans that do not have an associated sample
    		this.plansWithoutSample = new SampleCollectionPlans(); 

    		var self = this;
    		this.samples.fetch({
    			success: function(samples, response, options) {
    				console.log("assign.js:OverView.showContainer(): success fetching samples for container " + self.containerId);
    	    		self.sampletable.show(new SampleListView({collection: self.samples, containerId: self.containerId}));
    	    		self.fetchPlans(0)
    			},
    			error: function(samples, response, options) {
    				console.log("assign.js:OverView.showContainer(): error fetching samples for container " + self.containerId);
    			}
    		});
    		
    	},
    	
    	// Fetch the plans for a sample in the changer, and add the collections
    	// to the per-sample array of collections
    	fetchPlans: function(sampleIndex) {
    		console.log("assign.js:OverView.fetchPlans(): sampleIndex = "+sampleIndex);
    		if (sampleIndex >= this.samples.length)
				this.makePlanCollection();
    		else {

    			var currentId = this.samples.at(sampleIndex).get("BLSAMPLEID");
    			var currentName = this.samples.at(sampleIndex).get("NAME");

    			this.plansBySample[sampleIndex] = new SampleCollectionPlans({}, {sampleId: currentId});
    			var self=this;
    			this.plansBySample[sampleIndex].fetch({
    				success: function(plans, response, options) {
    					// Add the fetched plan collection to the array of plans by sample 
    					self.fetchPlans(sampleIndex+1);
    				},
    				error: function(plans, response, options) {
    					console.log("assign.js:OverView.fetchPlans(): Error getting data collection plans for sample "+currentId + ", " + currentName);
    					self.fetchPlans(sampleIndex+1);
    				},
    			});
    		}
    	},
    	
    	// Make the per-changer collection of plans from the per-instance array
    	// of collections of plans
    	makePlanCollection: function(normalize) {
    		// The Collection of all plans for this sample changer
    		this.planCollection = new SampleCollectionPlans();
    		this.planCollection.comparator = "ORDER";

    		var self = this;
    		// iterate over each sample's collection of plans
    		_.each(this.plansBySample, function(plans, sampleIndex, plansBySample) {
    			var currentId = self.samples.at(sampleIndex).get("BLSAMPLEID");
    			var currentName = self.samples.at(sampleIndex).get("NAME");
    			
    			// iterate over the Collection of plans 
    			plans.each(function(plan, planIndex, plans) {
    				plan.set({"SAMPLENAME": currentName.replace(/__/g, " ")});
    				// Add the plan to the overall collection, where is will be
    				// added in the sorted order
    				self.planCollection.add(plan);
    			});
    		});
    		
    		// Plans as yet unassigned to a sample
    		this.plansWithoutSample.each(function(plan, planIndex, plans) {
    			plan.set({"SAMPLENAME": ""});
    			self.planCollection.add(plan);
    		});
    		
    		// Normalize the order, if required
    		if (normalize)
    			this.planCollection.each( function(plan, planIndex, planCollection) {
    				plan.set({"ORDER": planIndex+1});
    			});
    		
    		this.fetchPlanDetails(0);
    	},
    	
    	// Fetch the detectors and axes for all the plans
    	fetchPlanDetails: function(planIndex) {
    		
    		// Check if the fetching is done
    		if (planIndex >= this.planCollection.length)
    			this.assignAxisServices();
    		else {
        		// Check for new plans without a DiffractionPlanId, and assign empty collections
        		if (this.planCollection.at(planIndex).get("DIFFRACTIONPLANID") === "") {
        			this.planCollection.at(planIndex).set({
        				"DETECTORS": new Detectors(),
        				"SCANMODELS": new Axes(),
        			});
        			this.fetchPlanDetails(planIndex + 1);
        		} else if (this.planCollection.at(planIndex).has("DETECTORS")) {
    				this.fetchPlanAxes(planIndex);
    			} else {
    				// Fetch the details for the plan at planIndex
    				// Starting with the detectors
    				var planId = this.planCollection.at(planIndex).get("DIFFRACTIONPLANID");
    				var detectors = new Detectors({}, {dataCollectionId: planId});
    				var self = this;
    				detectors.fetch({
    					success: function(detectors, response, options) {
    						console.log("assign.js:OverView.fetchPlanDetails(): Added " + detectors.length + " detectors");
    						self.planCollection.at(planIndex).set({"DETECTORS": detectors});
    						self.fetchPlanAxes(planIndex);
    					},
    					error: function(detectors, response, options) {
    						console.log("assign.js:OverView.fetchPlanDetails(): Error fetching detectors for data collection plan "+planId);
    						self.planCollection.at(planIndex).set({"DETECTORS": []});
    						self.fetchPlanAxes(planIndex);
    					},
    				});
    			}
    		}
    	},    	

    	fetchPlanAxes: function(planIndex) {
    		if (this.planCollection.at(planIndex).has("SCANMODELS")) {
    			this.fetchPlanDetails(planIndex+1);
    		} else {
    			var planId = this.planCollection.at(planIndex).get("DIFFRACTIONPLANID");
    			var axes = new Axes({}, {dataCollectionPlanId: planId});
    			axes.comparator = "MODELNUMBER";
    			var self = this;
    			axes.fetch({
    				success: function(axes, response, options) {
    					console.log("assign.js:OverView.fetchPlanAxes(): Added " + axes.length + " scan axes");
    					self.planCollection.at(planIndex).set({"SCANMODELS": axes});
    					self.fetchPlanDetails(planIndex+1);
    				},
    				error: function(axes, response, options) {
    					console.log("assign.js:OverView.fetchPlanAxes(): Error fetching scan parameter models for data collection plan "+planId);
    					var emptyAxes = new Axes([], {dataCollectionPlanId: planId});
    					
    					self.planCollection.at(planIndex).set({"SCANMODELS": emptyAxes});
    					self.fetchPlanDetails(planIndex+1);
    				},
    			});
    		}
    	},

    	// Get the name of the scan service, stored on the scan parameter
    	// model as SERVICENAME
    	assignAxisServices: function() {
    		var services = this.services;
    		this.planCollection.forEach(function(plan, index, plans) {
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
    		
    		this.showPlansFinale();
    	},
    	
    	// Having collected all the plans, show them
    	showPlansFinale: function() {
//    		console.log("Assign:OverView.showPlansFinale: Found "+planCollection.length+" plans:", planCollection.pluck("DIFFRACTIONPLANID"), planCollection.pluck("SAMPLENAME"), planCollection.pluck("ORDER"));
    		// Set the  field which lists similar data collections (TODO)
    		this.planCollection.forEach(function(plan, index, plans) {

//    			console.log(plan);
    		});
    		
    		// Store the collection of plans for future reference
//    		this.collection = planCollection;
    		
    		var planEvent = "plan:details";
    		// Show the table of data collection plans
    		if (this.planCollection.length > 0) {
    			this.$el.find("div.plantable").show();
    			this.$el.find("div.planparam").show();
    			this.$el.find("div.plandetails").hide();
    		
    			this.plantable.show(new PlanListView({
    				collection: this.planCollection, 
    				showPlanEvent: planEvent,
    				showPlanArgument: "ORDER",
    				collectionView: this,
    			}));
    			this.listenTo(app, planEvent, this.showPlanDetails);
    		} else {
    			this.$el.find("div.plantable").hide();
    			this.$el.find("div.planparam").hide();
    		}
    	},
    	
    	showPlanDetails: function(planOrdinal) {
    		console.log("assign.js:OverView.showPlanDetails(): show details for plan " + planOrdinal + " on ", this);
    		var plan = this.planCollection.find(function(plan) {return plan.get("ORDER") == planOrdinal});
    		console.log(plan);
			this.$el.find("div.plandetails").show();
    		this.planparam.show(new PlanDetailsView({
    			model: plan,
    			detectors: this.detectors,
    			services: this.services.pluck("NAME"),
    			samples: this.samples,
    			parentView: this,
    		}));
    	},
    	
        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit').toJSON(),
            }
        },
        
        // Plan manipulation functions
        move: function(ordinalIn, moveBy) {
        	// Ensure ordinal is numeric
        	/*int*/ var ordinal = (typeof ordinalIn === 'number') ? ordinalIn : Number.parseInt(ordinalIn);
        	// Since moveBy is not ultimately read from JSON, it is assumed numeric
        	
        	// Make sure nothing moves beyond the end of the array. Ordinal is
        	// 1-indexed!
        	if (ordinal + moveBy < 1)
        		moveBy = 1 - ordinal;
        	if (ordinal + moveBy > this.planCollection.length)
        		moveBy = this.planCollection.length - ordinal;

        	// The models that are to be moved run from ordinal to ordinal+moveBy
        	var endPoint = ordinal + moveBy;
        	
        	var direction = Math.sign(moveBy);
        	var upper = Math.max(ordinal, endPoint);
        	var lower = Math.min(ordinal, endPoint);
        	// all the models to be moved
        	var moveModels = this.planCollection.filter(function(plan) {return plan.get("ORDER") >= lower && plan.get("ORDER") <= upper});
        	var movedModel;
        	var contraModels;
        	if (direction == +1) {
        		movedModel = _.first(moveModels);
        		contraModels = _.rest(moveModels);
        	} else if (direction == -1) {
        		movedModel = _.last(moveModels);
        		contraModels = _.initial(moveModels);
        	} else {
        		// moveBy is zero
        		return;
        	}
        	// Move the model, slipping in between the other plans
        	movedModel.set({"ORDER": (endPoint+0.5*direction).toLocaleString()});
        	
        	this.makePlanCollection(true);
        	
        },
        
        // remove the data collection plan from its instance in this sample
        // changer
        remove: function(sOrdinal) {
        	// Ensure ordinal is numeric
        	/*int*/ var ordinal = (typeof sOrdinal === 'number') ? sOrdinal : Number.parseInt(sOrdinal);
        	// remove the plan with ORDER = ordinal from the per-sample and
        	// per-changer collections of data collection plans
        	_.each(this.plansBySample, function(samplePlans, index, plansBySample) {
        		samplePlans.remove(sOrdinal);//{"ORDER": sOrdinal});
        	});
        	this.planCollection.remove(sOrdinal);//{"ORDER": sOrdinal});
        	
        	this.makePlanCollection(true);
        },
        
        // another instance of the same data collection plan
        copy: function(ordinal) {
        	/*string*/ var newOrder = (this.planCollection.length + 1).toLocaleString();
        	_.each(this.plansBySample, function(samplePlans, sampleIndex, plansBySample) {
        		var sourcePlan = samplePlans.findWhere({"ORDER": ordinal});
        		if (sourcePlan) {
        			var newPlan = sourcePlan.clone();
        			newPlan.set({"ORDER": newOrder});
        			samplePlans.add(newPlan);
        		}
        	});
        	
        	this.makePlanCollection();
        },
        
        // a new data collection plan, with the same parameter values
        clone: function(ordinal) {
        	
        },
        
        // add a new, empty data collection plan
        create: function() {
        	console.log("Create new plan");

        	var nextOrder = this.planCollection.length+1;

        	// New plan without touching the database
        	var samplePlan = new SampleCollectionPlan();
        	samplePlan.set({
        		"ORDER": nextOrder,
        		"DIFFRACTIONPLANID": "",
				"WAVELENGTH": "",
				"PREFERREDBEAMSIZEX": "",
				"PREFERREDBEAMSIZEY": "",
				"MONOBANDWIDTH": "",
        	});
        	this.plansWithoutSample.add(samplePlan);
        	this.makePlanCollection();
        	
        },
        
        movePlanToSample(ordinal, nySampleId) {
    		if (_.contains(this.planCollection.pluck("ORDER"), ordinal)) {
        		console.log("Move plan at " + ordinal + " to sampleId " + nySampleId);
        		var movingModel = this.planCollection.findWhere({"ORDER": ordinal});
        		var targetSampleIndex = _.indexOf(this.samples.pluck("BLSAMPLEID"), nySampleId);
        		// remove the moving model 
        		_.each(this.plansBySample, function(plans, index, planses) {
        			plans.remove(plans.where({"ORDER": ordinal}));
        		});
        		this.plansWithoutSample.remove(this.plansWithoutSample.where({"ORDER": ordinal}));
        		// place the moving model
        		this.plansBySample[targetSampleIndex].push(movingModel);

    		} else {
    			console.log("planCollection has no plan ordered in position " + ordinal);
    		}
    		this.makePlanCollection();
        },
        
        doSaveChanger: function() {
        	var self = this;
        	
        	var toFetch = 0, fetched = 0;
        	
        	// Get new ids for newly created models
        	_.each(this.plansBySample, function(planCollection, sampleIndex, plansBySample) {
        		planCollection.each(function(plan, planIndex, plans) {
        			if (plan.get("DIFFRACTIONPLANID") === "") {
        				var nyDataCollectionPlan = new DataCollectionPlan();
        				toFetch++;
        				nyDataCollectionPlan.save({}, {
        					success: function(model, response, options) {
        						plan.set({"DIFFRACTIONPLANID": model.get("DIFFRACTIONPLANID")});
        						fetched++;
        						if (fetched == toFetch)
        							self.doSaveToBacking();
        					},
        					error: function(model, response, options) {
        						self.saveFailed("Error saving new data collection plan");
        					},
        				});
        			}
        			var scanParamModels = plan.get("SCANMODELS");
        			scanParamModels.each(function(scanModel, modelIndex, models) {
        				if (scanModel.get("SCANPARAMETERSMODELID") === "") {
        					var nyScanAxes = new ScanParametersModel();
        					toFetch++;
        					nyScanAxes.save({}, {
        						success: function(model, response, options) {
        							scanModel.set({"SCANPARAMETERSMODELID": model.get("SCANPARAMETERSMODELID")});
        							fetched++;
            						if (fetched == toFetch)
            							self.doSaveToBacking();
        						},
        						error: function(model, response, options) {
        							self.saveFailed("Error saving new scan parameters model");
        						},
        					});
        				}
        			});
        			
        		});
        	});
        	if (toFetch == 0)
        		this.doSaveToBacking();
        },
        
        doSaveToBacking: function() {
        	console.log("One day this will save the plans to the database for container " + this.containerId);
        	var self = this;
        	var saveData = "";
        	// Generate the data to be saved
        	_.each(this.plansBySample, function(planCollection, sampleIndex, plansBySample) {
    			saveData += "<p>PUT to <code>/api/dcplan/sample/"+self.samples.at(sampleIndex).get("BLSAMPLEID")+"</code></p>\n";
    			saveData += "<p><code>" + JSON.stringify(planCollection) + "</code></p>\n";
    			
    			planCollection.each(function(plan, planIndex, plans) {
        			saveData += "<p>PUT to <code>/api/detector/dcplan/"+plan.get("DIFFRACTIONPLANID")+"</code>:</p>\n";
        			saveData += "<p><code>"+JSON.stringify(plan.get("DETECTORS"))+"</code></p>\n";
        			if (plan.get("SCANMODELS").length > 0) {
        				saveData += "<p>PUT to <code>/api/scanparam/dcplan/"+plan.get("DIFFRACTIONPLANID")+"</code>:</p>\n";
        				saveData += "<p><code>" + JSON.stringify(plan.get("SCANMODELS"))+"</code></p>\n";
        			}
        		});
    			saveData += "<hr />";
        	});
        	var dataDialog = new SaveDataView({template: _.template(saveData),	});
        	app.dialog.show(dataDialog);
        },
        
        saveFailed: function(message) {
        	console.log("Unable to save changed sample changer details: " + message);
        },
        
    });
    
    var SaveDataView = DialogView.extend({
    	className: "plans",
    	title: "Save data",
    	buttons: {
    		"Close": "closeDialog",
    	},
    	
    	initialize: function(options) {
    		this.template = options.template;
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
    			"<div class=\"thetable\"></div>" + 
    			"<button type=\"button\" class=\"button create\" title=\"Create new empty plan\"><i class=\"fa fa-plus\"</i>New Data Collection Plan</button>"
    			),
    	
    	regions: {
    		thetable: ".thetable",
    	},
    	
    	events: {
    		"click button.create": "createPlan",
    	},
    	
    	/*
    	 * options
    	 * options.collection: the collection of plans to be displayed
    	 * options.showPlanEvent: the event fired when an event is to be shown
    	 * options.showPlanArgument: the identifier for the selected plan
    	 * options.collectionView: the view holding the collection for the
    	 * 			table, which provides move(order, by), remove(order),
    	 * 			copy(order) and clone(order) functions.

    	 */
    	initialize: function(options) {
    		if (options && options.collection) this.collection = options.collection;
    		if (options && options.showPlanEvent) this.showPlanEvent = options.showPlanEvent;
    		if (options && options.showPlanArgument) this.showPlanArgument = options.showPlanArgument;
    		if (options && options.collectionView) this.collectionView = options.collectionView;
    	},
    	
    	onShow: function() {
    		if (this.collection.length > 0) {
//    			this.$el.find("h2.tabletitle").show();
//    			this.$el.find("div.thetable").show();
    			this.thetable.show(new PlanListTableView({
    				collection: this.collection,
    				showPlanEvent: this.showPlanEvent,
    				showPlanArgument: this.showPlanArgument,
    				collectionView: this.collectionView,
    			}));
    		} else {
//    			this.$el.find("h2.tabletitle").hide();
//    			this.$el.find("div.thetable").hide();
    		}
    	},
    	
    	createPlan: function(event) {
    		this.collectionView.create();
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
        		this.parentTable.doCopy(this.model.get("ORDER"));
        	},
        	doMoveUp: function(event) {
        		this.parentTable.moveUp(this.model.get("ORDER"));
        	},
        	doMoveDown: function(event) {
        		this.parentTable.moveDown(this.model.get("ORDER"));
        	},
        	doDelete: function(event) {
        		this.parentTable.doRemove(this.model.get("ORDER"));
        	},
        }),
        // Callback functions for the above cell
        doCopy: function(order) {
        	console.log("Copying plan " + order);
        	this.collectionView.copy(order);
        },
        moveUp: function(order) {
        	console.log("Moving up plan " + order);
        	if (order > 1) {
        		this.collectionView.move(order, -1);
        	}
        },
        moveDown: function(order) {
        	console.log("Moving down plan " + order);
        	if (order < this.collection.length) {
        		this.collectionView.move(order, +1);
        	}
        },
        doRemove: function(order) {
        	console.log("Removing plan " + order);
        	this.collectionView.remove(order);
        },
        
        /*
    	 * options
    	 * options.showPlanEvent: the event fired when an event is to be shown
    	 * options.showPlanArgument: the identifier for the selected plan
    	 * options.collectionView: the view holding the collection that
    	 * 			provides move(order, by), remove(order), copy(order) and
    	 * 			clone(order) functions.
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
    		
    		this.collectionView = options.collectionView;
    		
			TableView.prototype.initialize.apply(this, [options]);
    	},
    	
    });
    
    var PlanDetailsView = Marionette.LayoutView.extend({
    	className: "content",
    	
    	regions: {
    		detectortable: ".detectortable",
    		axistable: ".axistable",
    	},
    	
    	modelEvents: {
    		"change": "render",
    	},
    	
    	events: {
    		"click button.addaxis": "addAxis",
    		"change select.instanceselect": "changeInstance",
    	},
    	
    	template: _.template("<h1>Plan Details</h1>" + 
    	        "<ul>" + 
    	        "<li><span class=\"label\">Instance</span><select class=\"instanceselect\"></select>" + 
    	        "<li><span class=\"label\">Wavelength (Å)</span><span class=\"WAVELENGTH\"><%=WAVELENGTH%></span></li>" +
    	        "<li><span class=\"label\">Mono. bandwidth</span><span class=\"MONOBANDWIDTH\"><%=MONOBANDWIDTH%></span></li>" +
    	        "<li><span class=\"label\">Beam size (mm)</span><span class=\"PREFERREDBEAMSIZEX\"><%=PREFERREDBEAMSIZEX%></span><span>×</span><span class=\"PREFERREDBEAMSIZEY\"><%=PREFERREDBEAMSIZEY%></span></li>" +
    	        "</ul>" +
    	        "<h2>Detectors</h2>" +
    	        "<div class=\"detectortable\"></div>" +
    	        "<h2 class=\"scantitle\">Scan axes</h2>"+
    	        "<div class=\"axistable\"></div>" +
    	        "<button class=\"button addaxis\"><i class=\"fa fa-plus\"></i>Add scan axis</button>"
    	        
    	        
    	 ),
    	 
    	 /*
    	  * options:
    	  * options.model: model of the sampleCollectionPlan  for which the details are to be shown
    	  * options.detectors: collection of all available detectors
    	  * options.services: collection of all available scan parameters services
    	  * options.sample: collection of the samples in this sample changer
    	  * options.parentView: the object which will handle the movePlanToSample(order, sid) function call
    	  */
    	 initialize: function(options) {
    		 Backbone.Validation.bind(this);
    		 
    		 this.model = options.model;
    		 this.detectors = options.detectors.clone();
    		 this.services = options.services;
    		 this.samples = options.samples;
    		 
    		 this.parentView = options.parentView;
    		 
    	 },
    	 
    	 onRender: function() {
    		 // editable fields
    		 var edit = new Editable( {model: this.model, el: this.$el, nosave: true});
    		 edit.create("WAVELENGTH", "text");
    		 edit.create("MONOBANDWIDTH", "text");
    		 edit.create("PREFERREDBEAMSIZEX", "text");
    		 edit.create("PREFERREDBEAMSIZEY", "text");
    		 
    		 // Create the collection of detector data, using all the beamline
    		 // detectors, and the data collection detector data
    		 var self = this;
    		 this.detectors.each(function(detector, index, detectors) {
    			if (self.model.get("DETECTORS").get(detector.get("DETECTORID"))) {
    				var planDetector = self.model.get("DETECTORS").get(detector.get("DETECTORID"));
    				detector.set({
    					"ISUSED": true,
    					"DISTANCE": planDetector.get("DISTANCE"),
    					"ORIENTATION": planDetector.get("ORIENTATION"),
    					"EXPOSURETIME": planDetector.get("EXPOSURETIME"),
    					});
    			} else {
    				detector.set({
    					"ISUSED": false,
    					"DISTANCE": detector.get("DISTANCEMIN") + "-" + detector.get("DISTANCEMAX"),
    					"ORIENTATION": "0 or 45°",
    					"EXPOSURETIME": "-",
    				});
    			}
    			
    			
  
    		 });

    		 // The instances available to select does not change in this view
    		 var selectotron = this.$el.find("select.instanceselect").get(0);
    		 
    		 this.samples.each(function(sample, index, samples) {
    			 selectotron.add(new Option(sample.get("NAME").replace(/__/g, " "), sample.get("BLSAMPLEID")));
    		 });
    		 // Get the ID of the current sample
    		 var currentSampleName = this.model.get("SAMPLENAME");
    		 var currentSampleId;
    		 if (currentSampleName === "") {
    			 currentSampleId = -1;
    		 } else {
    			 var currentSampleIndex = _.indexOf(this.samples.pluck("NAME"), currentSampleName.replace(/ /g, "__"));
    			 currentSampleId = this.samples.at(currentSampleIndex).get("BLSAMPLEID");
    		 }
    		 selectotron.value = currentSampleId;

    		 // Construct the array of name-value pairs to feed the service selector
    		 var serviceSelectorValues = _.reduce(this.services, function(memo, serviceName, index, services) {
    			 var nyPair = [serviceName, (index+1).toLocaleString()];
    			 memo.push(nyPair);
    			 return memo;
    		 }, [])
    		 
    		 // Show or hide the tables as necessary
    		 this.detectortable.show(new DetectorView({collection: this.detectors, pages: false}));
    		 if (this.model.get("SCANMODELS").length > 0) {
    			 this.$el.find("h3.scantitle").show();
    			 this.$el.find("div.axistable").show();
    			 this.axistable.show(new AxisView({collection: this.model.get("SCANMODELS"), values: serviceSelectorValues, pages:false}));
    		 } else {
    			 this.$el.find("h3.scantitle").hide();
    			 this.$el.find("div.axistable").hide();
    		 }

    	 },
    	 
    	 addAxis: function(event) {
    		 // Add an axis without (yet) touching the DB
    		 var nyScanParams = new ScanParametersModel();
    		 nyScanParams.set({
    			 "SCANPARAMETERSMODELID" : "",
    			 "SCANPARAMETERSSERVICEID": "",
    			 "DATACOLLECTIONPLANID": this.model.get("DATACOLLECTIONPLANID"),
    			 "MODELNUMBER": this.model.get("SCANMODELS").length + 1,
    			 "START": "",
    			 "STOP": "",
    			 "STEP": "",
    			 "ARRAY": [],
    		 });
    		 this.model.get("SCANMODELS").push(nyScanParams);

    	 },
    	 
    	 changeInstance: function(event) {
    		var selectotron = this.$el.find("select.instanceselect").get(0);
    		this.parentView.movePlanToSample(this.model.get("ORDER"), selectotron.value);
    	 },
    	
    });
    
    var DetectorView = TableView.extend({
    	initialize: function(options) {

    		this.columns =  [
    			{name: "TYPE", label: "Type", cell: "string", editable: false},
    			{name: "MANUFACTURER", label: "Manufacturer", cell: "string", editable: false},
    			{name: "MODEL", label: "Model", cell: "string", editable: false},
    			{name: "DISTANCE", label: "Distance (mm)", cell: "string", editable: true},
    			{name: "EXPOSURETIME", label: "Exposure time (s)", cell: "string", editable: true},
    			{name: "ORIENTATION", label: "Orientation (0, 45°)", cell: "string", editable: true},
    			{name: "ISUSED", label: "Active?", cell: "boolean", editable: true},
    		];
    		
        	TableView.prototype.initialize.apply(this, [options]);

    	},
    	
    	
    });

    var AxisView = TableView.extend({
    	initialize: function(options) {
    	
    	this.columns = [
    		{name: "MODELNUMBER", label: "Order", cell: "string", editable: false},
    		{name: "SCANPARAMETERSSERVICEID", label: "Service", cell: Backgrid.SelectCell.extend({optionValues: options.values}), editable: true},
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