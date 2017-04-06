define(['marionette', 'modules/assign/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {
    
    var Router = Marionette.AppRouter.extend({
    //var Router = LazyRouter.extend({
        appRoutes: {
            'assign': 'selectVisit',
            'assign/visit/:visit(/page/:page)': 'assignVisit',
            "detector": "detectorList",
//            "detector/:did": "detector",
//            "detector/dcplan/:dcpid": "detectorsForPlan",
        },
        
        loadEvents: ['assign:visit'],
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/assign/controller',
    })
})