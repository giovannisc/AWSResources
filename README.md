# Repositório para criação de recursos na AWS.  

## Introdução
Este repositório foi criado baseado no excelente tutorial fornecido pela organização [Serverless Stack](https://serverless-stack.com). Veja a seção de [Best Practices section](https://serverless-stack.com/chapters/best-practices-for-building-serverless-apps.html) do guia, em que são usados os frameworks [SST](https://github.com/serverless-stack/serverless-stack) e [AWS CDK](https://aws.amazon.com/cdk/) utilizados para o deploy de uma aplicação.

## Uso

Para usar essa aplicação é necessário ter uma conta da AWS, criar um usuário no IAM e cadastrar esse usuário na sua máquina utilizando a ferramenta de linha de comando da AWS.
Se precisar de ajuda para isso acesse o guia do [serverless-stack](https://serverless-stack.com/#guide).
Use o comando:
``` bash
$ aws configure --profile=myAppResources
```

Faça o clone dessa aplicação.

Instale as dependências usando o comando:

``` bash
$ npm install
```

e faça o deploy do APP usando o SST com sua conta configurada na AWS.

``` bash
$ npm run deploy
```

Remova seu deploy.

``` bash
$ npm run remove
```

Uma alternativa excelente para subir essa aplicação de forma automática é usando a solução do [seed-run](https://seed.run/).

## O que é feito aqui?
Este repositório instância 3 recursos da AWS:
 - cognito
 - dynamodb
 - S3
O cognito é um servidor de autenticação super completo e seguro, que pode importa e exportar os usuários para outros servidores, logo é uma solução útil e que não vai lhe deixar dependente.
O dynamodb é um banco de dados não relacional da Amazon. Veja esse vídeo para entender mais sobre [dynamodb tutorial zup](https://www.youtube.com/watch?v=_l_KBcqfPio)
O S3 que é um repositório para você guardar arquivos.

## Contato

[Email]: mailto:giovanni.schimidt@gmail.com
