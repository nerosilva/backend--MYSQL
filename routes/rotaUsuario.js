const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// GET - Buscar um usuário pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.query("SELECT * FROM usuario WHERE id = ?", [id], (error, result) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        if (result.length == 0) {
            return res.status(404).send({ mensagem: "Usuário não encontrado" });
        }
        res.status(200).send({
            mensagem: "Usuário encontrado",
            usuario: result[0]
        });
    });
});

// GET - Buscar todos os usuários
router.get("/", (req, res, next) => {
    mysql.query("SELECT * FROM usuario", (error, results) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        res.status(200).send({
            mensagem: "Aqui está a lista de usuários",
            usuarios: results
        });
    });
});

// POST - Login
router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;
    mysql.query("SELECT * FROM usuario WHERE email = ?", [email], (error, results) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        if (results.length == 0) {
            return res.status(401).send({ mensagem: "Usuário não encontrado" });
        }
        const usuario = results[0];
        bcrypt.compare(senha, usuario.senha, (bcryptError, result) => {
            if (bcryptError || !result) {
                return res.status(401).send({ mensagem: "Senha incorreta" });
            }
            const token = jwt.sign({ id: usuario.id, email: usuario.email }, 'secreto', { expiresIn: '1h' });
            res.status(200).send({ mensagem: "Login bem sucedido", token });
        });
    });
});

// POST - Cadastrar usuário
router.post('/', (req, res, next) => {
    const { nome, email, senha } = req.body;
    if (!nome || nome.length < 3 || !validateEmail(email) || !senha || senha.length < 6) {
        return res.status(400).send({ mensagem: "Dados inválidos para cadastro" });
    }

    mysql.query("SELECT email FROM usuario WHERE email = ?", [email], (error, results) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        if (results.length > 0) {
            return res.status(409).send({ mensagem: "E-mail já cadastrado" });
        }
        bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
            if (hashError) {
                return res.status(500).send({ error: hashError.message });
            }
            mysql.query("INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)", [nome, email, hashedPassword], (insertError, results) => {
                if (insertError) {
                    return res.status(500).send({ error: insertError.message });
                }
                res.status(201).send({
                    mensagem: "Usuário cadastrado com sucesso",
                    usuarioId: results.insertId
                });
            });
        });
    });
});

// Função auxiliar para validar o email
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// PUT - Atualizar usuário
router.put("/", (req, res, next) => {
    const { id, nome, email, senha } = req.body;
    mysql.query("UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?", [nome, email, senha, id], (error) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        res.status(200).send({ mensagem: "Usuário atualizado com sucesso" });
    });
});

// DELETE - Deletar usuário
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.query("DELETE FROM usuario WHERE id = ?", [id], (error) => {
        if (error) {
            return res.status(500).send({ error: error.message });
        }
        res.status(200).send({ mensagem: "Usuário deletado com sucesso" });
    });
});

module.exports = router;
