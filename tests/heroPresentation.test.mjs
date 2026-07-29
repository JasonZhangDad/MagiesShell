import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

test('hero replaces the cloud-platform badge with an animated shell command', () => {
  assert.doesNotMatch(main, /\$\{t\.heroBadge\}/)
  assert.match(main, /class="hero-terminal"/)
  assert.match(main, /data-typer/)
  assert.match(main, /const commands = \[/)
})

test('galaxy rotates separately while the center cross only pulses', () => {
  assert.match(
    main,
    /class="hero-logo-spin"[\s\S]*?src="\/logo-galaxy-ring-v3\.png"[\s\S]*?<\/div>\s*<div class="hero-cross"/,
  )
  assert.match(main, /class="hero-cross-image"[\s\S]*?src="\/logo-cross-v4\.png"/)
  assert.match(styles, /\.hero-logo-spin[\s\S]*?animation:\s*hero-ring-cw/)
  assert.match(styles, /\.hero-cross[\s\S]*?animation:\s*hero-cross-pulse/)
  assert.doesNotMatch(
    styles.match(/@keyframes hero-cross-pulse[\s\S]*?\n}/)?.[0] ?? '',
    /rotate\(/,
  )
  assert.doesNotMatch(styles, /hero-glow-breathe/)
  assert.doesNotMatch(styles, /hero-core-pulse/)
})

test('product screenshots use the mock-IP-safe images', () => {
  assert.match(main, /src="\/screenshots\/product-hosts-v3\.jpg"/)
  assert.match(main, /src="\/screenshots\/product-terminal-v3\.jpg"/)
  assert.match(main, /src="\/screenshots\/product-theme-v3\.jpg"/)
  assert.doesNotMatch(main, /src="\/screenshots\/product-(?:hosts|terminal|theme)(?:-v2)?\.jpg"/)
})

test('header uses the galaxy while the footer uses a pulsing cross star', () => {
  const references = main.match(/src="\/logo-galaxy-v3\.png"/g) ?? []
  assert.equal(references.length, 1)
  assert.match(main, /class="footer-star"[\s\S]*?src="\/logo-cross-v4\.png"/)
  assert.match(styles, /\.footer-star[\s\S]*?animation:\s*footer-star-pulse/)
  assert.doesNotMatch(
    styles.match(/@keyframes footer-star-pulse[\s\S]*?\n}/)?.[0] ?? '',
    /rotate\(/,
  )
  assert.doesNotMatch(main, /src="\/logo-galaxy(?:-v2)?\.png"/)
  assert.doesNotMatch(main, /src="\/logo-galaxy-star-v3\.png"/)
  assert.doesNotMatch(styles, /mix-blend-mode:\s*screen/)
})

test('language selector text is slightly larger', () => {
  assert.match(styles, /\.lang-select\s*\{[\s\S]*?font-size:\s*0\.8rem/)
})
