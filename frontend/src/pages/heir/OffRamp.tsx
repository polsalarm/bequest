import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Icon } from '../../components/Icon'
import { getRate, type RateQuote } from '../../lib/pdax'

const PAYOUTS = [
  { id: 'gcash', label: 'GCash', icon: 'account_balance_wallet' },
  { id: 'maya', label: 'Maya', icon: 'wallet' },
  { id: 'bank', label: 'Bank', icon: 'account_balance' },
]

/** Off-ramp: convert claimed USDC to Philippine pesos via PDAX.
 *  Layer 1 — live indicative rate + quote screen. Execution (withdraw) is the
 *  next increment; keys stay server-side (calls /api/pdax-rate only). */
export function OffRamp() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('100')
  const [quote, setQuote] = useState<RateQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [payout, setPayout] = useState('gcash')
  const [error, setError] = useState<string | null>(null)

  const value = parseFloat(amount)
  const valid = !isNaN(value) && value > 0

  useEffect(() => {
    if (!valid) {
      setQuote(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(async () => {
      try {
        const q = await getRate(value)
        if (!cancelled) setQuote(q)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [value, valid])

  return (
    <Layout>
      <div className="flex flex-col gap-5 pt-2">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-on-surface-variant flex items-center gap-1 text-sm mb-2"
          >
            <Icon name="arrow_back" className="text-base" /> Back
          </button>
          <h2 className="text-2xl font-semibold">Cash out to pesos</h2>
          <p className="text-on-surface-variant mt-1">
            Convert your USDC to PHP via PDAX — a BSP-licensed exchange.
          </p>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-outline-variant/30">
          <label className="text-xs uppercase tracking-wider text-on-surface-variant">
            Amount (USDC)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-4xl font-bold outline-none mt-2 placeholder:text-outline-variant"
          />
        </section>

        {/* Live quote */}
        <section className="bg-primary-container/5 rounded-2xl p-5 border border-primary-container/20 flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Icon name="progress_activity" className="animate-spin" /> Fetching live rate…
            </div>
          ) : quote ? (
            <>
              <div className="flex justify-between items-baseline">
                <span className="text-on-surface-variant text-sm">You receive</span>
                <span className="text-3xl font-bold text-primary-container">
                  ₱{quote.php.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>₱{quote.rate.toFixed(2)} / USDC</span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    quote.source === 'live'
                      ? 'bg-primary-container/15 text-primary-container'
                      : 'bg-secondary-container/20 text-secondary'
                  }`}
                >
                  {quote.source === 'live' ? '● live rate' : 'indicative rate'}
                </span>
              </div>
            </>
          ) : (
            <span className="text-on-surface-variant text-sm">
              Enter an amount to see a quote.
            </span>
          )}
        </section>

        {/* Payout method */}
        <section>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant px-1">
            Payout to
          </span>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {PAYOUTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayout(p.id)}
                className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  payout === p.id
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface border-outline-variant/40 text-on-surface'
                }`}
              >
                <Icon name={p.icon} />
                <span className="text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        {error && <p className="text-error text-sm break-words">{error}</p>}

        <button
          disabled={!valid || !quote}
          className="w-full h-14 rounded-full bg-primary-container text-on-primary font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 card-shadow"
        >
          Withdraw ₱{quote?.php.toLocaleString() ?? '0'}
          <Icon name="south" />
        </button>
        <p className="text-xs text-on-surface-variant text-center -mt-2">
          Live withdrawal wiring lands next — rate is a real PDAX quote (or
          indicative fallback while UAT pricing is down).
        </p>
      </div>
    </Layout>
  )
}
