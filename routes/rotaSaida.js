const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Rota para listar todas as saídas
router.get("/", (req, res, next) => {
    console.log("Entrou na rota GET /");

    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao obter conexão:", error.message);
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            `SELECT 
                saida.id as id, 
                saida.id_produto as id_produto,
                saida.quantidade as quantidade,
                saida.data_saida as data_saida,
                produto.descricao as descricao,
                saida.valor_unitario as valor_unitario
            FROM saida
            INNER JOIN produto ON saida.id_produto = produto.id`,
            (error, rows) => {
                connection.release(); // Libere a conexão

                if (error) {
                    console.error("Erro na consulta:", error.message);
                    return res.status(500).send({
                        error: error.message
                    });
                }

                console.log("Consulta bem-sucedida. Enviando resposta.");
                res.status(200).send({
                    mensagem: "Aqui está a lista de Saída",
                    produtos: rows
                });
            }
        );
    });
});

// Rota para criar uma nova saída
router.post('/', (req, res) => {
    const { id_produto, quantidade, valor_unitario, data_saida } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(
            "INSERT INTO `saida`( `id_produto`, `quantidade`, `valor_unitario`, `data_saida`) VALUES (?,?,?,?)",
            [id_produto, quantidade, valor_unitario, data_saida],
            (error, result) => {
                connection.release();

                if (error) {
                    console.error(error.message);
                    return res.status(500).send({
                        error: error.message,
                        response: null
                    });
                }

                res.status(201).send({
                    mensagem: "Saída Registrada!",
                    saida: {
                        id: result.insertId,
                        id_produto: id_produto,
                        quantidade: quantidade,
                        valor_unitario: valor_unitario,
                        data_saida: data_saida
                    }
                });
            }
        );
    });
});

// Rota DELETE para excluir uma saída pelo ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
  
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
  
        const query = "DELETE FROM saida WHERE id=?";
        const values = [id];
  
        connection.query(query, values, (error, result) => {
            connection.release();
  
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
  
            res.status(200).send({
                mensagem: "Saída excluída com sucesso!"
            });
        });
    });
});

module.exports = router;
