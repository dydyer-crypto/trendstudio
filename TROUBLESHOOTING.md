# Guide de dépannage - Connexion TrendStudio

## Problème : La connexion ne fonctionne pas

### Vérifications effectuées ✅

1. **Base de données** : L'utilisateur "didier" existe avec le rôle admin et 100 crédits
2. **Email confirmé** : L'email est automatiquement confirmé (vérification désactivée)
3. **Fonction handle_new_user** : Corrigée pour inclure le champ username
4. **Code** : Tous les tests lint passent sans erreur

### Logs de débogage ajoutés 🔍

J'ai ajouté des logs console dans `AuthContext.tsx` pour diagnostiquer le problème :

**Lors de la connexion :**
- `Tentative de connexion avec: [email]`
- `Erreur de connexion: [détails]` (si erreur)
- `Connexion réussie: [données]` (si succès)

**Lors de l'inscription :**
- `Tentative d'inscription avec: [email]`
- `Erreur d'inscription: [détails]` (si erreur)
- `Inscription réussie: [données]` (si succès)

### Comment tester la connexion 🧪

1. **Ouvrir la console du navigateur** (F12 ou Cmd+Option+I)
2. **Aller sur la page de connexion**
3. **Essayer de se connecter avec :**
   - Username: `didier`
   - Password: [le mot de passe utilisé lors de l'inscription]
4. **Regarder les logs dans la console** pour voir l'erreur exacte

### Solutions possibles 💡

#### Si l'erreur est "Invalid login credentials"
- Le mot de passe est incorrect
- Solution : Créer un nouveau compte ou réinitialiser le mot de passe

#### Si l'erreur est "Email not confirmed"
- La vérification email n'est pas complètement désactivée
- Solution : Exécuter cette requête SQL :
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW() 
WHERE email = 'didier@miaoda.com';
```

#### Si l'erreur est "User not found"
- L'utilisateur n'existe pas dans auth.users
- Solution : Créer un nouveau compte

#### Si aucune erreur n'apparaît mais la connexion échoue
- Problème de session ou de cookies
- Solution : 
  1. Vider le cache du navigateur
  2. Supprimer les cookies du site
  3. Réessayer en navigation privée

### Test rapide de connexion 🚀

Pour tester rapidement, créez un nouveau compte :

1. Aller sur l'onglet "S'inscrire"
2. Choisir un username simple (ex: `test123`)
3. Mot de passe : minimum 6 caractères (ex: `test123`)
4. Cliquer sur "Créer un compte"
5. Vous devriez être automatiquement connecté

### Vérification en base de données 🗄️

Pour vérifier si l'utilisateur existe :

```sql
-- Voir tous les utilisateurs
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Voir les profils correspondants
SELECT p.id, p.username, p.email, p.role, p.credits 
FROM profiles p 
ORDER BY p.created_at DESC;
```

### Informations de connexion actuelles 📋

**Utilisateur existant :**
- Username: `didier`
- Email: `didier@miaoda.com`
- Rôle: admin
- Crédits: 100
- Email confirmé: ✅ Oui
- Date de création: 2025-12-30 16:26:51

### Contact support 📧

Si le problème persiste après avoir suivi ce guide :
1. Ouvrir la console du navigateur (F12)
2. Copier tous les logs qui apparaissent lors de la tentative de connexion
3. Partager ces logs pour diagnostic approfondi

### Logs attendus en cas de succès ✅

```
Tentative de connexion avec: didier@miaoda.com
Connexion réussie: { user: {...}, session: {...} }
```

### Logs en cas d'échec ❌

```
Tentative de connexion avec: didier@miaoda.com
Erreur de connexion: AuthApiError: Invalid login credentials
```

---

**Note importante** : Les logs de débogage ont été ajoutés dans le code. Après avoir résolu le problème, vous pouvez les retirer si vous le souhaitez pour un code plus propre en production.
