# Login Google — configuração e próxima implementação

Estado confirmado em 09/10/2026: clientes criados no Google Cloud, mas login Google
ainda NÃO implementado no aplicativo ou na API. Nenhuma alteração na VM nesta etapa.

## Configuração pública (não são segredos)

- Projeto: `lifeguard-b88f9` (LifeGuard).
- Android: `com.mdantasc.lifeguard`.
- Cliente Android: `44066949202-3mgnu0etb17rjotq3s9pfis8s304lj5l.apps.googleusercontent.com`.
- Cliente Web/API: `44066949202-jn863ipr11pmp8e0p0bi4fmt09i00e4r.apps.googleusercontent.com`.
- SHA-1 do certificado do APK: `08:B7:3D:EA:79:D0:81:03:03:DB:BF:A7:C2:02:93:05:E2:E5:1E:03`.
- Certificado extraído com `apksigner verify --print-certs dist/lifeguard.apk`
  e cadastrado no Firebase. Nenhuma chave privada foi enviada ao Google.
- Branding LifeGuard, público externo em modo de teste. O titular confirmou os
  termos diretamente no navegador e autorizou seu e-mail de suporte/contato.
- Cliente Web sem origens JavaScript ou redirecionamentos: reservado ao audience
  dos ID tokens do login nativo Android, não a um fluxo de login Web.
- Segredo do cliente Web NÃO copiado, baixado ou versionado. Validar ID token
  assinado por Google não exige colocar esse segredo no APK.

## Próximos passos

1. Consultar documentação SDK 54 e biblioteca Google Sign-In antes de implementar.
2. Integrar login nativo usando cliente Web como audience; pedir somente identidade
   básica, sem permissões Gmail/Drive. Evitar armazenar ou registrar tokens Google.
3. API: validar assinatura/JWKS, issuer, audience, expiração, sub e e-mail verificado;
   emitir a sessão revogável LifeGuard existente, com limite de requisições.
4. Persistir vínculo por subject (`sub`) Google único. Não ligar uma conta existente
   apenas porque o e-mail coincide: exigir autenticação na conta LifeGuard e prova
   recente antes de vincular. Manter recuperação/exclusão/alteração de senha coerentes.
5. Cadastro novo: obter telefone, gênero, tipo Paciente/Cuidador e aceite dos termos
   antes de concluir a conta; preservar escolha feita na tela anterior.
6. Testar tokens inválidos/expirados/audience incorreto, e-mail não verificado,
   conflito de conta, cancelamento, falta de rede e criação concorrente.
7. Atualizar configuração Firebase local se necessária. Adicionar módulo nativo
   requer NOVO runtime/appVersion e APK-base; não enviar dependência nativa por OTA
   para a base 1.8.0 atual.
8. Configurar audience na API da VM, aplicar migrações testadas e publicar APK assinado
   com o MESMO certificado. Testar Google em dois celulares antes de anunciar pronto.
9. Revisar usuários de teste/publicação no console antes da distribuição; a plataforma
   foi criada em modo de teste, sem adicionar terceiros ou publicar em produção.

Console: https://console.cloud.google.com/auth/clients?project=lifeguard-b88f9
