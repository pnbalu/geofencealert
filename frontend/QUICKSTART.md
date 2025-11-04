# Quick Start - Login Credentials

## 🔐 Default Login Credentials

**Use these credentials for first-time login:**

- **Username:** `admin`  
- **Email:** `admin@geofencealert.com`
- **Password:** `Admin@123`

## 🚀 First Time Login Process

1. **Start the application:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Login with default credentials:**
   - Username: `admin`
   - Password: `Admin@123`

3. **Change your password immediately:**
   - After login, you'll be prompted to change your password
   - Create a strong password with:
     - Minimum 8 characters
     - At least one uppercase letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*)

## ⚠️ Important Security Notes

- The app automatically creates these default credentials on first launch
- You **MUST** change the password on first login
- These credentials will not work if you've already logged in and changed the password
- If you forget your new password, you'll need to delete the user data file to reset

## 🆘 Troubleshooting

**Problem:** Can't login with default credentials

**Solutions:**
1. Check the console output when starting the app - you should see "Default admin user created"
2. Make sure you're using the exact credentials above (case-sensitive)
3. If you already logged in, use your changed password
4. If you see "electronAPI not available" error:
   - Make sure you're running `npm run dev` (not opening in browser)
   - Electron window should open automatically
   - Check the Electron console (DevTools should open automatically)
   - Restart the app if needed
5. To reset, delete the user data file at:
   - Windows: `%APPDATA%\geofence-alert\user-data.json`
   - macOS: `~/Library/Application Support/geofence-alert/user-data.json`
   - Linux: `~/.config/geofence-alert/user-data.json`

## 📝 Creating Additional Users

After logging in as admin:

1. Go to **Users** page
2. Click **Invite User**
3. Fill in details and select "Administrator" role
4. Save the generated credentials securely
5. Share with the new user
6. They must change their password on first login

---

**Need Help?** Check the main README.md for more detailed information.

