import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Icon } from '../../components/Icon'
import { useFeedback } from '../../contexts/FeedbackContext'
import {
  getRate,
  depositFromFiat,
  CASH_IN_METHODS,
  type RateQuote,
  type DepositResult,
} from '../../lib/pdax'

/** PDAX rejects anything smaller (`PAP0500`). */
const MIN_PHP = 200
/** Crypto the pesos would buy. Shown as an estimate only — see below. */
const BUY_SYMBOL = 'USDC'

/** Cash-in (owner, PHP → crypto) via PDAX.
 *
 *  `POST /fiat/deposit` is a real call: PDAX returns a genuine bank checkout URL
 *  and a reference. But its sandbox checkout never settles, so the pesos never
 *  land and no crypto is ever bought. We say so on the screen rather than
 *  pretending the vault got funded.
 *
 *  The BSP travel-rule identity PDAX requires (legal names, and for larger
 *  amounts DOB / national id / address) lives in server-side env. This page
 *  sends only an amount and a payment channel — no personal data. */
export function CashIn() {
  const navigate = useNavigate()
  const { runTx } = useFeedback()
  const [amount, setAmount] = useState('500')
  const [method, setMethod] = useState<string>(CASH_IN_METHODS[0].id)
  const [quote, setQuote] = useState<RateQuote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DepositResult | null>(null)

  const php = parseFloat(amount)
  const valid = !isNaN(php) && php >= MIN_PHP
  const estimate = quote && quote.rate > 0 ? php / quote.rate : 0

  // BUY quote is priced per 1 crypto, so PHP / rate = crypto received.
  useEffect(() => {
    if (!valid) {
      setQuote(null)
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const q = await getRate(1, BUY_SYMBOL, 'BUY')
        if (!cancelled) setQuote(q)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [php, valid])

  async function onCashIn() {
    if (!valid) return
    setError(null)
    const { ok, result: r } = await runTx<DepositResult>({
      confirm: {
        title: 'Start cash-in',
        description: `PDAX will open a ₱${php.toLocaleString()} payment page. Their sandbox never settles it, so no ${BUY_SYMBOL} will actually arrive — the request and reference are real.`,
        confirmLabel: `Cash in ₱${php.toLocaleString()}`,
      },
      pendingTitle: 'Creating your deposit request…',
      showExplorer: false,
      silentSuccess: true,
      action: () => depositFromFiat(php, method),
    })
    if (ok && r) setResult(r)
  }

  // ── Result screen ─────────────────────────────────────────────────────
  if (result) {
    const failed = result.status === 'failed'
    return (
      <Layout>
        <div className="flex flex-col items-center text-center gap-5 pt-10">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              failed
                ? 'bg-error-container/20 text-error'
                : 'bg-secondary-container/20 text-secondary'
            }`}
          >
            <Icon name={failed ? 'close' : 'history'} className="text-5xl" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {failed ? 'Cash-in rejected' : 'Payment pending'}
            </h2>
            <p className="text-on-surface-variant mt-1">
              ₱{result.amount.toLocaleString()} ·{' '}
              {CASH_IN_METHODS.find((m) => m.id === result.method)?.label ?? result.method}
            </p>
          </div>

          {result.reference && (
            <section className="w-full bg-surface-container-lowest rounded-2xl p-5 card-shadow border border-outline-variant/30 flex flex-col gap-2 text-sm text-left">
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Reference</span>
                <span className="font-mono text-xs break-all">{result.reference}</span>
              </div>
              {result.fee != null && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Fee</span>
                  <span>₱{result.fee}</span>
                </div>
              )}
            </section>
          )}

          {failed ? (
            <p className="text-xs text-error bg-error-container/15 rounded-lg px-3 py-2 text-left break-all">
              {result.failure}
            </p>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-500 bg-amber-500/15 border border-amber-500/40 rounded-lg px-3 py-2 text-left">
              ⚠ SANDBOX — PDAX's test checkout never settles. Your vault will not be
              funded, and PDAX will email a "Cash In Failed" notice. The deposit request
              itself is real; production keys are needed for the pesos to actually move.
            </p>
          )}

          {result.checkoutUrl && (
            <a
              href={result.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full h-14 rounded-full bg-primary-container text-on-primary font-semibold uppercase tracking-wider flex items-center justify-center gap-2 card-shadow"
            >
              Open payment page <Icon name="open_in_new" />
            </a>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="text-on-surface-variant text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </Layout>
    )
  }

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
          <h2 className="text-2xl font-semibold">Cash in from pesos</h2>
          <p className="text-on-surface-variant mt-1">
            Fund your vault with PHP through PDAX — a BSP-licensed exchange.
          </p>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-outline-variant/30">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">
            Amount (PHP)
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-4xl font-bold outline-none mt-2 placeholder:text-outline-variant"
          />
          {!valid && amount !== '' && (
            <p className="text-xs text-error mt-2">Minimum is ₱{MIN_PHP}.</p>
          )}
        </section>

        {quote && valid && (
          <section className="bg-surface-container-low rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-on-surface-variant">You'd receive</span>
              <span className="text-xs text-on-surface-variant">
                ₱{quote.rate.toFixed(2)} / {BUY_SYMBOL}
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">
              ≈ {estimate.toFixed(4)} {BUY_SYMBOL}
            </span>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant px-1">
            Pay with
          </span>
          <div className="grid grid-cols-2 gap-3">
            {CASH_IN_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`h-12 rounded-xl font-semibold text-sm border transition ${
                  method === m.id
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface border-outline-variant/40 text-on-surface'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-500">
          <Icon name="warning" className="text-base" />
          <p>
            Sandbox: PDAX's test payment page never settles, so no {BUY_SYMBOL} will
            reach your vault. The deposit request and reference are real.
          </p>
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          onClick={onCashIn}
          disabled={!valid}
          className="w-full h-14 rounded-full bg-primary-container text-on-primary font-semibold uppercase tracking-wider flex items-center justify-center gap-2 card-shadow disabled:opacity-50"
        >
          Cash in {valid ? `₱${php.toLocaleString()}` : ''}
          <Icon name="account_balance" />
        </button>
      </div>
    </Layout>
  )
}
