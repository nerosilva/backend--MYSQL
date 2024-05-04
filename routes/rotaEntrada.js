const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

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

router.get("/", (req, res, next) => {
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
    entrada.id_produto = produto.id`, 
    (error, results, fields) => {
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

router.post('/', (req, res, next) => {
  const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

  if (!id_produto || !quantidade || !valor_unitario || !data_entrada) {
    return res.status(400).send({
      mensagem: "Falha ao cadastrar Entrada.",
      erro: "Todos os campos são obrigatórios."
    });
  }

  mysql.query(`INSERT INTO entrada (id_produto, quantidade, valor_unitario, data_entrada) VALUES (?, ?, ?, ?)`,
    [id_produto, quantidade, valor_unitario, data_entrada], 
    (error, results, fields) => {
      if (error) {
        return res.status(500).send({
          error: error.message
        });
      }
      res.status(201).send({
        mensagem: "Entrada criada com Sucesso!",
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

  mysql.query("DELETE FROM entrada WHERE id = ?", [id], (error, result) => {
    if (error) {
      return res.status(500).send({
        error: error.message
      });
    }
    res.status(200).send({
      mensagem: "Entrada excluída com Sucesso!"
    });
  });
});

module.exports = router;
