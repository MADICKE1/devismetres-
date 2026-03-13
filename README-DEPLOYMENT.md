# 🚀 DEVIS-IA Pro - Guide de Déploiement

Application SaaS complète pour génération de devis de construction avec IA.

---

## 📦 Architecture

### Stack Technique
- **Frontend** : React 18 + Tailwind CSS
- **Backend** : Node.js/Express (optionnel - l'app fonctionne en standalone)
- **IA** : Claude API (vision + langage)
- **Base de données** : PostgreSQL
- **Déploiement** : Vercel, AWS Amplify, ou Docker

---

## 🔧 Installation Locale

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Anthropic pour la clé API Claude

### Étape 1 : Créer un projet React

```bash
npx create-react-app devis-ia-pro
cd devis-ia-pro
```

### Étape 2 : Installer les dépendances

```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Étape 3 : Copier le code

1. Remplacer le contenu de `src/App.jsx` par le code de `devis-ia-app.jsx`
2. Configurer Tailwind dans `tailwind.config.js` :

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Étape 4 : Démarrer en local

```bash
npm start
```

L'application est accessible sur `http://localhost:3000`

---

## 📡 Configuration Backend API

### Créer un serveur Express simple

**`backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const client = new Anthropic();

// Endpoint: Upload plan et génération devis
app.post('/api/devis/generate', upload.single('file'), async (req, res) => {
  try {
    const { projectName, surface, floors, region, difficulty } = req.body;

    // Analyser le plan avec Claude Vision
    const analysisPrompt = `Vous êtes un expert en construction. Analysez ce plan architectural et fournissez:
    - Surface totale estimée
    - Éléments détectés (murs, portes, fenêtres, escaliers)
    - Recommandations structurelles
    - Quantitatifs (m², ml, m³)
    
    Format réponse JSON`;

    const message = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Projet: ${projectName}
Surface déclarée: ${surface} m²
Étages: ${floors}
Région: ${region}
Difficulté: ${difficulty}

${analysisPrompt}`
            }
          ]
        }
      ]
    });

    const analysis = message.content[0].text;

    // Calculer les coûts
    const grosOeuvre = Math.floor(surface * 450);
    const secondOeuvre = Math.floor(surface * 280);
    const total = grosOeuvre + secondOeuvre;

    // Retourner le devis
    res.json({
      projectName,
      surface,
      floors,
      region,
      date: new Date().toISOString().split('T')[0],
      analysis,
      totals: {
        grosOeuvre,
        secondOeuvre,
        total
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Export PDF
app.post('/api/devis/export-pdf', async (req, res) => {
  try {
    const { devisData } = req.body;
    // Générer PDF avec PDFKit ou similaire
    // À implémenter selon vos besoins
    res.json({ message: 'PDF généré' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});
```

### Installer les dépendances backend

```bash
npm install express cors multer @anthropic-ai/sdk
npm install -D nodemon
```

---

## 🌐 Déploiement sur Vercel

### Option 1 : Déploiement simple (Recommended)

**Étape 1 :** Créer un repo GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/devis-ia-pro.git
git push -u origin main
```

**Étape 2 :** Connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer "Import Project"
3. Sélectionner votre repo GitHub
4. Configurer les variables d'environnement :

```
REACT_APP_API_URL=https://votre-backend.com
REACT_APP_CLAUDE_API_KEY=sk-ant-...
```

5. Cliquer "Deploy"

---

## 🐳 Déploiement avec Docker

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=postgresql://user:password@db:5432/devis_ia
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=devis_ia
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Déployer avec Docker

```bash
docker-compose up -d
```

---

## 🔐 Variables d'Environnement

Créer un fichier `.env.local` :

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLAUDE_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:password@localhost:5432/devis_ia
JWT_SECRET=your_secret_key
```

---

## 📊 Configuration Base de Données PostgreSQL

### Schéma SQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  surface DECIMAL(10,2) NOT NULL,
  floors INTEGER,
  region VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devis (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  gros_oeuvre DECIMAL(15,2) NOT NULL,
  second_oeuvre DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP
);

CREATE INDEX idx_user_projects ON projects(user_id);
CREATE INDEX idx_project_devis ON devis(project_id);
```

---

## 🔌 Intégration API Claude

### Exemple d'appel

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY,
});

async function analyzeArchitecturalPlan(imageBase64) {
  const message = await client.messages.create({
    model: "claude-opus-4-1",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Analysez ce plan architectural et fournissez:
1. Surface totale
2. Quantités (m², m³, ml)
3. Estimation des coûts gros œuvre et second œuvre
Format: JSON`,
          },
        ],
      },
    ],
  });

  return message.content[0].text;
}
```

---

## 🚀 AWS Amplify Deployment

```bash
# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Initialiser Amplify
amplify init

# Ajouter authentification
amplify add auth

# Ajouter API
amplify add api

# Publier
amplify push
amplify publish
```

---

## 📈 Monitoring et Logs

### Vercel
- Dashboard : https://vercel.com/dashboard
- Logs : Console Vercel en temps réel
- Analytics : Vitesse de chargement, erreurs

### AWS CloudWatch
```bash
aws logs tail /aws/lambda/devis-ia --follow
```

---

## 🔒 Sécurité

- [ ] Utiliser HTTPS partout
- [ ] Configurer CORS correctement
- [ ] Hasher les mots de passe avec bcrypt
- [ ] Valider les inputs côté serveur
- [ ] Rate limiting sur l'API
- [ ] Chiffrer les données sensibles
- [ ] Implémenter l'authentification JWT

---

## 📧 Configuration Email (Nodemailer)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Envoyer devis par email
await transporter.sendMail({
  from: 'contact@devis-ia.pro',
  to: user.email,
  subject: 'Votre devis DEVIS-IA Pro',
  html: `<h1>${devis.projectName}</h1><p>Total: ${devis.total}€</p>`
});
```

---

## 📞 Support et Contact

- **Email** : contact@devis-ia.pro
- **Téléphone** : +33 1 XX XX XX XX
- **Documentation** : https://docs.devis-ia.pro
- **Status** : https://status.devis-ia.pro

---

## 📝 Licence

Propriétaire - Tous droits réservés DEVIS-IA Pro 2024

---

## ✅ Checklist de Déploiement

- [ ] Tests locaux complets
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] Clés API Claude valides
- [ ] HTTPS activé
- [ ] CORS configuré
- [ ] Logs configurés
- [ ] Monitoring actif
- [ ] Backup automatiques
- [ ] Plan de continuité

Bon déploiement ! 🎉
