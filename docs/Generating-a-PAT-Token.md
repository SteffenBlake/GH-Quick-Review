# Generating a GitHub Personal Access Token (PAT)

## ⚠️ Security Notice

**Before proceeding, please review our security documentation:**

Read [Should You Trust This App?](https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Should-You-Trust-This-App.md) to understand:
- How GH-Quick-Review handles your Personal Access Token
- What data is stored and where
- Security measures in place to protect your credentials
- What access the application has to your repositories

**Key Security Points:**
- ✅ Your PAT is stored **only in your browser's local storage** - never sent to third-party servers
- ✅ The app is **fully client-side** - all API calls go directly from your browser to GitHub
- ✅ **Fine-grained tokens** limit access to only the repositories you explicitly select
- ✅ **Read-only content access** ensures the app cannot modify your code
- ❌ **Never share your token** with anyone or paste it into untrusted applications

> If you have any security concerns, please review the source code at [github.com/SteffenBlake/GH-Quick-Review](https://github.com/SteffenBlake/GH-Quick-Review) or open an issue for questions.

---

## Overview

This guide will walk you through creating a fine-grained Personal Access Token (PAT) for use with GH-Quick-Review.

Personal Access Tokens are a secure way to grant applications limited access to your GitHub repositories without sharing your password. Fine-grained tokens provide the most secure option by allowing you to precisely control which repositories and permissions the application can access.

---

## Step-by-Step Instructions

### 1. Navigate to Token Creation Page

Go to GitHub's token creation page:  
**[https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)**

> **Note:** Make sure you're logged into your GitHub account first.

---

### 2. Configure Token Details

#### Token Name
Give your token a descriptive name that indicates its purpose, for example:
- `GH-Quick-Review`
- `PR Review Tool - Personal`
- `PR Diff Viewer`

#### Description (Optional)
Add a description to help you remember what this token is for:
```
Personal Access Token for GH-Quick-Review. 
Used to view pull request diffs and manage review comments.
```

---

### 3. Set Token Expiration

Choose an appropriate expiration date for your token. GitHub requires all tokens to expire for security reasons.

**Recommended options:**
- **30 days** - Good for testing or temporary use
- **60 days** - Balanced security and convenience
- **90 days** - Maximum recommended for regular use
- **Custom** - Set a specific date if needed

> **Important:** You'll need to regenerate your token when it expires. GitHub will send you email reminders before expiration.

---

### 4. Select Repository Access

**Choose "Only select repositories"** - This is critical for security.

#### Why This Matters

Selecting "Only select repositories" instead of "All repositories" follows the **principle of least privilege**:

- ✅ **Limits exposure** - If your token is compromised, only the selected repositories are at risk
- ✅ **Reduces attack surface** - Attackers can't access your entire GitHub account
- ✅ **Prevents accidental damage** - The app can only interact with repositories you explicitly authorize
- ✅ **Easier to audit** - You know exactly which repositories have granted access
- ✅ **Compliance friendly** - Meets security best practices for organizations

#### How to Select Repositories

After choosing "Only select repositories", a dropdown will appear:
1. Click the dropdown menu
2. Search for or select each repository you want to review PRs for
3. You can select multiple repositories

> **Important:** Choose carefully - you cannot edit which repositories a token has access to after creation. If you need to change repository access, you must revoke the old token and create a new one.

---

### 5. Configure Repository Permissions

Expand the **Permissions** section and configure the following:

#### Pull Requests
- **Access level:** `Read and write`
- **Why needed:**
  - **Read:** View pull request data, diffs, and metadata
  - **Write:** Post review comments, approve/request changes, and manage review threads

#### Contents
- **Access level:** `Read-only`
- **Why needed:**
  - View file contents for large files that aren't included in standard PR diffs
  - Read repository file structure and metadata

> **Note:** These are the **minimum permissions** required. Do not grant additional permissions unless specifically needed.

---

### 6. Generate and Save Your Token

1. Click the **"Generate token"** button at the bottom of the page
2. GitHub will generate your token and display it **once**
3. **Copy the token immediately** - you won't be able to see it again!

#### Where to Store Your Token

**Recommended storage options:**
- ✅ Password manager (1Password, Bitwarden, LastPass, etc.)
- ✅ Encrypted notes application
- ✅ Secure environment variable in your development environment

**Never store tokens in:**
- ❌ Plain text files in your home directory
- ❌ Git repositories (even private ones)
- ❌ Unencrypted cloud storage
- ❌ Email or messaging apps
- ❌ Browser bookmarks or history

---

### 7. Using Your Token

When GH-Quick-Review prompts for your token:
1. Paste the entire token string
2. The app will validate the token
3. If successful, the app will save it securely in your browser's local storage

> **Security Note:** Your token is stored locally in your browser and is never sent to any third-party servers except GitHub's official API.

---

## Token Security Best Practices

### If Your Token Is Compromised

If you believe your token has been exposed or compromised:

1. **Immediately revoke the token:**
   - Go to [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)
   - Find the compromised token in the list
   - Click **"Revoke"** next to the token
   - Confirm revocation

2. **Review your security log:**
   - Visit [https://github.com/settings/security-log](https://github.com/settings/security-log)
   - Look for any suspicious activity
   - Check for unauthorized API calls or repository access

3. **Generate a new token:**
   - Follow this guide again to create a replacement token
   - Update the token in GH-Quick-Review

4. **Report if necessary:**
   - If you suspect unauthorized access to repositories, notify repository administrators
   - For serious security incidents, contact [GitHub Support](https://support.github.com/contact)

### Additional Security Tips

- 🔒 **Rotate tokens regularly** - Generate new tokens every 60-90 days even if not compromised
- 🔍 **Audit permissions periodically** - Review which repositories have access and remove unused ones
- 🚫 **Revoke unused tokens** - Delete old tokens you're no longer using
- 📧 **Enable email notifications** - GitHub will warn you about expiring or suspicious token activity
- 🔐 **Enable 2FA** - Two-factor authentication adds an extra layer of account security

---

## Troubleshooting

### "Insufficient Permissions" Error

If you see permission errors when using the app:
- Verify you selected **both** "Pull requests (Read and write)" and "Contents (Read-only)"
- Check that you've selected the correct repositories in the token settings
- Make sure the token hasn't expired

### Token Not Working

- Ensure you copied the entire token (they're typically 93 characters long for fine-grained tokens)
- Verify the token hasn't been revoked at [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)
- Check the token's expiration date

### Need to Add More Repositories

If you need to grant access to additional repositories, you must:
1. Go to [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)
2. Revoke your existing token
3. Create a new token following this guide
4. Select all the repositories you need (including the new ones)
5. Update the token in GH-Quick-Review

---

## Additional Resources

- [GitHub Documentation: Managing Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/best-practices-for-preventing-data-leaks-in-your-organization)
- [GitHub Support](https://support.github.com/)
