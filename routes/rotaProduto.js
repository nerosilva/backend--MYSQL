const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
//const mysql = require("../mysql").pool;

// Configuração da conexão com o banco de dados MySQL
//const mysql = mysql.createmysql({
  //host: 'localhost',
  //user: 'seu_usuario',
  //password: 'sua_senha',
 // database: 'seu_banco_de_dados'
//});

// Conexão ao banco de dados


// Criação da tabela "produto" no banco de dados, caso não exista
mysql.query("CREATE TABLE IF NOT EXISTS produto (id INT AUTO_INCREMENT PRIMARY KEY, status VARCHAR(1), descricao VARCHAR(255), estoque_minimo DECIMAL(10,2), estoque_maximo DECIMAL(10,2))", (createTableError) => {
  if (createTableError) {
    console.error('Erro ao criar tabela produto:', createTableError);
  }
});

// Rota para listar todos os produtos
router.get("/", (req, res, next) => {
  mysql.query("SELECT * FROM produto", (error, rows) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Aqui está a lista de produtos",
      produtos: rows
    });
  });
});

// Rota para obter um produto pelo ID
router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query("SELECT * FROM produto WHERE id=?", [id], (error, rows) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Aqui está o produto solicitado",
      produto: rows[0] // Retorna apenas o primeiro resultado
    });
  });
});

// Rota para criar um novo produto
router.post('/', (req, res, next) => {
  const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

  mysql.query(`INSERT INTO produto (status, descricao, estoque_minimo, estoque_maximo) VALUES (?, ?, ?, ?)`, [status, descricao, estoque_minimo, estoque_maximo], (error, result) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(201).send({
      mensagem: "Produto cadastrado com sucesso!",
      produto: {
        id: result.insertId,
        status,
        descricao,
        estoque_minimo,
        estoque_maximo
      }
    });
  });
});

// Rota para atualizar um produto existente
router.put("/", (req, res, next) => {
  const { id, status, descricao, estoque_minimo, estoque_maximo } = req.body;

  mysql.query("UPDATE produto SET status=?, descricao=?, estoque_minimo=?, estoque_maximo=? WHERE id=?", [status, descricao, estoque_minimo, estoque_maximo, id], (error) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Produto alterado com sucesso!"
    });
  });
});

// Rota para excluir um produto pelo ID
router.delete("/:id", (req, res, next) => {
  const { id } = req.params;
  mysql.query("DELETE FROM produto WHERE id=?", id, (error) => {
    if (error) {
      console.log( error.message)
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Produto deletado com sucesso!"
    });
  });
});

module.exports = router;
