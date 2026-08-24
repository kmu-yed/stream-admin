import { Fragment } from 'react'

type BoldMarkupTextProps = {
  text: string
}

function BoldMarkupText({ text }: BoldMarkupTextProps) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
        return boldMatch ? <strong key={index}>{boldMatch[1]}</strong> : <Fragment key={index}>{part}</Fragment>
      })}
    </>
  )
}

export default BoldMarkupText
