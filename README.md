# Torre Inventário

O **Torre Inventário** é um sistema web responsivo e dinâmico desenvolvido para realizar auditorias e conferências (inventários) nos galpões e unidades de uma rede de transporte e logística. 

Sua função principal é comparar a realidade física (volumes bipados/escaneados na unidade) com o cenário teórico (volumes que o sistema diz que estão no pátio), ajudando as unidades a encontrar:
- **Faltantes:** Volumes que o sistema diz que deveriam estar no pátio, mas que não foram encontrados.
- **Sobras na Base:** Volumes que foram encontrados no pátio, mas que teoricamente já haviam sido embarcados, entregues ou que pertencem a outra filial.
- **Possíveis Extravios:** Volumes que foram bipados no galpão, mas que já constam no sistema como entregues ou extraviados em processos passados.

O grande diferencial deste sistema é sua capacidade de interligar essas divergências em tempo real com as **tabelas de ocorrências e processos** do banco legado. Assim, ao final do inventário, a equipe tem um relatório enriquecido informando exatamente se um volume "faltante" não foi bipado porque já tem uma tratativa de "Extravio" ou "Em Rota", por exemplo.

## 🛠 Como Funciona

1. **Dashboard (Visão Geral):** Lista todas as unidades operacionais com base no número de volumes "no pátio" e "em viagem".
2. **Abertura de Inventário:** Um inventário é iniciado especificamente para uma Unidade.
3. **Bipagem:** Utilizando coletores (via Guardião Android) ou teclado, os códigos de barras são inseridos. O sistema consulta imediatamente a última movimentação daquele volume e retorna na hora o status de auditoria (*Encontrado Correto*, *Sobra* ou *Possível Extravio*).
4. **Fechamento e Relatório:** O gerente de pátio encerra o inventário. Neste milissegundo, o sistema puxa todos os volumes teóricos de 90 dias atrás até agora que estão como "desembarcados" na base. Subtrai-se o que foi bipado, e os que restam tornam-se os **Faltantes**.
5. **Análise de Processos (SSW/Torre Legada):** No painel de relatório final e na exportação para Excel, o sistema busca na tabela `processo_volumes` qual foi a **Última Ocorrência** (ex: *AVARIA TOTAL, ROUBO*) atrelada ao volume, trazendo justificativas operacionais automaticamente.

## 🏗 Arquitetura

O projeto foi construído utilizando as melhores e mais modernas práticas do ecossistema React, utilizando a **T3 Stack**:

- **[Next.js 15 (App Router)](https://nextjs.org)**: Framework React full-stack. Renderização Server-Side, Server Actions e Client Components.
- **[React 19](https://react.dev)**: Última versão para a UI.
- **[tRPC](https://trpc.io/)**: Comunicação Tipada (End-to-end typesafe) entre o Frontend e Backend, substituindo APIs REST tradicionais e garantindo que os tipos do Typescript nunca falhem em produção.
- **[Prisma (ORM)](https://prisma.io)**: Gerenciamento do banco de dados local da aplicação, responsável por salvar os inventários abertos, as sessões e as bipagens realizadas (`ItemInventario`, `Inventario`).
- **[Postgres (Raw Client)](https://github.com/porsager/postgres)**: Conexão de Somente Leitura (Read-Only) direto na fonte da verdade (banco legado `torre_controle`) para extrair históricos de volumes, minutas, manifestos e processos sem risco de modificar tabelas antigas.
- **[Tailwind CSS v4](https://tailwindcss.com)**: Estilização utilitária super rápida e responsiva.
- **[XLSX](https://sheetjs.com/)**: Geração robusta de relatórios Excel Client-side.

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos
- **Node.js** (v20 ou superior)
- **NPM** instalado
- Bancos de dados PostgreSQL acessíveis (um para o App e outro Legado).

### 2. Configurando o Ambiente
Copie o arquivo de exemplo e preencha as credenciais:
```bash
cp .env.example .env
```
Preencha a `DATABASE_URL` (banco de aplicação) e as chaves `READONLY_DB_*` (banco legado da torre).

### 3. Instalação e Migrations
Instale os pacotes e suba as tabelas do Prisma no banco da aplicação:
```bash
npm install
npm run db:push
npm run db:generate
```

### 4. Rodando em Desenvolvimento (Local)
Para testes com hot-reload ativo:
```bash
npm run dev
```

### 5. Rodando em Produção com PM2
O projeto já está configurado para rodar na porta **3008** via PM2, ideal para ambientes Windows Server ou Linux.

Gere o build de produção:
```bash
npm run build
```

Inicie ou reinicie via PM2 utilizando a configuração:
```bash
pm2 start ecosystem.config.js
pm2 save
```

Você pode acompanhar os logs digitando:
```bash
pm2 logs torre-inventario
```
