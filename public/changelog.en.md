# Changelog

## [0.4.6] - 2026-07-15

### Security
- **SSH host-key verification off is no longer silent**: when `verifyHostKeys` is disabled (terminal sessions and Mosh stats connections), a clear warning is logged that any host key is accepted without prompting
- **Persistent settings warning**: turning off “Verify SSH host keys” shows a lasting MITM-risk notice under the toggle (en / zh-CN / zh-TW). Default remains on

## [0.4.5] - 2026-07-15

### Fixes
- **Nested ciphertext causing 401 / empty streams**: repeated saves while the keychain was unavailable nested encryption (`enc:v2(enc:v1(...))`); decryption loop bounds now fully unwrap nested blobs within budget instead of dropping valid plaintext or false-failing
- **One bad credential no longer breaks the whole vault load**: field decrypt failures keep the stored value (fail-soft) so the vault still loads and keys remain recoverable after keychain recovery
- **Web search API key**: focus/blur alone no longer deletes a stored key after decrypt failure; clearer encrypt/decrypt error messages
- **Windows DPAPI ciphertext detection**: anti-reencrypt guard previously missed DPAPI keys (`AQAAAN` header) and nested ciphertext after keychain failure — fixed
- **Cursor Agent**: decrypt failures no longer inject ciphertext as an API key into the child process
- Settings Provider / Web search / Cursor: unified re-enter-key prompts on decrypt failure; switching UI language no longer overwrites unsaved keys

## [0.4.4] - 2026-07-14

### Fixes
- **AI 401 / empty streams**: when API key decrypt fails or is not synced to the main process, requests no longer use the `__IPC_SECURED__` placeholder; fail fast with a re-save-key prompt
- Wait for providers to sync to the main process before send, avoiding auth races
- Clear auth errors when the local key is unavailable (decrypt failure / missing / leftover placeholder)

## [0.4.3] - 2026-07-14

### Fixes
- **API key decrypt**: main process correctly decrypts `enc:v2` local-vault keys; decrypt failure no longer sends ciphertext to the provider (avoids 401 and `…5Q==` tails)
- **Credential placeholder detection**: connection boundaries / cloud-sync guards recognize `enc:v2` so local-vault ciphertext is not sent as a password or uploaded
- Actionable errors for empty model streams (`NoOutputGeneratedError`) and 401s
- Cursor SDK install probe uses `require.resolve` to avoid false “not installed” reports

## [0.4.2] - 2026-07-14

### Fixes
- **API key encryption failure resolved**: when the OS keychain (`safeStorage`) is unavailable, fall back to a local encrypted vault (`enc:v2`) so keys still save after app updates
- macOS still prefers the system keychain and falls back quietly; Settings → System shows the active backend

## [0.4.1] - 2026-07-14

### Improvements
- Theme picker: card previews (background + primary/secondary), Core / All scopes, search and empty states
- Default Snow / Midnight contrast and card depth; sync `ui-snow` / `ui-midnight` terminal palettes
- Unified selection and surface hierarchy across Vault, SFTP, settings nav, AI sidebar, and terminal chrome
- Terminal theme lists support search and clearer swatch previews
- Sync status, toast info, update badges, and drop highlights move onto theme tokens

## [0.4.0] - 2026-07-13

### Features
- “Contact” entry copies the support email
- SSH reconnect uses exponential backoff (from 5s, cap 60s); stop after 10 failures with a manual-reconnect prompt
- Local/dynamic port forwards reuse an already-authenticated terminal SSH session (no second password/2FA)
- Importing FIDO2 security keys (`sk-*`) prompts to use ssh-agent auth instead

### Changes

## [0.3.0] - 2026-07-13

### Fixes
- API key encryption failures when saving AI providers are no longer swallowed; a clear localized error appears under the API key field

## [0.2.9] - 2026-07-13

### Features
- macOS auto-update: install by replacing the bundle after download, bypassing Squirrel limits for unsigned apps (from 0.2.9 all platforms can auto-upgrade)

### Fixes
- App icon keeps the official rounded plate so light/dark presentation stays consistent

## [0.2.8] - 2026-07-13

### Fixes
- Windows packages that exited silently on launch: re-embed integrity hashes after asar rewrite, with CI checks to prevent regressions
- Update install progress and errors visible on all platforms

## [0.2.7] - 2026-07-13

### Fixes
- Windows release architecture: safe x64 installer packaging

## [0.2.6] - 2026-07-12

### Security
- Packaged tray windows ignore `VITE_DEV_SERVER_URL` and block navigation / new windows
- Preload no longer trusts the dev server as an origin inside `app.asar`
- Bump DOMPurify 3.3.2 and undici 6.23.0 for reachable XSS / zip-bomb DoS fixes
- afterPack repairs ASAR integrity hashes and Info.plist to avoid instant macOS crash on launch

### Fixes
- Telnet auto-login integration tests wait for a prompt before asserting completion

## [0.2.5] - 2026-07-12

### Fixes
- Fix “Restart now” no-op: update-install quit is no longer cancelled by before-quit dirty checks
- Clear errors when “Restart and update” fails; platforms without auto-install open Releases as fallback

## [0.2.4] - 2026-07-12

### Security
- Stop saving when credential encryption is unavailable — no plaintext fallback
- SSH deep links off by default; reject URLs with passwords; require confirm before connect
- OSC52 clipboard off by default
- Tighten Electron CSP; enable ASAR integrity and security fuses
- Remove macOS disable-library-validation entitlement

## [0.2.3] - 2026-07-11

### Fixes
- Packaged `app://` hostnames lowercased by Chromium no longer break preload injection (terminal, SFTP, settings, file pickers, port forwards)
- Align main/settings windows and permission checks on `app://magiesterminal` so clipboard and local fonts work again

## [0.2.2] - 2026-07-11

### Fixes
- Host detail “Select Color Theme” nested ScrollArea blocked theme clicks; single scroller + pointerdown select
- SSH/local key file dialogs now parent correctly so macOS file pickers appear
- Settings window opens under the `app://` protocol
- Sidebar and package icons use the new asset set

## [0.2.1] - 2026-07-11

### CI/CD
- Re-enable macOS and Windows auto-build (unsigned) for more out-of-box packages

## [0.2.0] - 2026-07-11

### Features
- Auto-update IPC broadcasts to all windows (main + settings)
- Unified manual check and auto-update state machine
- “Check for updates” in settings shows live download progress
- Auto-check via electron-updater ~5s after launch
- Auto-download when a new version is found (`autoDownload=true`)
- Persistent toast when download completes (“Restart now” to install)
- Error toast on download failure with a Releases fallback
- Settings → System progress bar driven by `useUpdateCheck`

### Design notes
- `broadcastToAllWindows` replaces single-sender IPC delivery
- `manualCheckStatus` tracks manual-check UI; layered with `autoDownloadStatus` by priority
- `SettingsSystemTab` is a pure consumer of `useUpdateCheck`
- Global IPC listeners register once in `autoUpdateBridge.init()`
- `autoInstallOnAppQuit=false` — user initiates restart

### SettingsSystemTabProps interface
- Removed: `autoDownloadStatus`, `downloadPercent`
- Added: `updateState`, `checkNow`, `installUpdate`, `openReleasePage`

### Notes
- Applies to packaged apps (Windows NSIS, macOS dmg/zip, Linux AppImage); dev needs `forceDevUpdateConfig=true` + `dev-app-update.yml`
- Legacy `hasUpdate` toast is suppressed while auto-download is active

### CI / build
- Prefer free Linux packages when macOS/Windows signing is unavailable
- Linux x64 (AlmaLinux 8): Clang preferred, gcc-toolset-13 fallback
- Linux arm64 (Debian Bullseye): `clang-14 + lld-14`
- Release job can publish from Linux artifacts alone
- Soften deb artifact checks to warnings when a platform is skipped
