# Guide d'Administration - Synapse Portfolio

## Vue d'ensemble

Ce guide explique comment utiliser les fonctionnalités d'administration du portfolio Synapse pour gérer toutes les données et surveiller l'activité du système.

## Accès Administrateur

### Authentification
- **Email autorisé**: `fgadedjro@gmail.com`
- **Méthode**: Connexion Google OAuth
- **Accès**: Toutes les fonctionnalités d'administration

### Pages d'administration
- **Dashboard principal**: `/admin`
- **Test d'authentification**: `/auth-test`
- **Suivi des candidatures**: `/application-tracker`

## Structure des Données Firestore

### Collections principales

#### `/users/{userId}`
Structure complète du portfolio utilisateur :
```json
{
  "personalInfo": {
    "name": "string",
    "title": "string", 
    "introduction": "string",
    "contact": { ... },
    "resumeSummaries": [ ... ]
  },
  "projects": [ ... ],
  "experience": [ ... ],
  "skills": [ ... ],
  "networkingContacts": [ ... ],
  "lastUpdated": "timestamp",
  "version": "number"
}
```

#### `/users/{userId}/applications/{applicationId}`
Candidatures d'emploi avec contenu généré par IA :
```json
{
  "jobTitle": "string",
  "jobDescription": "string",
  "tailoredResume": "string",
  "coverLetter": "string",
  "matchingScore": "number",
  "status": "draft|applied|interview|rejected|accepted",
  "createdAt": "timestamp"
}
```

#### `/users/{userId}/activity/{activityId}`
Journaux d'activité système :
```json
{
  "action": "create|update|delete",
  "resource": "personalInfo|projects|experience|skills|networking|applications",
  "resourceId": "string",
  "changes": { ... },
  "timestamp": "timestamp"
}
```

## Fonctionnalités d'Administration

### 1. Dashboard Principal (`/admin`)

#### Statistiques système
- **Nombre total d'utilisateurs**
- **Nombre de candidatures**
- **Nombre de projets**
- **Contacts réseau**

#### Onglets de gestion
- **Overview**: Vue d'ensemble des données
- **Job Applications**: Gestion des candidatures
- **Networking**: Gestion des contacts professionnels
- **Activity Logs**: Historique détaillé des activités

### 2. Gestion des Données

#### Informations personnelles
```typescript
// Mise à jour des informations personnelles
await firestoreService.updatePersonalInfo(userId, personalInfo);
```

#### Projets
```typescript
// Ajouter un projet
await firestoreService.addProject(userId, project);

// Supprimer un projet
await firestoreService.deleteProject(userId, projectId);

// Mettre à jour tous les projets
await firestoreService.updateProjects(userId, projects);
```

#### Expérience professionnelle
```typescript
// Mettre à jour l'expérience
await firestoreService.updateExperience(userId, experience);
```

#### Compétences
```typescript
// Mettre à jour les compétences
await firestoreService.updateSkills(userId, skills);
```

#### Contacts réseau
```typescript
// Ajouter un contact
await firestoreService.addNetworkingContact(userId, contact);

// Supprimer un contact
await firestoreService.deleteNetworkingContact(userId, contactId);
```

### 3. Gestion des Candidatures

#### Créer une candidature
```typescript
const application = {
  jobTitle: "Senior Developer",
  jobDescription: "...",
  tailoredResume: "...",
  coverLetter: "...",
  language: "English",
  matchingScore: 85,
  matchingSkills: ["React", "Node.js"],
  lackingSkills: ["Kubernetes"],
  status: "draft"
};

await firestoreService.saveJobApplication(userId, application);
```

#### Mettre à jour le statut
```typescript
await firestoreService.updateJobApplication(userId, applicationId, {
  status: "applied"
});
```

### 4. Surveillance et Journalisation

#### Journaux d'activité
Toutes les actions sont automatiquement enregistrées :
- **Création** de nouvelles données
- **Modification** de données existantes
- **Suppression** de données
- **Métadonnées** : timestamp, user agent, détails des changements

#### Statistiques système
```typescript
const stats = await firestoreService.getSystemStats();
// Retourne : totalUsers, totalApplications, recentActivity
```

## Permissions et Sécurité

### Règles Firestore

#### Accès administrateur
```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.email == 'fgadedjro@gmail.com';
}
```

#### Accès utilisateur
```javascript
function isOwner(userId) {
  return request.auth.uid == userId;
}
```

#### Collections protégées
- **`/admin/{document=**}`** : Admin uniquement
- **`/config/{configId}`** : Lecture pour tous, écriture admin
- **`/analytics/{document=**}`** : Admin uniquement

### Opérations autorisées

#### Pour l'administrateur
- ✅ Lecture/écriture de toutes les données utilisateur
- ✅ Gestion des candidatures de tous les utilisateurs
- ✅ Accès aux journaux d'activité
- ✅ Statistiques système
- ✅ Configuration système

#### Pour les utilisateurs
- ✅ Lecture/écriture de leurs propres données
- ✅ Gestion de leurs candidatures
- ✅ Lecture de leurs journaux d'activité
- ❌ Accès aux données d'autres utilisateurs

## Opérations de Maintenance

### 1. Sauvegarde des données
```bash
# Export des données Firestore
npm run export:data

# Sauvegarde automatique
gcloud firestore export gs://backup-bucket/backup-$(date +%Y%m%d)
```

### 2. Déploiement des règles
```bash
# Validation et déploiement
npm run deploy:rules

# Ou manuellement
firebase deploy --only firestore:rules
```

### 3. Surveillance
```bash
# Vérification des logs
firebase functions:log

# Métriques de performance
firebase performance:report
```

## API de Service Firestore

### Méthodes principales

#### Données portfolio
- `getPortfolioData(userId)` - Récupérer les données
- `savePortfolioData(userId, data)` - Sauvegarder les données
- `batchUpdatePortfolio(userId, updates)` - Mise à jour en lot

#### Candidatures
- `getJobApplications(userId)` - Liste des candidatures
- `saveJobApplication(userId, application)` - Nouvelle candidature
- `updateJobApplication(userId, id, updates)` - Mise à jour
- `deleteJobApplication(userId, id)` - Suppression

#### Journalisation
- `getActivityLogs(userId, limit)` - Historique d'activité
- `logActivity(userId, action, resource, resourceId, changes)` - Enregistrer une action

#### Abonnements temps réel
- `subscribeToPortfolioData(userId, callback)` - Écoute des changements
- `subscribeToJobApplications(userId, callback)` - Écoute des candidatures

## Dépannage

### Problèmes courants

#### Erreurs de permission
```
Error: Missing or insufficient permissions
```
**Solution**: Vérifier que l'utilisateur est connecté avec le bon email admin

#### Données manquantes
```
Error: Document does not exist
```
**Solution**: Utiliser `refreshData()` pour recréer les données par défaut

#### Erreurs de validation
```
Error: Invalid data format
```
**Solution**: Vérifier la structure des données selon les types TypeScript

### Commandes de diagnostic
```bash
# Vérifier les règles Firestore
firebase firestore:rules:validate

# Tester les permissions
firebase auth:test

# Vérifier la connectivité
firebase projects:list
```

## Bonnes Pratiques

### 1. Gestion des données
- ✅ Toujours valider les données avant sauvegarde
- ✅ Utiliser les opérations en lot pour les mises à jour multiples
- ✅ Implémenter la gestion d'erreurs appropriée
- ✅ Logger toutes les actions importantes

### 2. Sécurité
- ✅ Ne jamais exposer les clés API côté client
- ✅ Valider toutes les entrées utilisateur
- ✅ Utiliser HTTPS pour toutes les communications
- ✅ Auditer régulièrement les permissions

### 3. Performance
- ✅ Utiliser les abonnements temps réel avec parcimonie
- ✅ Implémenter la pagination pour les grandes listes
- ✅ Optimiser les requêtes Firestore
- ✅ Mettre en cache les données fréquemment utilisées

## Support et Maintenance

### Contacts
- **Développeur**: Yaovi Gadedjro
- **Email**: fgadedjro@gmail.com
- **Projet Firebase**: synapse-portfolio-xy86p

### Ressources
- [Documentation Firebase](https://firebase.google.com/docs)
- [Règles de sécurité Firestore](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Console Firebase](https://console.firebase.google.com)

### Monitoring
- **Logs d'erreur**: Console Firebase > Functions > Logs
- **Métriques**: Console Firebase > Analytics
- **Performance**: Console Firebase > Performance