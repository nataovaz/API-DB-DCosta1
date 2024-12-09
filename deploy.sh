#!/bin/bash

# Navegar até o diretório da aplicação
cd /home/ec2-user/API-DCosta || exit

# Resetar qualquer mudança local
git reset --hard HEAD

# Fetch das mudanças do repositório remoto
git fetch --all

# Verificar e aplicar as mudanças da branch main
git checkout main
git pull origin main

# Instalar dependências, caso necessário
npm install

# Reiniciar a aplicação via PM2
pm2 restart api-dcosta || pm2 start index.js --name api-dcosta

# Exibir o status do PM2
pm2 status

