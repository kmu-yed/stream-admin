import { IconButton, Tooltip, TooltipContent, TooltipTrigger } from '@wanteddev/wds'
import { IconDownload } from '@wanteddev/wds-icon'

function ExcelExportButton({ onClick }: { onClick: () => void }) {
  return <Tooltip mode="hover"><TooltipTrigger><IconButton variant="outlined" color="semantic.label.assistive" size="medium" onClick={onClick} aria-label="엑셀 내보내기"><IconDownload style={{ color: 'var(--semantic-label-alternative)' }} /></IconButton></TooltipTrigger><TooltipContent>엑셀 내보내기</TooltipContent></Tooltip>
}

export default ExcelExportButton
