---
description: Pre-commit checklist to verify everything is ready
---

# Pre-Commit Checklist

Before committing changes, please verify the following:

## 1. Test the Game
- [ ] Open index.html in a browser (or use Live Server)
- [ ] Test all new features added this session
- [ ] Verify no breaking changes to existing features
- [ ] Check that the game starts without errors

## 2. Check for Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for JavaScript errors
- [ ] Check Network tab for failed asset loads
- [ ] Verify no 404 errors or loading failures

## 3. Review Git Status
- [ ] Run `git status` to see changed files
- [ ] Verify all intended files are included
- [ ] Check for unintended files (temp files, system files)
- [ ] Ensure no sensitive data in commits

## 4. Verify Documentation is Current
- [ ] PROJECT_CONTEXT.md reflects current state
- [ ] PROGRESS_LOG.md has entry for this session (if ending session)
- [ ] DONT_DO.md updated if mistakes were made
- [ ] README.md status is accurate

## 5. Confirm Commit Message Format
- [ ] Follows format: `type: description`
- [ ] Type is one of: feat, fix, docs, refactor, test, chore
- [ ] Description is clear and concise
- [ ] Example: `feat: add Mom conversation dialogue`

## 6. Stage and Commit
```bash
git add .
git commit -m "type: description"
```

## 7. Final Verification
- [ ] Commit was successful
- [ ] Run `git log` to verify commit message
- [ ] One final test: refresh browser, ensure game still works

---

All checks passed! Safe to commit.
