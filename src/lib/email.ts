import nodemailer, { Transporter } from 'nodemailer';
import { montarLinkAcompanhamento } from './utils';

/** Nome que aparece como remetente nos e-mails enviados ao cliente. */
const NOME_ATELIER = process.env.ATELIER_NOME || 'Atelier Bruno Amaral';

export interface AlteracaoObra {
  rotulo: string;
  de?: string | null;
  para?: string | null;
}

interface DadosEmail {
  obra: {
    titulo: string;
    cliente_nome: string;
    cliente_email: string | null;
    token_acesso: string;
    status_atual: string;
    percentual_conclusao: number;
  };
  alteracoes: AlteracaoObra[];
  imagemUrl?: string | null;
}

let transporterCache: Transporter | null = null;

/** Retorna o transporter do Gmail ou `null` quando as credenciais não foram configuradas. */
function obterTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporterCache) {
    transporterCache = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return transporterCache;
}

export function emailConfigurado(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function montarLinhaAlteracao(a: AlteracaoObra): string {
  const rotulo = escaparHtml(a.rotulo);
  if (a.de && a.para && a.de !== a.para) {
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e7ddcd;font-size:14px;color:#5c5346;">${rotulo}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e7ddcd;font-size:14px;color:#1c1a17;text-align:right;">
        <span style="color:#8a8070;text-decoration:line-through;">${escaparHtml(a.de)}</span>
        <span style="color:#8a8070;">&nbsp;→&nbsp;</span>
        <strong style="color:#8a6a2f;">${escaparHtml(a.para)}</strong>
      </td>
    </tr>`;
  }
  const valor = a.para ? escaparHtml(a.para) : 'atualizado';
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e7ddcd;font-size:14px;color:#5c5346;">${rotulo}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e7ddcd;font-size:14px;color:#1c1a17;text-align:right;">${valor}</td>
  </tr>`;
}

function montarHtml({ obra, alteracoes, imagemUrl }: DadosEmail): string {
  const link = montarLinkAcompanhamento(obra.token_acesso);
  const linhas = alteracoes.map(montarLinhaAlteracao).join('');
  const percentual = Math.max(0, Math.min(100, obra.percentual_conclusao || 0));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Atualização na sua obra</title>
</head>
<body style="margin:0;padding:0;background-color:#f4efe6;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#fffdf9;border:1px solid #e7ddcd;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #e7ddcd;">
              <p style="margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#8a6a2f;">${escaparHtml(NOME_ATELIER)}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:15px;color:#5c5346;">Olá, ${escaparHtml(obra.cliente_nome)}.</p>
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#1c1a17;font-weight:normal;">
                Sua obra <em style="color:#8a6a2f;">${escaparHtml(obra.titulo)}</em> foi atualizada
              </h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b6355;">
                Passando para contar as novidades do ateliê. Confira abaixo o que mudou:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${linhas}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a8070;padding-bottom:8px;">
                    Progresso da obra
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eee6d8;border-radius:99px;">
                      <tr>
                        <td width="${percentual}%" style="background-color:#b98a3d;border-radius:99px;height:8px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="${100 - percentual}%" style="font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;font-size:13px;color:#6b6355;">
                    <strong style="color:#1c1a17;">${percentual}%</strong> concluído · Etapa atual:
                    <strong style="color:#8a6a2f;">${escaparHtml(obra.status_atual)}</strong>
                  </td>
                </tr>
              </table>

              ${imagemUrl ? `<div style="margin-bottom:28px;text-align:center;">
                <img src="${escaparHtml(imagemUrl)}" alt="Foto de progresso da obra" width="496" style="max-width:100%;height:auto;border-radius:6px;border:1px solid #e7ddcd;display:block;" />
              </div>` : ''}

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" style="border-radius:6px;background-color:#1c1a17;">
                    <a href="${link}" style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:#f4efe6;text-decoration:none;letter-spacing:0.5px;">
                      Ver obra no ateliê
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#8a8070;text-align:center;">
                Este link é exclusivo e pessoal. Guarde com carinho.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;background-color:#faf6ef;border-top:1px solid #e7ddcd;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#8a8070;">
                ${escaparHtml(NOME_ATELIER)}
              </p>
              <p style="margin:0;font-size:11px;color:#a39a89;">
                Este aviso foi enviado automaticamente porque sua obra foi atualizada.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function montarTexto({ obra, alteracoes }: DadosEmail): string {
  const link = montarLinkAcompanhamento(obra.token_acesso);
  const linhas = alteracoes
    .map((a) => {
      if (a.de && a.para && a.de !== a.para) return `- ${a.rotulo}: ${a.de} -> ${a.para}`;
      return `- ${a.rotulo}: ${a.para || 'atualizado'}`;
    })
    .join('\n');

  return [
    `Olá, ${obra.cliente_nome}.`,
    '',
    `Sua obra "${obra.titulo}" foi atualizada no ${NOME_ATELIER}.`,
    '',
    linhas,
    '',
    `Progresso: ${obra.percentual_conclusao}% · Etapa atual: ${obra.status_atual}`,
    '',
    `Acompanhe os detalhes: ${link}`,
    '',
    NOME_ATELIER,
  ].join('\n');
}

/**
 * Envia ao cliente um e-mail avisando sobre a atualização da obra.
 * Nunca lança exceção: falhas são registradas e retornadas em `erro` para que
 * a ação principal (salvar a alteração no banco) não seja interrompida.
 */
export async function enviarEmailAtualizacaoObra(
  dados: DadosEmail
): Promise<{ enviado: boolean; erro?: string }> {
  const { obra, alteracoes } = dados;

  if (!obra.cliente_email) return { enviado: false, erro: 'Cliente sem e-mail cadastrado.' };
  if (alteracoes.length === 0) return { enviado: false };

  const transporter = obterTransporter();
  if (!transporter) {
    console.warn('[email] GMAIL_USER/GMAIL_APP_PASSWORD não configurados — e-mail não enviado.');
    return { enviado: false, erro: 'Envio de e-mail não configurado.' };
  }

  try {
    await transporter.sendMail({
      from: `"${NOME_ATELIER}" <${process.env.GMAIL_USER}>`,
      to: obra.cliente_email,
      replyTo: process.env.EMAIL_RESPOSTA || process.env.GMAIL_USER,
      subject: `Atualização na sua obra: ${obra.titulo}`,
      text: montarTexto(dados),
      html: montarHtml(dados),
    });
    return { enviado: true };
  } catch (e) {
    const erro = e instanceof Error ? e.message : 'Falha ao enviar e-mail.';
    console.error('[email] Falha ao enviar atualização da obra:', erro);
    return { enviado: false, erro };
  }
}
