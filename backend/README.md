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
npm run db:seed
```

Inicie a API e o simulador em terminais separados:

```powershell
npm run dev
npm run simulator
```

A API fica disponível em `http://localhost:3333`. Verifique com `GET /health`.

## Contas de demonstração

- Cuidador: `ana@lifeguard.test` / `Teste123!`
- Idoso: `maria@lifeguard.test` / `Teste123!`

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
- `GET /api/alertas`
- `PATCH /api/alertas/:alertaId`

As rotas sob `/api`, exceto cadastro e login, exigem `Authorization: Bearer <token>`.

## Regra de segurança das leituras

Uma leitura só pode gerar alerta quando `valid = true` e `contactDetected = true`. Picos observados durante perda de contato são armazenados para diagnóstico, com qualidade do sinal e motivo de invalidação, mas não disparam emergência.

Essa regra é uma proteção técnica temporária, não uma validação clínica. Os parâmetros de qualidade e filtragem deverão ser calibrados com dados reais do hardware antes do uso final.

## Implantação na Oracle

O `Dockerfile` e o `compose.production.example.yml` deixam a API e o PostgreSQL prontos para uma VM Ubuntu na Oracle Cloud. Na implantação, copie o arquivo de produção, configure senhas fortes fora do Git, execute `npm run db:deploy` dentro do contêiner da API e coloque HTTPS na frente da porta 3333 antes de conectar o aplicativo.
