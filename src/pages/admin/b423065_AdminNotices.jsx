import { useState } from 'react'
import { api } from '../../b423065_api.js'
import { useToast } from '../../b423065_Toast.jsx'
import { useFetch } from '../../b423065_hooks.js'
import { formatDateTime } from '../../b423065_format.js'
import { EmptyState, ErrorBox, PageLoader, Spinner } from '../../components/b423065_components.jsx'

export default function AdminNotices() {
  const toast = useToast()
  const noticesQ = useFetch('/notices')
  const [form, setForm] = useState({ title: '', body: '', pinned: false })
  const [busy, setBusy] = useState(false)
  const notices = noticesQ.data && noticesQ.data.notices

  async function publish(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/notices', form)
      toast('Notice published')
      setForm({ title: '', body: '', pinned: false })
      noticesQ.reload()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    try {
      await api.del(`/notices/${id}`)
      toast('Notice removed')
      noticesQ.reload()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="split">
      <form className="card card-pad form-stack" onSubmit={publish}>
        <h3>Publish a notice</h3>
        <label className="field">
          <span>Title</span>
          <input
            className="input"
            value={form.title}
            maxLength={120}
            onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea
            className="input textarea"
            rows={4}
            maxLength={1000}
            value={form.body}
            onChange={event => setForm(current => ({ ...current, body: event.target.value }))}
            required
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={event => setForm(current => ({ ...current, pinned: event.target.checked }))}
          />
          <span>Pin to the top</span>
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? <Spinner size={18} /> : 'Publish'}
        </button>
      </form>

      <section>
        {noticesQ.error && <ErrorBox message={noticesQ.error} onRetry={noticesQ.reload} />}
        {!notices && !noticesQ.error && <PageLoader label="Loading notices" />}
        {notices && notices.length === 0 && <EmptyState icon="📢" title="No notices" text="Published notices appear here." />}
        <div className="stack">
          {notices &&
            notices.map(notice => (
              <article key={notice._id} className="card notice">
                <div className="notice-top">
                  <h3>
                    {notice.pinned && '📌 '}
                    {notice.title}
                  </h3>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => remove(notice._id)}>
                    Delete
                  </button>
                </div>
                <p>{notice.body}</p>
                <small className="muted">
                  {notice.author} · {formatDateTime(notice.createdAt)}
                </small>
              </article>
            ))}
        </div>
      </section>
    </div>
  )
}
