# template-app-expo

GitHub Template — base para apps mobile Expo da Desenrolai.

## Stack

- **Expo SDK 57** (`expo@57.0.19`)
- **React Native 0.86.3** e **React 19.2.3** — versões que o SDK 57 pina
- **TypeScript 6.0.3** em modo `strict`
- **ESLint 10** com `typescript-eslint` (regras tipadas) e `eslint-plugin-react-hooks`
- **Jest** com `jest-expo` e `@testing-library/react-native`

A New Architecture é a única do SDK 57 — não há mais o campo `newArchEnabled`, e a
splash saiu do schema do `app.json` para o plugin `expo-splash-screen`.

## Ao gerar um projeto a partir deste template

O Forge scaffolda com `repos.createUsingTemplate` do GitHub — **cópia literal dos
arquivos**, sem substituição de placeholder. Os identificadores abaixo chegam no repo
novo com o valor do template, e os três primeiros têm **efeito real** em build e loja:

| # | Onde | Valor no template | O que acontece se não trocar |
|---|---|---|---|
| 1 | `app.json` → `slug` | `desenrolai-app` | **EAS**: dois apps gerados deste template disputam o mesmo projeto |
| 2 | `app.json` → `ios.bundleIdentifier` | `ai.desenrol.app` | **App Store**: identidade duplicada, os apps não coexistem |
| 3 | `app.json` → `android.package` | `ai.desenrol.app` | **Play Store**: idem |
| 4 | `app.json` → `name` | `DesenrolAI` | nome exibido no dispositivo |
| 5 | `package.json` → `name` | `template-app-expo` | cosmético |
| 6 | `App.tsx` | texto `Desenrolai` na tela | cosmético — **mas veja o aviso** |
| 7 | `assets/*.png` | placeholders | ícone, splash e favicon do app |

> ⚠️ **Trocar o texto da tela (6) sem trocar o teste quebra a suíte.**
> `App.test.tsx` afirma `getByRole('header', { name: 'Desenrolai' })`. O acoplamento é
> deliberado — é para isso que o teste existe — mas quem renomeia precisa mexer nos dois.

**`scheme` não existe no `app.json`.** O `expo-doctor` não reclama, porque o campo é
opcional; sem ele não há deep link nem redirect de OAuth. Adicione quando o app precisar.
Não há valor no template de propósito: um `scheme` copiado literalmente colidiria entre
todos os apps gerados.

## Uso

```bash
npm install
npm start          # expo start
npm run android    # / ios / web
```

## Qualidade

```bash
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit
npm test           # jest
npm run doctor     # expo-doctor
```

`npm run doctor` é o que pega incompatibilidade entre pacote e SDK — rode antes de
subir dependência. Para as libs do ecossistema Expo use **`npx expo install <pkg>`**,
não `npm install`: é o `expo install` que resolve a versão compatível com o SDK.

> Os testes usam RNTL 14, em que `render`, `fireEvent` e `act` são **assíncronos**.
> Sem `await render(...)`, `screen` fica vazio.

## Build

Build via **EAS** (Expo Application Services). Sem deploy em K8s — veja `forge.yaml`
(`deploy: none`).

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Estrutura

```
App.tsx             # tela inicial
App.test.tsx        # teste de render da tela inicial
assets/             # ícone, splash e favicon (placeholders — troque pela marca)
                    # referenciados em app.json; splash via plugin expo-splash-screen
app.json            # config Expo
eslint.config.mjs   # ESLint flat config
jest.config.js      # preset jest-expo
forge.yaml          # metadados do Forge (kind: app, deploy: none)
tsconfig.json       # strict mode
```

## CI

Job único `quality`: `npm ci` → lint → typecheck → test → `expo-doctor`.
