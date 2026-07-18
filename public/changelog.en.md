# Changelog

## [0.5.1] - 2026-07-18

### Release
- Packaging and distribution release aligned with the 0.5.x line (installers and auto-update metadata on MgTerminal-releases)

## [0.5.0] - 2026-07-17

### Features
- **Terminal Hex/Raw stream diagnostics panel**: optional per-byte view of session I/O for encoding / escape-sequence troubleshooting
- **JSON host data source**: pull host inventories from a local JSON file or HTTP(S) (CMDB / Ansible / custom API style); metadata only, secrets rejected; optional HTTP auth headers
- **Host inventory share & import**: export metadata-only lists for team handoff (including Ansible YAML); import from clipboard
- **Named workspace templates**: save host bindings, split layouts, optional cwd/startup commands; apply from the quick switcher
- **Connection log bookmarks**: bookmark replay positions with notes and search; log list shows bookmark counts
- **Port-forward live channel view**: per-connection source, target, and byte counters for local/remote/dynamic forwards
- **Script onOutput action extensions**: on match — desktop notification, sound, mark tab, or start session recording
- **Safe paste & precise broadcast**: multi-line paste delay / wait-for-prompt / dangerous-command confirm; broadcast to workspace / selection / group / window
- **System OpenSSH channel enhancements**: GSSAPI/Kerberos and post-quantum (PQ) algorithms via system OpenSSH

### Windows ARM64
- **win-arm64 packages ship mosh / ET**: MoshMagies 0.1.9 and EternalTerminal 6.2.10 native Windows arm64 binaries
- **win-arm64 dedicated auto-update channel**: metadata uses `latest-arm64.yml` so arm64 no longer follows x64 updates

## [0.4.10] - 2026-07-17

### Features
- **SSH connection diagnostics hub**: host editor “Test connection” + “Run diagnostics” on failure — DNS / TCP / jump / host key / auth / SFTP steps
- **SSH Agent first-class auth**: pick Agent auth, list key fingerprints, preferred identity; connection log records the method used
- **Multi-host health snapshot**: Vault one-shot latency, auth, and load/mem/disk checks; filter unhealthy hosts and run scripts
- **SFTP reliability phase 1**: resume, auto-retry with backoff, persistent transfer queue, optional SHA-256 verify
- **Productization onboarding**: first-run empty-Vault steps; command-palette actions; empty-state migration tips; first successful connection tips; README feature matrix

### Fixes
- Existing Vaults no longer show first-run onboarding; health-check auth failures close jump connections correctly

## [0.4.9] - 2026-07-17

### Improvements
- **Release and auto-update sources moved to a dedicated releases repo**: packages and update metadata publish to MgTerminal-releases; site download and in-app update UX unchanged; older clients keep receiving updates via redirect

## [0.4.8] - 2026-07-16

### Features
- **Quick Connect supports EternalTerminal**: ET entry in the wizard (SSH port + ET service port, default 2022); ET client binaries bundled (macOS / Linux / Windows x64)
- **Credential self-check**: Settings → System → Credential protection “Self-check” — encrypt/decrypt round-trip plus vault scan listing entries this device cannot decrypt
- **Windows ARM64 installer debut**: win-arm64 build (mosh/et bundling and arm64-specific update channel completed in 0.5.0)
- **Session restore expiry cleanup**: restore layouts older than 14 days are discarded at startup

### Fixes
- **Russian UI**: 203 missing strings filled (scripts / automation / recording); Simplified Chinese +3; full-alignment tests added
- Quick Connect custom mosh-server path now applies to host config

### Improvements
- SFTP select-all (Cmd/Ctrl+A) and list rendering share one visibility rule
- README macOS notes match unsigned shipping (Gatekeeper steps; in-app update unaffected)

## [0.4.7] - 2026-07-15

### Features
- **UI languages expanded to 10**: aligned with the website — added Japanese / Korean / German / French / Spanish / Portuguese (existing en / ru / zh-CN / zh-TW kept)
- Settings → Appearance → Language lists every supported language; uncovered strings still fall back to English

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
