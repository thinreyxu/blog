const awilix = require('awilix')
const { createContainer, asFunction, asClass, asValue } = awilix
const ioc = createContainer()
console.log(awilix)
module.exports = { ioc, asFunction, asClass, asValue }
