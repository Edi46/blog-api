const mysql = require('../helpers/database')
const Joi = require('joi')

class _article {
    // List all Articles
    listArticles = async (body = {}) => {
        try {
            const schema = Joi.object({
                user_id: Joi.number()
            })

            const validation = schema.validate(body)

            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)

                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }

            const sql = {
                query: `
                SELECT
                    da.id,
                    da.title,
                    da.summary,
                    da.created_at,
                    da.updated_at,
                    da.author id_author,
                    au.username username_author,
                    au.nama_user nama_author,
                    dk.id id_komentar,
                    dk.user id_komentator,
                    auc.username username_komentator,
                    auc.nama_user nama_komentator,
                    dk.title title_komentar,
                    dk.komentar
                FROM
                    d_artikel da
                JOIN
                    auth_user au ON au.id = da.author
                LEFT JOIN
                    d_komentar dk ON dk.artikel = da.id
                LEFT JOIN
                    auth_user auc ON auc.id = dk.user
                WHERE 1
                `,
                params: []
            }

            if (body.user_id) {
                sql.query += ' AND da.author = ?'
                sql.params.push(body.user_id)
            }

            const list = await mysql.query(sql.query, sql.params)
            // console.log('list',list)
            // console.log('sql',sql)

            const data = []

            for (const value of list) {
                // console.log('article',value)
                const idxArticle = data.findIndex(article => article.id === value.id)
                if (idxArticle === -1) {
                    data.push({
                        id: value.id,
                        title: value.title,
                        summary: value.summary,
                        created_at: value.created_at,
                        updated_at: value.updated_at,
                        user: {
                            id: value.id_author,
                            username: value.username_author,
                            name: value.nama_author
                        },
                        comment: value.id_komentar? [{
                            id: value.id_komentar,
                            title: value.title_komentar,
                            comment: value.komentar,
                            user: {
                                id: value.id_komentator,
                                username: value.username_komentator,
                                name: value.nama_komentator
                            }
                        }] : []
                    })
                } else {
                    if (value.id_komentar) {
                        data[idxArticle].comment.push({
                            id: value.id_komentar,
                            title: value.title_komentar,
                            comment: value.komentar,
                            user: {
                                id: value.id_komentator,
                                username: value.username_komentator,
                                name: value.nama_komentator
                            }
                        })
                    }
                }
            }

            return {
                status: true,
                data
            }
        } catch (error) {
            console.error('listArticles module Error: ',error)

            return {
                status: false,
                error
            }
        }
    }

    // Detail Article
    detailArticle = async (id) => {
        try {
            const schema = Joi.number().required()

            const validation = schema.validate(id)

            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)

                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }

            const detail = await mysql.query(
                `SELECT 
                    dk.id,
                    dk.title,
                    dk.summary,
                    dk.created_at,
                    dk.updated_at,
                    dk.author user_id,
                    au.username,
                    au.nama_user
                FROM d_artikel dk
                JOIN auth_user au ON au.id = dk.author
                WHERE dk.id = ?`,
                [id]
            )

            if (detail.length <= 0) {
                return {
                    status: false,
                    code: 404,
                    error: 'Sorry, article not found'
                }
            }

            const data = []
            for (const value of detail) {
                data.push({
                    id: value.id,
                    title: value.title,
                    summary: value.summary,
                    created_at: value.created_at,
                    updated_at: value.updated_at,
                    user: {
                        id: value.user_id,
                        username: value.username,
                        nama_user: value.nama_user
                    }
                })
            }

            return {
                status: true,
                data: data[0]
            }
        } catch (error) {
            console.error('detailArticle module Error: ', error)

            return {
                status: false,
                error: error
            }
        }
    }

    // Create Article
    addArticle = async (body) => {
        try {
            const schema = Joi.object({
                title: Joi.string().required(),
                user_id: Joi.number().required(),
                summary: Joi.string(),
            })

            const validation = schema.validate(body)

            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)

                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }

            const add = await mysql.query(
                'INSERT INTO d_artikel (author, title, summary) VALUES (?, ?, ?)',
                [body.user_id, body.title, body.summary]
            )

            return {
                status: true, 
                data: add
            }
        } catch (error) {
            console.error('addArticle module Error: ', error)

            return {
                status: false,
                error
            }
        }
    }

    // Edit Article
    editArticle = async (body) => {
        try {
            const schema = Joi.object({
                id: Joi.number().required(),
                title: Joi.string(),
                user_id: Joi.number(),
                summary: Joi.string()
            })

            const validation = schema.validate(body)

            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)

                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }

            // Don't insert if undefined field
            let query = 'UPDATE d_artikel SET '
            const queryField = []
            const params = []

            if (body.title) {
                queryField.push('title = ?')
                params.push(body.title)
            }
            if (body.summary) {
                queryField.push('summary = ?')
                params.push(body.summary)
            }

            query += queryField.join(', ')
            query += ' WHERE id = ? AND author = ?'
            params.push(body.id, body.user_id)

            const edit = await mysql.query(query, params)

            // If query not affected any rows
            if (edit && edit.affectedRows <= 0) {
                // console.log(edit)
                return {
                    status: false,
                    code: 403,
                    error: 'Article cannot edited. Reasons:article id is out of index or you are not the article owner'
                }
            }

            return {
                status: true,
                data: edit
            }
        } catch (error) {
            console.error('editArticle module Error: ', error)

            return {
                status: false,
                error
            }
        }
    }

    /**
     * Delete Article
     * @param {number} id 
     * @param {number} user_id 
     * @returns 
     */
    deleteArticle = async (id, user_id) => {
        try {
            const schema = Joi.number().required()

            const validation = schema.validate(id)

            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)

                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }

            const del = await mysql.query(
                'DELETE FROM d_artikel WHERE id = ? AND author = ?',
                [id, user_id]
            )

            // If query not affected any rows
            if (del && del.affectedRows <= 0) {
                // console.log(del)
                return {
                    status: false,
                    code: 403,
                    error: 'Article cannot deleted. Reasons:article id is out of index or you are not the article owner'
                }
            }

            return {
                status: true,
                data: del
            }
        } catch (error) {
            console.error('deleteArticle module Error: ', error)

            return {
                status: false,
                error
            }
        }
    }
}

module.exports = new _article()