define(['marionette',
    'collections/detectors',
    'collections/scanservices',

    'collections/samples',

    'models/datacollectionplan',
    'collections/datacollectionplans',

    'models/scanmodel',
    'collections/scanmodels',

    'models/datacollectionplandetector',
    'collections/datacollectionplandetectors',

    'views/table',
    'views/sortabletable',
    'utils/table',

    'tpl!templates/types/xpdf/plan.html',
    'tpl!templates/types/xpdf/planparams.html',
    "tpl!templates/types/xpdf/planparamsstatic.html",
    'tpl!templates/types/xpdf/planaxis.html',
    "tpl!templates/types/xpdf/planaxisstatic.html",
    'tpl!templates/types/xpdf/plandetector.html',
    "tpl!templates/types/xpdf/plandetectorstatic.html"

    ], function(Marionette,
        Detectors,
        ScanServices,

        Samples,

        DataCollectionPlan,
        DataCollectionPlans,

        ScanModel,
        ScanModels,

        DataCollectionPlanDetector,
        DataCollectionPlanDetectors,

        TableView,
        SortableTableView,
        table,

        template,
        planparams,
        planparamsstatic,
        planaxis,
        planaxisstatic,
        plandetector,
        plandetectorstatic
    ) {


    var AddCell = Backgrid.Cell.extend({
        events: {
            'click a.add': 'addPlan',
        },

        addPlan: function(e) {
            e.preventDefault()
            var plans = this.column.get('datacollectionplans')

            var p = new DataCollectionPlan({
                BLSAMPLEID: this.model.get('BLSAMPLEID'),
                SAMPLE: this.model.get('NAME'),
                PROTEINID: this.model.get('PROTEINID'),
                PROTEIN: this.model.get('ACRONYM'),
            })

            p.save({}, {
                success: function() {
                    plans.add(p)
                },

                error: function() {
                    app.alert({ message: 'Something went wrong creating a data collection plan for that sample' })
                }
            })

        },

        render: function() {
            this.$el.empty()
            this.$el.html('<a href="#" class="button add"><i class="fa fa-plus"></i></a>')

            return this
        }
    })


    var DeleteCell = Backgrid.Cell.extend({
        events: {
            'click a.delete': 'delete',
        },

        delete: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render: function() {
            this.$el.empty()
            this.$el.html('<a href="#" class="button delete"><i class="fa fa-times"></i></a>')

            return this
        }
    })        


    var ValidatedCell = Backgrid.Cell.extend({
        events: {
            'change input': 'updateModel',
            'blur input': 'updateModel',
            'keyup input': 'updateModel',
            'change select': 'updateModel',
        },

        updateModel: function(e) {
            console.log('up mod', $(e.target).attr('name'))
            this.model.set($(e.target).attr('name'), $(e.target).val(), { silent: true })
            this.validate({ attr: $(e.target).attr('name'), val: $(e.target).val() })
            this.preSave()
        },

        preSave: function() {
            if (this.model.isValid(true)) {
                var ch = this.model.changedAttributes()
                if (ch && !(Object.keys(ch).length == 1 && ('isSelected' in ch || '_valid' in ch))) {
                    console.log('attrs changed', this.model.changedAttributes())
                    this.model.save(this.model.attributes, { patch: true })   
                }

            } else {
                console.log('model invalid')
            }
        },

        validate: function(options) {
            var error = this.model.preValidate(options.attr, options.val)
            var attr = this.$el.find('[name='+options.attr+']')
            if (error) this.invalid(attr, error)
            else this.valid(attr)
        },

        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },

        initialize: function(options) {
            ValidatedCell.__super__.initialize.call(this,options)
            this.preSave = _.debounce(this.preSave, 1000)
        },

        bindModel: function() {
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                model: this.model,
                selector: 'name',
                valid: function(view, attr) {
                  view.valid(view.$el.find('[name="'+attr+'"]'))
                },
                invalid: function(view, attr, error) {
                  view.invalid(view.$el.find('[name="'+attr+'"]'), error)
                }
            })
        },
    })



    var DCPlanCell = ValidatedCell.extend({

    	initialize: function(options) {
        	DCPlanCell.__super__.initialize.apply(this, [options]);

        	this.listenTo(this.model, "row:collapse", this.doCollapse);
    		this.listenTo(this.model, "row:expand", this.doExpand);
    		
    		// Add keV energy as a model attribute in KEVENERGY
    		this.model.set({"KEVENERGY": (this.model.get("ENERGY")*0.001).toPrecision(3)});
    	},
    	
    	render: function() {
            this.$el.empty()
//            this.$el.html(planparamsstatic(this.model.toJSON()))
            this.bindModel()
            
            this.doCollapse();
            
            return this
        },

        doCollapse: function() {
    		this.$el.html(planparamsstatic(this.model.toJSON()));
    	},
    	
    	doExpand: function() {
            this.$el.html(planparams(this.model.toJSON()));
    	},

    })



    var AxisCell = ValidatedCell.extend({
    	events: function() {
    		return _.extend({}, ValidatedCell.prototype.events, {
    			"click a.moveup": "decrementSequence",
    			"click a.movedown": "incrementSequence",
    		});
    	},
    	
    	render: function() {
            this.$el.empty()
            this.$el.html(planaxis(this.model.toJSON()))
            this.bindModel()
            return this
        },
        
        updateModel: function(e) {
        	ValidatedCell.prototype.updateModel.call(this, e);

        	if ($(e.target).attr('name') == "SEQUENCENUMBER" && this.model.isValid(true))
        		this.column.trigger("axiscell:modsequence");

        },

        changeSequence: function(e, delta) {
        	e.preventDefault();
        	var seq = this.model.get("SEQUENCENUMBER");
        	console.log("Sequence number was ", seq);
        	seq = Number.parseInt(seq);
        	
        	seq += delta;

        	seq = seq.toString();
        	
        	this.model.set({"SEQUENCENUMBER" : seq});
        	if (this.model.has("SEQUENCENUMBER")) console.log("1 Sequence number is ", this.model.get("SEQUENCENUMBER"));

        	this.column.trigger("axiscell:modsequence");
        	if (this.model.has("SEQUENCENUMBER")) console.log("2 Sequence number is ", this.model.get("SEQUENCENUMBER"));
        	ValidatedCell.prototype.preSave.call(this);

        },
        
        incrementSequence: function(e) {
        	e.preventDefault();
        	if (this.model.get("SEQUENCENUMBER") < Number.MAX_SAFE_INTEGER) {
        		console.log("Increment!");
        		this.changeSequence(e, +1.01);
        	}
        },
        decrementSequence: function(e) {
        	e.preventDefault();
        	if (this.model.get("SEQUENCENUMBER") > 1) {
        		console.log("Decrement!");
        		this.changeSequence(e, -1.01);
        	}
        },
    })

    var StaticAxisCell = Backgrid.Cell.extend({
    	render: function() {
            this.$el.empty();
            this.$el.html(planaxisstatic(this.model.toJSON()));
            return this;
        },
    });

    var AxesCell = Backgrid.Cell.extend({
        template: _.template('<select name="services"></select><a href="#" class="button add"><i class="fa fa-plus"></i></a><div class="axes"></div><div class="axesstatic"></div>'),

        events: {
            'click a.add': 'addAxis',
        },

        initialize: function(options) {
        	AxesCell.__super__.initialize.apply(this, [options]);

    		this.listenTo(this.model, "row:collapse", this.doCollapse);
    		this.listenTo(this.model, "row:expand", this.doExpand);
//    		this.listenTo(this.)
        },
        
        addAxis: function(e) {
            e.preventDefault()

            var serviceid = this.$el.find('select[name=services]').val()
            var service = this.column.get('scanservices').findWhere({ SCANPARAMETERSSERVICEID: serviceid })

            var axis = new ScanModel({
                DATACOLLECTIONPLANID: this.model.get('DIFFRACTIONPLANID'),
                SCANPARAMETERSSERVICEID: serviceid,
                SCANPARAMETERSSERVICE: service.get('NAME')
            })

            var self = this
            axis.save({}, {
                success: function() {
                    // add our new model to the 'full' collection, datacollectionplan sub collections will autoupdate
                    self.column.get('scanmodels').add(axis)
                }, 

                error: function() {
                    app.alert({ message: 'Something went wrong adding an axis to that data collection plan' })
                }
            })
        },

        render: function() {
            var columns = [
               { label: 'Axis', cell: table.TemplateCell, editable: false, template: '<%=SCANPARAMETERSSERVICE%>' },
               { label: 'Parameters', cell: AxisCell, editable: false },
               { label: '', cell: DeleteCell, editable: false },
            ]

            var pointlessCallback = function() {
            	console.log("AxesCell: sequence modified");
            };
            
            this.atable = new TableView({ 
                collection: this.model.get('SCANPARAMETERSMODELS'), 
                columns: columns, 
                tableClass: 'axes', 
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No axes found' },
            })
            // Listen for the sequence number being modified
            this.listenTo(this.atable.grid.columns.models[1], "axiscell:modsequence", this.normalizeSequence);
            
            var staticColumns = [
            	{ label: 'Axis', cell: table.TemplateCell, editable: false, template: '<%=SCANPARAMETERSSERVICE%>' },
            	{ label: 'Parameters', cell: StaticAxisCell, editable: false },
            ];

            this.stable = new TableView({ 
                collection: this.model.get("SCANPARAMETERSMODELS"), 
                columns: staticColumns, 
                tableClass: "axesstatic", 
                loading: false,
                pages: false,
                backgrid: { emptyText: "No axes found" },
            });
           
            this.$el.empty()
            this.$el.html(this.template)
            this.$el.find('.axes').html(this.atable.render().$el)
            this.$el.find(".axesstatic").html(this.stable.render().$el);
            // this.$el.append(atable.render().$el)
            this.$el.find('select[name=services]').html(this.column.get('scanservices').opts())

            this.doCollapse();
            
            return this
        },

        doCollapse: function() {
    		this.$el.find("a.add").hide();
    		this.$el.find("select[name=services]").hide();
            this.$el.find(".axes").hide();
            this.$el.find(".axesstatic").show();

    	},
    	
    	doExpand: function() {
    		this.$el.find("a.add").show();
    		this.$el.find("select[name=services]").show();
            this.$el.find(".axes").show();
            this.$el.find(".axesstatic").hide();
    	},

    	// Order the axes within their collection by sequencenumber, and set the sequnce numbers to consecutive natural numbers
    	normalizeSequence: function() {
    		var scanParametersModels = this.model.get("SCANPARAMETERSMODELS");
    		scanParametersModels.sort();
    		scanParametersModels.each(function(model, index, collection) {
    			model.set({"SEQUENCENUMBER": (index+1).toString()});
    		});
    	},
    	
    })



    var DetectorCell = ValidatedCell.extend({
        render: function() {
            this.$el.empty()
            this.$el.html(plandetector(this.model.toJSON()))
            this.bindModel()
            return this
        }
    })
    
    var StaticDetectorCell = Backgrid.Cell.extend({
    	render: function() {
    		this.$el.empty();
    		this.$el.html(plandetectorstatic(this.model.toJSON()));
    		return this;
    	},
    });

    var DetectorsCell = Backgrid.Cell.extend({
        template: _.template('<select name="detectors"></select><a href="#" class="button add"><i class="fa fa-plus"></i></a><div class="detectors"></div><div class="detectorsstatic"></div>'),

        events: {
            'click a.add': 'addDetector',
        },

        initialize: function(options) {
        	DetectorsCell.__super__.initialize.apply(this, [options]);
        	
    		this.listenTo(this.model, "row:collapse", this.doCollapse);
    		this.listenTo(this.model, "row:expand", this.doExpand);

        },
        
        addDetector: function(e) {
            e.preventDefault()

            var detid = this.$el.find('select[name=detectors]').val()
            var det = this.column.get('detectors').findWhere({ DETECTORID: detid })

            var pdet = new DataCollectionPlanDetector({
                DATACOLLECTIONPLANID: this.model.get('DIFFRACTIONPLANID'),
                DETECTORID: detid,
                DETECTORTYPE: det.get('DETECTORTYPE'),
                DETECTORMANUFACTURER: det.get('DETECTORMANUFACTURER'),
                DETECTORMODEL: det.get('DETECTORMODEL'),
            })

            var self = this
            pdet.save({}, {
                success: function() {
                    // add our new model to the 'full' collection, datacollectionplan sub collections will autoupdate
                    self.column.get('dpdetectors').add(pdet)
                }, 

                error: function() {
                    app.alert({ message: 'Something went wrong adding a detector to that data collection plan' })
                }
            })
        },

        render: function() {
            var columns = [
               { label: 'Detector', cell: table.TemplateCell, editable: false, template: '<%=DETECTORTYPE%><br /><%=DETECTORMANUFACTURER%><br /><%=DETECTORMODEL%><br />' },
               { label: 'Parameters', cell: DetectorCell, editable: false },
               { label: '', cell: DeleteCell, editable: false },
            ]

            this.dtable = new TableView({ 
                collection: this.model.get('DETECTORS'), 
                columns: columns, 
                tableClass: 'detectors', 
                loading: false,
                pages: false,
                backgrid: { emptyText: 'No detectors found' },
            })

            var staticColumns = [
                { label: 'Detector', cell: table.TemplateCell, editable: false, template: '<%=DETECTORTYPE%><br /><%=DETECTORMANUFACTURER%><br /><%=DETECTORMODEL%><br />' },
                { label: 'Parameters', cell: StaticDetectorCell, editable: false },
            ]
            
            this.stable = new TableView({
            	collection: this.model.get("DETECTORS"),
            	columns: staticColumns,
            	tableClass: "detectorsstatic",
            	loading: false,
            	pages: false,
                backgrid: { emptyText: 'No detectors found' },
            });
            
            this.$el.empty()
            this.$el.html(this.template)
            this.$el.find('.detectors').html(this.dtable.render().$el)
            this.$el.find(".detectorsstatic").html(this.stable.render().$el);
            this.$el.find('select[name=detectors]').html(this.column.get('detectors').opts())
            
            this.doCollapse();
            
            return this
        },

        doCollapse: function() {
    		this.$el.find("a.add").hide();
    		this.$el.find("select[name=detectors]").hide();
            this.$el.find(".detectorsstatic").show();
            this.$el.find(".detectors").hide();
    		
        },
    	
    	doExpand: function() {
    		this.$el.find("a.add").show();
    		this.$el.find("select[name=detectors]").show();
            this.$el.find(".detectorsstatic").hide();
            this.$el.find(".detectors").show();
    	},
    })

    var CollapseExpandCell = table.TemplateCell.extend({
    	events: {
    		"click a.collapsar": "toggleExpansion",
    	},
    	
    	initialize: function(options) {
    		CollapseExpandCell.__super__.initialize.apply(this, [options]);
    		this.model.listenTo(this, "control:collapse", function() {this.trigger("row:collapse");});
    		this.listenTo(this.model, "row:collapse", this.doCollapse);

    		this.model.listenTo(this, "control:expand", function() {this.trigger("row:expand");});
    		this.listenTo(this.model, "row:expand", this.doExpand);
    		
    		this.collapsed = true;
    	},
    	
    	toggleExpansion: function(e) {
    		e.preventDefault();
    		
    		if (this.collapsed) {
    			this.collapsed = false;
    			this.trigger("control:expand");
    		} else {
    			this.collapsed = true;
    			this.trigger("control:collapse");
    		}
    	},
    	
    	doCollapse: function() {
    		this.$el.find("i.expcol").removeClass("fa-chevron-down").addClass("fa-chevron-right");
    	},
    	
    	doExpand: function() {
    		this.$el.find("i.expcol").removeClass("fa-chevron-right").addClass("fa-chevron-down");
    	},

    });

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            asmps: '.asamples',
            psmps: '.psamples',
        },


        initialize: function(options) {
            this.samples = new Samples()
            this.samples.queryParams.cid = this.model.get('CONTAINERID')
            this.samples.fetch()

            this.ready = []

            this.detectors = new Detectors()
            this.ready.push(this.detectors.fetch())
            this.scanservices = new ScanServices()
            this.ready.push(this.scanservices.fetch())

            this.scanmodels = new ScanModels(null, { state: { pageSize: 9999 }})
            this.scanmodels.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            this.scanmodels.fetch()

            this.datacollectionplandetectors = new DataCollectionPlanDetectors(null, { state: { pageSize: 9999 }})
            this.datacollectionplandetectors.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            this.datacollectionplandetectors.fetch()

            this.datacollectionplans = new DataCollectionPlans()
            this.datacollectionplans.queryParams.CONTAINERID = this.model.get('CONTAINERID')
            // hmm this is not what you'd expect
            this.datacollectionplans.fetch({
                SCANPARAMETERSMODELS: this.scanmodels,
                DETECTORS: this.datacollectionplandetectors,
            })

        },

        onRender: function() {
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            var columns = [
                { label: '#', cell: table.TemplateCell, editable: false, template: '<%=LOCATION%>' },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Component', cell: 'string', editable: false },
                { label: '', cell: AddCell, editable: false, datacollectionplans: this.datacollectionplans },
            ]

            this.table = new TableView({ 
                collection: this.samples, 
                columns: columns, 
                tableClass: 'asamples', 
                loading: true,
                backgrid: { emptyText: 'No samples found' },
            })

            this.asmps.show(this.table)


            var columns = [
            	{ label: "", cell: CollapseExpandCell, editable: false, template: "<a class=\"button collapsar\" href=\"#\"><i class=\"expcol fa fa-chevron-right\"></i></a>"},
                // { label: '#', cell: table.TemplateCell, editable: false, template: '<%=ORDER%>' },
                { label: 'Instance', cell: table.TemplateCell, editable: false, template: '<%=SAMPLE%>' },
                { label: 'Parameters', cell: DCPlanCell, editable: false },
                { label: 'Axes', cell: AxesCell, editable: false, scanservices: this.scanservices, scanmodels: this.scanmodels },
                { label: 'Detectors', cell: DetectorsCell, editable: false, detectors: this.detectors, dpdetectors: this.datacollectionplandetectors },
            ]

            this.table2 = new SortableTableView({ 
                collection: this.datacollectionplans, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: true,
                backgrid: { emptyText: 'No plans found' },
            })

            this.psmps.show(this.table2)
        },

    })

})
