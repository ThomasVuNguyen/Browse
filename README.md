# Browse

A simple browser built with Electron.

# Why?

Idk, I could, so I did.

# How to use

### Run Locally (Development)
To start the app in development mode with hot-reloading:
```bash
npm run electron:dev
```

### Build for Production
To build the installer for your OS (Windows .exe, Mac .dmg):
```bash
npm run electron:build
```
The output will be in the `release/` directory.

## GitHub Actions - Automated Builds

This project uses GitHub Actions to automatically build executables for Windows, macOS, and Linux.

### How it works:
- **Automatic triggers**: Builds run automatically on every push to the `main` branch
- **Manual triggers**: You can manually trigger builds from the Actions tab in GitHub
- **Icon conversion**: The workflow automatically converts `public/icon.svg` to platform-specific formats (.ico, .icns, .png)
- **Multi-platform**: Builds simultaneously on Windows, macOS, and Linux runners

### Accessing builds:

1. **From workflow artifacts** (available for 30 days):
   - Go to the "Actions" tab in your GitHub repository
   - Click on a completed workflow run
   - Scroll to "Artifacts" section
   - Download: `windows-build`, `macos-build`, or `linux-build`

2. **From releases** (permanent, only for main branch):
   - Go to the "Releases" section in your GitHub repository
   - Download the executable for your platform from the latest release

### Manually triggering a build:
1. Go to the "Actions" tab
2. Click "Build Multi-Platform Executables"
3. Click "Run workflow"
4. Select the branch (usually `main`)
5. Click "Run workflow" button

The build takes approximately 5-10 minutes to complete all platforms.

