
const qs = require('qs');
const axios = require('axios')
async function tokenVapt() {
    try {
        const loginUrl = 'https://vector.log.br/api/app/vapt/login';
        const loginData = {
            username: process.env.VAPTUSERNAME,
            password: process.env.VAPTPASSWORD
        };
        const response = await axios.post(loginUrl, qs.stringify(loginData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return response.data.token
    } catch (error) {
        return
    }
}

module.exports = tokenVapt

