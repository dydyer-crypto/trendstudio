# Guide de Configuration des APIs Sociales - TrendStudio

## Vue d'ensemble

Ce guide explique comment configurer les applications OAuth nécessaires pour les intégrations de réseaux sociaux dans TrendStudio.

## Prérequis

- Accès administrateur aux comptes développeur de chaque plateforme
- Domaine configuré pour les URLs de redirection
- Variables d'environnement prêtes à recevoir les clés

## 1. YouTube

### Création de l'application
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API YouTube Data API v3
4. Créer des credentials OAuth 2.0 :
   - Type : Application Web
   - Nom : TrendStudio
   - URLs de redirection autorisées :
     - `https://yourdomain.com/api/auth/youtube/callback`

### Scopes configurés
```
https://www.googleapis.com/auth/youtube.upload
https://www.googleapis.com/auth/youtube.readonly
```

### Variables d'environnement
```env
VITE_YOUTUBE_CLIENT_ID=votre_client_id
VITE_YOUTUBE_CLIENT_SECRET=votre_client_secret
```

## 2. Instagram

### Création de l'application
1. Aller sur [Meta for Developers](https://developers.facebook.com/)
2. Créer une nouvelle app ou utiliser une app existante
3. Ajouter Instagram Basic Display
4. Configurer :
   - Instagram App ID
   - URLs de redirection OAuth valides :
     - `https://yourdomain.com/api/auth/instagram/callback`

### Scopes configurés
```
user_profile
user_media
```

### Variables d'environnement
```env
VITE_INSTAGRAM_CLIENT_ID=votre_app_id
VITE_INSTAGRAM_CLIENT_SECRET=votre_app_secret
```

**Note** : Pour une publication complète, Instagram Graph API est recommandé.

## 3. TikTok

### Création de l'application
1. Aller sur [TikTok for Developers](https://developers.tiktok.com/)
2. Créer une nouvelle app
3. Type d'app : App for Business
4. Configurer :
   - Redirect URIs :
     - `https://yourdomain.com/api/auth/tiktok/callback`
   - Scopes requis

### Scopes configurés
```
user.info.basic
video.upload
```

### Variables d'environnement
```env
VITE_TIKTOK_CLIENT_ID=votre_client_key
VITE_TIKTOK_CLIENT_SECRET=votre_client_secret
```

## 4. Twitter/X

### Création de l'application
1. Aller sur [Twitter Developer Portal](https://developer.twitter.com/)
2. Créer un nouveau projet/app
3. Type : Standalone App
4. Configurer :
   - App permissions : Read + Write
   - Authentication settings :
     - OAuth 2.0
     - Redirect URIs :
       - `https://yourdomain.com/api/auth/twitter/callback`
     - Website URL : `https://yourdomain.com`

### Scopes configurés
```
tweet.write
users.read
media.upload
```

### Variables d'environnement
```env
VITE_TWITTER_CLIENT_ID=votre_client_id
VITE_TWITTER_CLIENT_SECRET=votre_client_secret
```

## 5. Facebook

### Création de l'application
1. Aller sur [Meta for Developers](https://developers.facebook.com/)
2. Créer une nouvelle app ou utiliser une app existante
3. Ajouter Facebook Login
4. Configurer :
   - Valid OAuth Redirect URIs :
     - `https://yourdomain.com/api/auth/facebook/callback`
   - App domains :
     - yourdomain.com

### Scopes configurés
```
pages_manage_posts
pages_read_engagement
publish_video
```

### Variables d'environnement
```env
VITE_FACEBOOK_CLIENT_ID=votre_app_id
VITE_FACEBOOK_CLIENT_SECRET=votre_app_secret
```

## 6. LinkedIn

### Création de l'application
1. Aller sur [LinkedIn Developers](https://developer.linkedin.com/)
2. Créer une nouvelle app
3. Configurer :
   - Redirect URLs :
     - `https://yourdomain.com/api/auth/linkedin/callback`
   - Products : Sign In with LinkedIn

### Scopes configurés
```
w_member_social
rw_organization_admin
```

### Variables d'environnement
```env
VITE_LINKEDIN_CLIENT_ID=votre_client_id
VITE_LINKEDIN_CLIENT_SECRET=votre_client_secret
```

## Configuration des variables d'environnement

### Fichier .env
Créer ou mettre à jour le fichier `.env` à la racine du projet :

```env
# Social Media API Keys
VITE_YOUTUBE_CLIENT_ID=
VITE_YOUTUBE_CLIENT_SECRET=

VITE_INSTAGRAM_CLIENT_ID=
VITE_INSTAGRAM_CLIENT_SECRET=

VITE_TIKTOK_CLIENT_ID=
VITE_TIKTOK_CLIENT_SECRET=

VITE_TWITTER_CLIENT_ID=
VITE_TWITTER_CLIENT_SECRET=

VITE_FACEBOOK_CLIENT_ID=
VITE_FACEBOOK_CLIENT_SECRET=

VITE_LINKEDIN_CLIENT_ID=
VITE_LINKEDIN_CLIENT_SECRET=
```

### Variables d'environnement système
Pour un déploiement en production, configurer les variables dans votre plateforme de déploiement (Vercel, Netlify, etc.).

## Vérification de la configuration

### Test des URLs de redirection
Vérifier que toutes les URLs de redirection sont accessibles :
- `https://yourdomain.com/api/auth/youtube/callback`
- `https://yourdomain.com/api/auth/instagram/callback`
- `https://yourdomain.com/api/auth/tiktok/callback`
- `https://yourdomain.com/api/auth/twitter/callback`
- `https://yourdomain.com/api/auth/facebook/callback`
- `https://yourdomain.com/api/auth/linkedin/callback`

### Test des clés API
1. Démarrer l'application localement
2. Aller dans Paramètres > Connexions sociales
3. Tester la connexion à chaque plateforme
4. Vérifier les logs pour d'éventuelles erreurs

## Sécurité

### Bonnes pratiques
- Ne jamais commiter les clés API dans le code
- Utiliser des variables d'environnement
- Faire tourner les clés régulièrement
- Monitorer l'utilisation des APIs

### Chiffrement
Les tokens d'accès utilisateur sont automatiquement chiffrés dans la base de données Supabase.

## Dépannage

### Erreurs communes
- **Redirect URI mismatch** : Vérifier les URLs configurées
- **Invalid scope** : S'assurer que les scopes sont correctement configurés
- **App not approved** : Certaines plateformes nécessitent une approbation manuelle

### Support
- Documentation des APIs : [docs/social_integrations.md](./social_integrations.md)
- Issues GitHub : Créer un ticket
- Support développeur de chaque plateforme

## Migration et mise à jour

### Changement de clés
1. Générer de nouvelles clés sur la plateforme
2. Mettre à jour les variables d'environnement
3. Redémarrer l'application
4. Les utilisateurs devront reconnecter leurs comptes

### Nouvelles plateformes
Suivre le même processus pour ajouter de nouvelles plateformes sociales.