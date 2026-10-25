import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlexBox, TextArea, useToast } from '@wanteddev/wds'
import { pageLabels } from '../../nav/pageLabels'
import PageHeader from '../../components/common/PageHeader'
import useFormDraft from '../../components/common/useFormDraft'
import FormActions from '../../components/common/FormActions'
import FormItem from '../../components/common/FormItem'
import NotFoundState from '../../components/common/NotFoundState'
import { useChatbot } from './store'
import type { FaqInput } from './types'

const emptyForm: FaqInput = { question: '', answer: '' }

function FaqFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { faqs, addFaq, updateFaq } = useChatbot()
  const toast = useToast()

  const existing = id ? faqs.find((faq) => faq.id === id) : undefined
  const [form, setForm] = useState<FaqInput>(
    existing ? { question: existing.question, answer: existing.answer } : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { markSaved, draftControls, navigationGuard } = useFormDraft(`faq:${id ?? 'new'}`, form, setForm)

  const goToList = () => navigate('/chatbot?tab=faq')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.question.trim()) nextErrors.question = '질문을 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateFaq(id, form)
      toast({ content: 'FAQ가 수정되었어요.', variant: 'positive' })
    } else {
      addFaq(form)
      toast({ content: 'FAQ가 등록되었어요.', variant: 'positive' })
    }
    markSaved()
    goToList()
  }

  if (isEdit && !existing) return <NotFoundState entity="FAQ" onBack={goToList} />

  return (
    <>
      <PageHeader title={isEdit ? 'FAQ 수정' : pageLabels.faqCreate} description="챗봇에 노출할 질문을 등록해요." />
      {navigationGuard}
      {draftControls}

      <FlexBox flexDirection="column" style={{ gap: 32, maxWidth: 640 }}>
        <FormItem label="질문" required error={errors.question}>
          <TextArea
            placeholder="자주 묻는 질문을 입력하세요"
            value={form.question}
            width="100%"
            minRows={1}
            maxRows={4}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </FormItem>

        <FormActions onCancel={goToList} onSubmit={handleSubmit} submitLabel={isEdit ? '수정 완료' : '등록하기'} />
      </FlexBox>
    </>
  )
}

export default FaqFormPage
