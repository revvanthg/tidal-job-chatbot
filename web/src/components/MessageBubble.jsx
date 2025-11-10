export default function MessageBubble({ role, children }) {
  return <div className={`bubble ${role}`}>{children}</div>
}
