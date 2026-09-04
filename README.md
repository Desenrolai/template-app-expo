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

Job único `quality`: `npm ci` → lint → typecheck → test → `expo-doctor`. Não há job de
imagem: app mobile faz build via **EAS**, não vai para o cluster (`forge.yaml`:
`deploy: none`).

O workflow dispara só em `push` (e não em `pull_request`) de propósito — os checks
aparecem no PR do mesmo jeito, sem rodar dois runs completos por commit.

### Runner: repo privado gerado a partir deste template precisa configurar

Este template é **público**, e em repositório público o GitHub Actions em runner hospedado
é gratuito. **O repo que você gera a partir dele é privado**, onde os minutos são cota paga
— e a cota da organização está esgotada. Por isso o `runs-on` é parametrizado por variável
de repositório, com default hospedado:

```yaml
runs-on: ${{ fromJSON(vars.CI_RUNNER || '"ubuntu-latest"') }}
```

Antes do primeiro push no repo novo, defina a variável (Settings → Secrets and variables →
Actions → Variables), ou por CLI:

```bash
gh variable set CI_RUNNER --body '["self-hosted","desenrolai"]'
```

- O valor é **JSON**, não texto solto. `'["self-hosted","desenrolai"]'` vira dois labels;
  a string `self-hosted,desenrolai` viraria **um** label só, que nenhum runner atende, e o
  job ficaria em `queued` para sempre.
- Sem a variável, tudo continua em `ubuntu-latest` — este template continua verde assim.
- Não há `CI_RUNNER_DOCKER` aqui: sem Dockerfile, não há job de imagem.

**Sintoma de não configurar:** o job termina em **~2 segundos**, com **zero steps
executados** e conclusão **`failure`** — sem nenhum log de erro que oriente.

Cuidado: *zero steps sozinho não é a assinatura.* Um job legitimamente **`skipped`**
também reporta zero steps. **O que separa os dois é a conclusão:**

| Conclusão | Steps | Significado |
|---|---|---|
| `failure` em ~2s | 0 | **Billing** — cota de Actions esgotada/bloqueada, ou runner inexistente |
| `skipped` | 0 | O `if:` do job não bateu. Está tudo certo. |
| `queued` que nunca sai | — | `CI_RUNNER` com label que nenhum runner atende (ex.: valor não-JSON) |

Não perca tempo procurando erro de sintaxe: com `failure` em ~2s, confira a variável e o
billing da organização.
