# SaveMyName - Deployment Guide

## Current Setup (Development)

| Component | URL |
|-----------|-----|
| Frontend | `https://e9c53c8d-e160-456d-ba89-6b716213ef37.lovableproject.com` |
| Backend | `https://q58217l9-8000.inc1.devtunnels.ms` |

---

## Switching to Production (savemyname.in)

### 1. Frontend Changes

**File: `src/config.ts`**

```typescript
// Change FROM:
export const API_BASE_URL = 'https://q58217l9-8000.inc1.devtunnels.ms';

// Change TO:
export const API_BASE_URL = 'https://savemyname.in';
// OR if backend is on a subdomain:
export const API_BASE_URL = 'https://api.savemyname.in';
```

---

### 2. Backend Changes

**File: `.env` or environment variables**

```bash
# Change FROM:
REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
FRONTEND_URL=https://e9c53c8d-e160-456d-ba89-6b716213ef37.lovableproject.com

# Change TO:
REDIRECT_URI=https://savemyname.in/auth/google/callback
# OR if backend is on subdomain:
REDIRECT_URI=https://api.savemyname.in/auth/google/callback

FRONTEND_URL=https://savemyname.in
```

**File: `app/main.py` (CORS settings)**

```python
# Change FROM:
origins = [
    "https://e9c53c8d-e160-456d-ba89-6b716213ef37.lovableproject.com",
    "http://localhost:5173",
]

# Change TO:
origins = [
    "https://savemyname.in",
    "https://www.savemyname.in",
]
```

**OAuth callback redirect (in your auth route)**

```python
# Change FROM:
return RedirectResponse(
    url=f"https://e9c53c8d-e160-456d-ba89-6b716213ef37.lovableproject.com/auth/callback?token={token}"
)

# Change TO:
return RedirectResponse(
    url=f"https://savemyname.in/auth/callback?token={token}"
)
```

---

### 3. Google Cloud Console Changes

Go to: [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

**OAuth 2.0 Client ID settings:**

| Setting | Development Value | Production Value |
|---------|------------------|------------------|
| Authorized JavaScript origins | `https://e9c53c8d-...lovableproject.com` | `https://savemyname.in` |
| Authorized redirect URIs | `https://q58217l9-8000.inc1.devtunnels.ms/auth/google/callback` | `https://savemyname.in/auth/google/callback` |

---

### 4. DNS & Hosting Setup

#### Option A: Frontend & Backend on same domain
```
savemyname.in → Frontend (Lovable published app)
savemyname.in/api/* → Backend (reverse proxy to your server)
```

#### Option B: Backend on subdomain (Recommended)
```
savemyname.in → Frontend (Lovable published app)
api.savemyname.in → Backend server
```

For Option B, update `API_BASE_URL` in frontend:
```typescript
export const API_BASE_URL = 'https://api.savemyname.in';
```

---

## Checklist Before Going Live

- [ ] Update `src/config.ts` → `API_BASE_URL` to production URL
- [ ] Update backend `.env` → `REDIRECT_URI` and `FRONTEND_URL`
- [ ] Update backend CORS → allow `savemyname.in`
- [ ] Update backend OAuth redirect → point to `savemyname.in/auth/callback`
- [ ] Update Google Cloud Console → JavaScript origins & redirect URIs
- [ ] Deploy backend to production server
- [ ] Publish frontend via Lovable → connect custom domain `savemyname.in`
- [ ] Test login flow end-to-end

---

## Quick Reference

### Development URLs
```
Frontend: https://e9c53c8d-e160-456d-ba89-6b716213ef37.lovableproject.com
Backend:  https://q58217l9-8000.inc1.devtunnels.ms
```

### Production URLs
```
Frontend: https://savemyname.in
Backend:  https://savemyname.in OR https://api.savemyname.in
```
