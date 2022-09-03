const { Router } = require('express')
const response = require('../helpers/response')
const m$user = require('../modules/user.module')

const UserController = Router()

/**
 * Create User
 */
UserController.post('/', async (req, res, next) => {
    const add = await m$user.addUser(req.body)

    response.sendResponse(res, add)
})

module.exports = UserController