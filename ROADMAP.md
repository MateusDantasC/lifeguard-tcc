# Roadmap do LifeGuard

Este arquivo registra as próximas etapas do projeto. Funcionalidades relacionadas ao ESP32 e ao simulador ficam deliberadamente para o final.

## 1. Conta, privacidade e segurança

- Alteração de senha para usuários autenticados.
- Exclusão de conta com confirmação e tratamento dos vínculos.
- Termos de Uso e Política de Privacidade completos e acessíveis dentro do aplicativo.
- Fluxo para exportar ou solicitar os próprios dados, alinhado à LGPD.
- Sessões revogáveis e opção de sair de todos os aparelhos.
- Proteção contra tentativas repetidas de login e abuso da API.
- Recuperação de senha e confirmação de e-mail, quando o serviço de e-mail for definido.

## 2. Experiência e acessibilidade

- Abrir a tela correta ao tocar em uma notificação.
- Preferências de notificação por categoria.
- Cache seguro dos últimos dados para consulta sem conexão.
- Revisão completa de estados vazios, carregamento, erro e tentativa novamente.
- Revisão de acessibilidade: leitor de tela, contraste, tamanhos de toque e textos ampliados.
- Tela de ajuda, perguntas frequentes e orientações de emergência.
- Histórico de alterações importantes no perfil do paciente.

## 3. Confiabilidade da infraestrutura

- Backup automático e teste de restauração do PostgreSQL.
- Monitoramento de disponibilidade da API e uso de disco da VM.
- Registro estruturado de erros sem armazenar dados sensíveis.
- Relatórios de entrega das notificações push e limpeza de tokens inválidos.
- Ambientes separados de teste e produção.
- Domínio próprio para a API.

## 4. Qualidade, distribuição e apresentação

- Testes automatizados das rotas, autenticação, vínculos e permissões.
- Testes de interface e roteiro de teste com dois ou mais celulares.
- Integração contínua para executar verificações a cada envio ao GitHub.
- Automação segura do deploy da API e das atualizações EAS.
- Site oficial com download do APK, versão e instruções de instalação.
- Tela de versão e notas da atualização no aplicativo.
- Monitoramento de falhas do aplicativo em produção.
- Material e roteiro de demonstração para a VISIT.

## 5. Etapa final: simulador e hardware

- Executar o simulador continuamente na Oracle durante os testes.
- Criar autenticação própria para o dispositivo e endpoint de envio de leituras.
- Integrar o ESP32 e associá-lo ao paciente correto.
- Exigir leituras anormais consecutivas antes de gerar alerta.
- Ignorar perda de contato e picos inválidos do sensor.
- Manter intervalo de segurança entre alertas repetidos.
- Avisar os cuidadores quando a condição voltar ao normal.
- Calibrar limites e filtros com dados reais, sem tratar a versão inicial como dispositivo médico validado.
