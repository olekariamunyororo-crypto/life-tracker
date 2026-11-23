# Deployment Guide

## Production Build

1. **Install** (devDependencies are needed: `postinstall` runs `prisma generate`)
   ```bash
   npm ci
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Build & start**
   ```bash
   npm run build
   npm start
   ```

4. **Environment Variables**
   - `POSTGRES_DATABASE_URL` — PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — **required in
     production.** Without them the app fails closed (HTTP 503) instead of
     serving anyone's data to the public internet.

## First sign-in: claim your existing data (one-time)

Rows created before authentication was enabled belong to the placeholder user
`local-dev-user`. Once Clerk is on, you are a *different* user, so that history
will not appear until it is reassigned. Sign in once, copy your Clerk user id
(`user_...`), then run (replace `user_XXXX`):

```sql
BEGIN;
INSERT INTO "user" ("id", "email", "externalId")
VALUES ('user_XXXX', 'user_XXXX@users.clerk.invalid', 'user_XXXX')
ON CONFLICT ("id") DO NOTHING;
UPDATE "daily_entry" SET "userId" = 'user_XXXX' WHERE "userId" = 'local-dev-user';
UPDATE "supplement"  SET "userId" = 'user_XXXX' WHERE "userId" = 'local-dev-user';
UPDATE "goal"        SET "userId" = 'user_XXXX' WHERE "userId" = 'local-dev-user';
COMMIT;
```

## Deployment Options

### Vercel (Recommended)
1. Connect to GitHub repository
2. Configure environment variables (including the Clerk keys above)
3. Deploy with automatic builds

### Manual Deployment
1. **Server Requirements**
   - Node.js 18.18+ (20+ recommended)
   - PostgreSQL
   - PM2 or similar process manager, behind HTTPS (HSTS is sent by the app)

2. **Setup Steps**
   ```bash
   npm ci
   npx prisma migrate deploy
   npm run build
   npm start
   ```

## Post-Deployment

### Monitoring
- Check application logs
- Monitor database performance
- Track error rates

### Maintenance
- Regular database backups
- Update dependencies
- Monitor security advisories
