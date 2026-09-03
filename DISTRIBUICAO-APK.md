# APK do LifeGuard

O APK de distribuição funciona sem Expo Go, sem `npm start` e sem o computador ligado. Ele acessa diretamente a API hospedada na Oracle.

## Atualizações sem reinstalar o APK

A partir da versão 1.5.0, o aplicativo usa EAS Update. Depois de instalar essa versão uma vez, alterações apenas em JavaScript, TypeScript e imagens podem ser enviadas pelo canal de produção:

```powershell
npm run update:publish -- --message "Descrição da atualização"
```

O aplicativo procura atualizações ao abrir, baixa a versão nova em segundo plano e oferece o botão **Atualizar agora**. Mudanças em bibliotecas nativas, permissões, `app.json` ou versão do Expo ainda exigem um APK novo. Nesse caso, aumente também `expo.version` e `expo.android.versionCode`.

## Gerar sem a fila do Expo

Na primeira utilização, instale o Android Studio e o JDK 17. O SDK usado pelo comando fica em `.tools/android-sdk`, pasta privada ignorada pelo Git. A chave original de assinatura deve estar nos arquivos locais também ignorados pelo Git:

- `credentials.json`
- `credentials/android/keystore.jks`

Depois, execute:

```powershell
npm run apk:local
```

O arquivo pronto será criado em `dist/lifeguard.apk`. O processo usa a mesma assinatura dos APKs produzidos anteriormente pela EAS, permitindo instalar a nova versão como atualização.

Antes de publicar uma nova versão nativa, aumente `expo.android.versionCode` em `app.json`. A versão visível ao usuário fica em `expo.version`.

## Link permanente

Publique o arquivo com o nome exato `lifeguard.apk` em uma versão do GitHub Releases. O endereço permanente da versão mais recente será:

<https://github.com/MateusDantasC/lifeguard-tcc/releases/latest/download/lifeguard.apk>

Esse endereço pode ser usado diretamente no futuro site do LifeGuard. Ele só muda se o repositório ou o nome do arquivo forem alterados.

Para publicar ou substituir o APK da versão indicada em `app.json`, execute:

```powershell
npm run apk:publish
```

## Alternativa pela EAS

O fluxo anterior continua disponível:

```powershell
npx eas-cli build --platform android --profile preview
```

Assim, uma falha ou troca de computador não impede a criação de novas versões.
