# CoreDash
A local dashboard running on an old laptop with Docker, using a tablet as the interface -just like my current setup!

## CasaOS
I'm currently using CasaOS on my home server to manage and simplify Docker images.

## Development
Executar Web App:

```Bash
cd apps/web
npm run dev
```
---
You can run a mock apis, running the docker-compose

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

## Deploy