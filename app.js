const express = require('express')
const app = express();
app.use(express.json());
const cors = require("cors")
app.use(cors());
const morgan = require("morgan");
app.use(morgan("dev"));


const rotaUsuarios = require("./routes/rotaUsuario");
const rotaProduto = require("./routes/rotaProduto");
const rotaEntrada = require("./routes/rotaEntrada");
const rotaSaida = require("./routes/rotaSaida");
const rotaEstoque = require("./routes/rotaEstoque");


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header(
        "Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type, Accept,Autorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control_Allow-Methods", "PUTT, POST, PATCH, DELETE, GET");
        return res.status(200).setDefaultEncoding({});
    }
    next();

});

app.use("/usuario", rotaUsuarios);
app.use("/produto", rotaProduto);
app.use("/entrada", rotaEntrada);
app.use("/saida", rotaSaida);
app.use("/estoque", rotaEstoque);


app.use((req, res, next) => {
    const erro = new console.error("Não encontrado!");
    erro.status(404);

});

app.use((error, req, res, next) => {

    res.status(error.status || 500);
    return res.json({
        erro: {
            mensagem: error.message
        }
    });

});

module.exports = app