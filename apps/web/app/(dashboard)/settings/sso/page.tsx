'use client'
import { useEffect, useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertCircle, Download, TestTube } from 'lucide-react'

type SsoConfig = {
  id: string
  protocol: string
  idpEntityId?: string
  idpSsoUrl?: string
  idpCertificate?: string
  idpMetadataXml?: string
  oidcDiscoveryUrl?: string
  oidcClientId?: string
  oidcClientSecretEnc?: string | null
  oidcScopes: string[]
  spEntityId: string
  spAcsUrl: string
  emailDomain: string
  forceSso: boolean
  isEnabled: boolean
  isVerified: boolean
  isIdpEnabled: boolean
}

type Tab = 'Setup' | 'IdP Config' | 'SP Config' | 'Test' | 'Status'
const tabs: Tab[] = ['Setup', 'IdP Config', 'SP Config', 'Test', 'Status']

export default function SsoSettingsPage() {
  const [tab, setTab] = useState<Tab>('Setup')
  const [config, setConfig] = useState<SsoConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [protocol, setProtocol] = useState('SAML')
  const [emailDomain, setEmailDomain] = useState('')
  const [forceSso, setForceSso] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [idpEntityId, setIdpEntityId] = useState('')
  const [idpSsoUrl, setIdpSsoUrl] = useState('')
  const [idpCertificate, setIdpCertificate] = useState('')
  const [idpMetadataXml, setIdpMetadataXml] = useState('')
  const [oidcDiscoveryUrl, setOidcDiscoveryUrl] = useState('')
  const [oidcClientId, setOidcClientId] = useState('')
  const [oidcClientSecret, setOidcClientSecret] = useState('')

  useEffect(() => {
    fetch('/api/settings/sso')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          const c = res.data as SsoConfig
          setConfig(c)
          setProtocol(c.protocol)
          setEmailDomain(c.emailDomain)
          setForceSso(c.forceSso)
          setIsEnabled(c.isEnabled)
          setIdpEntityId(c.idpEntityId ?? '')
          setIdpSsoUrl(c.idpSsoUrl ?? '')
          setIdpCertificate(c.idpCertificate ?? '')
          setIdpMetadataXml(c.idpMetadataXml ?? '')
          setOidcDiscoveryUrl(c.oidcDiscoveryUrl ?? '')
          setOidcClientId(c.oidcClientId ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/settings/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol, emailDomain, forceSso, isEnabled,
          idpEntityId: idpEntityId || undefined,
          idpSsoUrl: idpSsoUrl || undefined,
          idpCertificate: idpCertificate || undefined,
          idpMetadataXml: idpMetadataXml || undefined,
          oidcDiscoveryUrl: oidcDiscoveryUrl || undefined,
          oidcClientId: oidcClientId || undefined,
          oidcClientSecret: oidcClientSecret || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Save failed'); return }
      setConfig(data.data)
      setSuccess('SSO configuration saved.')
      setOidcClientSecret('')
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/sso/test', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setTestResult({ ok: true, message: data.data.message })
      } else {
        setTestResult({ ok: false, message: data.error ?? 'Test failed' })
      }
    } catch {
      setTestResult({ ok: false, message: 'Test request failed' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Shield className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Single Sign-On</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure SAML 2.0 or OIDC for enterprise login</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <XCircle size={16} />{error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <CheckCircle size={16} />{success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        {tab === 'Setup' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Protocol & Domain</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Protocol</label>
              <select
                value={protocol}
                onChange={e => setProtocol(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="SAML">SAML 2.0</option>
                <option value="OIDC">OIDC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email domain</label>
              <input
                type="text"
                value={emailDomain}
                onChange={e => setEmailDomain(e.target.value)}
                placeholder="company.com"
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Users with this domain will be redirected to SSO</p>
            </div>
            <div className="flex items-center gap-3">
              <input id="forceSso" type="checkbox" checked={forceSso} onChange={e => setForceSso(e.target.checked)} className="rounded" />
              <label htmlFor="forceSso" className="text-sm text-slate-700 dark:text-slate-300">Force SSO — disable password login for this domain</label>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
              Save
            </button>
          </div>
        )}

        {tab === 'IdP Config' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Identity Provider Configuration</h2>
            {protocol === 'SAML' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IdP Metadata XML (paste from your IdP)</label>
                  <textarea
                    value={idpMetadataXml}
                    onChange={e => setIdpMetadataXml(e.target.value)}
                    rows={6}
                    placeholder="<EntityDescriptor ...>...</EntityDescriptor>"
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Or fill in manually below</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IdP Entity ID</label>
                  <input
                    type="text"
                    value={idpEntityId}
                    onChange={e => setIdpEntityId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IdP SSO URL</label>
                  <input
                    type="url"
                    value={idpSsoUrl}
                    onChange={e => setIdpSsoUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">X.509 Certificate</label>
                  <textarea
                    value={idpCertificate}
                    onChange={e => setIdpCertificate(e.target.value)}
                    rows={4}
                    placeholder="-----BEGIN CERTIFICATE-----..."
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discovery URL</label>
                  <input
                    type="url"
                    value={oidcDiscoveryUrl}
                    onChange={e => setOidcDiscoveryUrl(e.target.value)}
                    placeholder="https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration"
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={oidcClientId}
                    onChange={e => setOidcClientId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={oidcClientSecret}
                    onChange={e => setOidcClientSecret(e.target.value)}
                    placeholder={config?.oidcClientSecretEnc ? '(saved — enter new value to update)' : 'Enter client secret'}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stored encrypted — never shown again after saving</p>
                </div>
              </>
            )}
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
              Save
            </button>
          </div>
        )}

        {tab === 'SP Config' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Service Provider Details</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Paste these values into your identity provider&apos;s application settings.</p>
            {config ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SP Entity ID</label>
                  <code className="block w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 break-all">{config.spEntityId}</code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ACS URL (Assertion Consumer Service)</label>
                  <code className="block w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 break-all">{config.spAcsUrl}</code>
                </div>
                {config.protocol === 'SAML' && (
                  <a
                    href={`/api/auth/sso/${window.location.pathname.split('/')[1]}/metadata`}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download SP Metadata XML
                  </a>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <AlertCircle size={16} />
                Save your SSO configuration first to generate SP details.
              </div>
            )}
          </div>
        )}

        {tab === 'Test' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Test SSO Configuration</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Verify your configuration is valid before enabling it for users.</p>
            <button
              onClick={handleTest}
              disabled={testing || !config}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {testing ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <TestTube size={16} />}
              Test connection
            </button>
            {testResult && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${testResult.ok ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
                {testResult.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {testResult.message}
              </div>
            )}
          </div>
        )}

        {tab === 'Status' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Enable / Disable</h2>
            <div className="flex items-center gap-3">
              <input
                id="isEnabled"
                type="checkbox"
                checked={isEnabled}
                onChange={e => setIsEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isEnabled" className="text-sm text-slate-700 dark:text-slate-300">
                SSO enabled — users with @{emailDomain || 'your-domain.com'} will be redirected to SSO login
              </label>
            </div>
            {config?.isVerified && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle size={16} />
                Configuration verified via successful test login
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
