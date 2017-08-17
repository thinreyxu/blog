module.exports = async (fs, express, ioc) => {
  const routeFiles = await fs.readdir('app/routes')
  const router = express.Router()

  routeFiles.forEach(async (routeFile) => {
    let routes = await ioc.create(`routes/${routeFile}`)
    if (Array.isArray(routes)) useRoutes(routes, router)
  })

  function useRoutes (routes, router) {
    for (let route of routes) {
      let path = route[0]
      let method = route[1]
      let handlers = route[2]
      router[method](path, ...handlers)
    }
  }

  return router
}

module.exports['@singleton'] = true
module.exports['@require'] = [ 'fs-extra', 'express', 'electrolyte' ]
