const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Por favor, preencha as informações abaixo para criar o arquivo .env\n');

const questions = [
  'Digite o número da porta para o servidor (PORT): ',
  'Digite a chave de API registrada para esse IP (API_KEY): ',
  'Digite o host do banco de dados (DB_HOST): ',
  'Digite a porta do banco de dados (DB_PORT): ',
  'Digite o nome do banco de dados (DB_DATABASE): ',
  'Digite o usuário do banco de dados (DB_USERNAME): ',
  'Digite a senha do banco de dados (DB_PASSWORD): ',
  'Digite o limite de conexões com o banco de dados (DB_CONNECTION_LIMIT): ',
  'Digite o número de dias para excluir arquivos antigos (FILES_OLD_THRESHOLD_DAYS): ',
];

const envConfig = [];

function askQuestion(index) {
  if (index === questions.length) {
    const envContent = envConfig.join('\n');
    fs.writeFileSync('.env', envContent, 'utf-8');
    console.log('\nArquivo .env criado com sucesso!');
    rl.close();
    return;
  }

  rl.question(questions[index], (answer) => {
    const key = questions[index].match(/\((.*?)\)/)[1];
    envConfig.push(`${key}=${answer}`);
    askQuestion(index + 1);
  });
}

askQuestion(0);
