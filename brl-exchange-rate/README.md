# BRL Exchange Rate

Aplicação web para verificar a taxa de câmbio do Real brasileiro (BRL) contra outras moedas.

## Requisitos

- Node.js 20.11.1 ou superior
- npm 10.2.4 ou superior
- Angular CLI 19+

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Executando a aplicação

Execute `ng serve` para iniciar o servidor de desenvolvimento. Navegue até `http://localhost:4200/`. A aplicação será recarregada automaticamente se você alterar os arquivos fonte.

```bash
ng serve
```

## Funcionalidades

- Busca de taxa de câmbio atual por código de moeda (USD, EUR, GBP, JPY, CAD, etc.)
- Visualização do histórico de taxas dos últimos 30 dias
- Cálculo automático do "Close Diff" (diferença entre o close rate do dia atual e do dia anterior)
- Layout responsivo para mobile e desktop

## Build

Execute `ng build` para compilar o projeto. Os artefatos de build serão armazenados no diretório `dist/`.

```bash
ng build
```

## Estrutura do Projeto

- `src/app/app.component.ts` - Componente principal
- `src/app/services/exchange-rate.service.ts` - Serviço para chamadas à API
- `src/app/app.component.html` - Template do componente principal
- `src/app/app.component.scss` - Estilos do componente

## API

A aplicação utiliza a API da Action Labs:
- Base URL: `https://api-brl-exchange.actionlabs.com.br/api/1.0/open`
- API Key: `RVZG0GHEV2KORLNA`
- Endpoints:
  - `/currentExchangeRate` - Taxa de câmbio atual
  - `/historicalExchangeRate` - Histórico de taxas

## Notas

- A API possui limite de 5 chamadas/minuto e 500 chamadas/dia
- Se o limite for excedido, a aplicação mostrará uma mensagem de erro apropriada
