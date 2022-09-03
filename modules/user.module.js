const mysql = require('../helpers/database')
const bcrypt = require('bcrypt')
const Joi = require('joi')

class _user {
    // Create User
    addUser = async (body) => {
        try {
            const schema = Joi.object({
                username: Joi.string().required(),
                password: Joi.string().required(),
                nama_user: Joi.string()
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

            body.password = bcrypt.hashSync(body.password,10)

            const add = await mysql.query(
                'INSERT INTO auth_user (username, password, nama_user) VALUES (?, ?, ?)',
                [body.username, body.password, body.nama_user]
            )

            return {
                status: true,
                data: add
            }
        } catch (error) {
            console.error('addUser user.modules.js Error: ',error)

            return {
                status: false,
                error
            }
        }
    }
}

module.exports = new _user()