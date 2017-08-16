const ioc = require('electrolyte')

ioc.use(ioc.node_modules())
ioc.use(ioc.dir('app'))
ioc.use('lib', ioc.dir('app/lib'))
ioc.use('models', ioc.dir('app/models'))
ioc.use('routes', ioc.dir('app/routes'))

module.exports = ioc
