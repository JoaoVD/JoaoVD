// webpack.common.js - VERSÃO CORRIGIDA PARA NW.js

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Ponto de entrada da sua aplicação
  entry: './js/app.js',

  // Onde o "pacote" final do frontend será colocado
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Limpa a pasta 'dist' antes de cada build
  },

  plugins: [
    // Gera o index.html na pasta 'dist' e injeta o 'bundle.js'
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),

    // COPIA todos os arquivos e pastas estáticas necessários para a 'dist'
    new CopyWebpackPlugin({
      patterns: [
        // Copia a pasta 'views' (com caixa.html, etc.)
        {from: './views', to: './views'},

        // --- ADIÇÃO CRÍTICA AQUI ---
        // Copia a pasta 'css' (com style.css)
        {from: './css', to: './css'}
      ]
    })
  ],

  module: {
    rules: [
      // Seus loaders (se houver)
    ],
  },
};
