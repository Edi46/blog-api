const { Router } = require('express')
const m$article = require('../modules/article.module')
const response = require('../helpers/response')
const userSession = require('../helpers/middleware')

const ArticelsController = Router()

/**
 * List Articles
 */
ArticelsController.get('/', userSession, async (req, res, next) => {
    // console.log('user',req.user)
    // req.user is created in userSession function
    const list = await m$article.listArticles(req.query)

    // Include user who access
    list.accessed_by = req.user

    response.sendResponse(res, list)
})

/**
 * Detail Article
 */
ArticelsController.get('/detail', userSession, async (req, res, next) => {
    // http://url-api/detail?id=1
    const detail = await m$article.detailArticle(req.query.id)

    // Include user who access
    detail.accessed_by = req.user

    response.sendResponse(res, detail)
})

/**
 * Create Article
 * @param {string} title
 * @param {string} summary
 */
ArticelsController.post('/', userSession, async (req, res, next) => {

    // Include user id who created to the body
    req.body.user_id = req.user.id

    const add = await m$article.addArticle(req.body)

    // Include user who created if status true
    if (add.status)
        add.created_by = req.user

    response.sendResponse(res, add)
})

/**
 * Update Article
 * @param {number} id
 * @param {string} title 
 * @param {string} summary 
 */
ArticelsController.put('/', userSession, async (req, res, next) => {

    // Include user id who created to the body
    req.body.user_id = req.user.id

    const edit = await m$article.editArticle(req.body)

    // Include user who edited if status true
    if (edit.status)
        edit.edited_by = req.user

    response.sendResponse(res, edit)
})

/**
 * Delete Article
 * @param {number} id
 */
ArticelsController.delete('/:id', userSession, async (req, res, next) => {
    const del = await m$article.deleteArticle(req.params.id, req.user.id)

    if (del.status)
        del.deleted_by = req.user
    
    response.sendResponse(res, del)
})

module.exports = ArticelsController