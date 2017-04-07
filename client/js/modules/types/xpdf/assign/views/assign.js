define(['marionette', 'views/pages',
    'collections/shipments',
    'collections/containers',
    'collections/dewars',
    'models/shipment',
    'models/dewar',
    
    'utils',
    'tpl!templates/types/xpdf/assign/assign.html',
    'jquery-ui',
    ], function(Marionette, Pages,
        Shipments,
        Containers,
        Dewars,
        Shipment,
        Dewar,
    
        utils,
        template) {

            
    
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
        	console.log("DewarView: show container " + container.model.get("CONTAINERID"));
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
        	console.log("ShipmentView: show container " + dewar.selectedContainer);
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
        template: template,
        className: 'content',
        childView: ShipmentView,
        childViewContainer: '#unassigned',
        
        regions: {
        	groupdetails: ".groupdetails",
        },
        
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
        	console.log("View: showing container "+shipment.selectedContainer);
        	this.showContainer(shipment.selectedContainer);
        },        
        
        showContainer: function(containerId) {
        	console.log("Showing experiment group for sample changer " + containerId);
        },
        
    })
    
    
    return View;
})