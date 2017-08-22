define(['underscore', 'backbone.paginator', 'models/crystal'], function(_, PageableCollection, Crystal) {
    
    return PageableCollection.extend({
        model: Crystal,
        mode: 'server',
        url: '/sample/crystals',
            
        state: {
            pageSize: 15,
        },
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },


        initialize: function(collection, options) {
            this.fetched = false
            this.on('sync', this.setFetched, this)
        },

        setFetched: function() {
          if (this.fetched) return
            
          this.fetched = true
          this.trigger('reset')
        },
    })
})