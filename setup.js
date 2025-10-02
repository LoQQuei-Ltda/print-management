const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Por favor, preencha as informações abaixo para criar o arquivo .env\n');

const questions = [
  'Digite a chave de API registrada para esse IP (API_KEY): ',
  'Digite o host do banco de dados (DB_HOST): ',
  'Digite a porta do banco de dados (DB_PORT): ',
  'Digite o usuário do banco de dados (DB_USERNAME): ',
  'Digite a senha do banco de dados (DB_PASSWORD): ',
  'Digite o limite de conexões com o banco de dados (DB_CONNECTION_LIMIT): ',
  'Digite o número de dias para excluir arquivos antigos (FILES_OLD_THRESHOLD_DAYS): ',
];

const envConfig = [
  'PORT=80',
  'DB_DATABASE=print_management'
];

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

    if (key === 'DB_USERNAME' && answer.toLowerCase() === 'postgres') {
      console.log('Erro: O nome de usuário "postgres" não é permitido para DB_USERNAME. Por favor, digite um nome de usuário diferente.');
      askQuestion(index);
      return;
    }

    envConfig.push(`${key}=${answer}`);
    askQuestion(index + 1);
  });
}

askQuestion(0);
