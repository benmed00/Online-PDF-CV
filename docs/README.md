# CV PDF en Ligne

> Une application Node.js Express simple et élégante pour héberger votre CV en PDF

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📝 Table des Matières

- [Aperçu](#aperçu)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Architecture](#architecture)
- [Technologies](#technologies)

## 🎯 Aperçu

Cette application permet d'héberger facilement votre CV au format PDF en ligne via Firebase Hosting. Accessible à l'adresse : <https://benyakoub-cv.firebaseapp.com/>

### ✨ Caractéristiques Principales

- 📄 Hébergement simple de CV PDF
- 🚀 Déploiement automatisé via GitHub Actions
- 📱 Design responsive
- 🔍 Intégration Google Analytics

## ⚙️ Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/votre-username/Online-PDF-CV.git
cd Online-PDF-CV
```

2. Installer les dépendances :

```bash
npm install
```

3. Démarrer en développement :

```bash
npm start
```

## 🚀 Déploiement

Le déploiement est automatisé via GitHub Actions vers Firebase Hosting.

1. Configuration Firebase :

```bash
npm install -g firebase-tools
firebase login
```

2. Déploiement manuel :

```bash
npm run deploy
```

## 🏗️ Architecture

```
Online-PDF-CV/
├── bin/              # Scripts de démarrage
├── public/           # Fichiers statiques (PDF, HTML)
├── routes/           # Routes Express
├── views/            # Templates Jade
├── .github/          # Configuration GitHub Actions
└── app.js           # Point d'entrée de l'application
```

## 🛠️ Technologies

- **Runtime**: Node.js ≥16.17.1
- **Framework**: Express.js 4.20.0
- **Template**: Jade 1.11.0
- **Hébergement**: Firebase
- **CI/CD**: GitHub Actions

### Dépendances Principales

| Package | Version | Description        |
| ------- | ------- | ------------------ |
| express | ^4.20.0 | Framework web      |
| jade    | ~1.11.0 | Moteur de template |
| morgan  | ^1.10.1 | Logger HTTP        |
