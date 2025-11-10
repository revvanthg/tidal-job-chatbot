import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble.jsx'
import JobCard from './JobCard.jsx'
import HistoryTimeline from './HistoryTimeline.jsx'
import { ExportJSON, ExportCSV } from './ExportButtons.jsx'
import { searchJobs, getJob, actionJob } from '../api.js'

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! Type a job name (e.g., "RMS_01"), and I’ll fetch its status, times, and owner. You can also click Start / Stop / Rerun.' }
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const scroll = () => endRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scroll, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { role: 'user', content: text }])
    setInput('')
    const res = await searchJobs(text)
    if (!res.items?.length) {
      setMessages(m => [...m, { role: 'bot', content: `No job found for "${text}".` }])
      return
    }
    const j = await getJob(res.items[0].id)
    setMessages(m => [...m, { role: 'bot', content: j }])
  }

  const onAction = async (type, job) => {
    const updated = await actionJob(job.id, type)
    setMessages(m => [...m, { role: 'bot', content: updated }])
  }

  return (
    <div className="container">
      <div className="header">Tidal Job Chat Bot</div>
      <div className="chat">
        {messages.map((m,i)=>(
          <MessageBubble key={i} role={m.role}>
            {typeof m.content === 'string'
              ? m.content
              : <>
                  <JobCard job={m.content} />
                  <div className="action-row">
                    <button onClick={()=>onAction('start', m.content)}>Start</button>
                    <button onClick={()=>onAction('stop', m.content)}>Stop</button>
                    <button onClick={()=>onAction('rerun', m.content)}>Rerun last</button>
                  </div>
                  <HistoryTimeline job={m.content}/>
                  <div className="export">
                    <ExportJSON job={m.content}/>
                    <ExportCSV job={m.content}/>
                  </div>
                </>
            }
          </MessageBubble>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="inputbar">
        <input
          placeholder="Type a job name…"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=> e.key==='Enter' && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
