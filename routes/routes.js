const express = require('express')
const router = express.Router()

const index = require('./index')
const user = require('./user')
const post = require('./post')
const upload = require('./upload')
const comment = require('./comment')

useRoutes(index, router)
useRoutes(user, router)
useRoutes(post, router)
useRoutes(upload, router)
useRoutes(comment, router)

function useRoutes (routes, router) {
  for (let route of routes) {
    let path = route[0]
    let method = route[1]
    let handlers = route[2]
    router[method](path, ...handlers)
  }
}

module.exports = router
