require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3030
const cors = require('cors')
const helmet = require("helmet")
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
app.use(cors({
    origin:"*"
}))
app.use(helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false
}))

app.use((error, req, res, next)=>{
   if(error){
    res.status(500).json({
        msg: "Internal Server Error",
        error: error
    })
   }
})

app.use(bodyParser.text({ type: '*/*' }));

var types = {
    "application/json": true,
    "text/plain": true,
    "application/javascript": true,
    "text/html": true,
    "application/xml": true
}
app.use((req, res, next) => {
    if (types[req.headers['content-type']] && typeof req.body === 'string') {
        const match = req.body.match(/^([a-zA-Z0-9_]+)=/);
        if (match) {
            req.body = req.body.substring(match[0].length);
            try {
                req.body = JSON.parse(req.body);
            } catch (error) {
                console.error('Falha ao interpretar como JSON:', error);
            }
        } else {
            req.body = JSON.parse(req.body);
        }
    }
    next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const routes = require('./routes/index')
app.use(routes)
//sudo firewall-cmd --permanent --add-port=3030/tcp

const dbUser = "sendOrderToOperator"//process.env.DB_USER 
const dbPass = "nsKgWk35STzKpOpy"//process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.xlgi8.mongodb.net/?retryWrites=true&w=majority`).then(() => {

    app.listen(port, () => {
        console.log(`api rodando na porta ${port}`)
    })

}).catch((error) => console.log(error))