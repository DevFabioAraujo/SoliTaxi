const nodemailer = require('nodemailer');
const excelService = require('./excelService');
const path = require('path');
const fs = require('fs');

class EmailService {
  constructor() {
    // Configuração do transporter com múltiplas opções
    this.transporter = null;
    this.emailConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = this.createTransporter();
      this.emailConfigured = true;
    } catch (error) {
      console.warn('⚠️  Email não configurado corretamente:', error.message);
      console.warn('📧 O sistema funcionará normalmente, mas emails não serão enviados.');
      this.emailConfigured = false;
      this.transporter = null;
    }
  }

  createTransporter() {
    // Tentar diferentes configurações de email
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('Configuração de email não encontrada. Usando configuração de teste.');
      // Usar Ethereal Email para testes (não envia emails reais)
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }

    // Configuração para Gmail com senha de app
    if (emailUser.includes('@gmail.com')) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Configuração genérica SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async generateExcel(requests, filename = 'solicitacoes_taxi.xlsx') {
    // Usar o excelService para gerar o arquivo
    return await excelService.generateExcel(requests, filename);
  }

  translateStatus(status) {
    const statusMap = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  async sendEmailWithAttachment(toEmail, excelPath, subject = 'Relatório de Solicitações de Táxi') {
    // Verificar se o email está configurado
    if (!this.emailConfigured || !this.transporter) {
      throw new Error('Email não configurado. Configure as variáveis EMAIL_USER e EMAIL_PASS no arquivo .env');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'sistema@taxi.com',
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Relatório de Solicitações de Táxi</h2>
          <p>Olá!</p>
          <p>Segue em anexo o relatório com as solicitações de táxi conforme solicitado.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📅 Data de geração:</strong> ${new Date().toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            })}</p>
            <p><strong>📊 Formato:</strong> Excel (.xlsx) - Formatado por carro e passageiros</p>
          </div>
          
          <p>O arquivo em anexo contém todas as informações organizadas por carro:</p>
          <ul>
            <li><strong>Organização por carro:</strong> Cada carro aparece destacado</li>
            <li><strong>Dados dos passageiros:</strong> Nome, endereço, telefone, etc.</li>
            <li><strong>Informações da viagem:</strong> Data, horário, origem e destino</li>
            <li><strong>Formatação profissional:</strong> Cores e estilos para fácil leitura</li>
          </ul>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>💡 Como usar:</strong></p>
            <p>O arquivo Excel está formatado para que cada motorista possa ver facilmente:</p>
            <ul>
              <li>Qual carro está dirigindo (linha destacada em vermelho)</li>
              <li>Lista de passageiros com endereços completos</li>
              <li>Telefones para contato se necessário</li>
            </ul>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Este é um email automático do Sistema de Solicitação de Táxi.<br>
            Por favor, não responda a este email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(excelPath),
          path: excelPath,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado com sucesso:', info.messageId);
      
      // Limpar arquivo temporário após envio
      setTimeout(() => {
        if (fs.existsSync(excelPath)) {
          fs.unlinkSync(excelPath);
          console.log('🗑️  Arquivo temporário removido:', excelPath);
        }
      }, 5000);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Tentar recriar o transporter e enviar novamente
      if (error.code === 'EAUTH') {
        console.log('🔄 Tentando reconfigurar transporter...');
        this.initializeTransporter();
        
        if (this.emailConfigured && this.transporter) {
          try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado na segunda tentativa:', info.messageId);
            return { success: true, messageId: info.messageId };
          } catch (retryError) {
            console.error('❌ Falha na segunda tentativa:', retryError);
            throw new Error(`Erro de autenticação de email. Para Gmail, você precisa usar uma SENHA DE APLICATIVO, não sua senha normal. Veja: https://support.google.com/accounts/answer/185833`);
          }
        }
      }
      
      throw error;
    }
  }

  async exportAndSendRequests(requests, toEmail, filters = {}) {
    try {
      // Filtrar solicitações se necessário
      let filteredRequests = requests;
      
      if (filters.status && filters.status !== 'all') {
        filteredRequests = requests.filter(req => req.status === filters.status);
      }
      
      if (filters.dateFrom) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.date) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.date) <= new Date(filters.dateTo)
        );
      }

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `solicitacoes_taxi_${timestamp}.xlsx`;
      
      // Gerar Excel
      const excelPath = await this.generateExcel(filteredRequests, filename);
      
      // Enviar por email
      const result = await this.sendEmailWithAttachment(
        toEmail, 
        excelPath, 
        `Relatório de Solicitações de Táxi - ${new Date().toLocaleDateString('pt-BR')}`
      );
      
      return {
        success: true,
        message: `Relatório enviado com sucesso para ${toEmail}`,
        recordsCount: filteredRequests.length,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('Erro no processo de exportação e envio:', error);
      throw error;
    }
  }

  // Método para testar configuração de email
  async testEmailConfiguration() {
    if (!this.emailConfigured || !this.transporter) {
      return { 
        success: false, 
        message: 'Email não configurado', 
        error: 'Variáveis EMAIL_USER e EMAIL_PASS não encontradas no arquivo .env',
        suggestion: 'Configure as variáveis de ambiente EMAIL_USER e EMAIL_PASS'
      };
    }

    try {
      await this.transporter.verify();
      return { 
        success: true, 
        message: 'Configuração de email válida',
        config: {
          host: this.transporter.options.host,
          port: this.transporter.options.port,
          user: this.transporter.options.auth?.user
        }
      };
    } catch (error) {
      console.error('Erro na verificação de email:', error);
      return { 
        success: false, 
        message: 'Erro na configuração de email', 
        error: error.message,
        suggestion: error.code === 'EAUTH' 
          ? '🔑 Para Gmail, você precisa usar uma SENHA DE APLICATIVO, não sua senha normal. Veja: https://support.google.com/accounts/answer/185833'
          : 'Verifique as configurações SMTP'
      };
    }
  }

  // Método para enviar email de teste
  async sendTestEmail(toEmail) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'sistema@taxi.com',
      to: toEmail,
      subject: 'Teste - Sistema de Solicitação de Táxi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Teste de Email Bem-sucedido!</h2>
          <p>Este é um email de teste do Sistema de Solicitação de Táxi.</p>
          <p>Se você recebeu este email, significa que a configuração está funcionando corretamente.</p>
          <p><strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
          })}</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EmailService();
