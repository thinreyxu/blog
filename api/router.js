module.exports = async (fs, express, ioc) => {
  const routeFiles = await fs.readdir(`${__dirname}/routes`)
  const router = express.Router()

  routeFiles.forEach(async (routeFile) => {
    let routes = await ioc.create(`routes/${routeFile}`)
    if (Array.isArray(routes)) useRoutes(routes, router)
  })

  function useRoutes (routes, router) {
    for (let [path, method, ...handlers] of routes) {
      router[method](path, ...handlers)
    }
  }

  return router
}

module.exports['@singleton'] = true
module.exports['@require'] = [ 'fs-extra', 'express', 'ioc' ]
