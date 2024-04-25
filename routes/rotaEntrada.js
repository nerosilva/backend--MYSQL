const express = require("express");
const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// Assumindo que "../mysql" exporta a pool de conexão como "pool"
const mysql = require("../mysql").pool;

// Criação de tabela de entrada no banco de dados, caso já não exista
mysql.query(`
  CREATE TABLE IF NOT EXISTS entrada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    quantidade DECIMAL(10,2),
    valor_unitario DECIMAL(10,2),
    data_entrada DATE
  )`, (error, results, fields) => {
  if (error) {
    console.error("Erro ao criar a tabela 'entrada':", error);
  }
});

// Rota para obter as entradas
router.get("/", (req, res, next) => {
  const { id } = req.params;

  mysql.query(` 
                SELECT 
                entrada.id as id,
                entrada.quantidade,
                entrada.id_produto as id_produto,
                produto.descricao as descricao,
                entrada.valor_unitario as valor_unitario,
                entrada.data_entrada as data_entrada
                FROM entrada
                INNER JOIN produto on
                entrada.id_produto =produto.id                
                `
                
                
                , (error, results, fields) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Aqui está a Entrada solicitada",
      entrada: results
    });
  });
});

// Rota para obter uma Entrada pelo ID
router.get("/:id", (req, res, next) => {
  const { id } = req.params;

  mysql.query("SELECT * FROM entrada WHERE id = ?", [id], (error, results, fields) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Aqui está a Entrada solicitada",
      entrada: results
    });
  });
});

// Aqui irão as outras rotas adaptadas para MySQL...

// Exemplo de adaptação para inserir uma nova entrada
router.post('/', (req, res, nxt) => {
  const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

  // Validação dos campos (mantida igual)
  let msg = [];
  var regex = /^[0-9]+$/
  if (!id_produto) {
    msg.push({ mensagem: "id do produto inválido! Não pode ser vazio." });
  }
  if (!quantidade || quantidade.length == 0) {
    console.log("erro")
    msg.push({ mensagem: "Quantidade inválida!" });
  }
  if (msg.length > 0) {
    return res.status(400).send({
      mensagem: "Falha ao cadastrar Entrada.",
      erros: msg
    });
  }

  // Insere a nova entrada no banco de dados
  mysql.query(`INSERT INTO entrada (id_produto, quantidade, valor_unitario, data_entrada) VALUES (?, ?, ?, ?)`,
    [id_produto, quantidade, valor_unitario, data_entrada], 
    (error, results, fields) => {
      console.log(error.message)
      if (error) {
        return res.status(500).send({
          error: error.message,
          response: null
        });
      }
      // Atualização de estoque (função atualizarestoque precisa ser adaptada para MySQL)
      res.status(201).send({
        mensagem: "Entrada criada com sucesso!",
        entradaId: results.insertId,
        dados: {
          id_produto,
          quantidade,
          valor_unitario,
          data_entrada,
        }
      });
    });
});
router.delete("/:id", (req, res, next) => {
  const { id } = req.params;

  mysql.getConnection((error, connection) => {
      if (error) {
          return res.status(500).send({
              error: error.message
          });
      }

      const query = "DELETE FROM entrada WHERE id=?";
      const values = [id];

      connection.query(query, values, (error, result) => {
          connection.release(); // Liberar conexão após exclusão

          if (error) {
              return res.status(500).send({
                  error: error.message
              });
          }

          res.status(200).send({
              mensagem: "Entrada excluída com sucesso!"
          });
      });
  });
});

// As outras funções, como `atualizarestoque`, também precisam ser adaptadas seguindo o exemplo acima.

module.exports = router;
