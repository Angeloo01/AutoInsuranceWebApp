//from: https://medium.com/swlh/automatic-api-documentation-in-node-js-using-swagger-dd1ab3c78284
const app = require('express')()
const http = require('http')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

http.createServer(app).listen(5000)
console.log("Listening at:// port:%s (HTTP)", 5000)

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
//app.use(require('./index.js'))