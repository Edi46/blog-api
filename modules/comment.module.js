const mysql = require('../helpers/database')
const Joi = require('joi')

class _comment {
    // Create Comment
    addComment = async (body) => {
        try {
            const schema = Joi.object({
                user_id: Joi.number().required(),
                article_id: Joi.number().required(),
                title: Joi.string(),
                comment: Joi.string().required(),
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
                'INSERT INTO d_komentar(user, artikel, title, komentar) VALUES (?, ?, ?, ?)',
                [body.user_id, body.article_id, body.title, body.comment]
            )

            return {
                status: true,
                data: add
            }
        } catch (error) {
            if (error.name === 'SqlError' && error.errno === 1452) {
                return {
                    status: false,
                    code: 404,
                    error: "Sorry, cannot add comment to the article because of the article is not found"
                }
            }

            console.error('addComment module Error: ', error)

            return {
                status: false,
                error
            }
        }
    }
}

module.exports = new _comment()