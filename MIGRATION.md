# Project Restructuring - Migration Guide

## What Changed?

The project has been restructured to support both desktop and mobile applications:

### Before
```
geofencealert/
├── src/
├── package.json
├── node_modules/
└── ... (everything in root)
```

### After
```
geofencealert/
├── frontend/           # Desktop Electron app
├── mobile/             # Mobile app (coming soon)
├── package.json        # Workspace root
└── ... (root docs)
```

## What to Do Now

### Option 1: Fresh Install (Recommended)

1. **Delete existing node_modules**:
   ```bash
   # From root directory
   Remove-Item -Recurse -Force node_modules
   ```

2. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

### Option 2: Keep Existing Setup

If you already have `node_modules` in the root that you want to keep:

1. The old structure still works from root directory
2. Eventually, migrate to using `frontend/` directory
3. The workspace `package.json` in root provides convenience scripts

## Development Workflow

### From Root Directory (Workspace)
```bash
npm run dev               # Runs frontend dev server
npm run build             # Builds frontend
npm run install:frontend  # Installs frontend dependencies
```

### From Frontend Directory (Direct)
```bash
cd frontend
npm run dev               # Start dev server
npm run build             # Build for production
npm run dist              # Package for distribution
```

## Important Notes

1. **All frontend code** is now in `frontend/` directory
2. **Dependencies** should be installed in `frontend/node_modules/`
3. **Environment files** (`.env`) go in `frontend/` directory
4. **Build outputs** go to `frontend/dist/`
5. **Mobile app** development will happen in `mobile/` directory

## Troubleshooting

### "Module not found" errors

- Make sure you're running `npm install` from `frontend/` directory
- Delete `node_modules` in root if it exists
- Reinstall from `frontend/` directory

### "electronAPI not available"

- Check you're running from correct directory
- Restart dev server: `npm run dev` from `frontend/`

## Need Help?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

