# EduVault Icon Requirements

## Brand Identity Icons

### Required Icon Sizes
Create the following PNG files with the EduVault logo:

1. **icon-192.png** (192x192px)
   - Used for PWA install prompt
   - Android home screen icon

2. **icon-512.png** (512x512px)
   - High-resolution PWA icon
   - Used in app stores

3. **icon-1024.png** (1024x1024px)
   - Splash screen
   - Marketing materials

### Logo Design Specifications

#### Concept
- Open book/vault icon representing knowledge
- Subtle speech waves around the book (voice interaction)
- Indian tricolor accent elements (Saffron #FF9933, White #FFFFFF, Green optional)

#### Style
- Minimalist, flat design
- High contrast for visibility on low-res devices
- Easily readable and recognizable at small sizes

#### Color Palette
- **Primary**: Indigo #3F51B5
- **Accent**: Saffron #FF9933
- **Background**: White #FFFFFF or Transparent

#### Format
- SVG source file (vector, scalable)
- PNG exports at specified sizes
- Transparent background preferred
- Maskable safe zone (80% of icon area)

### Creating Icons

#### Option 1: Design Tools
Use Figma, Adobe Illustrator, or Inkscape:
1. Create 1024x1024px artboard
2. Design logo following specifications above
3. Export as SVG
4. Export PNGs at required sizes

#### Option 2: Online Tools
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- Canva Pro (with custom dimensions)

#### Option 3: Placeholder (Temporary)
For development, use simple geometric shapes:
```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Book/Vault Shape -->
  <rect x="128" y="150" width="256" height="212" fill="#3F51B5" rx="8"/>
  <rect x="256" y="150" width="2" height="212" fill="#FFFFFF"/>
  
  <!-- Speech Waves -->
  <path d="M 100 256 Q 80 256 80 236" stroke="#FF9933" stroke-width="4" fill="none"/>
  <path d="M 100 256 Q 80 256 80 276" stroke="#FF9933" stroke-width="4" fill="none"/>
  
  <path d="M 412 256 Q 432 256 432 236" stroke="#FF9933" stroke-width="4" fill="none"/>
  <path d="M 412 256 Q 432 256 432 276" stroke="#FF9933" stroke-width="4" fill="none"/>
</svg>
```

### Icon Checklist
- [ ] SVG source created
- [ ] icon-192.png exported
- [ ] icon-512.png exported
- [ ] icon-1024.png exported
- [ ] Icons follow brand guidelines
- [ ] Maskable safe zone respected
- [ ] High contrast verified
- [ ] Icons placed in `public/icons/` folder
- [ ] manifest.json updated with correct paths
- [ ] Icons tested on device

### Additional Assets Needed

#### Splash Screen (1024x1024px)
- Gradient background: Indigo → Saffron
- Centered logo
- Tagline below: "ज्ञान की पहुंच, हर कोने तक"

#### Favicon (32x32px, 16x16px)
- Simplified version of main logo
- High contrast for browser tabs

### Testing Icons
1. Install PWA on Android device
2. Check home screen icon quality
3. Verify splash screen appearance
4. Test in light/dark mode
5. Verify maskable icons on different Android launchers

### Resources
- [PWA Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Maskable Icons](https://web.dev/maskable-icon/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)

---

**Priority**: High  
**Status**: Pending icon design  
**Blocker**: No blocker - app works with placeholder, but icons needed before production launch
