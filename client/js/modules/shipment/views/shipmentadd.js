define(['marionette', 'views/form',
    'models/shipment',
    'collections/visits',
    'collections/labcontacts',
    
    'views/dialog',
    'modules/contact/views/addcontact',
    
    'tpl!templates/shipment/shipmentadd.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(Marionette, FormView,
        Shipment, Visits, LabContacts,
        DialogView, AddContactView,
        template, $_, Backbone) {  

    /*
     List of facility codes
    */
    var FCode = Marionette.ItemView.extend({
        tagName: 'span',
        template: _.template('<input type="text" name=FCODES[] value="" placeholder="DLS-XX-000<%-id%>" />')
    })
            
    var FCodes = Marionette.CollectionView.extend({
        tagName: 'span',
        className: 'fcodes',
        childView: FCode,
    })
            
            
    return FormView.extend({
        template: template,

        templateHelpers: {
            DHL_ENABLE: app.options.get('dhl_enable'),
            DHL_LINK: app.options.get('dhl_link'),
        },
        
        events: {
            'change input[name=DEWARS]': 'updateFCodes',
            'change @ui.lcret': 'getlcdetails',
            'change input[name^=FCODES]': 'checkFCodes',
            'change @ui.name': 'checkFCodes',
            'click a.add_lc': 'addLC',
        },
        
        ui: {
            lcret: 'select[name=RETURNLABCONTACTID]',
            lcout: 'select[name=SENDINGLABCONTACTID]',
            first: 'select[name=FIRSTEXPERIMENTID]',
            name: 'input[name=SHIPPINGNAME]',
        },
        
        addLC: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Add Home Lab Contact', className: 'content', view: new AddContactView({ dialog: true }), autoSize: true }))
            this.listenTo(app.dialog.currentView, 'close', this.refreshContacts, this)
            
            return false
        },
        
        createModel: function() {
            this.model = new Shipment()
        },
        
        success: function(model, response, options) {
            console.log('success from shipadd')
            app.trigger('shipment:show', model.get('SHIPPINGID'))
        },

        failure: function(model, response, options) {
            console.log('failure from shipadd')
            app.alert({ message: 'Something went wrong registering this shipment, please try again'})
        },
        
        onRender: function() {
            var self = this
            
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()
            
            this.visits = new Visits(null, { queryParams: { next: 1 }, state: { pageSize: 5 } })
            this.visits.fetch().done(function() {
                self.ui.first.html(self.visits.opts())
            })
            
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE], input[name=DELIVERYAGENT_DELIVERYDATE]')
            this.time('input[name=READYBYTIME], input[name=CLOSETIME]')

            this.fcodes = new Backbone.Collection()
            this.$el.find('li.d .floated').append(new FCodes({ collection: this.fcodes }).render().el)
            
            this.updateFCodes()
            this.checkFCodes()
        },
        
        refreshContacts: function() {
            this.contacts.fetch()
        },
        
        updateContacts: function() {
            this.ui.lcret.html(this.contacts.opts())
            this.ui.lcout.html(this.contacts.opts())
            this.getlcdetails()
        },
        
        /*
         Get Courier details from selected lab contact
        */
        getlcdetails: function() {
            var lc = this.contacts.findWhere({ LABCONTACTID: this.ui.lcret.val() })
            console.log(lc)
            if (lc) {
                this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').val(lc.get('DEFAULTCOURRIERCOMPANY'))
                this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').val(lc.get('COURIERACCOUNT'))
            }
        },
        
        
        /*
         Update number of facility code inputs based on number of dewars
        */
        updateFCodes: function() {
            var d = this.$el.find('input[name=DEWARS]').val()
            d > 0 ? this.$el.find('li.d').show() : this.$el.find('li.d').hide()
            var fcs = _.map(_.range(1,parseInt(d)+1), function(i) { return { id: i } })
            this.fcodes.set(fcs)
        },
        
        
        /*
         Check facility codes and title are valid, if so show DLS shipping
         button
        */
        checkFCodes: function() {
            var fc = this.$el.find('input[name^=FCODES]').eq(0)

            if (!this.model.preValidate('FCODES[]', fc.val()) && fc.val() && fc.val().search('MX') > -1 && !this.model.preValidate('SHIPPINGNAME', this.ui.name.val())) this.$el.find('button[name="dls"]').fadeIn()
            else this.$el.find('button[name="dls"]').hide()
        },
        
        prepareModel: function() {
            this.model.set({ FCODES: this.$el.find('input[name^=FCODES]').map(function(i,f) { if ($(f).val()) return $(f).val() }).get() })
        },
        
    })

})