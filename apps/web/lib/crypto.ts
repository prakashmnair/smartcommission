import crypto from 'crypto'

const KEY = Buffer.from(process.env.ENCRYPTION_KEY ?? '0'.repeat(64), 'hex')

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), enc.toString('hex'), tag.toString('hex')].join('.')
}

export function decryptSecret(ciphertext: string): string {
  const [ivHex, encHex, tagHex] = ciphertext.split('.')
  const iv = Buffer.from(ivHex, 'hex')
  const enc = Buffer.from(encHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(enc) + decipher.final('utf8')
}
