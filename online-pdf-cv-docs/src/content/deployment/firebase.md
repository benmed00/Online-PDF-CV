# Déploiement sur Firebase

Ce document fournit des instructions détaillées pour déployer l'application Node.js Express "Online-PDF-CV" sur Firebase Hosting.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/) (version >= 16.17.1)
- [Firebase CLI](https://firebase.google.com/docs/cli) (installable via npm)

## Configuration de Firebase

1. **Initialiser Firebase dans votre projet :**
   Ouvrez votre terminal et exécutez la commande suivante dans le répertoire de votre projet :

   ```bash
   firebase init
   ```

   Sélectionnez les options appropriées pour votre projet, notamment "Hosting".

2. **Configurer le fichier `firebase.json` :**
   Assurez-vous que le fichier `firebase.json` contient les paramètres suivants :

   ```json
   {
     "hosting": {
       "public": "public",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```

3. **Configurer votre projet Firebase :**
   Assurez-vous que votre projet Firebase est correctement configuré dans le fichier `.firebaserc`. Cela devrait inclure l'ID de votre projet Firebase.

## Déploiement de l'application

Pour déployer votre application, exécutez les commandes suivantes dans votre terminal :

1. **Installer les dépendances :**

   ```bash
   npm install
   ```

2. **Déployer sur Firebase :**

   ```bash
   npm run deploy
   ```

## Accéder à votre application

Après un déploiement réussi, vous pouvez accéder à votre application à l'URL fournie par Firebase Hosting, généralement sous la forme :

```url
https://<your-project-id>.firebaseapp.com/
```

## Résolution des problèmes

Si vous rencontrez des problèmes lors du déploiement, vérifiez les messages d'erreur dans le terminal et assurez-vous que toutes les configurations sont correctes. Vous pouvez également consulter la [documentation de Firebase](https://firebase.google.com/docs) pour plus d'informations.
