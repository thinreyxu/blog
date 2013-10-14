var index = require('./index')
  , user = require('./user')
  , post = require('./post')
  , upload = require('./upload')
  , comment = require('./comment');

module.exports = function (app) {
  mapRoutes(index, app);
  mapRoutes(user, app);
  mapRoutes(post, app);
  mapRoutes(upload, app);
  mapRoutes(comment, app);
};

function mapRoutes (map, app) {
  var methods, routes;
  for (var path in map) {
    methods = map[path];
    for (var method in methods) {
      routes = methods[method];
      if (typeof routes === 'function') {
        app[method](path, routes);
      }
      else if (routes instanceof Array) {
        for (var i = 0; i < routes.length; i++) {
          app[method](path, routes[i]);
        }
      }
    }
  }
}
