const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate')

const routers = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routers);
app.use(errors());

app.listen(3333, () =>{
    console.log('Servidor escutando na porta 3333')
});