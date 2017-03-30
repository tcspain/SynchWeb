define(['marionette',
        'modules/samples/views/getsampleview',
        // 'modules/samples/views/list',
        // 'modules/samples/views/view',
    
        // 'modules/types/gen/samples/views/list',

        'models/sample',
        'collections/samples',
    
        // 'modules/samples/views/proteinlist',
        // 'modules/samples/views/proteinview',
        // 'modules/samples/views/proteinadd',

        // 'modules/types/gen/samples/views/componentlist',
        // 'modules/types/gen/samples/views/componentadd',

        'models/protein',
        'collections/proteins',
    
], function(Marionette, 
  GetView,
  // SampleList, SampleView, GenSampleList, 
  Sample, Samples, 
  // ProteinList, ProteinView, AddProteinView, 
  // GenComponentList, GenComponentAdd,
  Protein, Proteins) {
    
  var sbc =  { title: 'Samples', url: '/samples' }
  var pbc =  { title: 'Proteins', url: '/proteins' }
    
  var controller = {
    // Samples
    list: function(s, page) {
      app.loading()
      app.bc.reset([sbc])
      page = page ? parseInt(page) : 1
      var samples = new Samples(null, { state: { currentPage: page }, queryParams: { s : s } })
      samples.fetch().done(function() {
          app.content.show(GetView.SampleList.get(app.type, { collection: samples, params: { s: s } }))
      })
    },
      
    view: function(sid) {
      app.loading()
        var sample = new Sample({ BLSAMPLEID: sid })
        sample.fetch({
            success: function() {
                app.bc.reset([sbc, { title: sample.get('NAME') }])
                app.content.show(GetView.SampleView.get(app.type, { model: sample }))
            },
            
            error: function() {
                app.bc.reset([sbc])
                app.message({ title: 'No such sample', message: 'The specified sample could not be found'})
            }
        })
    },
      

    // Proteins
    proteinlist: function(s, page) {
        app.loading()
        app.bc.reset([pbc])
        page = page ? parseInt(page) : 1
        var proteinQueryParams = { s : s }
        if (app.type == "xpdf") proteinQueryParams["seq"] = 1
        var proteins = new Proteins(null, { state: { currentPage: page }, queryParams: proteinQueryParams })
        proteins.fetch().done(function() {
            app.content.show(GetView.ProteinList.get(app.type, { collection: proteins, params: { s: s } }))
        })
    },
      
    proteinview: function(pid) {
      app.loading()
        var protein = new Protein({ PROTEINID: pid })
        protein.fetch({
            success: function() {
                app.bc.reset([pbc, { title: protein.get('NAME') }])
                app.content.show(GetView.ProteinView.get(app.type, { model: protein }))
            },
            error: function() {
                app.bc.reset([pbc])
                app.message({ title: 'No such protein', message: 'The specified protein could not be found'})      
            },
        })
    },
      
    proteinadd: function() {
        app.bc.reset([pbc, { title: 'Add Protein' }])
        app.content.show(GetView.ProteinAdd.get(app.type))
    },

  }
       
       
  app.addInitializer(function() {
    app.on('samples:show', function() {
      app.navigate('samples')
      controller.list()
    })
      
    app.on('proteins:show', function() {
      app.navigate('proteins')
      controller.proteinlist()
    })

    app.on('samples:view', function(sid) {
      app.navigate('samples/sid/'+sid)
      controller.view(sid)
    })
      
    app.on('proteins:view', function(pid) {
      app.navigate('proteins/pid/'+pid)
      controller.proteinview(pid)
    })
  })
       
  return controller
})