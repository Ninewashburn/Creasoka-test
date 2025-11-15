# Configuration du Service d'Email

## 📧 Vue d'ensemble

Le système de réinitialisation de mot de passe nécessite un service d'envoi d'emails. En **développement**, les emails sont affichés dans la console. En **production**, vous devez configurer un service d'envoi (Resend recommandé).

---

## 🚀 Configuration en Production avec Resend

### Étape 1 : Créer un compte Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Vérifiez votre domaine (ou utilisez le domaine de test)
3. Créez une clé API

### Étape 2 : Installer Resend

```bash
npm install resend
```

### Étape 3 : Configurer les variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Service d'email
RESEND_API_KEY=re_xxx_your_api_key
EMAIL_FROM=noreply@votre-domaine.com

# URL de l'application (pour les liens de réinitialisation)
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### Étape 4 : Activer Resend dans le code

Dans `lib/email.ts`, décommentez le code Resend à la ligne ~126 :

```typescript
// Décommenter et configurer pour la production avec Resend :
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.EMAIL_FROM || 'noreply@creasoka.com',
  to: options.to,
  subject: options.subject,
  html: options.html,
  text: options.text,
});
```

---

## 🔧 Alternatives à Resend

### Option 1 : SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: options.to,
  from: process.env.EMAIL_FROM!,
  subject: options.subject,
  html: options.html,
  text: options.text,
});
```

### Option 2 : Nodemailer (SMTP)

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: options.to,
  subject: options.subject,
  html: options.html,
  text: options.text,
});
```

---

## 🧪 Test en Développement

En mode développement, les emails sont affichés dans la console du serveur. Recherchez :

```
==========================================================
📧 EMAIL ENVOYÉ (MODE DÉVELOPPEMENT)
==========================================================
À: utilisateur@exemple.com
Sujet: Réinitialisation de votre mot de passe - Creasoka
...
```

---

## ✅ Vérification

Pour tester le système de réinitialisation :

1. Démarrez le serveur : `npm run dev`
2. Allez sur `/forgot-password`
3. Entrez un email valide
4. Vérifiez la console pour voir l'email (dev) ou votre boîte email (prod)
5. Copiez le lien de réinitialisation
6. Testez la réinitialisation du mot de passe

---

## 📋 Migration de Base de Données

N'oubliez pas d'exécuter la migration Prisma pour créer la table `PasswordResetToken` :

```bash
npx prisma migrate dev --name add_password_reset_token
```

Ou pour la production :

```bash
npx prisma migrate deploy
```

---

## 🔐 Sécurité

- Les tokens expirent après **1 heure**
- Les tokens ne peuvent être utilisés qu'**une seule fois**
- Les anciens tokens sont automatiquement supprimés
- Les emails invalides ne révèlent pas si un compte existe (protection contre l'énumération)

---

## 📝 Personnalisation des Templates

Les templates d'emails sont dans `lib/email.ts`. Vous pouvez personnaliser :

- Le design HTML
- Les couleurs (actuellement #f97316 pour Creasoka)
- Le texte et les messages
- La durée d'expiration des tokens (actuellement 1h)

---

## 🆘 Dépannage

### Les emails ne sont pas reçus

1. Vérifiez que `RESEND_API_KEY` est configuré
2. Vérifiez que `EMAIL_FROM` utilise un domaine vérifié
3. Vérifiez les logs serveur pour les erreurs
4. Vérifiez le dossier spam

### Token expiré

- Les tokens expirent après 1 heure
- Demandez un nouveau lien de réinitialisation

### Le lien ne fonctionne pas

- Vérifiez que `NEXT_PUBLIC_APP_URL` est correctement configuré
- Assurez-vous de copier le lien complet avec le paramètre `?token=...`

---

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Bonnes pratiques sécurité password reset](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
