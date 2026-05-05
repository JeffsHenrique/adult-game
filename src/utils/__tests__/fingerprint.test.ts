import { generateFingerprint } from '../fingerprint'

describe('generateFingerprint', () => {
  beforeAll(() => {
    vi.stubGlobal('screen', { width: 1920, height: 1080 })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns a 32-character hex string', async () => {
    const fp = await generateFingerprint()
    expect(fp).toMatch(/^[a-f0-9]{32}$/)
  })

  it('returns same fingerprint for same inputs', async () => {
    const fp1 = await generateFingerprint()
    const fp2 = await generateFingerprint()
    expect(fp1).toBe(fp2)
  })
})
