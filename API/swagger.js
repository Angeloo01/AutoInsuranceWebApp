//from: https://medium.com/swlh/automatic-api-documentation-in-node-js-using-swagger-dd1ab3c78284
const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./index.js']

swaggerAutogen(outputFile, endpointsFiles)