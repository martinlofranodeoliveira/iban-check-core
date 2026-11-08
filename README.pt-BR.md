# iban-check-core

Validação offline de IBAN (ISO 13616): formato eletrônico, tamanho por país,
estrutura do BBAN e verificação mod-97. Zero dependências de execução, Node >= 22.

Parte do laboratório open source da LOFRANO TECNOLOGIA. MIT.

## Uso

```js
import { validate, check } from './src/iban.mjs';

validate('BR1500000000000010932840814P2'); // exemplo ilustrativo de formato
check('DE88370400440532013000');
// { ok: false, code: 'BAD_CHECK' }
```

32 países suportados (veja `docs/contract.md`). Fora da tabela, o retorno é
`UNSUPPORTED_COUNTRY` explícito — sem adivinhação.

## Teste e demonstração

```sh
npm test          # 22 testes, node:test, sem dependências
npm run demo      # lista fixa, confere expectativas
```

## Limites

Sem decodificação de banco/agência, sem atualização de registro em execução,
sem correção de dígito. Entrada inválida é reportada, nunca corrigida.

## Licença

MIT — veja `LICENSE`.
