import nodemailer from 'nodemailer'

function required(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export function mailer() {
  const host = required('SMTP_HOST')
  const port = Number(required('SMTP_PORT'))
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true'
  const user = required('SMTP_USER')
  const pass = required('SMTP_PASS')

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendMail(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const from = process.env.MAIL_FROM || required('SMTP_USER')
  const transporter = mailer()

  await transporter.sendMail({
    from,
    to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
}

export function appUrl(path: string) {
  const base = process.env.APP_URL || 'http://localhost:3000'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
