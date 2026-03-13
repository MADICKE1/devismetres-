/**
 * DEVIS-IA Pro - Backend Server
 * Express.js + Claude API Integration
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// ============================================
// ANTHROPIC CLIENT
// ============================================

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================
// ROUTES
// ============================================

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Authenticate (Mock - à remplacer par JWT/Auth0)
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  // Mock token - À remplacer par authentification réelle
  const token = Buffer.from(email).toString('base64');
  
  res.json({
    token,
    user: {
      id: 1,
      email,
      plan: 'pro'
    }
  });
});

/**
 * Upload Plan et Analyse avec Claude Vision
 */
app.post('/api/plans/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { projectName, surface, floors, region, difficulty } = req.body;

    // Lire le fichier uploadé
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    // Déterminer le type MIME
    const mimeType = req.file.mimetype === 'application/pdf' ? 'application/pdf' : 'image/jpeg';

    // Analyser avec Claude Vision
    console.log(`📸 Analyse du plan: ${projectName}`);

    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `Vous êtes un expert en construction BTP. Analysez ce plan architectural pour le projet: "${projectName}"
            
Informations du projet:
- Surface: ${surface} m²
- Étages: ${floors}
- Région: ${region}
- Niveau de difficulté: ${difficulty}

Fournissez une analyse JSON avec:
1. "detections": liste des éléments détectés (murs, portes, fenêtres, escaliers, etc.)
2. "surfaces": détail des surfaces par étage/zone
3. "volumes": volumes de béton, maçonnerie estimés (m³)
4. "lineaires": linéaires de murs, cloisons (ml)
5. "estimation_cout_gros_oeuvre": estimation en euros
6. "estimation_cout_second_oeuvre": estimation en euros
7. "observations": recommandations et observations importantes

Réponse UNIQUEMENT en JSON valide.`
            }
          ]
        }
      ]
    });

    const analysisText = message.content[0].text;
    
    // Parser la réponse JSON
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysisText };
    } catch (e) {
      analysis = { raw: analysisText };
    }

    // Calculer les coûts (basés sur les paramètres du projet)
    const surfaceNum = parseFloat(surface);
    const costPerM2Gros = 450; // €/m²
    const costPerM2Second = 280; // €/m²

    const grosOeuvre = Math.floor(surfaceNum * costPerM2Gros);
    const secondOeuvre = Math.floor(surfaceNum * costPerM2Second);

    // Appliquer des majorations selon la difficulté
    const difficultyMultiplier = {
      'facile': 1,
      'normal': 1.1,
      'difficile': 1.25
    }[difficulty] || 1.1;

    const totalGros = Math.floor(grosOeuvre * difficultyMultiplier);
    const totalSecond = Math.floor(secondOeuvre * difficultyMultiplier);

    res.json({
      plan_id: `plan_${Date.now()}`,
      projectName,
      surface,
      floors,
      region,
      difficulty,
      file_path: req.file.filename,
      analysis,
      estimated_costs: {
        gros_oeuvre: totalGros,
        second_oeuvre: totalSecond,
        total: totalGros + totalSecond
      },
      status: 'completed',
      analyzed_at: new Date().toISOString()
    });

    // Nettoyer le fichier uploadé
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'analyse du plan',
      details: error.message
    });
  }
});

/**
 * Générer un Devis Détaillé
 */
app.post('/api/devis/generate', async (req, res) => {
  try {
    const { projectName, surface, floors, region, difficulty } = req.body;

    if (!projectName || !surface || !floors) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const surfaceNum = parseFloat(surface);

    // Générer le devis avec Claude
    console.log(`📋 Génération du devis: ${projectName}`);

    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Générez un devis détaillé de construction pour:
          
Projet: ${projectName}
Surface: ${surfaceNum} m²
Étages: ${floors}
Région: ${region}
Difficulté: ${difficulty}

Fournissez un devis JSON avec la structure suivante:
{
  "gros_oeuvre": {
    "fondations": { "quantite": "X m³", "prix_unitaire": "Y €/m³", "sous_total": "Z €" },
    "structure": { "quantite": "X", "prix_unitaire": "Y €", "sous_total": "Z €" },
    "facades_maconnerie": { "quantite": "X m²", "prix_unitaire": "Y €/m²", "sous_total": "Z €" }
  },
  "second_oeuvre": {
    "cloisons": { "quantite": "X ml", "prix_unitaire": "Y €/ml", "sous_total": "Z €" },
    "menuiseries": { "quantite": "X pcs", "prix_unitaire": "Y €/pcs", "sous_total": "Z €" },
    "revetements": { "quantite": "X m²", "prix_unitaire": "Y €/m²", "sous_total": "Z €" },
    "electricite": { "quantite": "lot", "prix_unitaire": "forfait", "sous_total": "Z €" },
    "plomberie": { "quantite": "lot", "prix_unitaire": "forfait", "sous_total": "Z €" }
  },
  "total_gros_oeuvre": Z,
  "total_second_oeuvre": Z,
  "total_general": Z
}

Réponse UNIQUEMENT en JSON valide.`
        }
      ]
    });

    const devisText = message.content[0].text;
    
    // Parser la réponse
    let devis;
    try {
      const jsonMatch = devisText.match(/\{[\s\S]*\}/);
      devis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      devis = null;
    }

    // Si le parsing échoue, utiliser des valeurs par défaut
    if (!devis) {
      const grosOeuvre = Math.floor(surfaceNum * 450);
      const secondOeuvre = Math.floor(surfaceNum * 280);
      
      devis = {
        gros_oeuvre: {
          fondations: {
            quantite: `${Math.floor(surfaceNum * 0.18)} m³`,
            prix_unitaire: '280 €/m³',
            sous_total: Math.floor(surfaceNum * 0.18 * 280)
          },
          structure: {
            quantite: `${Math.floor(surfaceNum * 0.25)} m²`,
            prix_unitaire: '350 €/m²',
            sous_total: Math.floor(surfaceNum * 0.25 * 350)
          }
        },
        second_oeuvre: {
          cloisons: {
            quantite: `${Math.floor(surfaceNum * 0.34)} ml`,
            prix_unitaire: '80 €/ml',
            sous_total: Math.floor(surfaceNum * 0.34 * 80)
          }
        },
        total_gros_oeuvre: grosOeuvre,
        total_second_oeuvre: secondOeuvre,
        total_general: grosOeuvre + secondOeuvre
      };
    }

    res.json({
      devis_id: `dev_${Date.now()}`,
      projectName,
      surface: surfaceNum,
      floors,
      region,
      difficulty,
      date_generation: new Date().toISOString(),
      devis
    });

  } catch (error) {
    console.error('❌ Erreur génération devis:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération du devis',
      details: error.message
    });
  }
});

/**
 * Exporter en PDF (Mock - à implémenter avec PDFKit)
 */
app.post('/api/devis/export-pdf', async (req, res) => {
  try {
    const { devis_id, projectName, devis } = req.body;

    if (!devis_id || !devis) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }

    // Dans une vraie implémentation, générer le PDF avec PDFKit
    res.json({
      message: 'PDF généré avec succès',
      file_url: `/exports/${devis_id}.pdf`,
      file_name: `${projectName || 'devis'}_${devis_id}.pdf`
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de l\'export PDF',
      details: error.message
    });
  }
});

/**
 * Exporter en Excel (Mock - à implémenter avec XLSX)
 */
app.post('/api/devis/export-excel', async (req, res) => {
  try {
    const { devis_id, projectName, devis } = req.body;

    if (!devis_id || !devis) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }

    // Dans une vraie implémentation, générer l'Excel avec XLSX
    res.json({
      message: 'Excel généré avec succès',
      file_url: `/exports/${devis_id}.xlsx`,
      file_name: `${projectName || 'devis'}_${devis_id}.xlsx`
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de l\'export Excel',
      details: error.message
    });
  }
});

/**
 * Récupérer l'historique des projets
 */
app.get('/api/projects', (req, res) => {
  // Mock data - À remplacer par une vraie requête BDD
  res.json({
    projects: [
      {
        id: 1,
        name: 'Immeuble Résidentiel 5 Étages',
        date: '2024-03-10',
        surface: '2500 m²',
        total: '2 180 000 €',
        status: 'completed'
      },
      {
        id: 2,
        name: 'Bureau Moderne 3000 m²',
        date: '2024-03-08',
        surface: '3000 m²',
        total: '1 850 000 €',
        status: 'completed'
      }
    ]
  });
});

/**
 * Récupérer les statistiques utilisateur
 */
app.get('/api/stats', (req, res) => {
  res.json({
    devis_generated: 24,
    projects_completed: 8,
    total_estimated_value: '15 250 000 €',
    average_project_size: '1912 m²',
    last_generated: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║         🚀 DEVIS-IA Pro - Backend Server           ║
╠════════════════════════════════════════════════════╣
║ ✅ Serveur actif sur http://localhost:${PORT}        ║
║ 📍 Mode: ${process.env.NODE_ENV || 'development'}                              ║
║ 🤖 Claude API: ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}                          ║
╚════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
