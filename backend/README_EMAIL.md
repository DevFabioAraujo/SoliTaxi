# Configuração de Email para Exportação

## Problema Atual
O erro indica que o Gmail requer uma "senha de aplicativo" específica para autenticação.

## Solução para Gmail

### 1. Ativar Verificação em Duas Etapas
1. Acesse sua conta Google
2. Vá em "Segurança"
3. Ative a "Verificação em duas etapas"

### 2. Gerar Senha de Aplicativo
1. Na seção "Segurança", procure por "Senhas de app"
2. Clique em "Senhas de app"
3. Selecione "Email" como aplicativo
4. Selecione "Outro" como dispositivo e digite "Sistema Taxi"
5. Copie a senha gerada (16 caracteres)

### 3. Atualizar Configuração
Substitua a senha no arquivo `.env`:
```
EMAIL_USER=wmf.araujo@gmail.com
EMAIL_PASS=sua-senha-de-app-de-16-caracteres
```

## Alternativas de Email

### Opção 1: Usar outro provedor
- **Outlook/Hotmail**: Mais simples para configurar
- **Yahoo**: Suporte a senhas de app
- **Provedor corporativo**: SMTP personalizado

### Opção 2: Configuração SMTP personalizada
```javascript
// No emailService.js, substitua a configuração por:
this.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testando a Configuração
Acesse: `http://localhost:3001/test-email`

Se retornar `{"success": true}`, a configuração está correta.
