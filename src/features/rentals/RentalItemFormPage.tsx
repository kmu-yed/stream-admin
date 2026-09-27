import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Option, Select, TextField, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import { useRentals } from './store'
import { RENTAL_CATEGORIES, type RentalCategory, type RentalItemInput } from './types'

const emptyForm: RentalItemInput = { name: '', category: '전자기기', itemKind: '대여품', totalQuantity: 1 }
const CUSTOM_CATEGORY_VALUE = '__custom_category__'

function RentalItemFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { items, itemTypes, addItem, addItemType, updateItem } = useRentals()
  const toast = useToast()

  const existing = id ? items.find((item) => item.id === id) : undefined
  const [form, setForm] = useState<RentalItemInput>(
    existing ? { name: existing.name, category: existing.category, itemKind: existing.itemKind, totalQuantity: existing.totalQuantity } : { ...emptyForm, name: itemTypes.find((item) => item.category === '전자기기')?.name ?? '' },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [icon, setIcon] = useState<string[]>([])
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  const goToList = () => navigate('/rentals?tab=items')

  const handleCategoryChange = (category: RentalCategory) => {
    setForm({ ...form, category, name: itemTypes.find((item) => item.category === category)?.name ?? '' })
  }

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.name.trim()) nextErrors.name = '물품명을 입력해주세요.'
    if (!form.category.trim()) nextErrors.category = '카테고리명을 입력해주세요.'
    if (!isEdit && !icon[0]) nextErrors.icon = '아이콘 파일을 업로드해주세요.'
    if (!form.totalQuantity || form.totalQuantity < 1) nextErrors.totalQuantity = '수량은 1개 이상이어야 해요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateItem(id, form)
      toast({ content: '물품이 수정되었어요.', variant: 'positive' })
    } else {
      if (!itemTypes.some((item) => item.category === form.category && item.name === form.name.trim())) addItemType({ category: form.category, name: form.name.trim(), icon: icon[0] })
      addItem(form)
      toast({ content: '물품이 등록되었어요.', variant: 'positive' })
    }
    goToList()
  }

  return (
    <>
      <PageHeader title={isEdit ? '물품 수정' : '물품 등록'} description="등록한 물품 종류를 선택하고 수량을 입력해요." />

      <FlexBox flexDirection="column" style={{ gap: 24, maxWidth: 480, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
        <FormItem label="아이콘" error={errors.icon}>
          <ImageUploadField value={icon} onChange={setIcon} maxCount={1} previewSize={120} />
        </FormItem>
        <FormItem label="카테고리" required error={errors.category}>
          <FlexBox flexDirection="column" style={{ gap: 8 }}><Select value={isCustomCategory ? CUSTOM_CATEGORY_VALUE : form.category} onChange={(v) => { const custom = v === CUSTOM_CATEGORY_VALUE; setIsCustomCategory(custom); custom ? setForm({ ...form, category: '' }) : handleCategoryChange(v as RentalCategory) }}>
            {Array.from(new Set([...RENTAL_CATEGORIES, ...itemTypes.map((item) => item.category)])).map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
            <Option value={CUSTOM_CATEGORY_VALUE}>직접 입력</Option>
          </Select>{isCustomCategory && <TextField value={form.category} placeholder="카테고리명을 입력해주세요" onChange={(e) => setForm({ ...form, category: e.target.value })} />}</FlexBox>
        </FormItem>

        <FormItem label="이름" required error={errors.name}>
          <TextField value={form.name} placeholder="예: 멀티탭" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormItem>

        <FormItem label="물품 구분">
          <Select value={form.itemKind} onChange={(value) => setForm({ ...form, itemKind: value as RentalItemInput['itemKind'] })}>
            <Option value="대여품">대여품</Option>
            <Option value="소모품">소모품</Option>
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
