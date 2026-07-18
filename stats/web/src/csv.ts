/** Minimal CSV helpers for dashboard export. */

// Cells starting with these are treated as formulas by Excel / Sheets / WPS.
// Only string cells are guarded — numbers we generate are never formulas.
const FORMULA_TRIGGERS = new Set(['=', '+', '-', '@', '\t', '\r'])

function escapeCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  const guarded =
    typeof value === 'string' && FORMULA_TRIGGERS.has(text[0]) ? `'${text}` : text
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`
  }
  return guarded
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ]
  return `${lines.join('\n')}\n`
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
