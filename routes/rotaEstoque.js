const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Middleware para analisar o corpo das solicitações
router.use(express.json());

// Rota para listar todos os itens em estoque
router.get("/:id", (req, res) => {
    const {id} =req.params
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`
            SELECT 
                estoque.id AS id,
                estoque.quantidade AS quantidade,
                estoque.valor_unitario AS valor_unitario,
                produto.id AS id_produto,
                produto.descricao AS descricao
            FROM estoque
            INNER JOIN produto ON estoque.id_produto = produto.id where id_produto=?;
        `, [id], (queryError, rows) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao executar consulta:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Lista de itens em estoque",
                estoque: rows
            });
        });
    });
});
router.get("/", (req, res) => {
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`
            SELECT 
                estoque.id AS id,
                estoque.quantidade AS quantidade,
                estoque.valor_unitario AS valor_unitario,
                produto.id AS id_produto,
                produto.descricao AS descricao
            FROM estoque
            INNER JOIN produto ON estoque.id_produto = produto.id;
        `, (queryError, rows) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao executar consulta:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Lista de itens em estoque",
                estoque: rows
            });
        });
    });
});

// Rota para adicionar um novo item ao estoque
router.post("/", (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;

    if (!id_produto || !quantidade || !valor_unitario) {
        return res.status(400).send({ error: "Todos os campos são obrigatórios: id_produto, quantidade, valor_unitario" });
    }

    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`INSERT INTO estoque (id_produto, quantidade, valor_unitario) VALUES (?, ?, ?)`, [id_produto, quantidade, valor_unitario], (queryError, result) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao inserir no estoque:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(201).send({
                message: "Item adicionado ao estoque",
                estoque: {
                    id: result.insertId,
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
});

// Rota para deletar um item do estoque por ID
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query("DELETE FROM estoque WHERE id = ?", [id], (error, result) => {
            connection.release();
            if (error) {
                console.error('Erro ao deletar do estoque:', error.message);
                return res.status(500).send({ error: error.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: "Item não encontrado no estoque" });
            }
            res.status(200).send({ mensagem: "Estoque deletado com sucesso" });
        });
    });
});

module.exports = router;
