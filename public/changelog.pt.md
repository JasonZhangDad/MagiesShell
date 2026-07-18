# Notas de versão

## [0.5.1] - 2026-07-18

### Lançamento
- Instaladores e metadados de atualização automática da linha 0.5.x (MgTerminal-releases)

## [0.5.0] - 2026-07-17

### Recursos
- **Painel de diagnóstico Hex/Raw do terminal**: I/O da sessão por bytes (opcional)
- **Fonte de hosts JSON**: inventários de JSON local ou HTTP(S); só metadados; cabeçalhos de auth HTTP
- **Compartilhar e importar inventário**: export só metadados (YAML Ansible); import da área de transferência
- **Modelos de espaço de trabalho nomeados**: vínculos de hosts, splits, cwd/comando de início opcionais
- **Marcadores do log de conexão**: posições + notas + busca
- **Visão ao vivo de canais de encaminhamento de portas**: origem, destino e bytes por conexão
- **Ações onOutput de scripts**: notificação, som, marcar aba, iniciar gravação
- **Colagem segura e broadcast preciso**: atraso / espera de prompt / confirmação de comando perigoso
- **Canal OpenSSH do sistema**: GSSAPI/Kerberos e pós-quântico (PQ)

### Windows ARM64
- **win-arm64 com mosh / ET**: binários nativos MoshMagies 0.1.9 e EternalTerminal 6.2.10
- **Canal de autoatualização dedicado**: `latest-arm64.yml`

## [0.4.10] - 2026-07-17

### Recursos
- **Centro de diagnóstico SSH**: «Testar conexão» + «Executar diagnóstico» — DNS / TCP / jump / host key / auth / SFTP
- **Auth SSH Agent de primeira classe**: Agent, impressões digitais, identidade preferida
- **Snapshot de saúde multihost**: latência, auth, carga/memória/disco
- **Confiabilidade SFTP fase 1**: retomar, retry automático, fila persistente, SHA-256 opcional
- **Onboarding de produto**: guia de Vault vazio, paleta de comandos, estados vazios

### Correções
- Vaults existentes sem onboarding inicial; jump fechado corretamente se health auth falhar

## [0.4.9] - 2026-07-17

### Melhorias
- **Fontes de release / autoatualização em repositório releases dedicado**: MgTerminal-releases; UX do site e do app inalterada

## [0.4.8] - 2026-07-16

### Recursos
- **Quick Connect com EternalTerminal**: entrada ET (porta SSH + porta ET, padrão 2022)
- **Autoverificação de credenciais**: Configurações → Sistema → Proteção de credenciais
- **Instalador Windows ARM64**: win-arm64 (mosh/et e canal em 0.5.0)
- **Limpeza de restauração de sessão**: layouts > 14 dias descartados na inicialização

### Correções
- **UI russa**: 203 strings faltantes; zh-CN +3; testes de alinhamento
- Caminho mosh-server personalizado do Quick Connect aplicado

### Melhorias
- Visibilidade SFTP unificada
- README macOS alinhado à distribuição sem assinatura

## [0.4.7] - 2026-07-15

### Recursos
- **Idiomas da UI expandidos para 10**: alinhado ao site — adicionados japonês / coreano / alemão / francês / espanhol / português (mantidos en / ru / zh-CN / zh-TW)
- Configurações → Aparência → Idioma lista todos os idiomas suportados; strings sem tradução caem para o inglês

## [0.4.6] - 2026-07-15

### Segurança
- **Desligar a verificação de host key SSH não é mais silencioso**: com `verifyHostKeys` off (sessões de terminal e conexões de stats Mosh) registra aviso claro de que qualquer host key é aceita sem perguntar
- **Aviso persistente nas configurações**: desligar «Verificar host keys SSH» mostra risco de MITM sob o interruptor (en / zh-CN / zh-TW). Padrão continua ligado

## [0.4.5] - 2026-07-15

### Correções
- **Cifrado aninhado causando 401 / streams vazios**: salvamentos repetidos sem keychain aninhavam a criptografia (`enc:v2(enc:v1(...))`); o loop de descriptografia desenrola os blobs no orçamento
- **Uma credencial ruim não quebra mais o vault inteiro**: falha de descriptografia de campo mantém o valor (fail-soft)
- **Chave de API de busca na web**: focus/blur sozinhos não apagam mais uma chave salva após falha de descriptografia; mensagens mais claras
- **Detecção de cifrado DPAPI no Windows**: o guarda anti-recriptografia perdia chaves DPAPI (cabeçalho `AQAAAN`) — corrigido
- **Cursor Agent**: falha de descriptografia não injeta cifrado como API key no processo filho
- Configurações Provider / busca web / Cursor: avisos unificados para digitar a chave de novo; trocar idioma não sobrescreve chaves não salvas

## [0.4.4] - 2026-07-14

### Correções
- **IA 401 / streams vazios**: se a descriptografia da API key falhar ou não estiver sincronizada com o processo principal, não usa o placeholder `__IPC_SECURED__`; falha imediata e aviso para salvar de novo
- Esperar os providers sincronizarem com o processo principal antes de enviar
- Erros de auth claros quando a chave local está indisponível

## [0.4.3] - 2026-07-14

### Correções
- **Descriptografia de API key**: o processo principal descriptografa corretamente chaves vault locais `enc:v2`; em falha não envia cifrado ao provedor
- **Placeholders de credenciais**: limites de conexão / sync em nuvem reconhecem `enc:v2`
- Erros acionáveis para streams de modelo vazios (`NoOutputGeneratedError`) e 401
- Sonda de instalação do Cursor SDK com `require.resolve` para menos falsos positivos

## [0.4.2] - 2026-07-14

### Correções
- **Falha de criptografia de API key resolvida**: se o keychain do SO (`safeStorage`) estiver indisponível, usa vault criptografado local (`enc:v2`)
- macOS prefere o keychain do sistema e faz fallback silencioso; Configurações → Sistema mostra o backend ativo

## [0.4.1] - 2026-07-14

### Melhorias
- Seletor de temas: prévias em cartões, escopos Core / Tudo, busca e estados vazios
- Contraste padrão Snow / Midnight melhorado; paletas de terminal `ui-snow` / `ui-midnight` sincronizadas
- Hierarquia de seleção unificada em Vault, SFTP, navegação de configurações, barra lateral de IA e chrome do terminal
- Listas de temas de terminal com busca e amostras mais claras
- Status de sync, toasts, badges de atualização e destaques de drop em tokens de tema

## [0.4.0] - 2026-07-13

### Recursos
- Entrada «Contato» copia o e-mail de suporte
- Reconexão SSH com backoff exponencial (a partir de 5 s, teto 60 s); após 10 falhas, reconexão manual
- Encaminhamentos de porta local/dinâmicos reutilizam a sessão SSH do terminal já autenticada (sem segundo password/2FA)
- Importar chaves FIDO2 (`sk-*`) orienta a usar autenticação ssh-agent

### Alterações

## [0.3.0] - 2026-07-13

### Correções
- Falhas de criptografia de API key ao salvar provedor de IA não são mais engolidas; erro localizado sob o campo

## [0.2.9] - 2026-07-13

### Recursos
- Atualização automática no macOS: instalação substituindo o bundle após o download (contorna limites Squirrel de apps não assinados; a partir de 0.2.9 todas as plataformas podem auto-atualizar)

### Correções
- O ícone mantém a placa arredondada oficial em claro/escuro

## [0.2.8] - 2026-07-13

### Correções
- Pacotes Windows que saíam em silêncio no lançamento: reincorporar hashes de integridade após reescrita asar, checagens de CI
- Progresso e erros de instalação de atualização visíveis em todas as plataformas

## [0.2.7] - 2026-07-13

### Correções
- Arquitetura de release do Windows: empacotamento seguro do instalador x64

## [0.2.6] - 2026-07-12

### Segurança
- Janelas de bandeja empacotadas ignoram `VITE_DEV_SERVER_URL` e bloqueiam navegação / novas janelas
- Preload não confia mais no servidor de dev como origem dentro de `app.asar`
- DOMPurify 3.3.2 e undici 6.23.0 contra XSS / DoS zip-bomb
- afterPack repara hashes de integridade ASAR e Info.plist para evitar crash imediato no macOS

### Correções
- Testes de integração de auto-login Telnet esperam o prompt antes de afirmar a conclusão

## [0.2.5] - 2026-07-12

### Correções
- «Reiniciar agora» sem efeito: a saída de instalação de atualização não é mais cancelada por checagens before-quit
- Erros claros se «Reiniciar e atualizar» falhar; plataformas sem auto-instalação abrem Releases

## [0.2.4] - 2026-07-12

### Segurança
- Parar de salvar se a criptografia de credenciais estiver indisponível — sem fallback em texto puro
- Deep links SSH desligados por padrão; rejeitar URLs com senha; confirmar antes de conectar
- Área de transferência OSC52 desligada por padrão
- CSP do Electron mais rígido; integridade ASAR e fuses de segurança ativos
- Remover entitlement macOS disable-library-validation

## [0.2.3] - 2026-07-11

### Correções
- Hostnames `app://` empacotados em minúsculas pelo Chromium não quebram mais a injeção do preload (terminal, SFTP, configurações, seletor de arquivos, encaminhamento de portas)
- Alinhar janelas principal/configurações e permissões em `app://magiesterminal`

## [0.2.2] - 2026-07-11

### Correções
- «Select Color Theme» aninhado em ScrollArea bloqueava cliques; um único scroll + pointerdown
- Diálogos de chaves SSH/locais com pai correto no macOS
- Janela de configurações abre sob o protocolo `app://`
- Ícones da barra lateral e do pacote com o novo conjunto de assets

## [0.2.1] - 2026-07-11

### CI/CD
- Reativar builds automáticos de macOS e Windows (não assinados) para mais pacotes prontos

## [0.2.0] - 2026-07-11

### Recursos
- IPC de auto-atualização para todas as janelas (principal + configurações)
- Máquina de estados unificada para verificação manual e auto-atualização
- «Verificar atualizações» mostra progresso ao vivo
- Verificação automática via electron-updater ~5 s após o lançamento
- Download automático quando há nova versão (`autoDownload=true`)
- Toast persistente ao concluir («Reiniciar agora»)
- Toast de erro se o download falhar com fallback para Releases
- Barra de progresso Configurações → Sistema impulsionada por `useUpdateCheck`

### Notas de design
- `broadcastToAllWindows` substitui IPC de emissor único
- `manualCheckStatus` rastreia a UI de verificação manual; prioridade com `autoDownloadStatus`
- `SettingsSystemTab` é consumidor puro de `useUpdateCheck`
- Listeners IPC globais registrados uma vez em `autoUpdateBridge.init()`
- `autoInstallOnAppQuit=false` — o usuário inicia o reinício

### Interface SettingsSystemTabProps
- Removido: `autoDownloadStatus`, `downloadPercent`
- Adicionado: `updateState`, `checkNow`, `installUpdate`, `openReleasePage`

### Notas
- Aplica-se a apps empacotados (Windows NSIS, macOS dmg/zip, Linux AppImage); em dev: `forceDevUpdateConfig=true` + `dev-app-update.yml`
- Toast legado `hasUpdate` é suprimido durante o auto-download

### CI / build
- Preferir pacotes Linux gratuitos se não houver assinatura
- Linux x64 (AlmaLinux 8): Clang preferido, fallback gcc-toolset-13
- Linux arm64 (Debian Bullseye): `clang-14 + lld-14`
- Job Release pode publicar só com artefatos Linux
- Suavizar checagens deb para avisos se uma plataforma for pulada
