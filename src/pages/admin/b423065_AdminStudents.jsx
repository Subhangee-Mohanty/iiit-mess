import { useEffect, useState } from 'react'
import { api } from '../../b423065_api.js'
import { useToast } from '../../b423065_Toast.jsx'
import { useFetch } from '../../b423065_hooks.js'
import { formatDateTime, money, prettyDescription } from '../../b423065_format.js'
import { Chip, EmptyState, ErrorBox, Modal, PageLoader, Spinner } from '../../components/b423065_components.jsx'

const TONES = { charge: 'warn', refund: 'info', payment: 'success' }

function LedgerModal({ student, onClose }) {
  const ledgerQ = useFetch(`/admin/students/${student._id}/dues`)
  const data = ledgerQ.data

  return (
    <Modal title={`${student.name} · ${student.rollNo}`} onClose={onClose} wide>
      {ledgerQ.error && <ErrorBox message={ledgerQ.error} onRetry={ledgerQ.reload} />}
      {!data && !ledgerQ.error && <PageLoader label="Loading ledger" />}
      {data && (
        <>
          <div className="dues-breakdown solo">
            <div>
              <span>Charged</span>
              <b>{money(data.dues.charges)}</b>
            </div>
            <div>
              <span>Refunded</span>
              <b>{money(data.dues.refunds)}</b>
            </div>
            <div>
              <span>Paid</span>
              <b>{money(data.dues.payments)}</b>
            </div>
            <div>
              <span>Dues</span>
              <b>{money(data.dues.total)}</b>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.dues.entries.map(entry => (
                  <tr key={entry._id}>
                    <td className="nowrap">{formatDateTime(entry.createdAt)}</td>
                    <td>{prettyDescription(entry.description)}</td>
                    <td>
                      <Chip tone={TONES[entry.type]}>{entry.type}</Chip>
                    </td>
                    <td className={`num amount ${entry.type === 'charge' ? 'plus' : 'minus'}`}>
                      {entry.type === 'charge' ? '+' : '−'}
                      {money(entry.amount)}
                    </td>
                  </tr>
                ))}
                {data.dues.entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted center">
                      No entries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  )
}

export default function AdminStudents() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [ledger, setLedger] = useState(null)
  const [paying, setPaying] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const studentsQ = useFetch(`/admin/students?q=${encodeURIComponent(search)}`)
  const students = studentsQ.data && studentsQ.data.students

  async function recordPayment(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/admin/payments', { userId: paying._id, amount: Number(amount), note })
      toast(`Payment of ${money(Number(amount))} recorded for ${paying.name}`)
      setPaying(null)
      setAmount('')
      setNote('')
      studentsQ.reload()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const totalDues = students ? students.reduce((sum, student) => sum + Math.max(student.dues, 0), 0) : 0

  return (
    <div className="stack-lg">
      <section className="card card-pad">
        <div className="toolbar">
          <div>
            <h3>Students and dues</h3>
            <p className="muted">
              {students ? `${students.length} student${students.length === 1 ? '' : 's'} · ${money(totalDues)} pending in this list` : 'Loading'}
            </p>
          </div>
          <input
            className="input search-input"
            placeholder="Search by roll number or name"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>

        {studentsQ.error && <ErrorBox message={studentsQ.error} onRetry={studentsQ.reload} />}
        {!students && !studentsQ.error && <PageLoader label="Loading students" />}

        {students && students.length === 0 && (
          <EmptyState icon="🎓" title="No students found" text="Try a different search." />
        )}

        {students && students.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll no.</th>
                  <th>Name</th>
                  <th>Hostel</th>
                  <th className="num">Dues</th>
                  <th className="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>
                      <b>{student.rollNo}</b>
                    </td>
                    <td>
                      {student.name}
                      <br />
                      <small className="muted">{student.email}</small>
                    </td>
                    <td>
                      {student.hostel} {student.room}
                    </td>
                    <td className="num">
                      <Chip tone={student.dues > 0 ? 'warn' : student.dues < 0 ? 'info' : 'success'}>{money(student.dues)}</Chip>
                    </td>
                    <td className="num">
                      <div className="btn-row">
                        <button className="btn btn-ghost btn-sm" onClick={() => setLedger(student)}>
                          Ledger
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setPaying(student)}>
                          Record payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {ledger && <LedgerModal student={ledger} onClose={() => setLedger(null)} />}

      {paying && (
        <Modal title={`Record payment · ${paying.rollNo}`} onClose={() => !busy && setPaying(null)}>
          <form className="form-stack" onSubmit={recordPayment}>
            <p className="muted">
              {paying.name} currently has dues of <b>{money(paying.dues)}</b>. Record the cash or UPI amount collected at the
              mess office.
            </p>
            <label className="field">
              <span>Amount received (₹)</span>
              <input
                className="input"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Note (optional)</span>
              <input
                className="input"
                value={note}
                maxLength={120}
                onChange={event => setNote(event.target.value)}
                placeholder="Cash, receipt number, month..."
              />
            </label>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? <Spinner size={18} /> : 'Save payment'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
