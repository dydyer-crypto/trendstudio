# Intégrations Réseaux Sociaux - TrendStudio

## Vue d'ensemble

TrendStudio prend en charge la publication automatique sur les principales plateformes de réseaux sociaux : YouTube, Instagram, TikTok, Twitter, Facebook et LinkedIn.

## Plateformes Supportées

### YouTube
- **Authentification** : OAuth 2.0
- **Scopes requis** :
  - `https://www.googleapis.com/auth/youtube.upload`
  - `https://www.googleapis.com/auth/youtube.readonly`
- **Fonctionnalités** :
  - Upload de vidéos
  - Définition du titre, description, tags
  - Paramètres de confidentialité (public, privé, non listé)
  - Upload de miniature personnalisée

### Instagram
- **Authentification** : OAuth 2.0 (Basic Display API)
- **Scopes requis** :
  - `user_profile`
  - `user_media`
- **Fonctionnalités** :
  - Publication d'images
  - Publication de vidéos (court format)
  - Gestion des légendes
- **Note** : Nécessite Instagram Business API pour publication complète

### TikTok
- **Authentification** : OAuth 2.0
- **Scopes requis** :
  - `user.info.basic`
  - `video.upload`
- **Fonctionnalités** :
  - Upload de vidéos
  - Définition du titre et description
  - Paramètres de confidentialité
  - Configuration des interactions (commentaires, duets, stitches)

### Twitter/X
- **Authentification** : OAuth 2.0
- **Scopes requis** :
  - `tweet.write`
  - `users.read`
  - `media.upload`
- **Fonctionnalités** :
  - Publication de tweets textuels
  - Upload d'images (max 4 par tweet)
  - Upload de vidéos
  - Support des threads et citations

### Facebook
- **Authentification** : OAuth 2.0
- **Scopes requis** :
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `publish_video`
- **Fonctionnalités** :
  - Publication sur les pages Facebook
  - Support texte, images et vidéos
  - Gestion de la visibilité (public, amis, etc.)
  - Liens et articles

### LinkedIn
- **Authentification** : OAuth 2.0
- **Scopes requis** :
  - `w_member_social`
  - `rw_organization_admin`
- **Fonctionnalités** :
  - Publication d'articles textuels
  - Upload d'images
  - Partage de liens d'articles
  - Gestion de la visibilité (public, réseau)

## Configuration OAuth

### Variables d'environnement requises

```env
# YouTube
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Instagram
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# TikTok
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_id
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Twitter
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
VITE_TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook
VITE_FACEBOOK_CLIENT_ID=your_facebook_client_id
VITE_FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# LinkedIn
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### URLs de redirection

Toutes les plateformes utilisent la même URL de redirection :
```
https://yourdomain.com/api/auth/:platform/callback
```

## Architecture des APIs

### SocialAuth Service
Gère l'authentification OAuth pour toutes les plateformes :
- Génération d'URLs d'autorisation
- Échange de codes contre des tokens
- Rafraîchissement automatique des tokens
- Validation des permissions

### SocialPublisher Service
Orchestre la publication sur les différentes plateformes :
- Validation des credentials et permissions
- Routage vers le bon client API
- Gestion des erreurs et logging
- Mise à jour du statut des publications

### Clients API spécifiques
Chaque plateforme a son propre client :
- `YouTubeAPIClient` : Gestion YouTube Data API v3
- `InstagramAPIClient` : Gestion Instagram Basic Display API
- `TikTokAPIClient` : Gestion TikTok for Developers API
- `TwitterAPIClient` : Gestion Twitter API v2
- `FacebookAPIClient` : Gestion Facebook Graph API
- `LinkedInAPIClient` : Gestion LinkedIn API

## Gestion des Tokens

### Stockage
Les tokens sont stockés de manière chiffrée dans Supabase Vault.

### Expiration et Rafraîchissement
- Vérification automatique avant chaque publication
- Rafraîchissement automatique si expiré
- Désactivation automatique en cas d'échec de rafraîchissement

### Sécurité
- Chiffrement AES-256 des tokens
- Rotation périodique recommandée
- Validation des scopes avant publication

## Gestion des Erreurs

### Types d'erreurs courants
- **Token expiré** : Rafraîchissement automatique ou reconnexion manuelle
- **Permissions insuffisantes** : Reconnexion avec les bons scopes
- **Limite API dépassée** : Retry avec backoff exponentiel
- **Contenu rejeté** : Validation côté client avant publication

### Messages utilisateur
Tous les messages d'erreur sont traduits en français et fournis de manière claire et actionable.

## Publication Programmée

### Cron Job
- Fonction Supabase Edge pour traitement automatique
- Exécution toutes les minutes
- Fenêtre de 5 minutes pour éviter les publications manquées

### Statuts des publications
- `draft` : En attente de programmation
- `scheduled` : Programmée pour publication
- `published` : Publiée avec succès
- `cancelled` : Échec de publication

## Debugging et Monitoring

### Logs structurés
- Logs détaillés pour chaque étape de publication
- Identification par post ID et plateforme
- Timestamps et niveaux de log

### Métriques à surveiller
- Taux de succès des publications
- Temps de réponse des APIs
- Fréquence des erreurs de token

## Déploiement

### Configuration par plateforme
1. Créer une app OAuth sur chaque plateforme
2. Configurer les URLs de redirection
3. Obtenir les clés client/secret
4. Configurer les variables d'environnement
5. Tester les flux OAuth

### Séquence de déploiement
1. Configurer les apps OAuth
2. Déployer le code
3. Tester les connexions
4. Activer la publication programmée

## Support et Dépannage

### Problèmes courants
- **Popups bloquées** : Vérifier les bloqueurs de popups
- **Scopes manquants** : Reconnecter avec toutes les permissions
- **APIs en maintenance** : Attendre la résolution côté plateforme

### Contacts
- Documentation technique : Ce fichier
- Issues : GitHub repository
- Support : support@trendstudio.com