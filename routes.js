const AuthController = require('./controllers/AuthController')
const ArticlesController = require('./controllers/ArticlesController')
const CommentController = require('./controllers/CommentController')
const UserController = require('./controllers/UserController')

const _routes = [
    ['',AuthController],
    ['/articles',ArticlesController],
    ['/comment',CommentController],
    ['/user',UserController]
]

const routes = (app) => {
    _routes.forEach(route => {
        const [url, controller] = route
        app.use(`/api${url}`,controller)
    })
}

module.exports = routes