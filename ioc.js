const ioc = require('electrolyte')

ioc.use(ioc.node_modules())
ioc.use(ioc.dir('.'))
ioc.use('lib', ioc.dir('api/lib'))
ioc.use('modelsOld', ioc.dir('api/modelsOld'))
ioc.use('models', ioc.dir('api/models'))
ioc.use('routes', ioc.dir('api/routes'))

module.exports = ioc
