import Flourish from './Flourish'

export default function SectionTitle({ eyebrow, title, light = false }) {
  return (
    <header className={`section-title${light ? ' section-title--light' : ''}`}>
      <p className="section-title__eyebrow reveal">{eyebrow}</p>
      <h2 className="section-title__title reveal">{title}</h2>
      <Flourish className="reveal" />
    </header>
  )
}
