import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildGithubUrl,
  buildMirrorUrl,
  isDownloadId,
  isSafeDownloadTarget,
  pickTargetUrl,
  preferMirrorForRequest,
} from '../api/src/downloadRedirect.ts'

test('known download ids are accepted', () => {
  assert.equal(isDownloadId('mac-arm64'), true)
  assert.equal(isDownloadId('win-x64-zip'), true)
  assert.equal(isDownloadId('win-arm64'), true)
  assert.equal(isDownloadId('win-arm64-portable'), true)
  assert.equal(isDownloadId('win-arm64-zip'), true)
  assert.equal(isDownloadId('../etc/passwd'), false)
  assert.equal(isDownloadId('mac-arm64.exe'), false)
})

test('mainland China and zh-CN language prefer the R2 mirror', () => {
  assert.equal(preferMirrorForRequest({ country: 'CN', acceptLanguage: null }), true)
  assert.equal(
    preferMirrorForRequest({ country: 'US', acceptLanguage: 'zh-CN,zh;q=0.9' }),
    true,
  )
  assert.equal(preferMirrorForRequest({ country: 'US', acceptLanguage: 'en-US' }), false)
  assert.equal(preferMirrorForRequest({ country: 'JP', acceptLanguage: null }), false)
})

test('overseas downloads target GitHub; CN targets the mirror', () => {
  const fileName = 'MagiesTerminal-0.4.6-mac-arm64.dmg'
  const tag = 'v0.4.6'
  assert.equal(
    pickTargetUrl({ preferMirror: false, tag, fileName }),
    buildGithubUrl(tag, fileName),
  )
  assert.equal(
    pickTargetUrl({ preferMirror: true, tag, fileName }),
    buildMirrorUrl(fileName),
  )
})

test('redirect targets only allow GitHub release assets or the R2 mirror', () => {
  assert.equal(
    isSafeDownloadTarget(
      'https://github.com/JasonZhangDad/MgTerminal-releases/releases/download/v0.4.6/MagiesTerminal-0.4.6-mac-arm64.dmg',
    ),
    true,
  )
  assert.equal(
    isSafeDownloadTarget(
      'https://github.com/JasonZhangDad/MgTerminal/releases/download/v0.4.6/MagiesTerminal-0.4.6-mac-arm64.dmg',
    ),
    false,
  )
  assert.equal(
    isSafeDownloadTarget('https://dl.magies.top/stable/MagiesTerminal-0.4.6-mac-arm64.dmg'),
    true,
  )
  assert.equal(isSafeDownloadTarget('https://evil.example/payload'), false)
  assert.equal(isSafeDownloadTarget('http://dl.magies.top/stable/x.dmg'), false)
  assert.equal(
    isSafeDownloadTarget('https://github.com/JasonZhangDad/MgTerminal/tree/main'),
    false,
  )
})
