# 🚀 Crawler & Web Dashboard System

Este projeto consiste em uma arquitetura robusta de coleta de dados utilizando **Go**, visualização com **Next.js** e armazenamento em **MariaDB**, totalmente integrada ao ecossistema **CasaOS** via Docker.

---

## 🏗️ Arquitetura do Projeto

Baseado no fluxo de dados definido, o sistema opera em quatro camadas principais:

1.  **Crawlers (Go):** Motores de alta performance que realizam o scraping e populam o banco de dados.
2.  **Database (MariaDB):** Camada de persistência centralizada onde os dados são armazenados.
3.  **CI/CD (GitHub & Docker Hub):** * **GitHub Actions (Cron):** Dispara rotinas de build e automação.
    * **Docker Hub:** Armazena as imagens prontas da aplicação Next.js e dos Crawlers.
4.  **Deployment (CasaOS):** Servidor doméstico que consome as imagens do Docker Hub para rodar o app final e o banco de dados.

<img src=".docs/architecture.png" alt="architecture" />

---

## 📂 Estrutura de Diretórios

```text
├── .github/workflows/    # Configurações de Cron e CI/CD
├── apps/
│   └── web/              # Interface Next.js (Frontend)
├── crawlers/
│   ├── cmd/              # Entrypoints dos crawlers em Go
│   └── internal/         # Lógica de scraping e conexão com DB
├── docker-compose.yml    # Orquestração local/CasaOS
└── README.md
```

## 🚀 Fluxo de Deployment

1. GitHub para Docker Hub
Sempre que um novo código é enviado ou um agendamento (Cron) é disparado:

O GitHub Actions compila o código Go.

Gera uma nova imagem Docker para o App Next.js.

Faz o push das imagens para o seu repositório no Docker Hub.

2. Docker Hub para CasaOS
No seu painel do CasaOS:

Utilize a App Store ou "Custom Install".

Aponte para a imagem gerada no Docker Hub.

O CasaOS garantirá que o container do MariaDB e o App estejam na mesma rede para comunicação interna.

## ⚙️ Configuração de Ambiente
Crie um arquivo .env na raiz ou configure as variáveis diretamente no CasaOS:

```
# Database
DB_HOST=mariadb
DB_USER=admin
DB_PASSWORD=sua_senha
DB_NAME=crawler_db
DB_PORT=3306
```

## Connection String (Go/Next)
`DATABASE_URL=mysql://admin:sua_senha@mariadb:3306/crawler_db`
### 🛠️ Como rodar localmente
Subir infraestrutura (Docker):

```Bash
docker-compose up -d
```

Executar Crawlers (Desenvolvimento):

```Bash
cd crawlers
go run main.go
```
Executar Web App:

```Bash
cd apps/web
npm run dev
```

send a push

```Bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "sua_chave_p256dh",
        "auth": "sua_chave_auth"
      }
    },
    "title": "Teste de Push",
    "body": "Funcionou! 🎉",
    "url": "/"
  }'
```