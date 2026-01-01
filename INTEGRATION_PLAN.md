# Plan d'Intégration des Nouvelles Fonctionnalités - TrendStudio

## 📋 Vue d'ensemble

Ce document présente le plan d'intégration des fonctionnalités de production, business et gestion au sein de TrendStudio. L'objectif est d'enrichir la plateforme existante avec des outils professionnels pour la création de sites, la gestion de projets et l'analyse SEO.

---

## 🎯 Fonctionnalités Existantes (Déjà Implémentées)

### Générateurs de Contenu IA
- ✅ Générateur Vidéo IA
- ✅ Générateur Image IA
- ✅ Assistant Chat IA
- ✅ Script vers Vidéo
- ✅ Éditeur Vidéo

### Gestion et Analyse
- ✅ Calendrier de Publication (multi-plateformes)
- ✅ Analyse des Tendances (temps réel)
- ✅ Analytics de Performance
- ✅ Tutoriels Interactifs

### Business
- ✅ Programme d'Affiliation (avec tracking)
- ✅ Système de Paiement Stripe
- ✅ Gestion des Crédits
- ✅ Historique des Commandes

### Système
- ✅ Authentification Supabase
- ✅ Support Multilingue (FR/EN)
- ✅ Mode Sombre/Clair
- ✅ Interface Responsive

---

## 🚀 Nouvelles Fonctionnalités à Intégrer

### Phase 1 : Gestion de Projets (Priorité Haute)

#### 1.1 Mes Projets
**Description** : Tableau de bord central pour gérer tous les projets de création de contenu et de sites.

**Fonctionnalités** :
- Vue en grille/liste des projets
- Filtres par statut (En cours, Terminé, Archivé)
- Recherche et tri
- Statistiques par projet (vues, engagement, ROI)
- Actions rapides (Éditer, Dupliquer, Archiver, Supprimer)

**Base de données** :
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'content', 'website', 'seo', 'redesign'
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/projects`
- Composants : ProjectCard, ProjectGrid, ProjectFilters, ProjectStats
- Navigation : Ajouter "Mes Projets" en haut du menu

---

#### 1.2 Laboratoire d'Idées
**Description** : Outil de brainstorming et de recherche d'idées de contenu basé sur l'IA.

**Fonctionnalités** :
- Génération d'idées par niche/thématique
- Analyse de tendances par mot-clé
- Suggestions de sujets viraux
- Sauvegarde des idées favorites
- Export vers Calendrier Éditorial

**Base de données** :
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'video', 'article', 'social', 'website'
  keywords TEXT[],
  trend_score INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'idea', -- 'idea', 'planned', 'in_progress', 'published'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/ideas-lab`
- Composants : IdeaGenerator, IdeaCard, KeywordAnalyzer, TrendMeter
- Intégration : Lien avec Tendances et Calendrier

---

### Phase 2 : Création de Sites (Priorité Haute)

#### 2.1 Constructeur de Site
**Description** : Interface no-code pour créer et configurer des sites web.

**Fonctionnalités** :
- Templates prédéfinis (Blog, E-commerce, Portfolio, Landing Page)
- Éditeur drag-and-drop
- Configuration SEO de base
- Choix de domaine et hébergement
- Prévisualisation en temps réel
- Publication en un clic

**Base de données** :
```sql
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  template TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'maintenance'
  seo_config JSONB DEFAULT '{}',
  design_config JSONB DEFAULT '{}',
  pages JSONB DEFAULT '[]',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE website_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/site-builder`
- Composants : TemplateSelector, PageEditor, SEOPanel, DomainConfig
- Navigation : Ajouter "Constructeur de Site"

---

#### 2.2 Refonte de Site
**Description** : Outils pour analyser et migrer des sites existants.

**Fonctionnalités** :
- Analyse de site existant (structure, SEO, performance)
- Détection des problèmes techniques
- Plan de migration automatique
- Import de contenu
- Comparaison avant/après
- Recommandations d'amélioration

**Base de données** :
```sql
CREATE TABLE site_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  audit_type TEXT NOT NULL, -- 'seo', 'performance', 'security', 'full'
  results JSONB DEFAULT '{}',
  score INTEGER,
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/site-redesign`
- Composants : SiteAnalyzer, AuditReport, MigrationWizard, IssuesList
- Navigation : Ajouter "Refonte de Site"

---

### Phase 3 : SEO et Contenu (Priorité Moyenne)

#### 3.1 Analyse SEO
**Description** : Suite complète d'outils d'audit et d'optimisation SEO.

**Fonctionnalités** :
- Audit SEO on-page
- Analyse de mots-clés
- Suivi de positionnement
- Analyse de backlinks
- Suggestions d'optimisation
- Rapports SEO détaillés

**Base de données** :
```sql
CREATE TABLE seo_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  keywords TEXT[],
  rankings JSONB DEFAULT '{}',
  on_page_score INTEGER,
  technical_score INTEGER,
  backlinks_count INTEGER DEFAULT 0,
  issues JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE keyword_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  position INTEGER,
  search_volume INTEGER,
  difficulty INTEGER,
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/seo-analysis`
- Composants : SEODashboard, KeywordTracker, AuditPanel, RankingChart
- Navigation : Ajouter "Analyse SEO"

---

#### 3.2 Générateur AIO (All-In-One)
**Description** : Module unifié de génération de contenu assistée par IA.

**Fonctionnalités** :
- Génération d'articles de blog
- Création de pages web
- Rédaction de descriptions produits
- Génération de meta descriptions
- Optimisation SEO automatique
- Templates personnalisables
- Export multi-formats

**Base de données** :
```sql
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'article', 'page', 'product', 'meta'
  title TEXT NOT NULL,
  content TEXT,
  seo_optimized BOOLEAN DEFAULT FALSE,
  word_count INTEGER,
  ai_model TEXT,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/generator-aio`
- Composants : ContentTypeSelector, AIEditor, SEOOptimizer, ExportPanel
- Navigation : Ajouter "Générateur AIO"

---

### Phase 4 : Business Avancé (Priorité Moyenne)

#### 4.1 Devis IA
**Description** : Génération automatique de devis commerciaux basés sur l'analyse IA.

**Fonctionnalités** :
- Analyse automatique des besoins client
- Calcul de prix intelligent
- Templates de devis personnalisables
- Génération PDF
- Suivi des devis (envoyé, accepté, refusé)
- Conversion en facture

**Base de données** :
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_type TEXT NOT NULL,
  services JSONB DEFAULT '[]',
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected'
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);
```

**Interface** :
- Page : `/quotes`
- Composants : QuoteGenerator, QuoteEditor, ClientForm, PDFPreview
- Navigation : Ajouter "Devis IA"

---

#### 4.2 Mode Agence
**Description** : Gestion multi-clients et allocation de crédits pour les agences.

**Fonctionnalités** :
- Gestion de clients multiples
- Allocation de crédits par client
- Tableau de bord agence
- Rapports par client
- Facturation groupée
- Gestion d'équipe

**Base de données** :
```sql
CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  credits_allocated INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'inactive'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agency_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'admin', 'manager', 'member'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/agency`
- Composants : ClientList, CreditAllocator, TeamManager, AgencyDashboard
- Navigation : Ajouter "Mode Agence"

---

### Phase 5 : Intégrations et API (Priorité Basse)

#### 5.1 Gestion des API
**Description** : Configuration et gestion des clés API tierces.

**Fonctionnalités** :
- Gestion des clés OpenAI, Anthropic, etc.
- Sélecteur de modèles IA
- Configuration des webhooks
- Intégration CRM (Djaboo)
- Logs d'utilisation API
- Limites et quotas

**Base de données** :
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'djaboo'
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface** :
- Page : `/settings/api`
- Composants : APIKeyManager, ModelSelector, WebhookConfig, UsageLogs
- Navigation : Sous-section dans "Paramètres"

---

#### 5.2 Récupération de Compte
**Description** : Flux complet de réinitialisation de mot de passe.

**Fonctionnalités** :
- Page "Mot de passe oublié"
- Envoi d'email de réinitialisation
- Validation du token
- Changement de mot de passe sécurisé
- Confirmation par email

**Interface** :
- Pages : `/forgot-password`, `/reset-password`
- Composants : ForgotPasswordForm, ResetPasswordForm
- Navigation : Lien sur page de connexion

---

## 📊 Architecture et Organisation

### Structure de Navigation Proposée

```
TrendStudio
├── 🏠 Accueil
├── 📁 Mes Projets ⭐ NOUVEAU
│
├── 🎨 Création de Contenu
│   ├── 🎬 Générateur Vidéo IA
│   ├── 🖼️ Générateur Image IA
│   ├── 💬 Assistant Chat IA
│   ├── 📝 Script vers Vidéo
│   ├── ✂️ Éditeur Vidéo
│   └── 🤖 Générateur AIO ⭐ NOUVEAU
│
├── 🌐 Gestion de Sites ⭐ NOUVEAU
│   ├── 🏗️ Constructeur de Site
│   ├── 🔄 Refonte de Site
│   └── 📊 Analyse SEO
│
├── 📅 Planification
│   ├── 💡 Laboratoire d'Idées ⭐ NOUVEAU
│   ├── 📅 Calendrier Éditorial
│   └── 📈 Tendances
│
├── 📊 Analytics
│   ├── 📊 Performance
│   └── 🔍 Analyse SEO ⭐ NOUVEAU
│
├── 💼 Business
│   ├── 💳 Tarifs
│   ├── 🏢 Mode Agence ⭐ NOUVEAU
│   ├── 📄 Devis IA ⭐ NOUVEAU
│   ├── 👥 Affiliation
│   └── 🧾 Facturation
│
├── 🎓 Tutoriels
└── ⚙️ Paramètres
    ├── 👤 Profil
    ├── 🔑 API & Intégrations ⭐ NOUVEAU
    └── 🌐 Langue & Thème
```

---

## 🗓️ Planning d'Implémentation

### Sprint 1 (Semaine 1-2) : Fondations
- [ ] Créer la table `projects` et les migrations
- [ ] Implémenter la page "Mes Projets"
- [ ] Créer les composants de base (ProjectCard, ProjectGrid)
- [ ] Ajouter la navigation vers "Mes Projets"

### Sprint 2 (Semaine 3-4) : Laboratoire d'Idées
- [ ] Créer la table `ideas` et les migrations
- [ ] Implémenter la page "Laboratoire d'Idées"
- [ ] Intégrer l'API OpenAI pour la génération d'idées
- [ ] Créer le système de sauvegarde et favoris

### Sprint 3 (Semaine 5-6) : Constructeur de Site
- [ ] Créer les tables `websites` et `website_pages`
- [ ] Implémenter la sélection de templates
- [ ] Créer l'éditeur de pages basique
- [ ] Ajouter la configuration SEO

### Sprint 4 (Semaine 7-8) : Analyse SEO
- [ ] Créer les tables `seo_analyses` et `keyword_tracking`
- [ ] Implémenter l'audit SEO on-page
- [ ] Créer le tableau de bord SEO
- [ ] Ajouter le suivi de mots-clés

### Sprint 5 (Semaine 9-10) : Générateur AIO
- [ ] Créer la table `generated_content`
- [ ] Implémenter les templates de contenu
- [ ] Intégrer l'optimisation SEO automatique
- [ ] Ajouter l'export multi-formats

### Sprint 6 (Semaine 11-12) : Refonte de Site
- [ ] Créer la table `site_audits`
- [ ] Implémenter l'analyseur de site
- [ ] Créer le rapport d'audit
- [ ] Ajouter les recommandations IA

### Sprint 7 (Semaine 13-14) : Devis IA
- [ ] Créer les tables `quotes` et `quote_items`
- [ ] Implémenter le générateur de devis
- [ ] Ajouter la génération PDF
- [ ] Créer le système de suivi

### Sprint 8 (Semaine 15-16) : Mode Agence
- [ ] Créer les tables `agency_clients` et `agency_team`
- [ ] Implémenter la gestion multi-clients
- [ ] Créer le tableau de bord agence
- [ ] Ajouter l'allocation de crédits

### Sprint 9 (Semaine 17-18) : Intégrations
- [ ] Créer les tables `api_keys` et `webhooks`
- [ ] Implémenter la gestion des clés API
- [ ] Ajouter le sélecteur de modèles IA
- [ ] Créer la configuration des webhooks

### Sprint 10 (Semaine 19-20) : Finalisation
- [ ] Implémenter la récupération de compte
- [ ] Tests complets de toutes les fonctionnalités
- [ ] Optimisation des performances
- [ ] Documentation utilisateur

---

## 🎨 Considérations de Design

### Cohérence Visuelle
- Utiliser les composants shadcn/ui existants
- Respecter la palette de couleurs actuelle
- Maintenir le système de design tokens
- Assurer la cohérence des icônes (Lucide React)

### Responsive Design
- Mobile-first pour toutes les nouvelles pages
- Adaptation desktop avec layouts appropriés
- Utilisation des breakpoints existants (xl: 1280px)

### Accessibilité
- Respect des normes WCAG AA
- Navigation au clavier
- Contraste des couleurs
- Labels ARIA appropriés

---

## 🔒 Sécurité et Permissions

### Row Level Security (RLS)
Toutes les nouvelles tables doivent implémenter des politiques RLS :

```sql
-- Exemple pour la table projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### Gestion des Clés API
- Chiffrement des clés API avec AES-256
- Stockage sécurisé dans Supabase Vault
- Rotation régulière des clés
- Logs d'utilisation pour audit

---

## 💰 Système de Crédits

### Coûts par Fonctionnalité

| Fonctionnalité | Coût en Crédits |
|----------------|-----------------|
| Génération d'idée (Laboratoire) | 5 crédits |
| Création de site (template) | 50 crédits |
| Audit SEO complet | 20 crédits |
| Génération article AIO | 15 crédits |
| Génération page web | 10 crédits |
| Analyse de site (refonte) | 30 crédits |
| Génération de devis IA | 5 crédits |
| Suivi mots-clés (par mois) | 10 crédits |

### Packs de Crédits Suggérés
- **Starter** : 100 crédits - 9.99€
- **Pro** : 500 crédits - 39.99€ (économie 20%)
- **Business** : 2000 crédits - 129.99€ (économie 35%)
- **Agence** : 10000 crédits - 499.99€ (économie 50%)

---

## 📚 Documentation Requise

### Pour les Développeurs
- [ ] Guide d'architecture des nouvelles fonctionnalités
- [ ] Documentation des API endpoints
- [ ] Schémas de base de données
- [ ] Guide de contribution

### Pour les Utilisateurs
- [ ] Tutoriels interactifs pour chaque nouvelle fonctionnalité
- [ ] FAQ et troubleshooting
- [ ] Vidéos de démonstration
- [ ] Guide de démarrage rapide

---

## 🧪 Tests et Qualité

### Tests Unitaires
- Couverture minimale de 80%
- Tests pour chaque fonction critique
- Mocks pour les appels API externes

### Tests d'Intégration
- Flux utilisateur complets
- Intégrations avec Supabase
- Appels API tiers

### Tests E2E
- Scénarios utilisateur principaux
- Tests multi-navigateurs
- Tests responsive

---

## 🚀 Déploiement

### Environnements
- **Development** : Tests locaux
- **Staging** : Tests pré-production
- **Production** : Version live

### CI/CD
- Déploiement automatique via GitHub Actions
- Tests automatiques avant merge
- Rollback automatique en cas d'erreur

---

## 📈 Métriques de Succès

### KPIs à Suivre
- Nombre de projets créés par utilisateur
- Taux d'utilisation des nouvelles fonctionnalités
- Temps moyen de création d'un site
- Score de satisfaction utilisateur (NPS)
- Taux de conversion (essai → abonnement)
- Revenus générés par fonctionnalité

---

## 🎯 Prochaines Étapes Immédiates

1. **Validation du plan** avec l'équipe
2. **Priorisation** des fonctionnalités selon les besoins business
3. **Création des maquettes** pour les nouvelles interfaces
4. **Setup de l'environnement** de développement
5. **Début du Sprint 1** : Mes Projets

---

## 📞 Contact et Support

Pour toute question sur ce plan d'intégration :
- Documentation technique : Voir `/docs`
- Issues GitHub : Créer un ticket
- Support : support@trendstudio.com

---

**Version** : 1.0  
**Date** : 2025-12-30  
**Auteur** : Équipe TrendStudio  
**Statut** : 📋 En attente de validation
