# Spécifications - Forum Next.js (Méthodologie Agile)

Ce fichier contient toutes les User Stories du projet avec leurs règles métier et scénarios de test (format Given-When-Then).

---

## 📋 CONVERSATION

### US-1: Créer une conversation

**En tant qu'utilisateur authentifié,**
**Je veux créer une nouvelle conversation avec un premier message,**
**Afin de démarrer une discussion sur le forum**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- Le **titre est obligatoire**
- Le titre **doit contenir au minimum 1 caractère**
- Le titre **ne peut pas dépasser 200 caractères**
- Le **contenu du premier message est obligatoire**
- Le contenu du premier message **doit contenir au minimum 1 caractère**
- Le contenu du premier message **ne peut pas dépasser 2000 caractères**
- L'`authorId` est **automatiquement récupéré** depuis la session de l'utilisateur
- La conversation et le premier message sont créés **en une seule transaction**

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Création réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il crée une conversation avec le titre "Bienvenue sur le forum" et le contenu "Bonjour à tous !"
  - **Alors** la conversation doit être créée avec succès
  - **Et** le premier message doit être attaché à la conversation
  - **Et** l'`authorId` de la conversation doit être "user-123"
  - **Et** un ID unique (CUID) doit être généré pour la conversation

- **Exemple 2 / Scénario 2 : Création échouée - utilisateur non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de créer une conversation avec le titre "Test" et le contenu "Message"
  - **Alors** une erreur doit être retournée avec le statut **401 Unauthorized**

- **Exemple 3 / Scénario 3 : Création échouée - titre vide**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée une conversation avec un titre vide ""
  - **Alors** une erreur doit être retournée avec le statut **400 Bad Request**

- **Exemple 4 / Scénario 4 : Création échouée - titre trop long**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée une conversation avec un titre de 201 caractères
  - **Alors** une erreur doit être retournée avec le statut **400 Bad Request**

- **Exemple 5 / Scénario 5 : Création échouée - contenu vide**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée une conversation avec le titre "Test" et un contenu vide ""
  - **Alors** une erreur doit être retournée avec le statut **400 Bad Request**

- **Exemple 6 / Scénario 6 : Création échouée - contenu trop long**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée une conversation avec un contenu de 2001 caractères
  - **Alors** une erreur doit être retournée avec le statut **400 Bad Request**

---

### US-2: Lister toutes les conversations

**En tant que visiteur (authentifié ou non),**
**Je veux voir la liste de toutes les conversations publiques,**
**Afin de parcourir les discussions disponibles sur le forum**

**Règles métier :**

- Accessible **sans authentification** (lecture publique)
- Affiche **toutes les conversations non supprimées** (`deletedAt` = `null`)
- Les conversations **archivées** peuvent être exclues (selon implémentation future)
- Ordre par défaut : **les plus récentes en premier** (`createdAt DESC`)
- Chaque conversation affiche : `title`, `authorId`, `createdAt`, `updatedAt`
- Affiche **obligatoirement le nombre de messages** par conversation

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Récupération réussie**
  - **Étant donné** qu'il existe 5 conversations dans la base de données
  - **Et** qu'aucune conversation n'est supprimée
  - **Quand** on demande la liste des conversations
  - **Alors** les 5 conversations doivent être retournées
  - **Et** elles doivent être triées par date de création (la plus récente en premier)
  - **Et** chaque conversation doit afficher son nombre de messages

- **Exemple 2 / Scénario 2 : Exclusion des conversations supprimées**
  - **Étant donné** qu'il existe 5 conversations
  - **Et** que 2 conversations ont `deletedAt` défini (soft delete)
  - **Quand** on demande la liste des conversations
  - **Alors** seulement 3 conversations doivent être retournées
  - **Et** les conversations supprimées ne doivent pas apparaître

- **Exemple 3 / Scénario 3 : Liste vide**
  - **Étant donné** qu'il n'y a aucune conversation dans la base
  - **Quand** on demande la liste des conversations
  - **Alors** un tableau vide doit être retourné
  - **Et** le statut HTTP doit être **200 OK**

---

### US-3: Récupérer une conversation par ID

**En tant que visiteur (authentifié ou non),**
**Je veux consulter une conversation spécifique avec tous ses messages,**
**Afin de lire le fil de discussion complet**

**Règles métier :**

- Accessible **sans authentification**
- Doit inclure **tous les messages** de la conversation (non supprimés)
- Les messages doivent être **triés par ordre chronologique** (`createdAt ASC`)
- Retourne **404 Not Found** si :
  - La conversation n'existe pas
  - La conversation a `deletedAt` défini (supprimée)
- Inclut les informations de l'auteur de la conversation et des messages

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Récupération réussie**
  - **Étant donné** qu'une conversation existe avec l'ID "conv-123"
  - **Et** que cette conversation contient 3 messages
  - **Quand** on demande la conversation "conv-123"
  - **Alors** la conversation doit être retournée avec ses 3 messages
  - **Et** les messages doivent être triés du plus ancien au plus récent

- **Exemple 2 / Scénario 2 : Conversation introuvable**
  - **Étant donné** qu'aucune conversation n'existe avec l'ID "conv-999"
  - **Quand** on demande la conversation "conv-999"
  - **Alors** une erreur **404 Not Found** doit être retournée

- **Exemple 3 / Scénario 3 : Conversation supprimée**
  - **Étant donné** qu'une conversation existe avec l'ID "conv-456"
  - **Et** que cette conversation a `deletedAt` défini
  - **Quand** on demande la conversation "conv-456"
  - **Alors** une erreur **404 Not Found** doit être retournée

---

### US-4: Modifier le titre d'une conversation

**En tant qu'auteur d'une conversation,**
**Je veux pouvoir modifier le titre de ma conversation,**
**Afin de corriger une erreur ou améliorer la clarté**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **doit être le propriétaire** (`authorId` = user session ID)
- Le nouveau titre **est obligatoire** (min 1 caractère)
- Le nouveau titre **ne peut pas dépasser 200 caractères**
- Retourne **401 Unauthorized** si non authentifié
- Retourne **403 Forbidden** si l'utilisateur n'est pas le propriétaire
- Retourne **404 Not Found** si la conversation n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Modification réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'une conversation existe avec l'ID "conv-123" et `authorId` = "user-123"
  - **Quand** il modifie le titre en "Nouveau titre"
  - **Alors** le titre de la conversation doit être mis à jour
  - **Et** `updatedAt` doit être mis à jour

- **Exemple 2 / Scénario 2 : Modification échouée - titre vide**
  - **Étant donné** qu'un utilisateur est authentifié et propriétaire de "conv-123"
  - **Quand** il modifie le titre avec une chaîne vide ""
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 3 / Scénario 3 : Modification échouée - titre trop long**
  - **Étant donné** qu'un utilisateur est authentifié et propriétaire de "conv-123"
  - **Quand** il modifie le titre avec 201 caractères
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 4 / Scénario 4 : Modification échouée - pas le propriétaire**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-456"
  - **Et** qu'une conversation existe avec `authorId` = "user-123"
  - **Quand** l'utilisateur "user-456" tente de modifier le titre
  - **Alors** une erreur **403 Forbidden** doit être retournée

- **Exemple 5 / Scénario 5 : Modification échouée - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de modifier le titre d'une conversation
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

### US-5: Supprimer une conversation

**En tant qu'auteur d'une conversation,**
**Je veux pouvoir supprimer ma conversation,**
**Afin de retirer du forum une discussion que je ne souhaite plus voir publiée**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **doit être le propriétaire** (`authorId` = user session ID)
- Suppression **soft delete** : définir `deletedAt` à la date actuelle
- **Tous les messages** de la conversation doivent également être supprimés (`deletedAt` défini)
- La conversation n'est **pas physiquement supprimée** de la base
- Retourne **401 Unauthorized** si non authentifié
- Retourne **403 Forbidden** si l'utilisateur n'est pas le propriétaire
- Retourne **404 Not Found** si la conversation n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Suppression réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'une conversation existe avec l'ID "conv-123" et `authorId` = "user-123"
  - **Quand** il supprime la conversation
  - **Alors** `deletedAt` doit être défini à la date actuelle
  - **Et** la conversation ne doit plus apparaître dans la liste des conversations

- **Exemple 2 / Scénario 2 : Suppression échouée - pas le propriétaire**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-456"
  - **Et** qu'une conversation existe avec `authorId` = "user-123"
  - **Quand** l'utilisateur "user-456" tente de supprimer la conversation
  - **Alors** une erreur **403 Forbidden** doit être retournée

- **Exemple 3 / Scénario 3 : Suppression échouée - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de supprimer une conversation
  - **Alors** une erreur **401 Unauthorized** doit être retournée

- **Exemple 4 / Scénario 4 : Suppression des messages associés**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'une conversation existe avec l'ID "conv-123" et `authorId` = "user-123"
  - **Et** que cette conversation contient 5 messages
  - **Quand** il supprime la conversation
  - **Alors** `deletedAt` doit être défini pour la conversation
  - **Et** `deletedAt` doit être défini pour tous les 5 messages de la conversation
  - **Et** les messages ne doivent plus apparaître dans les contributions de l'utilisateur

---

## 💬 MESSAGE

### US-6: Créer un message dans une conversation

**En tant qu'utilisateur authentifié,**
**Je veux poster un message dans une conversation existante,**
**Afin de participer à la discussion**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- La **conversation doit exister** et ne pas être supprimée
- Le **contenu est obligatoire** (min 1 caractère)
- Le contenu **ne peut pas dépasser 2000 caractères**
- L'`authorId` est **automatiquement récupéré** depuis la session
- Retourne **401 Unauthorized** si non authentifié
- Retourne **404 Not Found** si la conversation n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Création réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'une conversation existe avec l'ID "conv-123"
  - **Quand** il crée un message avec le contenu "Super discussion !"
  - **Alors** le message doit être créé et attaché à "conv-123"
  - **Et** l'`authorId` du message doit être "user-123"

- **Exemple 2 / Scénario 2 : Création échouée - contenu vide**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de créer un message avec un contenu vide ""
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 3 / Scénario 3 : Création échouée - contenu trop long**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée un message avec 2001 caractères
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 4 / Scénario 4 : Création échouée - conversation inexistante**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de créer un message dans la conversation "conv-999" qui n'existe pas
  - **Alors** une erreur **404 Not Found** doit être retournée

---

### US-7: Modifier un message

**En tant qu'auteur d'un message,**
**Je veux pouvoir modifier le contenu de mon message,**
**Afin de corriger une erreur ou ajouter des précisions**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **doit être le propriétaire** du message (`authorId` = user session ID)
- Le nouveau contenu **est obligatoire** (min 1 caractère)
- Le nouveau contenu **ne peut pas dépasser 2000 caractères**
- `updatedAt` est automatiquement mis à jour
- Retourne **401 Unauthorized** si non authentifié
- Retourne **403 Forbidden** si l'utilisateur n'est pas le propriétaire
- Retourne **404 Not Found** si le message n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Modification réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'un message existe avec `authorId` = "user-123"
  - **Quand** il modifie le contenu en "Contenu modifié"
  - **Alors** le contenu du message doit être mis à jour
  - **Et** `updatedAt` doit être mis à jour

- **Exemple 2 / Scénario 2 : Modification échouée - contenu vide**
  - **Étant donné** qu'un utilisateur est authentifié et propriétaire d'un message
  - **Quand** il tente de modifier le contenu avec ""
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 3 / Scénario 3 : Modification échouée - pas le propriétaire**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-456"
  - **Et** qu'un message existe avec `authorId` = "user-123"
  - **Quand** l'utilisateur "user-456" tente de modifier le message
  - **Alors** une erreur **403 Forbidden** doit être retournée

---

### US-8: Supprimer un message

**En tant qu'auteur d'un message,**
**Je veux pouvoir supprimer mon message,**
**Afin de retirer un contenu que je ne souhaite plus publier**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **doit être le propriétaire** du message
- Suppression **soft delete** : définir `deletedAt` à la date actuelle
- Le message n'est **pas physiquement supprimé** de la base
- Retourne **401 Unauthorized** si non authentifié
- Retourne **403 Forbidden** si l'utilisateur n'est pas le propriétaire
- Retourne **404 Not Found** si le message n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Suppression réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** qu'un message existe avec `authorId` = "user-123"
  - **Quand** il supprime le message
  - **Alors** `deletedAt` doit être défini à la date actuelle

- **Exemple 2 / Scénario 2 : Suppression échouée - pas le propriétaire**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-456"
  - **Et** qu'un message existe avec `authorId` = "user-123"
  - **Quand** "user-456" tente de supprimer le message
  - **Alors** une erreur **403 Forbidden** doit être retournée

---

## 👤 USER (AUTHENTIFICATION)

### US-9: S'inscrire sur le forum (Sign Up)

**En tant que visiteur,**
**Je veux créer un compte utilisateur,**
**Afin de pouvoir participer aux discussions du forum**

**Architecture** : Better Auth Direct (pas de use case custom)

**Règles métier :**

- **Email** :
  - Obligatoire
  - Format valide (RFC 5322)
  - Doit être unique (pas déjà utilisé)
  - Maximum 255 caractères
- **Mot de passe** :
  - Obligatoire
  - Minimum 8 caractères
  - Doit contenir au moins **1 majuscule**
  - Doit contenir au moins **1 minuscule**
  - Doit contenir au moins **1 chiffre**
  - Doit contenir au moins **1 caractère spécial** parmi `!@#$%^&*()_+-=[]{}|;:,.<>?`
  - Le mot de passe est **haché avec bcrypt** (10 salt rounds) avant stockage
- **Name** (nom d'utilisateur) :
  - Optionnel
  - Maximum 100 caractères si fourni
- **Connexion automatique** :
  - Après inscription réussie, l'utilisateur est **automatiquement connecté**
  - Une session est créée via Better Auth (30 jours)
  - Un cookie de session httpOnly est défini
- Retourne **400 Bad Request** si validation échoue
- Retourne **409 Conflict** si l'email existe déjà

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Inscription réussie avec nom**
  - **Étant donné** qu'aucun utilisateur n'existe avec l'email "alice@example.com"
  - **Quand** on s'inscrit avec :
    - Email : "alice@example.com"
    - Password : "SecureP@ss123"
    - Name : "Alice Dupont"
  - **Alors** l'utilisateur doit être créé en base de données
  - **Et** le mot de passe doit être haché avec bcrypt
  - **Et** un ID unique (CUID) doit être généré
  - **Et** une session doit être créée automatiquement (Better Auth)
  - **Et** un cookie de session httpOnly doit être défini
  - **Et** l'utilisateur est immédiatement connecté (pas besoin de se reconnecter)
  - **Et** le statut HTTP doit être **201 Created**

- **Exemple 2 / Scénario 2 : Inscription réussie sans nom**
  - **Étant donné** qu'aucun utilisateur n'existe avec l'email "bob@example.com"
  - **Quand** on s'inscrit avec :
    - Email : "bob@example.com"
    - Password : "MyP@ssw0rd"
    - Name : (non fourni)
  - **Alors** l'utilisateur doit être créé
  - **Et** le champ `name` doit être `null`
  - **Et** l'utilisateur est automatiquement connecté (session créée)

- **Exemple 3 / Scénario 3 : Inscription échouée - email déjà utilisé**
  - **Étant donné** qu'un utilisateur existe avec l'email "alice@example.com"
  - **Quand** on tente de s'inscrire avec le même email
  - **Alors** une erreur **409 Conflict** doit être retournée

- **Exemple 4 / Scénario 4 : Inscription échouée - email invalide**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on s'inscrit avec l'email "invalid-email"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 5 / Scénario 5 : Inscription échouée - mot de passe trop court**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on s'inscrit avec le mot de passe "Short1!"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 6 / Scénario 6 : Inscription échouée - mot de passe sans majuscule**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on s'inscrit avec le mot de passe "password123!"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 7 / Scénario 7 : Inscription échouée - mot de passe sans chiffre**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on s'inscrit avec le mot de passe "Password!"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 8 / Scénario 8 : Inscription échouée - mot de passe sans caractère spécial**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on s'inscrit avec le mot de passe "Password123"
  - **Alors** une erreur **400 Bad Request** doit être retournée

---

### US-10: Se connecter au forum (Sign In)

**En tant qu'utilisateur enregistré,**
**Je veux me connecter à mon compte,**
**Afin d'accéder aux fonctionnalités réservées aux membres**

**Architecture** : Better Auth Direct (pas de use case custom)

**Règles métier :**

- **Email** et **mot de passe** obligatoires
- L'email doit correspondre à un utilisateur existant
- Authentification gérée par **Better Auth** (`signIn.email()`)
- Better Auth vérifie le mot de passe (bcrypt hash comparison)
- Création d'une **session JWT valable 30 jours** (rolling session)
- **Renouvellement automatique de la session toutes les 24 heures** si l'utilisateur est actif
- Session expire après **30 jours d'inactivité totale**
- Session stockée en **cookie httpOnly** (protection XSS)
- Session cookies **sameSite: lax** (protection CSRF)
- Session cookies **secure** en production (HTTPS uniquement)
- Retourne **400 Bad Request** si email ou password manquant
- Retourne **401 Unauthorized** si identifiants incorrects

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Connexion réussie**
  - **Étant donné** qu'un utilisateur existe avec :
    - Email : "alice@example.com"
    - Password (haché) : hash de "SecureP@ss123"
  - **Quand** on se connecte avec :
    - Email : "alice@example.com"
    - Password : "SecureP@ss123"
  - **Alors** la connexion doit réussir (gérée par Better Auth)
  - **Et** une session JWT (30 jours) doit être créée
  - **Et** une entrée dans la table `Session` doit être créée en base de données (Better Auth)
  - **Et** un cookie httpOnly, sameSite:lax, secure (prod) doit être défini
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Connexion échouée - email inexistant**
  - **Étant donné** qu'aucun utilisateur n'existe avec l'email "unknown@example.com"
  - **Quand** on tente de se connecter avec cet email
  - **Alors** une erreur **401 Unauthorized** doit être retournée

- **Exemple 3 / Scénario 3 : Connexion échouée - mot de passe incorrect**
  - **Étant donné** qu'un utilisateur existe avec l'email "alice@example.com"
  - **Quand** on se connecte avec le mauvais mot de passe "WrongPassword"
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

### US-11: Se déconnecter (Sign Out)

**En tant qu'utilisateur connecté,**
**Je veux me déconnecter de mon compte,**
**Afin de sécuriser ma session sur un appareil partagé**

**Architecture** : Better Auth Direct (pas de use case custom)

**Règles métier :**

- Déconnexion gérée par **Better Auth** (`signOut()`)
- Better Auth supprime la session de la base de données
- Supprime les cookies de session
- Accessible uniquement si une session existe
- Retourne **200 OK** même si aucune session n'est active

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Déconnexion réussie**
  - **Étant donné** qu'un utilisateur est connecté avec une session active
  - **Quand** il se déconnecte
  - **Alors** la session doit être supprimée de la base de données (Better Auth)
  - **Et** les cookies de session doivent être supprimés
  - **Et** le statut HTTP doit être **200 OK**

---

### US-12: Demander la réinitialisation du mot de passe

**En tant qu'utilisateur ayant oublié son mot de passe,**
**Je veux demander un lien de réinitialisation par email,**
**Afin de pouvoir définir un nouveau mot de passe**

**Règles métier :**

- **Email** obligatoire
- L'email doit correspondre à un utilisateur existant
- Génération d'un **token sécurisé** (32 bytes en hexadécimal)
- Token **unique** (pas de collision)
- Token **valable 10 minutes** (expiration)
- **Rate limiting** : 1 demande par **60 secondes** par email
- Envoi d'un **email** avec lien de réinitialisation : `{APP_URL}/reset-password?token={token}`
- Retourne **200 OK** même si l'email n'existe pas (pour ne pas révéler les emails enregistrés - sécurité)
- Retourne **429 Too Many Requests** si rate limiting dépassé

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Demande réussie**
  - **Étant donné** qu'un utilisateur existe avec l'email "alice@example.com"
  - **Et** qu'aucune demande récente n'a été faite pour cet email
  - **Quand** on demande la réinitialisation du mot de passe pour "alice@example.com"
  - **Alors** un token sécurisé doit être généré
  - **Et** le token doit être stocké en base avec `expiresAt` = maintenant + 10 minutes
  - **Et** un email doit être envoyé avec le lien de réinitialisation
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Demande pour email inexistant (sécurité)**
  - **Étant donné** qu'aucun utilisateur n'existe avec l'email "unknown@example.com"
  - **Quand** on demande la réinitialisation pour cet email
  - **Alors** aucun token ne doit être créé
  - **Mais** le statut HTTP doit être **200 OK** (pour masquer l'inexistence de l'email)

- **Exemple 3 / Scénario 3 : Rate limiting dépassé**
  - **Étant donné** qu'une demande a été faite il y a 30 secondes pour "alice@example.com"
  - **Quand** on fait une nouvelle demande pour le même email
  - **Alors** une erreur **429 Too Many Requests** doit être retournée

---

### US-13: Réinitialiser le mot de passe

**En tant qu'utilisateur ayant reçu un lien de réinitialisation,**
**Je veux définir un nouveau mot de passe,**
**Afin de récupérer l'accès à mon compte**

**Règles métier :**

- **Token** obligatoire
- Token doit **exister** en base de données
- Token **ne doit pas être expiré** (`expiresAt` > maintenant)
- Token **ne doit pas avoir été utilisé** (`usedAt` = `null`)
- **Nouveau mot de passe** doit respecter les mêmes règles que l'inscription (US-9)
- Une fois utilisé, marquer le token comme utilisé (`usedAt` = maintenant)
- Le nouveau mot de passe est **haché avec bcrypt** avant stockage
- **Toutes les sessions de l'utilisateur sont invalidées** (suppression en base de données pour sécurité)
- Retourne **400 Bad Request** si token invalide, expiré, ou déjà utilisé
- Retourne **400 Bad Request** si nouveau mot de passe invalide

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Réinitialisation réussie**
  - **Étant donné** qu'un token valide "abc123" existe
  - **Et** que le token n'est pas expiré
  - **Et** que le token n'a pas été utilisé (`usedAt` = `null`)
  - **Quand** on réinitialise le mot de passe avec :
    - Token : "abc123"
    - Nouveau password : "NewSecure@123"
  - **Alors** le mot de passe de l'utilisateur doit être mis à jour (haché)
  - **Et** `usedAt` du token doit être défini à maintenant
  - **Et** toutes les sessions de l'utilisateur doivent être supprimées de la base de données (sécurité)
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Réinitialisation échouée - token expiré**
  - **Étant donné** qu'un token existe mais `expiresAt` est dans le passé
  - **Quand** on tente de réinitialiser le mot de passe
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 3 / Scénario 3 : Réinitialisation échouée - token déjà utilisé**
  - **Étant donné** qu'un token existe avec `usedAt` défini
  - **Quand** on tente de réinitialiser le mot de passe
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 4 / Scénario 4 : Réinitialisation échouée - token inexistant**
  - **Étant donné** qu'aucun token "invalid-token" n'existe
  - **Quand** on tente de réinitialiser le mot de passe
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 5 / Scénario 5 : Réinitialisation échouée - nouveau mot de passe invalide**
  - **Étant donné** qu'un token valide existe
  - **Quand** on tente de réinitialiser avec le mot de passe "weak"
  - **Alors** une erreur **400 Bad Request** doit être retournée

---

### US-14: Consulter les contributions d'un utilisateur

**En tant que visiteur (authentifié ou non),**
**Je veux consulter le profil d'un utilisateur et voir ses contributions,**
**Afin de connaître son activité sur le forum**

**Règles métier :**

- Accessible **sans authentification**
- Affiche les informations publiques : `id`, `name`, `avatar`, `bio`, `createdAt`
- Affiche la liste des **conversations créées** par l'utilisateur (non supprimées)
- Affiche la liste des **messages postés** par l'utilisateur (non supprimés)
- **Ne jamais exposer** : `email`, `password`
- Retourne **404 Not Found** si l'utilisateur n'existe pas

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Récupération réussie**
  - **Étant donné** qu'un utilisateur "user-123" existe
  - **Et** qu'il a créé 3 conversations et posté 10 messages
  - **Quand** on demande les contributions de "user-123"
  - **Alors** les informations publiques de l'utilisateur doivent être retournées
  - **Et** les 3 conversations créées doivent être listées
  - **Et** les 10 messages postés doivent être listés
  - **Et** l'email et le password **ne doivent pas** être retournés

- **Exemple 2 / Scénario 2 : Utilisateur inexistant**
  - **Étant donné** qu'aucun utilisateur "user-999" n'existe
  - **Quand** on demande les contributions de "user-999"
  - **Alors** une erreur **404 Not Found** doit être retournée

- **Exemple 3 / Scénario 3 : Utilisateur sans contributions**
  - **Étant donné** qu'un utilisateur "user-456" existe
  - **Et** qu'il n'a créé aucune conversation
  - **Et** qu'il n'a posté aucun message
  - **Quand** on demande les contributions de "user-456"
  - **Alors** les informations publiques de l'utilisateur doivent être retournées
  - **Et** le tableau des conversations doit être vide
  - **Et** le tableau des messages doit être vide

- **Exemple 4 / Scénario 4 : Exclusion des éléments supprimés**
  - **Étant donné** qu'un utilisateur "user-789" existe
  - **Et** qu'il a créé 2 conversations (1 active, 1 supprimée)
  - **Et** qu'il a posté 3 messages (2 actifs, 1 supprimé)
  - **Quand** on demande les contributions de "user-789"
  - **Alors** seule la conversation active doit être retournée
  - **Et** seuls les 2 messages actifs doivent être retournés
  - **Et** les éléments avec `deletedAt` non-null ne doivent pas apparaître

---

### US-15a: Modifier nom et bio du profil

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir modifier mon nom et ma bio,**
**Afin de personnaliser les informations textuelles de mon profil**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **ne peut modifier que son propre profil**
- **Nom (name)** :
  - Optionnel (peut être `null`)
  - Maximum 100 caractères si fourni
- **Bio** :
  - Optionnel (peut être `null`)
  - Maximum 500 caractères si fourni
- `updatedAt` est automatiquement mis à jour lors de la modification
- Retourne **401 Unauthorized** si non authentifié
- Retourne **400 Bad Request** si validation échoue

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Modification du nom réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il modifie son nom en "Alice Dupont"
  - **Alors** le champ `name` doit être mis à jour
  - **Et** `updatedAt` doit être mis à jour
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Modification de la bio réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il modifie sa bio en "Développeur passionné par Next.js"
  - **Alors** le champ `bio` doit être mis à jour
  - **Et** `updatedAt` doit être mis à jour
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 3 / Scénario 3 : Modification du nom et bio réussie**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il modifie son nom en "Alice Dupont" et sa bio en "Développeuse web"
  - **Alors** les champs `name` et `bio` doivent être mis à jour
  - **Et** `updatedAt` doit être mis à jour
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 4 / Scénario 4 : Suppression du nom (null)**
  - **Étant donné** qu'un utilisateur est authentifié avec un nom défini
  - **Quand** il modifie son nom avec une valeur `null`
  - **Alors** le champ `name` doit être `null`
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 5 / Scénario 5 : Modification échouée - nom trop long**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de modifier son nom avec 101 caractères
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 6 / Scénario 6 : Modification échouée - bio trop longue**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de modifier sa bio avec 501 caractères
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 7 / Scénario 7 : Modification échouée - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de modifier un profil
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

### US-15b: Upload avatar utilisateur

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir uploader une photo de profil (avatar),**
**Afin de personnaliser visuellement mon compte**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- L'utilisateur **ne peut modifier que son propre profil**
- **Avatar** :
  - Optionnel (peut être `null`)
  - **Upload de fichier image** (JPEG, PNG, WebP uniquement)
  - Taille maximum : **2 MB**
  - Dimensions recommandées : 256×256 à 1024×1024 pixels
  - Le système génère automatiquement une URL CDN après upload
  - L'URL générée est stockée dans la base de données (max 500 caractères)
  - Validation du fichier côté serveur (type MIME, taille, magic bytes)
- `updatedAt` est automatiquement mis à jour
- Retourne **401 Unauthorized** si non authentifié
- Retourne **400 Bad Request** si validation échoue

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Upload d'avatar réussi**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il upload une image JPEG valide de 1 MB
  - **Alors** le fichier doit être uploadé sur le CDN
  - **Et** une URL CDN doit être générée (ex: "https://cdn.example.com/avatars/user-123/avatar.jpg")
  - **Et** le champ `avatar` doit être mis à jour avec l'URL générée
  - **Et** `updatedAt` doit être mis à jour
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Upload d'avatar PNG réussi**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Quand** il upload une image PNG valide de 500 KB
  - **Alors** le fichier doit être uploadé sur le CDN
  - **Et** le champ `avatar` doit être mis à jour avec l'URL CDN
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 3 / Scénario 3 : Suppression de l'avatar (null)**
  - **Étant donné** qu'un utilisateur est authentifié avec un avatar défini
  - **Quand** il supprime son avatar (valeur `null`)
  - **Alors** le champ `avatar` doit être `null`
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 4 / Scénario 4 : Upload échoué - fichier trop volumineux**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente d'uploader une image de 3 MB (> 2 MB max)
  - **Alors** une erreur **400 Bad Request** doit être retournée
  - **Et** le message d'erreur doit indiquer "L'image ne peut pas dépasser 2 MB"

- **Exemple 5 / Scénario 5 : Upload échoué - format non supporté**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente d'uploader un fichier GIF ou PDF
  - **Alors** une erreur **400 Bad Request** doit être retournée
  - **Et** le message d'erreur doit indiquer "Format non supporté (JPEG, PNG, WebP uniquement)"

- **Exemple 6 / Scénario 6 : Upload échoué - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente d'uploader un avatar
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

### US-15c: Changer mot de passe

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir changer mon mot de passe,**
**Afin de sécuriser mon compte ou récupérer un accès compromis**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- **Ancien mot de passe obligatoire** pour vérification
- Ancien mot de passe doit être correct (vérification bcrypt)
- **Nouveau mot de passe** doit respecter les règles de US-9 :
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial parmi `!@#$%^&*()_+-=[]{}|;:,.<>?`
- Le nouveau mot de passe est **haché avec bcrypt** (10 salt rounds) avant stockage
- **Toutes les sessions de l'utilisateur sont invalidées** après changement de mot de passe (sécurité)
- L'utilisateur doit être déconnecté après le changement (session actuelle supprimée)
- Retourne **401 Unauthorized** si non authentifié
- Retourne **400 Bad Request** si validation échoue

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Changement de mot de passe réussi**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** que son mot de passe actuel est "OldPass@123"
  - **Quand** il change son mot de passe avec :
    - Ancien mot de passe : "OldPass@123"
    - Nouveau mot de passe : "NewSecure@456"
  - **Alors** le mot de passe doit être mis à jour (haché avec bcrypt)
  - **Et** toutes les sessions de l'utilisateur doivent être invalidées (suppression en base de données)
  - **Et** l'utilisateur doit être déconnecté (session actuelle supprimée)
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Changement échoué - ancien mot de passe incorrect**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** que son mot de passe actuel est "OldPass@123"
  - **Quand** il tente de changer son mot de passe avec :
    - Ancien mot de passe : "WrongPassword!"
    - Nouveau mot de passe : "NewSecure@456"
  - **Alors** une erreur **400 Bad Request** doit être retournée
  - **Et** le message d'erreur doit indiquer "Ancien mot de passe incorrect"

- **Exemple 3 / Scénario 3 : Changement échoué - nouveau mot de passe trop court**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de changer son mot de passe avec :
    - Ancien mot de passe : (correct)
    - Nouveau mot de passe : "Short1!"
  - **Alors** une erreur **400 Bad Request** doit être retournée
  - **Et** le message d'erreur doit indiquer les règles de validation du mot de passe

- **Exemple 4 / Scénario 4 : Changement échoué - nouveau mot de passe sans majuscule**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de changer son mot de passe avec :
    - Ancien mot de passe : (correct)
    - Nouveau mot de passe : "newpass123!"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 5 / Scénario 5 : Changement échoué - nouveau mot de passe sans chiffre**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de changer son mot de passe avec :
    - Ancien mot de passe : (correct)
    - Nouveau mot de passe : "NewPassword!"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 6 / Scénario 6 : Changement échoué - nouveau mot de passe sans caractère spécial**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de changer son mot de passe avec :
    - Ancien mot de passe : (correct)
    - Nouveau mot de passe : "NewPassword123"
  - **Alors** une erreur **400 Bad Request** doit être retournée

- **Exemple 7 / Scénario 7 : Changement échoué - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de changer un mot de passe
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

### US-16: Récupérer mon profil utilisateur

**En tant qu'utilisateur authentifié,**
**Je veux récupérer mes informations de profil,**
**Afin de les afficher ou de pré-remplir un formulaire de modification**

**Règles métier :**

- L'utilisateur **doit être authentifié**
- Retourne les informations du profil de l'utilisateur connecté : `id`, `email`, `name`, `bio`, `avatar`
- **Ne jamais exposer** : `password`, `createdAt`, `updatedAt`
- Les champs `name`, `bio` et `avatar` **peuvent être `null`** s'ils n'ont pas été renseignés
- Retourne **401 Unauthorized** si non authentifié

**Exemples / Scénarios :**

- **Exemple 1 / Scénario 1 : Récupération réussie avec informations complètes**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-123"
  - **Et** que son profil contient : name = "John Doe", bio = "Software Developer", avatar = "https://cdn.example.com/avatar.jpg"
  - **Quand** il récupère son profil
  - **Alors** les informations suivantes doivent être retournées :
    - `id` : "user-123"
    - `email` : "john@example.com"
    - `name` : "John Doe"
    - `bio` : "Software Developer"
    - `avatar` : "https://cdn.example.com/avatar.jpg"
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 2 / Scénario 2 : Récupération réussie avec informations minimales**
  - **Étant donné** qu'un utilisateur est authentifié avec l'ID "user-456"
  - **Et** que son profil contient : name = `null`, bio = `null`, avatar = `null`
  - **Quand** il récupère son profil
  - **Alors** les informations suivantes doivent être retournées :
    - `id` : "user-456"
    - `email` : "jane@example.com"
    - `name` : `null`
    - `bio` : `null`
    - `avatar` : `null`
  - **Et** le statut HTTP doit être **200 OK**

- **Exemple 3 / Scénario 3 : Récupération échouée - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de récupérer le profil
  - **Alors** une erreur **401 Unauthorized** doit être retournée

---

## 📝 Notes et conventions

### Format des messages d'erreur

Tous les messages d'erreur doivent être **en français** et **explicites** pour l'utilisateur final. Les messages d'erreur exacts seront définis lors de l'implémentation.

### Codes HTTP

- **200 OK** : Succès (GET, PATCH, DELETE)
- **201 Created** : Ressource créée (POST)
- **400 Bad Request** : Validation échouée
- **401 Unauthorized** : Non authentifié
- **403 Forbidden** : Authentifié mais non autorisé (ownership)
- **404 Not Found** : Ressource introuvable
- **409 Conflict** : Conflit (email déjà utilisé)
- **429 Too Many Requests** : Rate limiting dépassé
- **500 Internal Server Error** : Erreur serveur inattendue

### Tests

Chaque User Story doit avoir :

- ✅ **Tests unitaires** pour la logique métier (entités + use cases)
- ✅ **Tests E2E** pour les API routes (avec PostgreSQL en testcontainer)

### Ordre d'implémentation effectif

1. **US-9** : Inscription (Sign Up)
2. **US-10** : Connexion (Sign In)
3. **US-11** : Déconnexion (Sign Out)
4. **US-1** : Créer une conversation
5. **US-2** : Lister les conversations
6. **US-3** : Récupérer une conversation
7. **US-4** : Modifier une conversation
8. **US-5** : Supprimer une conversation
9. **US-6** : Créer un message
10. **US-7** : Modifier un message
11. **US-8** : Supprimer un message
12. **US-12** : Demander réinitialisation mot de passe
13. **US-13** : Réinitialiser mot de passe
14. **US-14** : Consulter les contributions
15. **US-15a** : Modifier nom et bio du profil
16. **US-16** : Récupérer mon profil utilisateur
17. **US-15b** : Upload avatar utilisateur
18. **US-15c** : Changer mot de passe
