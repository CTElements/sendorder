
const qs = require('qs');
const axios = require('axios')
async function tokenVapt() {
    try {
        const loginUrl = 'https://vector.log.br/api/app/vapt/login';
        const loginData = {
            username: "759",//process.env.VAPTUSERNAME
            password: "X0i#7W4}IPSWjHQqc+04"//process.env.VAPTPASSWORD
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

