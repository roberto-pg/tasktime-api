const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3334;

const server = http.createServer(app);

server.listen(port, function () {
    console.log(`Server started on port ${port}`)
});