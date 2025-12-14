# API-Spezifikation

## 1. Übersicht
Die Fabrikplattform stellt eine RESTful API zur Verfügung, die folgende Hauptbereiche abdeckt:
- Authentifizierung und Autorisierung
- Maschinensteuerung
- Produktionsdaten
- Wartungsmanagement
- Benutzerverwaltung

## 2. Basis-URL
```
https://api.fabrikplattform.de/v1
```

## 3. Authentifizierung
```http
POST /auth/token
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Response
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## 4. Endpunkte

### 4.1 Maschinensteuerung

#### Maschinen abrufen
```http
GET /machines
Authorization: Bearer {token}
```

#### Maschinenstatus aktualisieren
```http
PATCH /machines/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "RUNNING|STOPPED|MAINTENANCE",
  "reason": "string"
}
```

### 4.2 Produktionsdaten

#### Produktionsdaten abrufen
```http
GET /production/data?machine={id}&start={timestamp}&end={timestamp}
Authorization: Bearer {token}
```

#### Produktionsdaten hochladen
```http
POST /production/data
Authorization: Bearer {token}
Content-Type: application/json

{
  "machine_id": "string",
  "timestamp": "2025-12-14T14:30:00Z",
  "metrics": {
    "temperature": 25.5,
    "vibration": 0.5,
    "output": 120
  }
}
```

## 5. Fehlercodes

| Code | Bedeutung | Beschreibung |
|------|-----------|--------------|
| 200 | OK | Erfolgreiche Abfrage |
| 201 | Created | Ressource erfolgreich erstellt |
| 400 | Bad Request | Ungültige Anfrage |
| 401 | Unauthorized | Nicht authentifiziert |
| 403 | Forbidden | Keine Berechtigung |
| 404 | Not Found | Ressource nicht gefunden |
| 500 | Internal Server Error | Serverfehler |

## 6. Rate Limiting
- Maximal 100 Anfragen pro Minute pro API-Schlüssel
- Bei Überschreitung: HTTP 429 Too Many Requests

## 7. Versionierung
- API-Versionierung über URL-Pfad: `/v1/...`
- Neue Versionen werden mindestens 6 Monate parallel unterstützt

## 8. Sicherheit
- Alle Endpunkte erfordern HTTPS
- JWT-basierte Authentifizierung
- Rate Limiting
- Eingabevalidierung
- CORS-Richtlinien

## 9. Beispieldaten

### Maschine
```json
{
  "id": "machine-123",
  "name": "CNC-Fräse 1",
  "type": "MILLING",
  "status": "RUNNING",
  "last_maintenance": "2025-11-30T08:00:00Z",
  "next_maintenance": "2025-12-28T08:00:00Z",
  "location": "Halle 1, Position A-12"
}
```

### Produktionsauftrag
```json
{
  "id": "order-456",
  "product_id": "prod-789",
  "quantity": 1000,
  "status": "IN_PROGRESS",
  "start_time": "2025-12-14T08:00:00Z",
  "estimated_completion": "2025-12-14T16:30:00Z",
  "assigned_machines": ["machine-123", "machine-124"]
}
```

## 10. SDKs und Bibliotheken
- JavaScript/TypeScript: `@fabrikplattform/api-client`
- Python: `fabrikplattform-client`
- Java: `com.fabrikplattform:api-client`

## 11. Änderungshistorie

| Version | Datum | Beschreibung |
|---------|-------|--------------|
| 1.0.0 | 2025-12-14 | Erste stabile Version |
| 1.1.0 | 2026-01-15 | Neue Endpunkte für Wartungsmanagement |

---
*Dokument erstellt am: 14.12.2025*
*Version: 1.0.0*
