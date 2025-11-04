# Troubleshooting Guide

## electronAPI Not Available

If you see the error: `electronAPI not available, returning empty users`

### What to Check:

1. **Check Electron DevTools Console** (should auto-open)
   - Look for: `✅ Preload script loaded successfully!`
   - Look for: `✅ electronAPI exposed to renderer!`
   - Look for: `Default admin user created:`
   - If these don't appear, there's a preload issue

2. **Check Terminal Console**
   - Run `npm run dev`
   - You should see Electron starting up
   - Look for any error messages

3. **Verify You're Running Electron (not browser)**
   - You should see an Electron window (not just browser)
   - DevTools should open automatically
   - Title bar should say "Geofence Alert"

### Debugging Steps:

1. **Stop all running instances:**
   ```bash
   # Kill any existing Electron processes
   # Then restart fresh
   npm run build
   npm run dev
   ```

2. **Check Console Output:**
   - Open DevTools in the Electron window
   - Look for the debug messages
   - Check if `window.electronAPI` exists

3. **Verify File Structure:**
   ```bash
   ls dist/
   # Should see: main.js, preload.cjs, renderer/
   ```

4. **Check userData location:**
   - Windows: `%APPDATA%\geofence-alert\user-data.json`
   - Look for the file and check if it has the default user

### Common Issues:

**Issue:** Still seeing "electronAPI not available"

**Solution:**
1. Delete `dist/` folder
2. Run `npm run build` again
3. Make sure `dist/preload.cjs` exists and is CommonJS format
4. Restart the app with `npm run dev`

**Issue:** Preload script not loading

**Solution:**
- Check `dist/main.js` references `preload.cjs` (not `preload.js`)
- Check `dist/preload.cjs` uses `require()` not `import`
- Verify `contextBridge.exposeInMainWorld` is called

**Issue:** Can't find user-data.json

**Solution:**
- The file is created on first run
- Make sure you run `npm run dev` from the project root
- Check Electron console for "Default admin user created"

## Still Need Help?

Check these files:
1. `dist/main.js` - line 16 should reference `preload.cjs`
2. `dist/preload.cjs` - should use CommonJS `require()`
3. Console logs - should show preload loading

Login credentials when working:
- Username: `admin`
- Password: `Admin@123`

