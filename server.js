const ioc = require('./app/ioc')

ioc.create('app').then(app => {
  let port = app.get('port')
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
  })
})
