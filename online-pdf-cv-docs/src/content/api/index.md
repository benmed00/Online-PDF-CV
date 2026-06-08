# Documentation de l'API - Online-PDF-CV

Cette documentation décrit les points de terminaison de l'API disponibles pour l'application Online-PDF-CV.

## Points de terminaison

### 1. Obtenir le PDF du CV

- **URL** : `/api/resume`
- **Méthode** : `GET`
- **Description** : Récupère le fichier PDF du CV.
- **Exemple de requête** :

```
GET /api/resume HTTP/1.1
Host: benyakoub-cv.firebaseapp.com
```

- **Exemple de réponse** :

```
HTTP/1.1 200 OK
Content-Type: application/pdf

[Contenu du fichier PDF]
```

### 2. Obtenir des informations sur l'application

- **URL** : `/api/info`
- **Méthode** : `GET`
- **Description** : Récupère des informations sur l'application, y compris la version et les fonctionnalités.
- **Exemple de requête** :

```
GET /api/info HTTP/1.1
Host: benyakoub-cv.firebaseapp.com
```

- **Exemple de réponse** :

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "version": "1.0.0",
  "features": [
    "Hébergement de CV PDF",
    "Accès via URL",
    "Intégration Google Analytics"
  ]
}
```

## Erreurs

### 1. Erreur 404 - Non trouvé

- **Description** : Le point de terminaison demandé n'existe pas.
- **Exemple de réponse** :

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Not Found"
}
```

### 2. Erreur 500 - Erreur interne du serveur

- **Description** : Une erreur s'est produite sur le serveur.
- **Exemple de réponse** :

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal Server Error"
}
```

## Conclusion

Cette API permet d'accéder facilement au CV PDF et aux informations de l'application. Assurez-vous de gérer les erreurs correctement lors de l'utilisation des points de terminaison.
