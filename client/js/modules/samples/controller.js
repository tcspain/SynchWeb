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

        "models/crystal",
        "collections/crystals",
        
        'models/protein',
        'collections/proteins',
    
], function(Marionette, 
  GetView,
  // SampleList, SampleView, GenSampleList, 
  Sample, Samples, 
  // ProteinList, ProteinView, AddProteinView, 
  // GenComponentList, GenComponentAdd,
  Crystal, Crystals,
  Protein, Proteins) {
    
  var sbc =  { title: 'Samples', url: '/samples' }
  var pbc =  { title: 'Proteins', url: '/proteins' }
  var phbc = { title: "Phases", url: "/phases" }
  var xbc =  { title: "Crystals", url: "/crystals" };
  var xsbc = { title: "Samples", url: "/samples" };
  
  var hasPhases = function() {
	  var phaseTypes = ["xpdf"];
	  return (phaseTypes.indexOf(app.type) != -1);
  }
  
  var phpbc = function() {
	  return (hasPhases()) ? phbc : pbc;
  }
  
  var xsxbc = function() {
	  return (hasPhases()) ? xsbc : xbc;
  }
  
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
        app.bc.reset([phpbc()])
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
                app.bc.reset([phpbc(), { title: protein.get('NAME') }])
                app.content.show(GetView.ProteinView.get(app.type, { model: protein }))
            },
            error: function() {
                app.bc.reset([phpbc()])
                app.message({ title: 'No such protein', message: 'The specified protein could not be found'})      
            },
        })
    },
      
    proteinadd: function() {
    	var componentName = phpbc().title.substring(0, phpbc().title.length-1)
        app.bc.reset([phpbc(), { title: 'Add '+componentName }])
        app.content.show(GetView.ProteinAdd.get(app.type))
    },
    
    // Crystals as XPDF samples
    crystallist: function(s, page) {
    	app.loading();
    	app.bc.reset([xsxbc()]);
    	page = page ? parseInt(page) : 1;
    	var crystalQueryParams = { s : s };
    	var crystals = new Crystals(null, {state: {currentPage: page}, queryParams: crystalQueryParams });
    	crystals.fetch().done(function() {
    		app.content.show(GetView.CrystalList.get(app.type, { collection: crystals, params: { s: s } }));
    	});
    },
    
    crystalview: function(xid) {
    	app.loading();
    	var crystal = new Crystal({CRYSTALID: xid});
    	crystal.fetch({
    		success: function() {
    			app.bc.reset([xsxbc(), {title: crystal.get("NAME")}]);
    			app.content.show(GetView.CrystalView.get(app.type, {model: crystal}));
    		},
    		error: function() {
    			var bc = xsxbc();
    			var component = bc.title.substring(0, bc.title.length-1); // remove the plural
    			app.bc.reset([bc]);
    			app.message({ title: "No such " + component.toLowerCase(), message: "The specified " + component.toLowerCase() + " could not be found"});
    		},
    	});
    },
    
    crystaladd: function() {
    	var bc = xsxbc();
    	var component = bc.title.substring(0, bc.title.length-1); // singularize the title 
    	app.bc.reset([bc, {title: "Add " + component }]);
    	app.content.show(GetView.CrystalAdd.get(app.type));
    },
    
    newinstance: function(sid) {
    	app.loading();
    	var xpdfsample = new Crystal({CRYSTALID: sid});
    	xpdfsample.fetch({
    		success: function() {
    			app.bc.reset([sbc, {title: "New Instance of " + xpdfsample.get("NAME") }]);
    			app.content.show(GetView.NewInstance.get(app.type, {sampleModel: xpdfsample}));
    		},
    		error: function() {
    			app.bc.reset([sbc]);
    			app.message({ title: "No such sample", message: "The specified sample could not be found."});
    		},
    	});
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

    app.on('phases:view', function(pid) {
    	app.navigate('phases/pid/'+pid)
    	controller.proteinview(pid)
    })
      
    app.on("crystals:view", function(xid) {
    	app.navigate("xpdfsamples/xid/"+xid);
    	controller.crystalview(xid);
    });
    
    app.on("instance:create", function(sid) {
    	app.navigate("instance/new");
    	controller.newinstance(sid);
    });
  })
       
  return controller
})