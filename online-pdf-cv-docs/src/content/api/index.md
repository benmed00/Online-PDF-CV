# Documentation de l'API - Online-PDF-CV

Contrat canonique : **`GET /api/openapi.yaml`** (OpenAPI 3.1).  
Documentation interactive (serveur Express uniquement) : **`GET /api/docs`** (Swagger UI).

## Points de terminaison

### 1. Lister les versions du CV

- **URL** : `/api/versions`
- **Méthode** : `GET`
- **Description** : Retourne la liste des slugs de versions PDF disponibles.

```
GET /api/versions HTTP/1.1
Host: benyakoub-cv.firebaseapp.com
```

```json
{
  "versions": ["default", "technical"],
  "count": 2,
  "baseUrl": "https://benyakoub-cv.firebaseapp.com/resume/"
}
```

### 2. Télécharger le CV (PDF)

- **URL** : `/resume` ou `/resume/{version}`
- **Méthode** : `GET`
- **Description** : Récupère le fichier PDF du CV (version par défaut ou nommée).

```
GET /resume/technical HTTP/1.1
Host: benyakoub-cv.firebaseapp.com
```

```
HTTP/1.1 200 OK
Content-Type: application/pdf
```

### 3. Analyseur (serveur Express uniquement)

Ces routes nécessitent `npm start` (non disponibles sur Firebase statique seul) :

| Route                  | Méthode | Description                     |
| ---------------------- | ------- | ------------------------------- |
| `/api/analyzer/config` | GET     | Indicateurs OpenAI / VirusTotal |
| `/api/analyze`         | POST    | Analyse de texte de CV (JSON)   |
| `/api/extract-resume`  | POST    | Upload + extraction de texte    |

Voir le fichier OpenAPI pour les schémas complets des requêtes et réponses.

## Erreurs JSON

Les routes `/api/*` renvoient des erreurs au format :

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Can't find /api/unknown on this server!"
}
```

## Notes

- Les anciens points `/api/resume` et `/api/info` **n'existent plus** — utilisez `/resume` et `/api/versions`.
- Référence anglaise : [wiki/API-Reference.md](https://github.com/benmed00/Online-PDF-CV/blob/master/wiki/API-Reference.md)
