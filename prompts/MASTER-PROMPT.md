# MASTER PROMPT - FABRIKAGE INDUSTRIAL SOFTWARE PRODUCTION
## Vollständige Aufgabenliste - Automatische Abarbeitung

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV  
**DATUM:** 2025-01-27

---

## 🎯 HAUPTAUFGABEN

### 1. Digitalnotator - Vollständige Umsetzung nach Dokumentation ✅

**Status:** IN PROGRESS

**Anforderungen:**
- ✅ Alle Menü-Items aus Dokumentation umsetzen
- ✅ Unterschriftsfeld zum Unterzeichnen (Canvas)
- ✅ OCR-System für automatische Dokumentenerkennung
- ✅ Alle Features aus Dokumentation implementieren
- ⏳ Vollständige Dokumentation durchgehen und Lücken schließen

**Dokumentation:**
- `CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/NOTAR-INTEGRATION.md`
- `BUILDTOOLS-NOTAR-VERIFIZIERUNG-KONZEPT.md`
- `FABRIKAGE-DIGITALNOTATOR-COMPLETE-IMPLEMENTATION.md`

**Implementierung:**
- `CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar-complete.html`

---

### 2. Console-Cache-System - Webseiten-Fehler erkennen ✅

**Status:** COMPLETED

**Anforderungen:**
- ✅ Erkennt weiße Seiten automatisch
- ✅ Erkennt leere Seiten (öffnet aber keinen Inhalt)
- ✅ Erkennt Browser-Fehler
- ✅ Cache-System funktioniert
- ✅ Integration in alle HTML-Dateien

**Implementierung:**
- `js/console-cache-system.js`
- Automatisch zu allen HTML-Dateien hinzugefügt

---

### 3. System zum Testen aller Webseiten ✅

**Status:** COMPLETED

**Anforderungen:**
- ✅ Testet alle HTML-Dateien automatisch
- ✅ Erkennt weiße Seiten
- ✅ Erkennt leere Seiten
- ✅ Erkennt fehlende Inhalte
- ✅ Erstellt detaillierte Reports

**Implementierung:**
- `FABRIKAGE-TEST-ALL-WEBSITES.ps1`

---

### 4. Alle Webseiten-Fehler beheben ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ Weiße Seiten beheben
- ⏳ Leere Seiten beheben
- ⏳ Seiten ohne Inhalt beheben
- ⏳ Browser-Fehler beheben
- ⏳ Console-Fehler beheben

**Vorgehen:**
1. Test-Script ausführen
2. Report analysieren
3. Fehler automatisch beheben
4. Erneut testen

---

### 5. Apple-Pi System - Lokales Setup ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ Grundarchitektur dokumentieren
- ⏳ Spec Mirror (A-Z JSON/YAML Schemas)
- ⏳ Containerisierung (fin-core, ins-core, house-core, notary-core)
- ⏳ API Gateway (Traefik/Nginx)
- ⏳ Client-Integration (macOS/iOS)
- ⏳ Notary Workflow (Hashes, PDFs, Export ZIP)
- ⏳ Security Layer (Client Certs, Backups, VPN)
- ⏳ Hardware-Dokumentation (Raspberry Pi, HATs, Dummy-Anleitung)

**Komponenten:**
- **AA:** Allgemeiner Account/Identity
- **BA:** Bankkonto
- **BV:** Bank + Versicherung Link
- **AV:** Allianz-Versicherung
- **BB:** Budget & Bilanz
- **EE:** Energie (Solar, Brennstoffzelle)
- **EI:** Einkommen/Investitionen
- **HH:** Haushalt gesamt
- **NN:** Notar / Notator
- **PP:** Produkt-Perfektion (Startup)
- **TT:** TTTT-Branding / Manifest
- **VV:** Verifikation
- **ZZ:** Zeit/Zeitraum-Analytik

---

### 6. Startup-System - Produktübergabe ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ Startup-System erstellen
- ⏳ Produktübergabe an Startups
- ⏳ Startups arbeiten an Perfektionierung
- ⏳ Verifizierung vor Verkauf
- ⏳ Digitalnotator-Integration
- ⏳ Manifest-Offline-Portal
- ⏳ Entwicklungsberichte erfassen
- ⏳ Mathematische Verifikation
- ⏳ Logische Nachprüfung

**Workflow:**
1. Produkt wird an Startup übergeben
2. Startup perfektioniert Produkt
3. Digitalnotator verifiziert vor Verkauf
4. Alle Dokumente werden erfasst
5. Mathematische/Logische Prüfung
6. Verifizierung durch menschlichen Notar
7. Produkt kann verkauft werden

---

### 7. Wissenschaftliche Excel-Formeln ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ Excel-Integration für wissenschaftliche Formeln
- ⏳ Kalkulation, Bilanz, Haushaltsbuch
- ⏳ Einkommen, Auskommen bilanziert
- ⏳ Wissenschaftliche Formeln für:
  - Solarzellen-Berechnungen
  - Brennstoffzellen-Berechnungen
  - Ökonomische Ministrukturen
  - Raumloses Zeit-Continuum
- ⏳ Hardware-Schnittstellen (Raspberry Pi HATs)
- ⏳ Alte Hardware-Karten berücksichtigen
- ⏳ Upgrade-Möglichkeiten

---

### 8. Hardware-Dokumentation - Raspberry Pi ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ Detaillierte Hardware-Anleitung
- ⏳ Raspberry Pi Setup
- ⏳ HATs (Hardware Attached on Top)
- ⏳ Anschlüsse erklären
- ⏳ Für Dummies verständlich
- ⏳ Konfektierung
- ⏳ Selbstbauanleitung
- ⏳ Beschaffungsquellen
- ⏳ Vorgangsweise
- ⏳ Löten (wenn nötig)
- ⏳ Technischer Ausbau
- ⏳ Platinen
- ⏳ Gesamter Produktionsprozess

---

### 9. Offline-Manifest-Portal - PWA ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ PWA-Offline (Service Worker, IndexedDB)
- ⏳ Signierte Pakete (ZIP mit Manifest + Hash)
- ⏳ QR-Verifizierung
- ⏳ Datenformate (JSON/YAML, PDF/HTML)
- ⏳ WebAuthn (Passkeys)
- ⏳ Client-Zertifikate (mTLS)
- ⏳ Token-basierter Gastzugang
- ⏳ Geräte-Code (OAuth Device Flow)
- ⏳ Lokale Konten (Offline)
- ⏳ Alle Daten bleiben User-Eigentum
- ⏳ Keine Daten werden geteilt ohne Bestätigung
- ⏳ Alles bleibt im Localhost

---

### 10. Zugriff und Verifizierung für alle Systeme ⏳

**Status:** PENDING

**Anforderungen:**
- ⏳ WebAuthn (Passkeys) für alle Geräte
- ⏳ Client-Zertifikate (mTLS)
- ⏳ Token-basierter Gastzugang
- ⏳ Geräte-Code (OAuth Device Flow)
- ⏳ Lokale Konten (Offline)
- ⏳ LAN, VPN, Privacy-Routen
- ⏳ Tor/I2P optional
- ⏳ Rollenmodell (Gast, Verifiziert, Betreiber, Auditor, Notar)
- ⏳ Barrierefreiheit (WCAG)
- ⏳ Mehrsprachigkeit

---

## 🔄 AUTOMATISCHE ABARBEITUNG

**Regeln:**
- Nach jeder Implementation: Prompt-Scanner ausführen
- Offene Tasks automatisch erkennen
- Sichere Routine-Schritte automatisch ausführen
- Status dokumentieren
- Fortschritt protokollieren

**Sichere Auto-Schritte:**
- ✅ Lint/Format (ESLint, Prettier)
- ✅ Typecheck (TypeScript)
- ✅ Tests (Schnelltests)
- ✅ Docs (README/Architecture)
- ✅ Mirror (Fehlerfreien Code speichern)
- ✅ Evidence (Coverage, SBOM)

**Nicht automatisch:**
- ❌ Public Contracts ändern ohne Migration
- ❌ Sicherheitsrelevante Konfigurationen
- ❌ Dateien außerhalb Fabrikage-Kerne

---

## 📋 AKZEPTANZKRITERIEN

### Digitalnotator:
- [x] Alle 8 Menü-Items vorhanden
- [x] Unterschriftsfeld (Canvas) funktioniert
- [x] OCR-System integriert
- [ ] Vollständige Dokumentation durchgearbeitet
- [ ] Alle Features aus Dokumentation implementiert

### Console-Cache-System:
- [x] Erkennt weiße Seiten
- [x] Erkennt leere Seiten
- [x] Erkennt Browser-Fehler
- [x] Cache-System funktioniert
- [x] Integration in alle HTML-Dateien

### Website-Test-System:
- [x] Testet alle HTML-Dateien
- [x] Erstellt Reports
- [x] Erkennt Probleme automatisch

### Webseiten-Fehler:
- [ ] Alle weißen Seiten behoben
- [ ] Alle leeren Seiten behoben
- [ ] Alle Browser-Fehler behoben
- [ ] Alle Console-Fehler behoben

### Apple-Pi System:
- [ ] Spec Mirror erstellt
- [ ] Containerisierung implementiert
- [ ] API Gateway konfiguriert
- [ ] Client-Integration erstellt
- [ ] Security Layer implementiert
- [ ] Hardware-Dokumentation erstellt

### Startup-System:
- [ ] Startup-System erstellt
- [ ] Produktübergabe implementiert
- [ ] Verifizierung integriert
- [ ] Entwicklungsberichte erfasst
- [ ] Mathematische Verifikation
- [ ] Logische Nachprüfung

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---
