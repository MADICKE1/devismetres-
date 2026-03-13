# 🚀 DEVIS-IA Pro - Guide de Démarrage Rapide

## ⚡ Installation en 5 minutes

### Option 1️⃣ : Déploiement Local (Recommandé pour tester)

#### Prérequis
- Node.js 18+ installé
- Compte Anthropic avec clé API Claude

#### Étapes

```bash
# 1. Cloner/télécharger le projet
git clone https://github.com/votre-repo/devis-ia-pro.git
cd devis-ia-pro

# 2. Créer le fichier d'environnement
cp .env.example .env.local

# 3. Éditer .env.local avec vos clés
# - REACT_APP_CLAUDE_API_KEY=sk-ant-xxxxx
# - ANTHROPIC_API_KEY=sk-ant-xxxxx

# 4. Installer les dépendances
npm install

# 5. Démarrer en mode développement (frontend + backend)
npm run dev
```

**L'application s'ouvre automatiquement sur** : `http://localhost:3000`

---

### Option 2️⃣ : Déploiement Docker (Production)

#### Prérequis
- Docker et Docker Compose installés

#### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/devis-ia-pro.git
cd devis-ia-pro

# 2. Créer le fichier d'environnement
cp .env.example .env

# 3. Éditer .env avec vos configurations
vim .env

# 4. Lancer les services
docker-compose up -d

# 5. Vérifier le statut
docker-compose ps
```

**Accès** :
- Frontend : `http://localhost:3000`
- Backend API : `http://localhost:5000`
- pgAdmin (debug) : `http://localhost:5050`

---

### Option 3️⃣ : Déploiement sur Vercel (Recommandé pour production)

#### Étapes

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter à Vercel
vercel login

# 3. Déployer
vercel --prod

# 4. Configurer les variables d'environnement dans le dashboard Vercel
# - REACT_APP_CLAUDE_API_KEY
# - REACT_APP_API_URL
```

---

## 📝 Configuration

### Variables d'Environnement Essentielles

```env
# IA/API
REACT_APP_CLAUDE_API_KEY=sk-ant-YOUR_KEY
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY

# Base de données (Docker)
DB_USER=devis_user
DB_PASSWORD=your_password
DATABASE_URL=postgresql://devis_user:password@db:5432/devis_ia

# Backend
PORT=5000
JWT_SECRET=your_secret_key

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

---

## 🧪 Test de l'Application

### 1️⃣ Accéder à l'interface
```
http://localhost:3000
```

### 2️⃣ Se connecter (credentials de test)
```
Email: test@devis-ia.pro
Mot de passe: password123
```

### 3️⃣ Créer un devis de test
- Remplir le formulaire :
  - Nom : "Maison Résidentielle"
  - Surface : 1500 m²
  - Étages : 2
  - Région : Île-de-France
  - Difficulté : Normal

- Cliquer "Générer le Devis"
- Attendre 2-3 secondes pour l'analyse IA
- Voir le résultat avec les montants estimés

---

## 🔌 Tester l'API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Générer un Devis
```bash
curl -X POST http://localhost:5000/api/devis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Immeuble Test",
    "surface": "2500",
    "floors": "5",
    "region": "Île-de-France",
    "difficulty": "normal"
  }'
```

### Récupérer les Projets
```bash
curl http://localhost:5000/api/projects
```

---

## 📦 Structure du Projet

```
devis-ia-pro/
├── frontend/                  # Application React
│   ├── src/
│   │   ├── App.jsx           # Code principal
│   │   └── index.js          
│   └── package.json
├── backend/                   # Serveur Node.js/Express
│   ├── server.js             # Code principal
│   └── package.json
├── docker-compose.yml        # Configuration Docker
├── .env.example              # Variables d'environnement
├── package.json              # Dépendances
└── README.md

```

---

## 🚨 Dépannage

### Erreur : "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : Port déjà utilisé
```bash
# Changer le port dans package.json ou .env
PORT=5001
```

### Erreur : API Key non valide
```bash
# Vérifier la clé dans .env.local
# Regénérer une clé depuis console.anthropic.com
```

### Docker : Services ne démarrent pas
```bash
# Voir les logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Redémarrer
docker-compose restart
```

---

## 📊 Logs et Monitoring

### Frontend (React)
```bash
# Logs en local
npm start
# Voir la console du navigateur (F12)
```

### Backend (Node.js)
```bash
# Logs en local
npm run backend

# Logs Docker
docker-compose logs backend -f
```

### Database (PostgreSQL)
```bash
# Se connecter
docker exec -it devis-ia-db psql -U devis_user -d devis_ia

# Voir les tables
\dt
```

---

## 🔐 Sécurité - Avant la Production

- [ ] Changer tous les mots de passe par défaut
- [ ] Activer HTTPS
- [ ] Configurer CORS correctement
- [ ] Implémenter l'authentification réelle (Auth0/Firebase)
- [ ] Ajouter un rate limiting
- [ ] Valider les inputs côté serveur
- [ ] Configurer les backups automatiques
- [ ] Activer les logs de sécurité
- [ ] Ajouter le monitoring (Sentry/DataDog)

---

## 📈 Prochaines Étapes

1. **Intégration Authentification**
   - Implémenter Auth0 ou Firebase
   - Ajouter JWT tokens

2. **Paiements**
   - Intégrer Stripe pour les forfaits
   - Gérer les souscriptions

3. **Export PDF/Excel**
   - Utiliser PDFKit pour les PDF
   - Utiliser XLSX pour les Excel

4. **Base de Données**
   - Migrer vers PostgreSQL complète
   - Implémenter les migrations Sequelize/Prisma

5. **Notifications**
   - Email de confirmation de devis
   - SMS d'alerte

---

## 💬 Support

- **Email** : support@devis-ia.pro
- **Slack** : [Invitation lien]
- **Docs** : https://docs.devis-ia.pro

---

## 📄 Licence

Propriétaire - Tous droits réservés DEVIS-IA Pro 2024

---

## ✅ Checklist de Production

Avant de mettre en production :

- [ ] Tests unitaires et intégration
- [ ] Vérifier CORS et HTTPS
- [ ] Configurer CDN (CloudFlare)
- [ ] Ajouter monitoring (Sentry)
- [ ] Mettre en place CI/CD (GitHub Actions)
- [ ] Tester la scalabilité
- [ ] Documenter l'API
- [ ] Faire un backup complet
- [ ] Tester la récupération d'erreur
- [ ] Configurer les alertes

---

**Bon déploiement ! 🎉**

Pour toute question : contact@devis-ia.pro
