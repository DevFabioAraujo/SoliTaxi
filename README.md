# Sistema de Solicitação de Táxi

Sistema web completo para gerenciamento de solicitações de táxi corporativo, desenvolvido com React.js no frontend e Node.js no backend.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Configuração de Email](#configuração-de-email)
- [Histórico de Implementações](#histórico-de-implementações)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O Sistema de Solicitação de Táxi é uma aplicação web desenvolvida para facilitar o gerenciamento de solicitações de transporte corporativo. O sistema permite cadastrar passageiros, criar solicitações de táxi, acompanhar status e exportar relatórios em Excel.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React.js** (v18.2.0) - Biblioteca para construção da interface
- **React Router DOM** (v6.8.1) - Roteamento da aplicação
- **Vite** (v4.1.0) - Build tool e servidor de desenvolvimento
- **Tailwind CSS** (v3.2.7) - Framework CSS para estilização
- **Axios** (v1.3.4) - Cliente HTTP para requisições à API
- **PostCSS** (v8.4.21) - Processamento de CSS
- **Autoprefixer** (v10.4.14) - Prefixos CSS automáticos

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** (v4.18.2) - Framework web
- **SQLite3** (v5.1.6) - Banco de dados
- **ExcelJS** (v4.4.0) - Geração de arquivos Excel
- **Nodemailer** (v7.0.5) - Envio de emails
- **Multer** (v1.4.5) - Upload de arquivos
- **CSV Parser** (v3.0.0) - Processamento de arquivos CSV
- **CORS** (v2.8.5) - Controle de acesso entre origens
- **dotenv** (v17.2.0) - Gerenciamento de variáveis de ambiente

### Ferramentas de Desenvolvimento
- **Nodemon** (v3.0.1) - Reinicialização automática do servidor
- **JSZip** (v3.10.1) - Manipulação de arquivos ZIP

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das solicitações
- Estatísticas em tempo real
- Gráficos e métricas

### 👥 Gerenciamento de Passageiros
- Cadastro de novos passageiros
- Edição de informações
- Importação via CSV
- Campos: Nome, Endereço, Bairro, Cidade, Telefone, Centro de Custo, Turno

### 🚖 Solicitações de Táxi
- Criação de novas solicitações
- Acompanhamento de status (Pendente, Confirmado, Em Andamento, Concluído, Cancelado)
- Histórico completo
- Filtros por data e status

### 📤 Exportação e Relatórios
- Exportação para Excel (.xlsx)
- Envio automático por email
- Filtros personalizáveis
- Formatação de datas em português brasileiro

### 📧 Sistema de Email
- Configuração SMTP
- Envio de relatórios por email
- Suporte a Gmail com senha de aplicativo
- Testes de configuração

## 📁 Estrutura do Projeto

```
SolicitarTaxi/
├── backend/
│   ├── server.js              # Servidor principal
│   ├── database.js            # Configuração do banco SQLite
│   ├── emailService.js        # Serviço de envio de emails
│   ├── excelService.js        # Geração de arquivos Excel
│   ├── importData.js          # Importação de dados CSV
│   ├── package.json           # Dependências do backend
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   └── exports/               # Diretório para arquivos exportados
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal
│   │   ├── main.jsx           # Ponto de entrada
│   │   ├── index.css          # Estilos globais
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Página inicial
│   │       ├── PassengerForm.jsx  # Formulário de passageiros
│   │       ├── TaxiRequestForm.jsx # Formulário de solicitações
│   │       └── RequestList.jsx    # Lista de solicitações
│   ├── index.html             # Template HTML
│   ├── package.json           # Dependências do frontend
│   ├── vite.config.js         # Configuração do Vite
│   ├── tailwind.config.js     # Configuração do Tailwind
│   └── postcss.config.js      # Configuração do PostCSS
├── .gitignore                 # Arquivos ignorados pelo Git
└── README.md                  # Este arquivo
```

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone git@github.com:DevFabioAraujo/Solicitartaxi.git
cd Solicitartaxi
```

### 2. Configuração do Backend
```bash
cd backend
npm install
```

### 3. Configuração do Frontend
```bash
cd ../frontend
npm install
```

### 4. Configuração das Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend` baseado no `.env.example`:

```env
# Configuração do Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-aplicativo

# Porta do servidor (opcional)
PORT=3001
```

### 5. Inicialização

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎮 Uso

### Acessando o Sistema
1. Abra o navegador em `http://localhost:5173`
2. Use a navegação superior para acessar as diferentes seções

### Cadastrando Passageiros
1. Acesse "Passageiros" no menu
2. Preencha o formulário com os dados
3. Clique em "Cadastrar Passageiro"

### Criando Solicitações
1. Acesse "Solicitar Táxi"
2. Selecione o passageiro
3. Preencha os detalhes da viagem
4. Confirme a solicitação

### Exportando Relatórios
1. Acesse "Solicitações"
2. Use os filtros desejados
3. Clique em "Exportar" ou "Enviar por Email"

## 🔌 API Endpoints

### Passageiros
- `GET /passengers` - Listar todos os passageiros
- `GET /passengers/:id` - Buscar passageiro por ID
- `POST /passengers` - Criar novo passageiro
- `PUT /passengers/:id` - Atualizar passageiro
- `DELETE /passengers/:id` - Excluir passageiro
- `POST /import/passengers` - Importar passageiros via CSV

### Solicitações
- `GET /requests` - Listar todas as solicitações
- `POST /requests` - Criar nova solicitação
- `PUT /requests/:id/status` - Atualizar status da solicitação
- `DELETE /requests/:id` - Excluir solicitação

### Exportação
- `POST /export/requests` - Exportar e enviar por email
- `POST /export/download` - Download direto do Excel

### Utilitários
- `GET /test-email` - Testar configuração de email
- `POST /test-email/send` - Enviar email de teste

## 📧 Configuração de Email

### Para Gmail
1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma senha de aplicativo:
   - Acesse "Segurança" → "Senhas de app"
   - Selecione "Email" e "Outro"
   - Digite "Sistema Taxi"
   - Use a senha gerada (16 caracteres) no arquivo `.env`

### Teste da Configuração
```bash
curl http://localhost:3001/test-email
```

## 📈 Histórico de Implementações

### Versão 1.0.0 - Implementação Inicial
- ✅ Estrutura básica do projeto (Frontend + Backend)
- ✅ Sistema de roteamento com React Router
- ✅ Interface responsiva com Tailwind CSS
- ✅ Banco de dados SQLite com operações CRUD
- ✅ API RESTful completa
- ✅ Formulários para passageiros e solicitações

### Funcionalidades de Dados
- ✅ Cadastro e gerenciamento de passageiros
- ✅ Sistema de solicitações de táxi
- ✅ Controle de status das solicitações
- ✅ Importação de dados via CSV
- ✅ Validação de dados no frontend e backend

### Sistema de Exportação
- ✅ Geração de arquivos Excel (.xlsx)
- ✅ Formatação automática de dados
- ✅ Limpeza de caracteres especiais
- ✅ Formatação de datas em português brasileiro
- ✅ Sistema de filtros para exportação

### Integração de Email
- ✅ Configuração SMTP com Nodemailer
- ✅ Envio automático de relatórios
- ✅ Suporte a Gmail com senha de aplicativo
- ✅ Sistema de testes de configuração
- ✅ Tratamento de erros de autenticação

### Melhorias de UX/UI
- ✅ Dashboard com visão geral
- ✅ Interface intuitiva e responsiva
- ✅ Feedback visual para ações do usuário
- ✅ Navegação fluida entre páginas
- ✅ Formatação consistente de dados

### Arquivos Ignorados (.gitignore)
- ✅ Dependências (node_modules)
- ✅ Arquivos de build (dist, build)
- ✅ Variáveis de ambiente (.env)
- ✅ Banco de dados local (*.db, *.sqlite)
- ✅ Logs e arquivos temporários
- ✅ Arquivos de teste (test_*.xlsx, test_*.csv)
- ✅ Diretório de exportações (backend/exports/)
- ✅ Arquivos do sistema operacional
- ✅ Configurações de IDE

## 🌐 Deploy no GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions.

### Configuração Automática
O deploy acontece automaticamente a cada push na branch `main`. O workflow está configurado em `.github/workflows/deploy.yml`.

### Configuração Manual do GitHub Pages

1. **Acesse as configurações do repositório:**
   - Vá para `Settings` > `Pages` no seu repositório GitHub

2. **Configure a fonte:**
   - Em "Source", selecione `Deploy from a branch`
   - Selecione a branch `gh-pages`
   - Pasta: `/ (root)`

3. **Aguarde o deploy:**
   - O GitHub Actions fará o build e deploy automaticamente
   - Acesse: `https://devfabioaraujo.github.io/Solicitartaxi/`

### Estrutura de Deploy
- **Workflow**: `.github/workflows/deploy.yml`
- **Build**: Frontend é buildado com Vite
- **Deploy**: Arquivos são enviados para branch `gh-pages`
- **SPA Support**: Configurado redirecionamento para rotas React

### URLs do Projeto
- **Repositório**: https://github.com/DevFabioAraujo/Solicitartaxi
- **GitHub Pages**: https://devfabioaraujo.github.io/Solicitartaxi/
- **Backend Local**: http://localhost:3001 (para desenvolvimento)

### Notas Importantes
- O backend não é deployado no GitHub Pages (apenas frontend)
- Para funcionalidade completa, configure um backend em serviços como Heroku, Vercel, etc.
- As funcionalidades que dependem da API funcionarão apenas em desenvolvimento local

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Fábio Araújo**
- GitHub: [@DevFabioAraujo](https://github.com/DevFabioAraujo)
- Email: wmf.araujo@gmail.com

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
