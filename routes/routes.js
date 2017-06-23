const router = require('express').Router();
var index = require('./index')
  , user = require('./user')
  , post = require('./post')
  , upload = require('./upload')
  , comment = require('./comment');

module.exports = router;

mapRoutes(index, router);
mapRoutes(user, router);
mapRoutes(post, router);
mapRoutes(upload, router);
mapRoutes(comment, router);

function mapRoutes (map, router) {
  for (let path of Object.keys(map)) {
    let methods = map[path];
    for (let method of Object.keys(methods)) {
      let routes = methods[method];
      if (typeof routes === 'function') {
        router[method](path, routes);
      }
      else if (Array.isArray(routes)) {
        routes.forEach(route => router[method](path, route));
      }
    }
  }
}
