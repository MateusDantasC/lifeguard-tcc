# Verificação antes de conectar o ESP32

## Testes automatizados

O workflow `quality.yml` cria PostgreSQL descartável, aplica todas as migrations,
verifica TypeScript, exporta o bundle Android e executa testes unitários e HTTP.
O teste de integração não aceita NODE_ENV de produção nem banco sem sufixo `_test`.

Localmente, com um PostgreSQL exclusivo em localhost e permissão para criar bancos:

```powershell
cd backend
# Defina DATABASE_URL com a conexão LOCAL de teste, sem usar credenciais de produção.
node scripts/test-local.mjs
```

O script cria um banco com nome aleatório, aplica migrations e o remove ao terminar.
Não altera o banco original. Alternativa: `docker compose -f compose.test.yml up -d`.
Esse compose publica somente em localhost e usa armazenamento temporário.

## Roteiro em dois celulares

Use contas de teste e registre versão do APK, modelo do aparelho e resultado.

1. Instalar o APK 1.8.0 como atualização e abrir sem USB ou Metro.
2. Confirmar logo, splash, textos legíveis e ausência de recortes com fonte ampliada.
3. Criar paciente no celular A e cuidador no B; conferir validações, termos e telefone.
4. Confirmar e-mail e recuperar senha. Conferir expiração e limite de tentativas.
5. Gerar código no A; vincular no B. O mesmo código não deve funcionar novamente.
6. Editar foto e perfil; conferir foto nas listas, homes e informações do paciente.
7. Testar saída durante edição, teclado, tela pequena e leitor de tela.
8. Enviar teste de notificação aos cuidadores no A. Conferir o B aberto, em segundo
   plano e fechado; tocar deve abrir a tela correta.
9. Consultar entregas no perfil do destinatário após 15 minutos. "Encaminhado" não
   comprova visualização; é a confirmação do provedor FCM/APNs.
10. Desativar preferências, desconectar outros dispositivos e testar a revogação.
11. Remover vínculo: o antigo cuidador não deve mais acessar o perfil/leituras.
12. Desligar internet: conferir aviso, cache da própria conta e botão de tentar novamente.
13. Exportar dados pelo compartilhamento nativo; excluir apenas contas de teste.

## Infraestrutura ainda precisa de validação

- Recuperar SSH da VM, implantar código e migrations e testar rollback.
- Substituir/revogar a credencial SMTP historicamente exposta.
- Confirmar timers de backup, restauração e monitoramento ativos.
- Manter cópia criptografada de backup fora da VM e testar restauração.
- Configurar homologação remota separada; o banco descartável local/CI não a substitui.
- Domínio próprio depende de escolha/registro; sslip.io permanece em uso.

## Só depois: hardware

Endpoint e credencial exclusiva do dispositivo, pareamento, validação de leituras,
perda de contato, picos inválidos, leituras consecutivas, cooldown e recuperação.
Não usar dados simulados como se fossem medições reais ou validação clínica.
