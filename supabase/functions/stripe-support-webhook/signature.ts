export const verifyStripeSignature = async (
  payload: string,
  signatureHeader: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> => {
  if (!signatureHeader || !secret) return false
  const parts = signatureHeader.split(',').map((part) => part.trim().split('=', 2))
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1])
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value ?? '')
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300 || signatures.length === 0) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`)))
  const expected = [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return signatures.some((candidate) => {
    if (!/^[0-9a-f]{64}$/i.test(candidate)) return false
    let difference = 0
    for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ candidate.toLowerCase().charCodeAt(index)
    return difference === 0
  })
}
