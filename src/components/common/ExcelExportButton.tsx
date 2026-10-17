import { IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@wanteddev/wds'
import { IconDownload } from '@wanteddev/wds-icon'

function ExcelExportButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return <Tooltip mode="hover"><TooltipTrigger><IconButton variant="outlined" color="semantic.label.assistive" size="medium" disabled={disabled} onClick={onClick} aria-label="엑셀 내보내기"><IconDownload style={{ color: 'var(--semantic-label-alternative)' }} /></IconButton></TooltipTrigger><TooltipContent>{disabled ? '내보낼 데이터가 없어요.' : '엑셀 내보내기'}</TooltipContent></Tooltip>
}

export default ExcelExportButton
