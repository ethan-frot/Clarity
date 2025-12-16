# User Stories

Ce fichier contient toutes les User Stories du projet avec leurs règles métier (format Given-When-Then).

---

## 📋 CONVERSATION

### US-1: Créer une conversation

**En tant qu'utilisateur authentifié,**
**Je veux créer une nouvelle conversation avec un premier message,**
**Afin de démarrer une discussion sur le forum**

**Règles métier :**

- L'utilisateur doit être authentifié
- Le titre est obligatoire (1-200 caractères)
- Le contenu du premier message est obligatoire (1-2000 caractères)
- La conversation et le premier message sont créés en une seule transaction

**Scénarios :**

- **Création réussie**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il crée une conversation avec un titre et un contenu valides
  - **Alors** la conversation et le premier message sont créés

- **Création échouée - non authentifié**
  - **Étant donné** qu'aucun utilisateur n'est authentifié
  - **Quand** on tente de créer une conversation
  - **Alors** une erreur est retournée (401)

- **Création échouée - validation**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il soumet un titre ou contenu invalide (vide ou trop long)
  - **Alors** une erreur de validation est retournée (400)

---

### US-2: Lister toutes les conversations

**En tant que visiteur (authentifié ou non),**
**Je veux voir la liste de toutes les conversations publiques,**
**Afin de parcourir les discussions disponibles sur le forum**

**Règles métier :**

- Accessible sans authentification
- Affiche toutes les conversations non supprimées
- Triées par date (plus récentes en premier)
- Affiche le nombre de messages par conversation

**Scénarios :**

- **Récupération réussie**
  - **Étant donné** qu'il existe des conversations non supprimées
  - **Quand** on demande la liste
  - **Alors** les conversations sont retournées triées par date

- **Exclusion des conversations supprimées**
  - **Étant donné** qu'il existe des conversations supprimées
  - **Quand** on demande la liste
  - **Alors** seules les conversations actives sont retournées

---

### US-3: Récupérer une conversation par ID

**En tant que visiteur (authentifié ou non),**
**Je veux consulter une conversation spécifique avec tous ses messages,**
**Afin de lire le fil de discussion complet**

**Règles métier :**

- Accessible sans authentification
- Inclut tous les messages actifs triés chronologiquement
- Inclut les informations des auteurs
- Retourne 404 si conversation inexistante ou supprimée

**Scénarios :**

- **Récupération réussie**
  - **Étant donné** qu'une conversation existe et n'est pas supprimée
  - **Quand** on demande cette conversation
  - **Alors** la conversation et ses messages sont retournés

- **Conversation introuvable**
  - **Étant donné** qu'une conversation n'existe pas ou est supprimée
  - **Quand** on demande cette conversation
  - **Alors** une erreur 404 est retournée

---

### US-4: Modifier le titre d'une conversation

**En tant qu'auteur d'une conversation,**
**Je veux pouvoir modifier le titre de ma conversation,**
**Afin de corriger une erreur ou améliorer la clarté**

**Règles métier :**

- L'utilisateur doit être authentifié et propriétaire de la conversation
- Le nouveau titre est obligatoire (1-200 caractères)
- Retourne 403 si l'utilisateur n'est pas le propriétaire

**Scénarios :**

- **Modification réussie**
  - **Étant donné** qu'un utilisateur authentifié possède une conversation
  - **Quand** il modifie le titre avec une valeur valide
  - **Alors** le titre est mis à jour

- **Modification échouée - non propriétaire**
  - **Étant donné** qu'un utilisateur authentifié ne possède pas la conversation
  - **Quand** il tente de modifier le titre
  - **Alors** une erreur 403 est retournée

- **Modification échouée - validation**
  - **Étant donné** qu'un utilisateur possède une conversation
  - **Quand** il soumet un titre invalide
  - **Alors** une erreur 400 est retournée

---

### US-5: Supprimer une conversation

**En tant qu'auteur d'une conversation,**
**Je veux pouvoir supprimer ma conversation,**
**Afin de retirer du forum une discussion que je ne souhaite plus voir publiée**

**Règles métier :**

- L'utilisateur doit être authentifié et propriétaire de la conversation
- Suppression soft delete (marque `deletedAt`)
- Tous les messages de la conversation sont également supprimés
- Retourne 403 si l'utilisateur n'est pas le propriétaire

**Scénarios :**

- **Suppression réussie**
  - **Étant donné** qu'un utilisateur possède une conversation
  - **Quand** il supprime la conversation
  - **Alors** la conversation et ses messages sont marqués comme supprimés

- **Suppression échouée - non propriétaire**
  - **Étant donné** qu'un utilisateur ne possède pas la conversation
  - **Quand** il tente de supprimer la conversation
  - **Alors** une erreur 403 est retournée

---

## 💬 MESSAGE

### US-6: Créer un message dans une conversation

**En tant qu'utilisateur authentifié,**
**Je veux poster un message dans une conversation existante,**
**Afin de participer à la discussion**

**Règles métier :**

- L'utilisateur doit être authentifié
- La conversation doit exister et ne pas être supprimée
- Le contenu est obligatoire (1-2000 caractères)

**Scénarios :**

- **Création réussie**
  - **Étant donné** qu'un utilisateur est authentifié et qu'une conversation existe
  - **Quand** il crée un message avec un contenu valide
  - **Alors** le message est créé et attaché à la conversation

- **Création échouée - validation**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il soumet un contenu invalide
  - **Alors** une erreur 400 est retournée

- **Création échouée - conversation inexistante**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il tente de créer un message dans une conversation inexistante
  - **Alors** une erreur 404 est retournée

---

### US-7: Modifier un message

**En tant qu'auteur d'un message,**
**Je veux pouvoir modifier le contenu de mon message,**
**Afin de corriger une erreur ou ajouter des précisions**

**Règles métier :**

- L'utilisateur doit être authentifié et propriétaire du message
- Le nouveau contenu est obligatoire (1-2000 caractères)
- Retourne 403 si l'utilisateur n'est pas le propriétaire

**Scénarios :**

- **Modification réussie**
  - **Étant donné** qu'un utilisateur possède un message
  - **Quand** il modifie le contenu avec une valeur valide
  - **Alors** le contenu est mis à jour

- **Modification échouée - non propriétaire**
  - **Étant donné** qu'un utilisateur ne possède pas le message
  - **Quand** il tente de modifier le message
  - **Alors** une erreur 403 est retournée

---

### US-8: Supprimer un message

**En tant qu'auteur d'un message,**
**Je veux pouvoir supprimer mon message,**
**Afin de retirer un contenu que je ne souhaite plus publier**

**Règles métier :**

- L'utilisateur doit être authentifié et propriétaire du message
- Suppression soft delete (marque `deletedAt`)
- Retourne 403 si l'utilisateur n'est pas le propriétaire

**Scénarios :**

- **Suppression réussie**
  - **Étant donné** qu'un utilisateur possède un message
  - **Quand** il supprime le message
  - **Alors** le message est marqué comme supprimé

- **Suppression échouée - non propriétaire**
  - **Étant donné** qu'un utilisateur ne possède pas le message
  - **Quand** il tente de supprimer le message
  - **Alors** une erreur 403 est retournée

---

## 👤 USER (AUTHENTIFICATION)

### US-9: S'inscrire sur le forum (Sign Up)

**En tant que visiteur,**
**Je veux créer un compte utilisateur,**
**Afin de pouvoir participer aux discussions du forum**

**Architecture** : Better Auth

**Règles métier :**

- Email obligatoire, unique et valide (max 255 caractères)
- Mot de passe fort obligatoire (min 8 caractères avec majuscule, minuscule, chiffre, caractère spécial)
- Nom optionnel (max 100 caractères)
- Connexion automatique après inscription réussie
- Retourne 409 si l'email existe déjà

**Scénarios :**

- **Inscription réussie**
  - **Étant donné** qu'aucun utilisateur n'existe avec cet email
  - **Quand** on s'inscrit avec des identifiants valides
  - **Alors** l'utilisateur est créé et automatiquement connecté

- **Inscription échouée - email déjà utilisé**
  - **Étant donné** qu'un utilisateur existe avec cet email
  - **Quand** on tente de s'inscrire avec le même email
  - **Alors** une erreur 409 est retournée

- **Inscription échouée - validation**
  - **Étant donné** qu'aucun utilisateur n'existe
  - **Quand** on soumet un email ou mot de passe invalide
  - **Alors** une erreur 400 est retournée

---

### US-10: Se connecter au forum (Sign In)

**En tant qu'utilisateur enregistré,**
**Je veux me connecter à mon compte,**
**Afin d'accéder aux fonctionnalités réservées aux membres**

**Architecture** : Better Auth

**Règles métier :**

- Email et mot de passe obligatoires
- Retourne 401 si identifiants incorrects
- Création d'une session sécurisée (30 jours)

**Scénarios :**

- **Connexion réussie**
  - **Étant donné** qu'un utilisateur existe avec des identifiants valides
  - **Quand** il se connecte avec ces identifiants
  - **Alors** une session est créée et l'utilisateur est connecté

- **Connexion échouée - identifiants incorrects**
  - **Étant donné** qu'un utilisateur existe
  - **Quand** il se connecte avec un email ou mot de passe incorrect
  - **Alors** une erreur 401 est retournée

---

### US-11: Se déconnecter (Sign Out)

**En tant qu'utilisateur connecté,**
**Je veux me déconnecter de mon compte,**
**Afin de sécuriser ma session sur un appareil partagé**

**Architecture** : Better Auth

**Règles métier :**

- Supprime la session de la base de données
- Supprime les cookies de session

**Scénarios :**

- **Déconnexion réussie**
  - **Étant donné** qu'un utilisateur est connecté
  - **Quand** il se déconnecte
  - **Alors** la session est supprimée

---

### US-12: Demander la réinitialisation du mot de passe

**En tant qu'utilisateur ayant oublié son mot de passe,**
**Je veux demander un lien de réinitialisation par email,**
**Afin de pouvoir définir un nouveau mot de passe**

**Architecture** : Better Auth

**Règles métier :**

- Email obligatoire
- Génération d'un token sécurisé (valable 10 minutes)
- Envoi d'un email avec lien de réinitialisation
- Rate limiting (1 demande/60s par email)
- Retourne toujours 200 (même si email inexistant - sécurité)

**Scénarios :**

- **Demande réussie**
  - **Étant donné** qu'un utilisateur existe
  - **Quand** il demande la réinitialisation
  - **Alors** un token est généré et un email est envoyé

- **Rate limiting dépassé**
  - **Étant donné** qu'une demande récente a été faite
  - **Quand** on fait une nouvelle demande trop tôt
  - **Alors** une erreur 429 est retournée

---

### US-13: Réinitialiser le mot de passe

**En tant qu'utilisateur ayant reçu un lien de réinitialisation,**
**Je veux définir un nouveau mot de passe,**
**Afin de récupérer l'accès à mon compte**

**Architecture** : Better Auth

**Règles métier :**

- Token obligatoire (doit exister, ne pas être expiré ou utilisé)
- Nouveau mot de passe doit respecter les règles de l'inscription
- Toutes les sessions de l'utilisateur sont invalidées
- Retourne 400 si token invalide ou mot de passe faible

**Scénarios :**

- **Réinitialisation réussie**
  - **Étant donné** qu'un token valide et non expiré existe
  - **Quand** on réinitialise avec un mot de passe fort
  - **Alors** le mot de passe est mis à jour et les sessions invalidées

- **Réinitialisation échouée - token invalide**
  - **Étant donné** qu'un token est expiré, utilisé ou inexistant
  - **Quand** on tente de réinitialiser
  - **Alors** une erreur 400 est retournée

- **Réinitialisation échouée - mot de passe faible**
  - **Étant donné** qu'un token valide existe
  - **Quand** on soumet un mot de passe invalide
  - **Alors** une erreur 400 est retournée

---

### US-14: Consulter les contributions d'un utilisateur

**En tant que visiteur (authentifié ou non),**
**Je veux consulter le profil d'un utilisateur et voir ses contributions,**
**Afin de connaître son activité sur le forum**

**Règles métier :**

- Accessible sans authentification
- Affiche les informations publiques (name, avatar, bio, createdAt)
- Affiche les conversations et messages actifs de l'utilisateur
- Ne jamais exposer email ni password
- Retourne 404 si l'utilisateur n'existe pas

**Scénarios :**

- **Récupération réussie**
  - **Étant donné** qu'un utilisateur existe avec des contributions
  - **Quand** on demande son profil
  - **Alors** les informations publiques et contributions sont retournées

- **Utilisateur inexistant**
  - **Étant donné** qu'aucun utilisateur n'existe avec cet ID
  - **Quand** on demande ce profil
  - **Alors** une erreur 404 est retournée

---

### US-15a: Modifier nom et bio du profil

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir modifier mon nom et ma bio,**
**Afin de personnaliser les informations textuelles de mon profil**

**Règles métier :**

- L'utilisateur doit être authentifié
- Nom optionnel (max 100 caractères)
- Bio optionnelle (max 500 caractères)
- Retourne 400 si validation échoue

**Scénarios :**

- **Modification réussie**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il modifie son nom et/ou sa bio avec des valeurs valides
  - **Alors** les champs sont mis à jour

- **Modification échouée - validation**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il soumet des valeurs trop longues
  - **Alors** une erreur 400 est retournée

---

### US-15b: Upload avatar utilisateur

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir uploader une photo de profil (avatar),**
**Afin de personnaliser visuellement mon compte**

**Règles métier :**

- L'utilisateur doit être authentifié
- Formats acceptés : JPEG, PNG, WebP
- Taille maximum : 2 MB
- Génération automatique d'une URL CDN après upload
- Retourne 400 si validation échoue

**Scénarios :**

- **Upload réussi**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il upload une image valide
  - **Alors** l'image est uploadée et l'URL est stockée

- **Upload échoué - validation**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il upload un fichier trop volumineux ou format invalide
  - **Alors** une erreur 400 est retournée

---

### US-15c: Changer mot de passe

**En tant qu'utilisateur authentifié,**
**Je veux pouvoir changer mon mot de passe,**
**Afin de sécuriser mon compte ou récupérer un accès compromis**

**Architecture** : Better Auth

**Règles métier :**

- L'utilisateur doit être authentifié
- Ancien mot de passe obligatoire et doit être correct
- Nouveau mot de passe doit respecter les règles de l'inscription
- Toutes les sessions de l'utilisateur sont invalidées
- Retourne 400 si ancien mot de passe incorrect ou nouveau faible

**Scénarios :**

- **Changement réussi**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il change son mot de passe avec un ancien correct et un nouveau fort
  - **Alors** le mot de passe est mis à jour et toutes les sessions invalidées

- **Changement échoué - ancien mot de passe incorrect**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il fournit un mauvais ancien mot de passe
  - **Alors** une erreur 400 est retournée

- **Changement échoué - nouveau mot de passe faible**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il soumet un nouveau mot de passe invalide
  - **Alors** une erreur 400 est retournée

---

### US-16: Récupérer mon profil utilisateur

**En tant qu'utilisateur authentifié,**
**Je veux récupérer mes informations de profil,**
**Afin de les afficher ou de pré-remplir un formulaire de modification**

**Règles métier :**

- L'utilisateur doit être authentifié
- Retourne id, email, name, bio, avatar
- Ne jamais exposer password
- Retourne 401 si non authentifié

**Scénarios :**

- **Récupération réussie**
  - **Étant donné** qu'un utilisateur est authentifié
  - **Quand** il récupère son profil
  - **Alors** ses informations sont retournées

---

### US-17: Vérifier son adresse email

**En tant qu'utilisateur nouvellement inscrit,**
**Je veux recevoir un email de vérification et confirmer mon adresse email,**
**Afin de pouvoir me connecter au forum et prouver que mon email est valide**

**Architecture** : Better Auth

**Règles métier :**

- Vérification OBLIGATOIRE : connexion bloquée tant que l'email n'est pas vérifié
- Lors de l'inscription, pas d'auto-login
- Email de vérification envoyé automatiquement après inscription
- Token sécurisé valable 24 heures
- Retourne 403 si tentative de connexion avec email non vérifié
- Retourne 400 si token invalide ou expiré

**Scénarios :**

- **Inscription et vérification réussie (flux complet)**
  - **Étant donné** qu'un nouvel utilisateur s'inscrit
  - **Quand** il s'inscrit avec un email valide
  - **Alors** un email de vérification est envoyé et aucune session n'est créée
  - **Quand** il clique sur le lien de vérification
  - **Alors** son email est vérifié et il peut se connecter

- **Tentative de connexion avec email non vérifié**
  - **Étant donné** qu'un utilisateur n'a pas vérifié son email
  - **Quand** il tente de se connecter
  - **Alors** la connexion est refusée (403)

- **Vérification échouée - token invalide ou expiré**
  - **Étant donné** qu'un utilisateur clique sur un lien de vérification
  - **Quand** le token est expiré ou invalide
  - **Alors** une erreur 400 est retournée

---
