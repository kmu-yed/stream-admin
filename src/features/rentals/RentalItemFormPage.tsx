import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Option, Select, TextField, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useRentals } from './store'
import { RENTAL_CATALOG, RENTAL_CATEGORIES, type RentalCategory, type RentalItemInput } from './types'

const emptyForm: RentalItemInput = { name: RENTAL_CATALOG.전자기기[0], category: '전자기기', totalQuantity: 1 }

function RentalItemFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { items, addItem, updateItem } = useRentals()
  const toast = useToast()

  const existing = id ? items.find((item) => item.id === id) : undefined
  const [form, setForm] = useState<RentalItemInput>(
    existing ? { name: existing.name, category: existing.category, totalQuantity: existing.totalQuantity } : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const goToList = () => navigate('/rentals?tab=items')

  const handleCategoryChange = (category: RentalCategory) => {
    setForm({ ...form, category, name: RENTAL_CATALOG[category][0] })
  }

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.name) nextErrors.name = '물품을 선택해주세요.'
    if (!form.totalQuantity || form.totalQuantity < 1) nextErrors.totalQuantity = '수량은 1개 이상이어야 해요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateItem(id, form)
      toast({ content: '물품이 수정되었어요.', variant: 'positive' })
    } else {
      addItem(form)
      toast({ content: '물품이 등록되었어요.', variant: 'positive' })
    }
    goToList()
  }

  return (
    <>
      <PageHeader title={isEdit ? '물품 수정' : '새 물품 등록'} description="빌릴게 목록에 노출될 물품 정보를 입력해요." />

      <FlexBox flexDirection="column" style={{ gap: 32, maxWidth: 480 }}>
        <FormItem label="카테고리" required>
          <Select value={form.category} onChange={(v) => handleCategoryChange(v as RentalCategory)}>
            {RENTAL_CATEGORIES.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </FormItem>

        <FormItem label="이름" required error={errors.name}>
          <Select value={form.name} onChange={(v) => setForm({ ...form, name: v })}>
            {RENTAL_CATALOG[form.category].map((name) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
        </FormItem>

        <FormItem label="수량" required error={errors.totalQuantity}>
          <TextField
            type="number"
            value={String(form.totalQuantity)}
            onChange={(e) => setForm({ ...form, totalQuantity: Number(e.target.value) || 0 })}
          />
        </FormItem>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={goToList}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default RentalItemFormPage
