const app = require('./src/config/custom-express');

app.listen(process.env.PORT || 3333, () =>{
    console.log('Servidor escutando na porta 3333')
});
