//define(['marionette', 'modules/samples/controller'], function(Marionette, c) {
define(['utils/lazyrouter'], function(LazyRouter) {
  var Router = LazyRouter.extend({
    appRoutes: {
      'samples(/s/:s)(/page/:page)': 'list',
      'samples/sid/:sid(/visit/:visit)': 'view',

      'proteins(/s/:s)(/page/:page)': 'proteinlist',
      'proteins/pid/:pid': 'proteinview',
      'proteins/add': 'proteinadd',

      "phases(/s/:s)(/page/:page)": "proteinlist",
      "phases/pid/:pid": "proteinview",
      "phases/add": "proteinadd",
    },
      
    loadEvents: ['samples:show', 'proteins:show', 'samples:view', 'proteins:view', "phases:view"],
      
  })
       
  return new Router({
    //controller: c
    rjsController: 'modules/samples/controller',
  })
})