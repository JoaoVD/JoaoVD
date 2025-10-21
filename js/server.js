// server.js - VERSÃO FINAL E CORRIGIDA PARA NW.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

// =================================================================
// MUDANÇA PRINCIPAL: O banco de dados agora é salvo na pasta local
const DB_SOURCE = "./pastelaria.db";
// =================================================================

// CONEXÃO COM O BANCO DE DADOS
const db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    throw err;
  }
  console.log(`Conectado ao banco de dados SQLite em '${DB_SOURCE}'.`);

  db.serialize(() => {
    // Tabela usuarios (COMPLETA)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_usuario TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            nome_completo TEXT,
            cargo TEXT
        )`, (err) => {
      if (err) return console.error("Erro ao criar tabela 'usuarios':", err.message);
      console.log("Tabela 'usuarios' verificada/criada.");

      // Tabela produtos (COMPLETA)
      db.run(`CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                preco REAL NOT NULL,
                categoria TEXT
            )`, (err) => {
        if (err) return console.error("Erro ao criar tabela 'produtos':", err.message);
        console.log("Tabela 'produtos' verificada/criada.");

        // Tabela vendas (COMPLETA)
        db.run(`CREATE TABLE IF NOT EXISTS vendas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
                    total REAL NOT NULL,
                    forma_pagamento TEXT NOT NULL,
                    id_caixa INTEGER NOT NULL,
                    itens TEXT NOT NULL
                )`, (err) => {
          if (err) return console.error("Erro ao criar tabela 'vendas':", err.message);
          console.log("Tabela 'vendas' verificada/criada.");
          popularDadosIniciais();
        });
      });
    });
  });
});

function popularDadosIniciais() {
  db.get(`SELECT COUNT(*) as count FROM usuarios`, (err, row) => {
    if (row && row.count === 0) {
      bcrypt.hash('admin', 10, (err, hash) => {
        if (err) return;
        db.run(`INSERT INTO usuarios (nome_usuario, senha_hash) VALUES (?, ?)`, ['admin', hash], () => {
          console.log("Usuário 'admin' padrão criado.");
        });
      });
    }
  });

  db.get(`SELECT COUNT(*) as count FROM produtos`, (err, row) => {
    if (row && row.count === 0) {
      const produtosExemplo = [
        {nome: 'Pastel de Carne', preco: 8.50, categoria: 'Salgados'},
        {nome: 'Pastel de Queijo', preco: 8.50, categoria: 'Salgados'},
        {nome: 'Coca-Cola Lata', preco: 5.00, categoria: 'Bebidas'},
      ];
      const sqlInsert = `INSERT INTO produtos (nome, preco, categoria) VALUES (?, ?, ?)`;
      produtosExemplo.forEach(p => db.run(sqlInsert, [p.nome, p.preco, p.categoria]));
      console.log("Produtos de exemplo inseridos.");
    }
  });
}

// --- ROTAS DA API ---

app.post('/login', (req, res) => {
  const {nome_usuario, senha} = req.body;
  db.get(`SELECT * FROM usuarios WHERE nome_usuario = ?`, [nome_usuario], (err, usuario) => {
    if (err || !usuario) return res.status(401).json({success: false, message: "Usuário ou senha inválidos."});
    bcrypt.compare(senha, usuario.senha_hash, (err, result) => {
      if (result) res.json({
        success: true,
        message: "Login bem-sucedido!",
        usuario: {nome_usuario: usuario.nome_usuario}
      });
      else res.status(401).json({success: false, message: "Usuário ou senha inválidos."});
    });
  });
});

app.get('/produtos', (req, res) => {
  db.all("SELECT * FROM produtos ORDER BY categoria, nome", [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json({data: rows});
  });
});

app.post('/produtos', (req, res) => {
  const {nome, preco, categoria} = req.body;
  db.run(`INSERT INTO produtos (nome, preco, categoria) VALUES (?, ?, ?)`, [nome, preco, categoria], function (err) {
    if (err) return res.status(500).json({error: err.message});
    res.status(201).json({data: {id: this.lastID, nome, preco, categoria}});
  });
});

app.put('/produtos/:id', (req, res) => {
  const {nome, preco, categoria} = req.body;
  db.run(`UPDATE produtos SET nome = ?, preco = ?, categoria = ? WHERE id = ?`, [nome, preco, categoria, req.params.id], function (err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({message: "Produto atualizado com sucesso", changes: this.changes});
  });
});

app.delete('/produtos/:id', (req, res) => {
  db.run(`DELETE FROM produtos WHERE id = ?`, req.params.id, function (err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({message: "Produto deletado com sucesso", changes: this.changes});
  });
});

app.post('/vendas', (req, res) => {
  const {total, forma_pagamento, id_caixa, itens} = req.body;
  db.run(`INSERT INTO vendas (total, forma_pagamento, id_caixa, itens) VALUES (?, ?, ?, ?)`, [total, forma_pagamento, id_caixa, JSON.stringify(itens)], function (err) {
    if (err) return res.status(500).json({error: err.message});
    res.status(201).json({message: "Venda registrada com sucesso!", id_venda: this.lastID});
  });
});

app.get('/relatorios/vendas', (req, res) => {
  const {dataInicio, dataFim} = req.query;
  const params = [`${dataInicio} 00:00:00`, `${dataFim} 23:59:59`];
  db.all(`SELECT * FROM vendas WHERE data_hora BETWEEN ? AND ? ORDER BY data_hora DESC`, params, (err, vendas) => {
    if (err) return res.status(500).json({error: err.message});
    const totalFaturado = vendas.reduce((acc, v) => acc + v.total, 0);
    res.json({
      resumo: {
        totalFaturado,
        numeroDeVendas: vendas.length,
        ticketMedio: vendas.length > 0 ? totalFaturado / vendas.length : 0
      },
      vendas: vendas
    });
  });
});

app.delete('/dados/reset', (req, res) => {
  db.serialize(() => {
    db.run(`DELETE FROM vendas`, [], () => {
      db.run(`DELETE FROM produtos`, [], () => {
        db.run(`DELETE FROM sqlite_sequence WHERE name IN ('vendas', 'produtos')`, [], () => {
          popularDadosIniciais();
          res.status(200).json({message: "Sistema resetado com sucesso."});
        });
      });
    });
  });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  // A linha 'if (process.send)' foi removida
});
