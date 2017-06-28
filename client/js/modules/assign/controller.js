define(['marionette',
    'models/visit',
    'collections/visits',
    
//    'modules/assign/views/selectvisit',
//    'modules/assign/views/assign',
    
    "modules/assign/views/getassignview",
    ], function(Marionette,
    		Visit,
    		Visits,
    		
//    		SelectVisitView,
//    		AssignView,
    		GetView) {
    
    var bc = { title: 'Assign Containers', url: '/assign' }
    var xpbc = {title: "Plan Experiments", url: "/assign" }
    
    var getBC = function() {
    	var xpTypes = ["xpdf"];
    	return (xpTypes.indexOf(app.type) != -1) ? xpbc : bc;
    }
    
    var controller = {
        
        // Select visit to assign
        selectVisit: function(visit) {
            app.loading()
            var qParams = {}
            if (app.type != "xpdf") qParams["next"] = 1;
            var visits = new Visits(null, { queryParams: qParams })
            visits.fetch({
                success: function() {
                    app.bc.reset([getBC()]),
//                    app.content.show(new SelectVisitView({ collection: visits }))
                    app.content.show(GetView.SelectVisitView.get(app.type, { collection: visits }))
                },
                error: function() {
                    app.bc.reset([getBC(), { title: 'Error' }])
                    app.message({ title: 'Couldnt load visit list', message: 'Couldnt load visit list please try again' })
                }
            })
        },
            
            
        // Assign containers to visit
        assignVisit: function(vis, page) {
            app.loading()
            var visit = new Visit({ VISIT: vis })
            
            visit.fetch({
                success: function() {
                    app.bc.reset([getBC(),
                        {title: vis, url: '/dc/visit/'+vis }]),
                    page = page ? parseInt(page) : 1
//                    app.content.show(new AssignView({ visit: visit, page: page }))
                    app.content.show(GetView.AssignView.get(app.type, { visit: visit, page: page }))
                },
                error: function() {
                    app.bc.reset([getBC(), { title: 'Error' }])
                    app.message({ title: 'No such visit', message: 'The specified visit doesnt exist' })
                }
            })
        }
    }
       
    app.addInitializer(function() {
        app.on('assign:visit', function(visit) {
            app.navigate('assign/visit/'+visit)
            controller.assign(visit)
        })
    })
       
    return controller
})