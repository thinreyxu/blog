const ioc = require('electrolyte')

ioc.use(ioc.node_modules())
ioc.use(ioc.dir('app'))
ioc.use('lib', ioc.dir('app/lib'))
ioc.use('modelsOld', ioc.dir('app/models'))
ioc.use('models', ioc.dir('app/models2'))
ioc.use('routes', ioc.dir('app/routes'))

module.exports = ioc
