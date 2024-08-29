
const axios = require('axios')
async function getTokenBling() {
    try {
        const response = await axios.post('https://bling-refresh-token.vercel.app/token');
        return response.data;
    } catch (error) {
        return null;
    }
}

module.exports = getTokenBling