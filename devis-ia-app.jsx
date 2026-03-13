import React, { useState, useEffect } from 'react';
import { Upload, FileText, Zap, BarChart3, LogOut, Plus, Menu, X, Eye, Download, Trash2, Check, Lock, Star } from 'lucide-react';

export default function DevisIAApp() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Immeuble Résidentiel 5 Étages',
      date: '2024-03-10',
      status: 'completed',
      surface: '2500 m²',
      total: '2 180 000 €',
      grosOeuvre: '1 426 000 €',
      secondOeuvre: '754 000 €'
    },
    {
      id: 2,
      name: 'Bureau Moderne 3000 m²',
      date: '2024-03-08',
      status: 'completed',
      surface: '3000 m²',
      total: '1 850 000 €',
      grosOeuvre: '1 100 000 €',
      secondOeuvre: '750 000 €'
    }
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    surface: '',
    floors: '',
    region: 'Île-de-France',
    difficulty: 'normal'
  });

  const [generatedDevis, setGeneratedDevis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'STARTER',
      price: '29',
      period: '/mois',
      description: 'Pour débuter',
      color: 'from-blue-500 to-cyan-500',
      features: [
        { text: '5 devis/mois', included: true },
        { text: 'Plans jusqu\'à 1000 m²', included: true },
        { text: 'Export PDF basique', included: true },
        { text: 'API (10 appels/jour)', included: false },
        { text: 'Base prix personnalisée', included: false },
        { text: 'Support prioritaire', included: false },
        { text: 'Historique illimité', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'PROFESSIONNEL',
      price: '99',
      period: '/mois',
      description: 'Plus populaire',
      color: 'from-orange-500 to-red-500',
      features: [
        { text: '50 devis/mois', included: true },
        { text: 'Plans illimités', included: true },
        { text: 'Export (PDF, Excel, JSON)', included: true },
        { text: 'API (500 appels/jour)', included: true },
        { text: 'Base prix personnalisée', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Historique illimité', included: true }
      ]
    },
    {
      id: 'enterprise',
      name: 'ENTREPRISE',
      price: 'Sur devis',
      period: '',
      description: 'Solutions custom',
      color: 'from-purple-600 to-pink-600',
      features: [
        { text: 'Devis illimités', included: true },
        { text: 'API sans limite', included: true },
        { text: 'Intégration ERP/Métré', included: true },
        { text: 'Formation équipe', included: true },
        { text: 'Support 24/7', included: true },
        { text: 'Customisation complète', included: true },
        { text: 'Rapports analytiques', included: true }
      ]
    }
  ];

  const generateDevis = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const grosOeuvre = Math.floor(newProject.surface * 450);
      const secondOeuvre = Math.floor(newProject.surface * 280);
      const total = grosOeuvre + secondOeuvre;

      setGeneratedDevis({
        projectName: newProject.name,
        surface: newProject.surface,
        floors: newProject.floors,
        region: newProject.region,
        date: new Date().toLocaleDateString('fr-FR'),
        details: {
          grosOeuvre: {
            fondations: {
              volume: Math.floor(newProject.surface * 0.18),
              unite: 'm³',
              prixUnitaire: '280 €/m³',
              sousTotal: Math.floor(newProject.surface * 0.18 * 280)
            },
            structure: {
              volume: Math.floor(newProject.surface * 0.25),
              unite: 'm²',
              prixUnitaire: '350 €/m²',
              sousTotal: Math.floor(newProject.surface * 0.25 * 350)
            },
            facades: {
              volume: Math.floor(newProject.surface * 1.28),
              unite: 'm²',
              prixUnitaire: '125 €/m²',
              sousTotal: Math.floor(newProject.surface * 1.28 * 125)
            }
          },
          secondOeuvre: {
            cloisons: {
              longueur: Math.floor(newProject.surface * 0.34),
              unite: 'ml',
              prixUnitaire: '80 €/ml',
              sousTotal: Math.floor(newProject.surface * 0.34 * 80)
            },
            menuiseries: {
              quantite: Math.floor(newProject.surface * 0.048),
              unite: 'pcs',
              prixUnitaire: '1500 €/pcs',
              sousTotal: Math.floor(newProject.surface * 0.048 * 1500)
            },
            revêtements: {
              volume: Math.floor(newProject.surface * 1.28),
              unite: 'm²',
              prixUnitaire: '85 €/m²',
              sousTotal: Math.floor(newProject.surface * 1.28 * 85)
            }
          }
        },
        totals: {
          grosOeuvre,
          secondOeuvre,
          total
        }
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('landing');
    setUserPlan(null);
  };

  const handleSelectPlan = (planId) => {
    if (planId === 'enterprise') {
      alert('Contactez notre équipe commerciale : contact@devis-ia.pro');
    } else {
      setUserPlan(planId);
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  };

  // PAGE LANDING
  if (!isLoggedIn && currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/50 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-lg">D</div>
                <span className="text-xl font-bold">DEVIS-IA Pro</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <nav className="hidden lg:flex gap-8">
                <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-400 transition">Fonctionnalités</button>
                <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-400 transition">Tarifs</button>
                <button onClick={() => setCurrentPage('signin')} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition">Se connecter</button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Devis de Construction en
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent"> 30 secondes</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Analysez vos plans architecturaux et générez des devis détaillés avec IA. Gros œuvre, second œuvre, estimations précises.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('signin')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition transform hover:scale-105"
                >
                  Démarrer gratuitement
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-blue-400/50 rounded-lg font-bold text-lg hover:bg-blue-500/10 transition"
                >
                  En savoir plus
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-3xl rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-32 bg-slate-700/50 rounded-lg border border-blue-400/20 flex items-center justify-center text-slate-400">
                    <Upload size={40} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-4 bg-gradient-to-r from-blue-500 to-transparent rounded opacity-70"></div>
                    <div className="h-4 bg-gradient-to-r from-orange-500 to-transparent rounded opacity-60"></div>
                    <div className="h-4 bg-gradient-to-r from-red-500 to-transparent rounded opacity-50"></div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-slate-400">Analyse en cours...</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
          <h2 className="text-4xl font-bold text-center mb-16">Fonctionnalités Puissantes</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 size={40} />,
                title: 'Métré Automatique',
                desc: 'Analyse IA des plans pour calculs précis de surfaces, volumes et linéaires'
              },
              {
                icon: <Zap size={40} />,
                title: 'Génération Instantanée',
                desc: 'Créez des devis détaillés en quelques secondes avec coûts estimés'
              },
              {
                icon: <FileText size={40} />,
                title: 'Export Professionnel',
                desc: 'Téléchargez en PDF, Excel ou JSON pour vos intégrations'
              }
            ].map((feat, i) => (
              <div key={i} className="group p-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 hover:border-orange-500/50 transition">
                <div className="text-orange-500 mb-4 group-hover:scale-110 transition">{feat.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-slate-300">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
          <h2 className="text-4xl font-bold text-center mb-4">Tarification Transparente</h2>
          <p className="text-center text-slate-400 mb-16 text-lg">Choisissez le plan adapté à vos besoins</p>
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition transform hover:scale-105 ${
                  plan.id === 'pro' ? 'lg:scale-105 ring-2 ring-orange-500' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10`}></div>
                <div className="relative bg-slate-800/80 backdrop-blur border border-slate-700/50 p-8 h-full flex flex-col">
                  {plan.id === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 px-4 py-1 rounded-full text-sm font-bold">
                      ⭐ Plus populaire
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-400">{plan.period}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 rounded-lg font-bold mb-8 transition ${
                      plan.id === 'pro'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/50'
                        : 'border border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    Commencer
                  </button>
                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check size={20} className="text-green-500" />
                        ) : (
                          <Lock size={20} className="text-slate-600" />
                        )}
                        <span className={feature.included ? 'text-white' : 'text-slate-500'}>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-blue-500/20 mt-20 py-12 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
            <p>© 2024 DEVIS-IA Pro. Tous droits réservés.</p>
            <p className="text-sm mt-4">contact@devis-ia.pro | +33 1 XX XX XX XX</p>
          </div>
        </footer>
      </div>
    );
  }

  // PAGE SIGN IN
  if (!isLoggedIn && currentPage === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-slate-800/80 backdrop-blur border border-blue-500/30 p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold">D</div>
              <h1 className="text-2xl font-bold">DEVIS-IA Pro</h1>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="vous@example.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <button
                onClick={() => {
                  setUserPlan('pro');
                  setIsLoggedIn(true);
                  setCurrentPage('dashboard');
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/50 transition"
              >
                Se connecter
              </button>
              
              <button
                onClick={() => setCurrentPage('landing')}
                className="w-full py-2 border border-slate-600 rounded-lg font-semibold hover:bg-slate-700/50 transition"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE DASHBOARD
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold">D</div>
                <span className="text-xl font-bold">DEVIS-IA Pro</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-800/50 border border-orange-500/30 rounded-lg text-sm">
                  Plan: <span className="font-bold text-orange-400">{userPlan === 'pro' ? 'PROFESSIONNEL' : 'STARTER'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <div className="flex gap-4 mb-12 border-b border-slate-700/50">
            <button
              onClick={() => setGeneratedDevis(null)}
              className={`px-6 py-3 font-semibold transition ${
                !generatedDevis ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nouveau Devis
            </button>
            <button
              onClick={() => setGeneratedDevis(null)}
              className={`px-6 py-3 font-semibold transition ${
                generatedDevis ? 'text-slate-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes Projets ({projects.length})
            </button>
          </div>

          {!generatedDevis ? (
            <>
              {/* Générateur de Devis */}
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Formulaire */}
                <div className="rounded-2xl bg-slate-800/50 border border-blue-500/20 p-8">
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Plus size={28} className="text-orange-500" />
                    Nouveau Devis
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nom du projet</label>
                      <input
                        type="text"
                        placeholder="Ex: Immeuble Résidentiel 5 Étages"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Surface (m²)</label>
                        <input
                          type="number"
                          placeholder="Ex: 2500"
                          value={newProject.surface}
                          onChange={(e) => setNewProject({ ...newProject, surface: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Étages</label>
                        <input
                          type="number"
                          placeholder="Ex: 5"
                          value={newProject.floors}
                          onChange={(e) => setNewProject({ ...newProject, floors: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Région</label>
                      <select
                        value={newProject.region}
                        onChange={(e) => setNewProject({ ...newProject, region: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      >
                        <option>Île-de-France</option>
                        <option>Provence-Alpes-Côte d'Azur</option>
                        <option>Auvergne-Rhône-Alpes</option>
                        <option>Nouvelle-Aquitaine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Niveau de difficulté</label>
                      <select
                        value={newProject.difficulty}
                        onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="facile">Facile</option>
                        <option value="normal">Normal</option>
                        <option value="difficile">Difficile</option>
                      </select>
                    </div>

                    <button
                      onClick={generateDevis}
                      disabled={!newProject.name || !newProject.surface || !newProject.floors || isGenerating}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin">⚙️</div>
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Zap size={20} />
                          Générer le Devis
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Projets récents */}
                <div className="rounded-2xl bg-slate-800/50 border border-blue-500/20 p-8">
                  <h3 className="text-xl font-bold mb-6">Projets Récents</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-orange-500/50 transition cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{proj.name}</h4>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Complété</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{proj.date} • {proj.surface}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">Gros Œuvre</p>
                            <p className="font-bold text-orange-400">{proj.grosOeuvre}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Second Œuvre</p>
                            <p className="font-bold text-blue-400">{proj.secondOeuvre}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Affichage du devis généré
            <div className="rounded-2xl bg-slate-800/50 border border-blue-500/20 p-12">
              {/* En-tête */}
              <div className="mb-12 pb-8 border-b border-slate-700/50">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{generatedDevis.projectName}</h1>
                    <p className="text-slate-400">Généré le {generatedDevis.date}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => alert('PDF téléchargé !')}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition"
                    >
                      <Download size={20} />
                      PDF
                    </button>
                    <button
                      onClick={() => alert('Excel téléchargé !')}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition"
                    >
                      <Download size={20} />
                      Excel
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Surface</p>
                    <p className="text-2xl font-bold">{generatedDevis.surface} m²</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Étages</p>
                    <p className="text-2xl font-bold">{generatedDevis.floors}</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Région</p>
                    <p className="text-2xl font-bold">{generatedDevis.region.split('-')[0]}</p>
                  </div>
                </div>
              </div>

              {/* Totaux */}
              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 p-8">
                  <p className="text-slate-300 mb-2">Gros Œuvre</p>
                  <p className="text-4xl font-bold text-orange-400">
                    {generatedDevis.totals.grosOeuvre.toLocaleString()} €
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-8">
                  <p className="text-slate-300 mb-2">Second Œuvre</p>
                  <p className="text-4xl font-bold text-blue-400">
                    {generatedDevis.totals.secondOeuvre.toLocaleString()} €
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-8">
                  <p className="text-slate-300 mb-2">Total</p>
                  <p className="text-4xl font-bold text-green-400">
                    {generatedDevis.totals.total.toLocaleString()} €
                  </p>
                </div>
              </div>

              {/* Détails */}
              <div className="grid lg:grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-orange-400">Gros Œuvre - Détail</h3>
                  <div className="space-y-4">
                    {Object.entries(generatedDevis.details.grosOeuvre).map(([key, item]) => (
                      <div key={key} className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50">
                        <h4 className="font-semibold mb-3 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex justify-between">
                            <span>Quantité</span>
                            <span className="font-semibold">{item.volume} {item.unite}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix unitaire</span>
                            <span className="font-semibold">{item.prixUnitaire}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-600/50">
                            <span>Sous-total</span>
                            <span className="font-bold text-orange-400">{item.sousTotal.toLocaleString()} €</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-blue-400">Second Œuvre - Détail</h3>
                  <div className="space-y-4">
                    {Object.entries(generatedDevis.details.secondOeuvre).map(([key, item]) => (
                      <div key={key} className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50">
                        <h4 className="font-semibold mb-3 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex justify-between">
                            <span>Quantité</span>
                            <span className="font-semibold">{item.volume || item.quantite} {item.unite}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix unitaire</span>
                            <span className="font-semibold">{item.prixUnitaire}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-600/50">
                            <span>Sous-total</span>
                            <span className="font-bold text-blue-400">{item.sousTotal.toLocaleString()} €</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-8 border-t border-slate-700/50">
                <button
                  onClick={() => setGeneratedDevis(null)}
                  className="flex-1 py-3 border border-slate-600 rounded-lg font-semibold hover:bg-slate-700/50 transition"
                >
                  Nouveau Devis
                </button>
                <button
                  onClick={() => {
                    const newProj = {
                      id: projects.length + 1,
                      name: generatedDevis.projectName,
                      date: new Date().toISOString().split('T')[0],
                      status: 'completed',
                      surface: `${generatedDevis.surface} m²`,
                      total: `${generatedDevis.totals.total.toLocaleString()} €`,
                      grosOeuvre: `${generatedDevis.totals.grosOeuvre.toLocaleString()} €`,
                      secondOeuvre: `${generatedDevis.totals.secondOeuvre.toLocaleString()} €`
                    };
                    setProjects([newProj, ...projects]);
                    setGeneratedDevis(null);
                    alert('Devis sauvegardé !');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition"
                >
                  Sauvegarder le Projet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
