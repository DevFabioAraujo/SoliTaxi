# Configuração Manual do GitHub Pages

## Problema Identificado
O site está carregando apenas o título mas não o React. Isso indica que:
1. O GitHub Actions pode não estar executando corretamente
2. O GitHub Pages pode não estar configurado
3. Pode haver problema com os caminhos dos assets

## Passos para Configurar Manualmente

### 1. Verificar GitHub Actions
1. Vá para o seu repositório no GitHub
2. Clique na aba "Actions"
3. Verifique se o workflow "Deploy to GitHub Pages" está executando
4. Se houver erros, clique no workflow para ver os detalhes

### 2. Configurar GitHub Pages
1. Vá para `Settings` > `Pages` no seu repositório
2. Em "Source", selecione:
   - **Deploy from a branch**
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Clique em "Save"

### 3. Aguardar o Deploy
- O GitHub Actions deve criar a branch `gh-pages` automaticamente
- Aguarde alguns minutos para o deploy ser concluído
- O site estará disponível em: https://devfabioaraujo.github.io/Solicitartaxi/

### 4. Verificar se a Branch gh-pages Existe
1. No seu repositório, clique no dropdown de branches
2. Procure pela branch `gh-pages`
3. Se não existir, o GitHub Actions não executou corretamente

### 5. Solução Alternativa - Deploy Manual
Se o GitHub Actions não funcionar, você pode fazer deploy manual:

```bash
# 1. Build do projeto
cd frontend
npm run build

# 2. Instalar gh-pages (se não tiver)
npm install -g gh-pages

# 3. Deploy manual
gh-pages -d dist -b gh-pages
```

### 6. Verificar Configurações do Repositório
Certifique-se de que:
- O repositório é público (ou você tem GitHub Pro para Pages privadas)
- As GitHub Actions estão habilitadas
- Não há restrições de branch protection

### 7. Testar Localmente
Para testar se o build está correto:

```bash
cd frontend
npm run build
npm run preview
```

## Arquivos de Configuração Criados

### `.github/workflows/deploy.yml`
- Workflow do GitHub Actions para build e deploy automático

### `frontend/vite.config.js`
- Configurado com `base: '/Solicitartaxi/'`

### `frontend/src/App.jsx`
- BrowserRouter com `basename="/Solicitartaxi"`

### `frontend/public/404.html`
- Redirecionamento para SPA funcionar no GitHub Pages

### `frontend/index.html`
- Script de redirecionamento para rotas

## Troubleshooting

### Se o site mostrar apenas "Solicitartaxi":
1. Verifique se o GitHub Actions executou sem erros
2. Confirme se a branch `gh-pages` foi criada
3. Verifique se o GitHub Pages está configurado corretamente

### Se houver erro 404 nos assets:
1. Verifique se o `base` no vite.config.js está correto
2. Confirme se o `basename` no App.jsx está correto
3. Verifique se os caminhos no index.html estão relativos

### Se as rotas não funcionarem:
1. Confirme se o arquivo 404.html está na pasta public
2. Verifique se o script de redirecionamento está no index.html
3. Teste se o basename do Router está correto

## Contato
Se precisar de ajuda adicional, verifique:
1. Console do navegador para erros JavaScript
2. Network tab para ver quais recursos estão falhando
3. GitHub Actions logs para erros de build
