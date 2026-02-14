# GroundCTRL Helper Scripts

Utility scripts for project maintenance and development operations.

## 📁 Scripts Overview

### 1. `close_all_servers.bat`
**Purpose:** Terminate all running Node.js development servers.

**Usage:**
```bash
# From project root or anywhere
helper_scripts\close_all_servers.bat
# Or double-click the file
```

**What it does:**
- Terminates all Node.js processes (frontend dev server, backend server, etc.)
- Useful for quickly stopping all development servers
- Shows success/info messages

**Use Cases:**
- Quickly stop all servers before switching branches
- Clean shutdown when servers hang or port conflicts occur
- Batch cleanup of development processes

---

### 2. `map_file_structure.py`
**Purpose:** Generate a visual tree map of the entire project structure.

**Usage:**
```bash
# From project root
python helper_scripts/map_file_structure.py
```

**Output:** Creates `file_structure.txt` in the project root with a complete directory tree.

**What it ignores:** node_modules, .git, build folders, cache directories

---

### 3. `convert_crlf_to_lf.py`
**Purpose:** Convert all text files from Windows (CRLF) to Unix (LF) line endings.

**Usage:**
```bash
# From project root
python helper_scripts/convert_crlf_to_lf.py
```

**Scans:** The entire project recursively

**Processes:** .js, .jsx, .ts, .tsx, .json, .md, .py, .yml, .yaml, .css, .html, and config files

**What it ignores:** node_modules, .git, build folders, binary files

---

### 4. `use_new_syntax.py`
**Purpose:** Automatically fix Tailwind CSS canonical class name warnings from VS Code.

**Usage:**
```bash
# 1. Copy Problems panel JSON (View → Problems → Ctrl+A → Copy)
# 2. Paste into helper_scripts/problems.json
# 3. Run from project root
python helper_scripts/use_new_syntax.py
```

**What it does:**
- Parses VS Code Problems JSON export
- Identifies Tailwind CSS IntelliSense `suggestCanonicalClasses` warnings
- Automatically replaces old class syntax with canonical versions
- Examples: `flex-grow-0` → `grow-0`, `flex-shrink-0` → `shrink-0`

**Processes:**
- .jsx, .tsx, .html files with Tailwind classes
- Exact location-based replacements (line, column)
- Handles Windows path formats from VS Code

**Output:**
```
🔍 Found 15 Tailwind fixes to apply...
✅ Fixed badge.jsx:12:45: 'flex-grow-0' → 'grow-0'
✅ Fixed button.jsx:8:20: 'flex-shrink-0' → 'shrink-0'
🎉 Done! Check files, then: npm run dev
```

---

### 5. `firebase-cleanup.js` ⭐ (Unified Cleanup Tool)
**Purpose:** Interactive Firebase cleanup with multiple modes - safely clean test data or perform complete wipes.

**Usage:**
```bash
# From project root
node helper_scripts/firebase-cleanup.js
```

**Interactive Menu:**
```
╔════════════════════════════════════════════════════════════╗
║        Firebase Cleanup Tool - GroundCTRL                 ║
╚════════════════════════════════════════════════════════════╝

Select cleanup mode:

  1️⃣  NUCLEAR OPTION - Delete EVERYTHING
     • Deletes ALL Firebase Auth users
     • Deletes ALL Firestore collections
     • Complete database wipe

  2️⃣  KEEP USERS - Preserve user accounts
     • Preserves Firebase Auth users
     • Preserves "users" collection
     • Deletes all other Firestore data

  3️⃣  Cancel - Exit without changes

Enter your choice (1, 2, or 3):
```

**Features:**
- 🎯 **Dynamic Discovery:** Automatically finds all collections (no hardcoded lists)
- 🔄 **Recursive Deletion:** Removes subcollections at any depth
- 🛡️ **Safe Mode (Option 2):** Perfect for resetting test data while keeping user accounts
- ⚠️ **Double Confirmation:** Requires explicit typed confirmation phrases
- 📊 **Detailed Reporting:** Shows collections/documents/subcollections deleted
- ⏱️ **Performance Tracking:** Reports elapsed time

**Mode 1: Nuclear Option**
- Confirmation: Type `DELETE ALL DATA`
- Use Case: Complete environment reset, starting fresh
- Deletes: Auth users + ALL Firestore data

**Mode 2: Keep Users (Recommended for Testing)**
- Confirmation: Type `DELETE EXCEPT USERS`
- Use Case: Reset test scenarios without losing user accounts
- Preserves: Auth users + users collection
- Deletes: scenarios, satellites, commands, sessions, etc.

**After Cleanup:**
```bash
# Repopulate with fresh seed data
cd backend && npm run seed
```

**Output Example:**
```
✅ Total collections deleted: 8
✅ Total documents deleted: 247
✅ Users collection: PRESERVED ✓
✅ Auth users: PRESERVED ✓
⏱️ Time elapsed: 5.42s
```

**Legacy Scripts (Deprecated):**
- ~~`FB_cleanup.js`~~ - Use `firebase-cleanup.js` Option 1 instead
- ~~`FB_cleanup_keep_users.js`~~ - Use `firebase-cleanup.js` Option 2 instead

---

## 🚀 Prerequisites

**For Python scripts:**
- Python 3.7 or higher
- No external dependencies required (uses standard library)

**For JavaScript scripts:**
- Node.js 16 or higher
- Backend dependencies installed (`npm install` in `backend/`)
- Properly configured `.env` file

---

## 📝 Notes

- All scripts are designed to run from the **project root directory**
- Scripts automatically detect paths relative to their location
- Safe to run multiple times (idempotent where applicable)
- Check script headers for detailed documentation

---

## 🔒 Security

- `FB_cleanup.js` requires explicit confirmations
- Never run cleanup scripts on production databases
- Review `.env` configuration before running Firebase scripts
- Line ending converter preserves file permissions

---

## 💡 Tips

1. **Before major refactoring:** Run `map_file_structure.py` to document current structure
2. **After Windows checkout:** Run `convert_crlf_to_lf.py` to normalize line endings
3. **Development cleanup:** Use `FB_cleanup.js` to reset test environment
4. **CI/CD integration:** These scripts can be integrated into automated workflows

---

## 📞 Support

For issues or questions about these scripts:
- Check script header comments for detailed documentation
- Review execution output for error messages
- Ensure all prerequisites are met

---

*Last Updated: January 2026*
