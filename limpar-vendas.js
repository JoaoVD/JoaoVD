// limpar-vendas.js
// ATENÇÃO: Este script apaga permanentemente todos os registros da tabela 'vendas'.

const sqlite3 = require('sqlite3').verbose();

// Conecta ao nosso banco de dados
const db = new sqlite3.Database('./pastelaria.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    return;
  }
  console.log("Conectado ao banco de dados 'pastelaria.db' para limpeza.");
});

// Mensagem de aviso e contagem regressiva para cancelamento
console.log('-----------------------------------------------------------------');
console.log('--- ATENÇÃO: Este script irá apagar TODAS as vendas registradas ---');
console.log('-----------------------------------------------------------------');
console.log('A operação começará em 5 segundos. Pressione CTRL+C para cancelar.');

// Espera 5 segundos antes de executar a exclusão
setTimeout(() => {
  console.log('Iniciando a limpeza da tabela de vendas...');

  const sql = `DELETE FROM vendas`;

  db.run(sql, [], function (err) {
    if (err) {
      console.error("Ocorreu um erro ao limpar a tabela de vendas:", err.message);
    } else {
      console.log(`✅ Operação concluída com sucesso.`);
      console.log(`   ${this.changes} registros de vendas foram apagados.`);
    }

    // Fecha a conexão com o banco de dados
    db.close((err) => {
      if (err) {
        console.error("Erro ao fechar a conexão com o banco:", err.message);
      } else {
        console.log("Conexão com o banco de dados fechada.");
      }
    });
  });

}, 5000); // Atraso de 5000 milissegundos (5 segundos)
