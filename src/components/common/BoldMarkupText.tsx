import { Fragment } from 'react'

type BoldMarkupTextProps = {
  text: string
}

function BoldMarkupText({ text }: BoldMarkupTextProps) {
  const parts = text.split(/(\*\*[\s\S]+?\*\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*([\s\S]+)\*\*$/)
        return boldMatch ? <strong key={index} style={{ fontWeight: 700, color: 'var(--semantic-label-normal)' }}>{boldMatch[1]}</strong> : <Fragment key={index}>{part}</Fragment>
      })}
    </>
  )
}

export default BoldMarkupText
