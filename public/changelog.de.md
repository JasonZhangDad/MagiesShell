# Änderungsprotokoll

## [0.5.1] - 2026-07-18

### Release
- Installer und Auto-Update-Metadaten der 0.5.x-Linie (MgTerminal-releases)

## [0.5.0] - 2026-07-17

### Funktionen
- **Terminal-Hex/Raw-Diagnosepanel**: optionale Byte-Ansicht der Session-E/A
- **JSON-Host-Datenquelle**: Inventare aus lokaler JSON-Datei oder HTTP(S); nur Metadaten; HTTP-Auth-Header
- **Host-Inventar teilen & importieren**: Metadaten-Export (inkl. Ansible YAML); Zwischenablage-Import
- **Benannte Workspace-Vorlagen**: Host-Bindungen, Splits, optionales cwd/Startkommando; Quick Switcher
- **Verbindungslog-Lesezeichen**: Positionen + Notizen + Suche
- **Portforward-Live-Kanalansicht**: Quelle, Ziel, Bytes pro Verbindung
- **Skript-onOutput-Aktionen**: Benachrichtigung, Ton, Tab markieren, Aufzeichnung starten
- **Sicheres Einfügen & präziser Broadcast**: Verzögerung / Prompt-Warte / Gefahrenbestätigung; Workspace/Auswahl/Gruppe/Fenster
- **System-OpenSSH-Kanal**: GSSAPI/Kerberos und Post-Quantum (PQ)

### Windows ARM64
- **win-arm64 mit mosh / ET**: native Binaries MoshMagies 0.1.9 und EternalTerminal 6.2.10
- **Eigener Auto-Update-Kanal**: `latest-arm64.yml` statt x64-Follow

## [0.4.10] - 2026-07-17

### Funktionen
- **SSH-Diagnosezentrum**: „Verbindung testen“ + „Diagnose“ — DNS / TCP / Jump / Host-Key / Auth / SFTP
- **SSH-Agent erstklassig**: Agent-Auth, Fingerprints, bevorzugte Identität
- **Multi-Host-Health-Snapshot**: Latenz, Auth, Load/Mem/Disk
- **SFTP-Zuverlässigkeit Phase 1**: Resume, Auto-Retry, persistente Warteschlange, optionales SHA-256
- **Onboarding**: leerer Vault, Befehlspalette, Leere-Zustands-Hinweise

### Fehlerbehebungen
- Bestehende Vaults ohne First-Run; Jump bei Health-Auth-Fehler korrekt schließen

## [0.4.9] - 2026-07-17

### Verbesserungen
- **Release/Auto-Update-Quelle in dediziertes Releases-Repo**: MgTerminal-releases; Site-Download und In-App-Update unverändert

## [0.4.8] - 2026-07-16

### Funktionen
- **Quick Connect EternalTerminal**: ET im Assistenten (SSH-Port + ET-Port Standard 2022); Binaries gebündelt
- **Credential-Selbsttest**: Einstellungen → System → Credential-Schutz
- **Windows-ARM64-Installer**: win-arm64 (mosh/et + Kanal in 0.5.0 vervollständigt)
- **Session-Restore-Ablauf**: Layouts älter als 14 Tage verwerfen

### Fehlerbehebungen
- **Russische UI**: 203 fehlende Strings; zh-CN +3; Alignment-Tests
- Custom mosh-server-Pfad in Quick Connect greift

### Verbesserungen
- SFTP Alles-auswählen und Listen-Sichtbarkeit vereinheitlicht
- README-macOS an unsignierte Auslieferung angeglichen

## [0.4.7] - 2026-07-15

### Funktionen
- **UI-Sprachen auf 10 erweitert**: an die Website angeglichen — Japanisch / Koreanisch / Deutsch / Französisch / Spanisch / Portugiesisch hinzugefügt (bestehende en / ru / zh-CN / zh-TW bleiben)
- Einstellungen → Erscheinungsbild → Sprache listet alle unterstützten Sprachen; nicht übersetzte Strings fallen auf Englisch zurück

## [0.4.6] - 2026-07-15

### Sicherheit
- **SSH-Host-Key-Prüfung aus ist nicht mehr still**: bei deaktiviertem `verifyHostKeys` (Terminalsitzungen und Mosh-Statistikverbindungen) wird klar protokolliert, dass beliebige Host-Keys ohne Nachfrage akzeptiert werden
- **Dauerhafte Einstellungswarnung**: das Ausschalten von „SSH-Host-Keys prüfen“ zeigt einen bleibenden MITM-Hinweis unter dem Schalter (en / zh-CN / zh-TW). Standard bleibt an

## [0.4.5] - 2026-07-15

### Fehlerbehebungen
- **Verschachtelte Chiffretexte verursachen 401 / leere Streams**: wiederholte Speichern, während die Keychain fehlte, verschachtelten die Verschlüsselung (`enc:v2(enc:v1(...))`); Entschlüsselungsschleifen entpacken verschachtelte Blobs im Budget vollständig
- **Ein defektes Credential bricht nicht mehr die gesamte Vault-Ladung**: Feldentschlüsselungsfehler behalten den Speicherwert (fail-soft)
- **Web-Suche-API-Schlüssel**: Fokus/Blur löschen nach Entschlüsselungsfehler keinen gespeicherten Schlüssel mehr; klarere Fehler
- **Windows-DPAPI-Chiffretexterkennung**: Anti-Reencrypt-Guard verpasste DPAPI-Keys (`AQAAAN`-Header) — behoben
- **Cursor Agent**: Entschlüsselungsfehler injizieren keinen Chiffretext als API-Key in den Kindprozess
- Einstellungen Provider / Web-Suche / Cursor: einheitliche Neu-Eingabe-Hinweise; Sprachwechsel überschreibt ungespeicherte Keys nicht

## [0.4.4] - 2026-07-14

### Fehlerbehebungen
- **AI 401 / leere Streams**: bei Key-Entschlüsselungsfehler oder fehlender Sync zum Main-Prozess keine Anfragen mit `__IPC_SECURED__`-Platzhalter; sofortiger Fehler und Neu-Speichern-Hinweis
- Vor dem Senden auf Provider-Sync zum Main-Prozess warten, Auth-Races vermeiden
- Klare Auth-Fehler, wenn der lokale Key fehlt (Entschlüsselung / fehlend / Platzhalter)

## [0.4.3] - 2026-07-14

### Fehlerbehebungen
- **API-Key-Entschlüsselung**: Main-Prozess entschlüsselt `enc:v2`-Local-Vault-Keys korrekt; bei Fehler kein Chiffretext an den Anbieter
- **Credential-Platzhalter**: Verbindungsgrenzen / Cloud-Sync-Guards erkennen `enc:v2`
- Handlungsfähige Fehler bei leeren Modellströmen (`NoOutputGeneratedError`) und 401
- Cursor-SDK-Installationsprüfung nutzt `require.resolve`, weniger False Positives

## [0.4.2] - 2026-07-14

### Fehlerbehebungen
- **API-Key-Verschlüsselungsfehler behoben**: wenn die OS-Keychain (`safeStorage`) fehlt, automatischer Fallback auf lokalen verschlüsselten Vault (`enc:v2`)
- macOS bevorzugt die System-Keychain und fällt still zurück; Einstellungen → System zeigt das aktive Backend

## [0.4.1] - 2026-07-14

### Verbesserungen
- Theme-Auswahl: Kartenvorschauen, Core / Alle, Suche und Leerzustände
- Standard Snow / Midnight mit besserem Kontrast; `ui-snow` / `ui-midnight` Terminalpaletten synchron
- Einheitliche Auswahl- und Flächenhierarchie in Vault, SFTP, Einstellungsnav, AI-Sidebar, Terminal-Chrome
- Terminal-Themenlisten mit Suche und klareren Farbvorschauen
- Sync-Status, Toasts, Update-Badges und Drop-Highlights auf Theme-Tokens

## [0.4.0] - 2026-07-13

### Funktionen
- „Kontakt“ kopiert die Support-E-Mail
- SSH-Reconnect mit exponentiellem Backoff (ab 5s, max. 60s); nach 10 Fehlern manueller Reconnect-Hinweis
- Lokale/dynamische Portweiterleitungen nutzen die authentifizierte Terminal-SSH-Sitzung wieder (kein zweites Passwort/2FA)
- Import von FIDO2-Sicherheitsschlüsseln (`sk-*`) weist auf ssh-agent hin

### Änderungen

## [0.3.0] - 2026-07-13

### Fehlerbehebungen
- API-Key-Verschlüsselungsfehler beim Speichern von AI-Anbietern werden nicht mehr verschluckt; lokalisierte Fehlermeldung unter dem Feld

## [0.2.9] - 2026-07-13

### Funktionen
- macOS-Auto-Update: Installation durch Bundle-Ersatz nach Download (umgeht Squirrel-Limits unsignierter Apps; ab 0.2.9 alle Plattformen auto-upgrade)

### Fehlerbehebungen
- App-Icon behält die offizielle abgerundete Platte in Hell/Dunkel

## [0.2.8] - 2026-07-13

### Fehlerbehebungen
- Windows-Pakete beendeten sich still beim Start: Integritätshashes nach asar-Rewrite neu einbetten, CI-Checks
- Update-Installationsfortschritt und Fehler auf allen Plattformen sichtbar

## [0.2.7] - 2026-07-13

### Fehlerbehebungen
- Windows-Release-Architektur: sicheres x64-Installer-Packaging

## [0.2.6] - 2026-07-12

### Sicherheit
- Verpackte Tray-Fenster ignorieren `VITE_DEV_SERVER_URL` und blockieren Navigation / neue Fenster
- Preload vertraut dem Dev-Server in `app.asar` nicht mehr als Origin
- DOMPurify 3.3.2, undici 6.23.0 gegen XSS / Zip-Bomb-DoS
- afterPack repariert ASAR-Integritätshashes und Info.plist gegen sofortigen macOS-Crash

### Fehlerbehebungen
- Telnet-Auto-Login-Integrationstests warten auf Prompt vor Abschluss-Assertion

## [0.2.5] - 2026-07-12

### Fehlerbehebungen
- „Jetzt neu starten“ wirkungslos: Update-Install-Quit wird nicht mehr durch before-quit-Dirty-Checks abgebrochen
- Klare Fehler bei „Neu starten und aktualisieren“; Plattformen ohne Auto-Install öffnen Releases

## [0.2.4] - 2026-07-12

### Sicherheit
- Speichern stoppen, wenn Credential-Verschlüsselung fehlt — kein Klartext-Fallback
- SSH-Deep-Links standardmäßig aus; URLs mit Passwort ablehnen; Bestätigung vor Connect
- OSC52-Zwischenablage standardmäßig aus
- Electron-CSP verschärfen; ASAR-Integrität und Security-Fuses aktivieren
- macOS-disable-library-validation-Entitlement entfernen

## [0.2.3] - 2026-07-11

### Fehlerbehebungen
- Paketierte `app://`-Hostnamen, von Chromium kleingeschrieben, brechen Preload-Injection nicht mehr (Terminal, SFTP, Einstellungen, Dateiauswahl, Portweiterleitung)
- Haupt-/Einstellungsfenster und Berechtigungsprüfungen auf `app://magiesterminal` ausrichten

## [0.2.2] - 2026-07-11

### Fehlerbehebungen
- Host-Detail „Select Color Theme“ mit verschachteltem ScrollArea blockierte Klicks; ein Scroller + pointerdown
- SSH-/lokale Schlüssel-Dialoge parenten korrekt, macOS-Dateiauswahl erscheint
- Einstellungsfenster öffnet unter `app://`
- Sidebar- und Paket-Icons mit neuem Asset-Set

## [0.2.1] - 2026-07-11

### CI/CD
- macOS- und Windows-Auto-Build (unsigniert) wieder aktiviert für mehr Out-of-Box-Pakete

## [0.2.0] - 2026-07-11

### Funktionen
- Auto-Update-IPC an alle Fenster (Haupt + Einstellungen)
- Einheitliche manuelle Prüfung und Auto-Update-State-Machine
- „Nach Updates suchen“ in Einstellungen zeigt Live-Download-Fortschritt
- Auto-Check per electron-updater ~5s nach Start
- Auto-Download bei neuer Version (`autoDownload=true`)
- Dauer-Toast nach Download („Jetzt neu starten“)
- Fehler-Toast bei Download-Fehler mit Releases-Fallback
- Fortschrittsbalken Einstellungen → System über `useUpdateCheck`

### Designnotizen
- `broadcastToAllWindows` ersetzt Single-Sender-IPC
- `manualCheckStatus` trackt manuelle Prüfung; Priorität mit `autoDownloadStatus`
- `SettingsSystemTab` ist reiner Consumer von `useUpdateCheck`
- Globale IPC-Listener einmal in `autoUpdateBridge.init()`
- `autoInstallOnAppQuit=false` — Nutzer startet Neustart

### SettingsSystemTabProps-Schnittstelle
- Entfernt: `autoDownloadStatus`, `downloadPercent`
- Hinzugefügt: `updateState`, `checkNow`, `installUpdate`, `openReleasePage`

### Hinweise
- Gilt für gepackte Apps (Windows NSIS, macOS dmg/zip, Linux AppImage); Dev braucht `forceDevUpdateConfig=true` + `dev-app-update.yml`
- Legacy-`hasUpdate`-Toast während Auto-Download unterdrückt

### CI / Build
- Kostenlose Linux-Pakete bevorzugen, wenn Signing fehlt
- Linux x64 (AlmaLinux 8): Clang bevorzugt, gcc-toolset-13-Fallback
- Linux arm64 (Debian Bullseye): `clang-14 + lld-14`
- Release-Job kann nur aus Linux-Artefakten veröffentlichen
- Deb-Prüfungen bei übersprungenen Plattformen zu Warnings abschwächen
