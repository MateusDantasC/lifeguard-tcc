# LifeGuard API

Backend Node.js/TypeScript do LifeGuard. A API usa Express 5, PostgreSQL, Prisma 7 e JWT. O simulador substitui temporariamente o ESP32 e inclui cenários de leitura normal, atenção, alerta válido, perda de contato e pico inválido.

## Requisitos

- Node.js 22.2 ou superior
- PostgreSQL 17, diretamente ou pelo Docker
- Docker Desktop apenas se optar pelo `docker compose`

## Preparação local

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run db:migrate -- --name initial
npm run db:seed:build
```

Inicie a API e o simulador em terminais separados:

```powershell
npm run dev
npm run simulator
```

A API fica disponível em `http://localhost:3333`. Verifique com `GET /health`.

## Contas de demonstração

- Cuidador: `ana@lifeguard.test` / `Teste123!`
- Paciente: `maria@lifeguard.test` / `Teste123!`

## Endpoints iniciais

- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/vinculos`
- `POST /api/vinculos/codigo`
- `POST /api/vinculos`
- `DELETE /api/vinculos/:vinculoId`
- `GET /api/idosos`
- `GET /api/idosos/:idosoId`
- `GET /api/idosos/:idosoId/leituras`
- `GET /api/idosos/:idosoId/limites`
- `PUT /api/idosos/:idosoId/limites`
- `POST /api/notificacoes/token`
- `DELETE /api/notificacoes/token`
- `POST /api/notificacoes/teste`
- `GET /api/alertas`
- `PATCH /api/alertas/:alertaId`

As rotas sob `/api`, exceto cadastro e login, exigem `Authorization: Bearer <token>`.

## Regra de segurança das leituras

Uma leitura só pode gerar alerta quando `valid = true` e `contactDetected = true`. Picos observados durante perda de contato são armazenados para diagnóstico, com qualidade do sinal e motivo de invalidação, mas não disparam emergência.

Essa regra é uma proteção técnica temporária, não uma validação clínica. Os parâmetros de qualidade e filtragem deverão ser calibrados com dados reais do hardware antes do uso final.

## Implantação na Oracle

O `Dockerfile`, o `compose.production.example.yml` e o `Caddyfile` deixam a API, o PostgreSQL e o HTTPS prontos para uma VM Ubuntu na Oracle Cloud.

Na VM, copie o arquivo de produção e crie um `.env` que não deve ser enviado ao Git:

```env
POSTGRES_PASSWORD=gere-uma-senha-alfanumerica-forte
JWT_SECRET=gere-uma-chave-aleatoria-com-64-ou-mais-caracteres
APP_ORIGIN=*
PUBLIC_HOST=api.seu-dominio.com
```

Com as portas 80 e 443 liberadas e o domínio apontado para o IP público da VM, execute:

```bash
docker compose -f compose.production.yml up -d --build
docker compose -f compose.production.yml exec api npm run db:seed
```

O contêiner da API aplica as migrations ao iniciar. O PostgreSQL não é publicado na internet; somente o Caddy recebe tráfego externo e encaminha as requisições para a API por HTTPS. Verifique a implantação em `https://api.seu-dominio.com/health`.
