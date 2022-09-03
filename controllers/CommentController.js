const { Router } = require("express");
const userSession = require("../helpers/middleware");
const response = require("../helpers/response");
const m$comment = require('../modules/comment.module')

const CommentController = Router()

/**
 * Create Comment to Article
 * @param {number} article_id 
 * @param {string} title 
 * @param {string} comment 
 */
CommentController.post('/', userSession, async (req, res, next) => {

    // user_id from userSession
    req.body.user_id = req.user.id

    const add = await m$comment.addComment(req.body)

    // Include user who created if status true
    if (add.status)
        add.created_by = req.user

    response.sendResponse(res, add)
})

module.exports = CommentController