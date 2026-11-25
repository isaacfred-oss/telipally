# TeliPally — Push to GitHub & Publish on Vercel

The app is complete and committed (branch: `main`). To publish it yourself:

## 1. Push to GitHub (2 commands)
```bash
unzip telipally-repo.zip -d telipally && cd telipally
git init -b main && git add -A && git commit -m "TeliPally v1.0.0" 
# create an empty repo named "telipally" on github.com first, then:
git remote add origin https://github.com/<YOUR-USERNAME>/telipally.git
git push -u origin main
```

## 2. Publish live on Vercel (1 minute)
- Go to https://vercel.com/new
- Click "Import Git Repository" → choose your `telipally` repo
- Leave all settings at their defaults → click **Deploy**
- Live URL appears when the build finishes (~2 min)

No environment variables are required. Zero configuration needed (vercel.json is included).
