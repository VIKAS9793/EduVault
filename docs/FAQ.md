# Frequently Asked Questions (FAQ)
## EduVault Platform

**Last Updated:** September 30, 2025  
**Version:** 1.0  

---

## General Questions

### What is EduVault?

EduVault is a free, offline-first educational platform designed to provide quality, government-aligned learning content to students across India, especially in areas with limited internet connectivity.

### Is EduVault really free?

Yes! EduVault is **100% free** with:
- ❌ No subscription fees
- ❌ No in-app purchases
- ❌ No advertisements
- ❌ No hidden costs
- ✅ Open-source codebase
- ✅ Free forever commitment

### Who can use EduVault?

EduVault is designed for:
- **Students** (Grades 6-12)
- **Teachers** and educators
- **Parents** monitoring their children's education
- **NGO facilitators** distributing educational content
- **Self-learners** of any age
- **Disabled learners** with accessibility needs

### Do I need internet to use EduVault?

**Short answer:** Only for the first-time setup.

**Detailed answer:**
- **First install:** Yes, need internet to download app and initial content (5-10MB)
- **After setup:** No, works 100% offline
- **Updates:** Optional, when you want new content
- **Syncing:** Only if you want to save progress across devices (future feature)

---

## Installation & Setup

### How do I install EduVault?

**On Android:**
1. Open Chrome browser
2. Visit https://eduvault.app
3. Tap "Add to Home Screen"
4. Launch like any app

**On iPhone:**
1. Open Safari
2. Visit https://eduvault.app
3. Tap Share → Add to Home Screen

**On Computer:**
1. Open Chrome/Edge
2. Visit https://eduvault.app
3. Click Install button in address bar

### What devices are supported?

**Mobile:**
- Android 8.0+ (recommended: Android 10+)
- iOS 13+ (iPhone 6S and newer)

**Desktop:**
- Windows 10+
- macOS 10.15+
- Linux (any modern distribution)

**Browsers:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### How much storage space do I need?

- **Minimum:** 200MB free space
- **Recommended:** 500MB
- **Breakdown:**
  - App itself: ~5MB
  - 20 lessons (MVP): ~50MB
  - Full library (500 lessons): ~200MB
  - Audio files: ~100MB
  - Cached data: ~50MB

### How much data will installation use?

**First-time download:**
- Core app: ~5MB
- Initial lessons: ~10-20MB
- **Total: 15-25MB**

**💡 Tip:** Use WiFi for first download to save mobile data!

### Can I use it on multiple devices?

Yes! Install on as many devices as you want. However:
- Progress **doesn't sync** between devices (in v1.0)
- You'll need to complete lessons separately on each device
- Progress sync coming in **v1.2** (May 2026)

---

## Content & Learning

### What subjects are available?

**Currently (v1.0):**
- Science (Physics, Chemistry, Biology)
- Mathematics
- Civics

**Coming soon (v1.1 - Feb 2026):**
- History
- Geography
- English Language
- Hindi Language

### What grades/classes are covered?

**Currently:** Grades 6-12 (Middle & High School)  
**Future:** Grades 1-12 + Competitive Exams (JEE, NEET)

### How many lessons are there?

- **v1.0 (Current):** 20+ lessons
- **v1.1 (Feb 2026):** 500+ lessons
- **v2.0 (Aug 2026):** 2000+ lessons
- **Goal:** Complete NCERT curriculum coverage

### Is the content NCERT-aligned?

**Yes!** All content is:
- ✅ Based on NCERT textbooks
- ✅ Aligned with government curriculum
- ✅ Reviewed by subject matter experts
- ✅ Updated annually
- ✅ Compatible with DIKSHA standards

### Are there practice questions/quizzes?

Yes! Every lesson includes:
- Multiple-choice quizzes
- Instant feedback
- Detailed explanations
- Score tracking
- Ability to retake

**Coming soon:**
- Subjective questions
- Previous year exam questions
- Mock tests
- Timed quizzes

### Can I download specific lessons only?

**v1.0:** All lessons cached automatically  
**v1.1 (Feb 2026):** Selective download feature

This will let you:
- Choose which subjects/lessons to download
- Manage storage space better
- Save mobile data

### What languages are supported?

**Currently:**
- Hindi (हिंदी)
- English

**Coming in 2026:**
- Tamil (தமிழ்) - Q2 2026
- Telugu (తెలుగు) - Q2 2026
- Marathi (मराठी) - Q2 2026
- Bengali (বাংলা) - Q3 2026
- Gujarati (ગુજરાતી) - Q3 2026
- More regional languages in development

### Can I switch languages anytime?

Yes! 
- Click language selector at top
- Choose Hindi or English
- UI and content change instantly
- Preference saved automatically

---

## Features

### Does it work offline?

**Yes, completely!** After initial setup:
- ✅ Browse all lessons
- ✅ Read content
- ✅ Listen to audio
- ✅ Take quizzes
- ✅ Track progress
- ✅ Use basic voice features

**Offline limitations:**
- ❌ Can't download new content
- ❌ Can't sync progress across devices
- ❌ Advanced AI features limited

### What are the voice features?

**Text-to-Speech (TTS):**
- Listen to lessons read aloud
- Works in Hindi and English
- Adjustable speed (future)
- Great for visually impaired users

**Speech Recognition (ASR):**
- Answer quizzes using voice
- Voice commands for navigation (beta)
- Hands-free learning

**Voice Assistant (Beta):**
- Ask questions about lessons
- Get explanations
- Navigate app with voice

### Is it accessible for disabled learners?

**Absolutely!** EduVault is **WCAG 2.1 AA** compliant:

**For Blind/Visually Impaired:**
- Full screen reader support (NVDA, JAWS, TalkBack)
- Complete voice interaction
- High contrast mode
- Text-to-speech for all content
- Keyboard navigation

**For Deaf/Hard of Hearing:**
- All audio has text transcripts
- Haptic feedback for interactions
- Visual indicators for all sounds
- (Sign language videos in v1.2)

**For Motor Disabilities:**
- Large touch targets
- Keyboard-only navigation
- Voice control
- No time-limited interactions

**For Cognitive Disabilities:**
- Simple, clear language
- Consistent layout
- Visual progress indicators
- No distractions
- Dyslexia-friendly fonts (v1.2)

### How does progress tracking work?

EduVault automatically tracks:
- ✅ Lessons viewed/completed
- ✅ Quiz scores and attempts
- ✅ Time spent learning
- ✅ Overall progress percentage

**Viewing your progress:**
- Dashboard shows all stats
- Visual charts and graphs
- Lesson-by-lesson breakdown
- Subject-wise performance

**Data storage:**
- Saved locally on your device
- Private and secure
- No cloud sync (yet)
- Export/backup (v1.2)

---

## Technical Questions

### What technology is it built with?

**Frontend:**
- React 18.2
- TypeScript 5.3
- Tailwind CSS

**Offline:**
- Service Workers
- IndexedDB
- Progressive Web App (PWA)

**Voice:**
- Web Speech API
- Browser-native TTS/ASR

### Does it collect my personal data?

**NO!** EduVault is privacy-first:
- ❌ No account required
- ❌ No personal information collected
- ❌ No tracking cookies
- ❌ No analytics without consent
- ❌ No ads
- ✅ All data stays on your device
- ✅ Open-source and auditable

### How is my data secured?

- **Local storage only:** Nothing sent to servers
- **HTTPS encryption:** When online
- **No PII:** No personally identifiable information
- **Secure APIs:** Only whitelisted sources
- **Regular security audits**

### Can I use it without Play Store?

Yes! EduVault is a **Progressive Web App (PWA)**:
- Install directly from browser
- No Play Store needed
- Works same as native app
- Auto-updates when online

**Android APK** also coming to Play Store (Feb 2026) for users who prefer traditional install.

### Why is offline mode important?

**India's Internet Reality:**
- 600M+ Indians lack consistent internet
- Rural areas have 2G/3G only
- Expensive mobile data
- Frequent connectivity issues

**EduVault solves this:**
- Download once, learn forever
- No internet interruptions
- No data costs after install
- Learn anywhere, anytime

### How often is content updated?

**Current plan:**
- **Major updates:** Quarterly (every 3 months)
- **Content additions:** Monthly
- **Bug fixes:** As needed

**You control when to update:**
- Auto-update (default): Downloads automatically when online
- Manual update: You choose when to sync
- Notifications: Tells you when updates available

---

## Usage & Performance

### Does it use a lot of battery?

No! EduVault is optimized for battery efficiency:
- Lightweight code
- Minimal background processes
- No constant network requests
- Sleep mode when inactive

**Typical usage:** 
- 1 hour of learning ≈ 5-10% battery
- Similar to reading an ebook

### Will it slow down my phone?

No, EduVault is lightweight:
- **RAM usage:** <150MB
- **CPU usage:** Minimal
- **Works on low-end phones** (<2GB RAM)
- No background processes when closed

### Can I use it on a slow internet connection?

Yes!
- **First download:** Works on 2G/3G (just slower)
- **After setup:** Internet not needed at all
- **Updates:** Can wait for WiFi

**Tips:**
- Use WiFi for initial install
- Enable WiFi-only sync
- Download overnight on slow connections

### How long does initial setup take?

**On WiFi:**
- 2-5 minutes

**On 4G:**
- 5-10 minutes

**On 3G/2G:**
- 10-30 minutes

💡 **Tip:** Setup once, use forever offline!

---

## Troubleshooting

### The app is not installing. What should I do?

**Check these:**
1. Using Chrome (Android) or Safari (iOS)?
2. Have 200MB+ free storage?
3. Browser is updated to latest version?
4. On HTTPS (not HTTP) site?

**If still not working:**
- Clear browser cache
- Try incognito/private mode
- Restart device
- Try different browser

### I can't hear the audio. Help!

**Check:**
1. Device not muted?
2. Volume turned up?
3. Headphones connected properly?
4. Browser has audio permission?

**On iOS:**
- Tap screen first (Safari requires user interaction for audio)

**Still not working:**
- Try a different lesson
- Reload page
- Clear cache and retry

### Voice recognition isn't working.

**Requirements:**
- Use **Chrome** browser (best support)
- Grant **microphone permission**
- Speak clearly in quiet environment
- Match your language setting

**Troubleshooting:**
- Check mic permissions in browser settings
- Test mic in another app (ensure it works)
- Speak louder and clearer
- Try in a quieter place

### The app says "storage full."

**Solutions:**
1. **Free device storage:**
   - Delete unused apps
   - Clear photos/videos
   - Move files to SD card

2. **Clear app cache:**
   - Settings → Apps → EduVault → Clear Cache
   - Don't clear data (will lose progress)

3. **Selective download (v1.1):**
   - Choose only needed subjects
   - Remove completed lessons

### Lessons are not loading.

**Quick fixes:**
1. **Reload page** (Ctrl+R or ⌘+R)
2. **Check internet** (if first time)
3. **Clear browser cache**
4. **Hard refresh** (Ctrl+Shift+R)

**If persists:**
- Uninstall and reinstall
- Try different browser
- Report bug: bugs@eduvault.app

### I lost my progress after updating. Can I recover it?

**v1.0:** Progress saved locally
- If you cleared browser data, it's lost
- Always export progress before clearing (feature coming in v1.1)

**v1.1+ (Feb 2026):**
- Export/backup feature
- Cloud sync option
- Progress recovery tools

**Prevention:**
- Don't clear browser data
- Don't uninstall app
- Use backup feature when available

---

## Privacy & Security

### Is my quiz data shared with anyone?

**No!** All quiz data:
- Stays on your device only
- Never sent to servers
- Not shared with anyone
- Not used for analytics
- Completely private

### Can my teacher/parent see my progress?

**Currently (v1.0):** No, unless you show them on your device.

**Future (v1.2+):** Optional sharing features:
- You choose what to share
- Permission-based access
- Can revoke anytime
- Still works offline without sharing

### Do you sell user data?

**Absolutely NOT!**
- We don't collect any data to sell
- We're not ad-supported
- We're funded by grants and donations
- Your privacy is fundamental, not for sale

### Is it safe for children?

**Yes, very safe:**
- ✅ No ads or external links
- ✅ No user-generated content (moderated in future)
- ✅ No chat or social features (v1.0)
- ✅ Age-appropriate content only
- ✅ NCERT-aligned educational material
- ✅ No in-app purchases or spending

### Why is it free? What's the catch?

**There's no catch!** EduVault is:
- Funded by educational grants
- Supported by NGO partnerships
- Potentially government-backed
- Open-source community-driven
- Part of Digital India initiative

**Our mission:** Education is a right, not a product.

---

## Future Features

### When will teacher features be available?

**Teacher Dashboard:** v1.2 (May 2026)

Features will include:
- Student progress monitoring
- Assign lessons
- Create custom quizzes
- Classroom management
- Export reports

### Will there be video lessons?

**Yes!** Video content planned for **v1.1** (Feb 2026):
- Offline video playback
- Concept explanations
- Experiments and demonstrations
- Limited file size for offline storage

### Can I create my own lessons?

**Community Content Creation:** v2.0 (Aug 2026)
- Teacher content creation tools
- Review and approval process
- Quality standards
- Optional revenue sharing for creators

### Will there be live classes?

**Not planned** for EduVault core.

**Reason:** Live classes require internet, contradicting our offline-first mission.

**Alternative:** Recorded video lessons work offline and reach more students.

### What about competitive exam prep (JEE/NEET)?

**Planned for v2.1** (Q4 2026):
- JEE Main/Advanced prep
- NEET preparation
- Previous year papers
- Mock tests
- Detailed solutions

---

## Partnerships & Collaboration

### How can my school use EduVault?

**Current (v1.0):**
- Students can install individually
- Teachers can recommend
- Use in computer labs
- Offline distribution via USB

**Future (v1.2+):**
- School admin portal
- Bulk student enrollment
- School-wide content distribution
- Analytics for educators

**Contact:** schools@eduvault.app

### Can NGOs distribute EduVault?

**Yes! We encourage it.**

**Distribution options:**
- Pre-installed on devices
- USB drives with app + content
- WiFi hotspot downloads
- SD card distribution

**NGO Partnership:** ngo@eduvault.app

### How can I contribute?

**Ways to help:**

1. **Content Creation:**
   - Write lessons
   - Create quizzes
   - Translate to regional languages
   - Email: contribute@eduvault.app

2. **Development:**
   - GitHub: github.com/eduvault
   - Fix bugs
   - Add features
   - Improve accessibility

3. **Testing:**
   - Beta test new features
   - Report bugs
   - Provide feedback

4. **Spread the word:**
   - Share with students/teachers
   - Social media
   - Community outreach

### Can my organization sponsor EduVault?

**Yes!** We welcome:
- Financial support
- Content partnerships
- Infrastructure
- Distribution networks
- Technology contributions

**Contact:** partnerships@eduvault.app

---

## Support

### How do I report a bug?

**GitHub Issues:** [github.com/eduvault/issues](https://github.com/eduvault/issues)  
**Email:** bugs@eduvault.app

**Include:**
- Device and browser details
- Steps to reproduce
- Screenshots if possible
- What you expected vs. what happened

### How do I request a feature?

**Email:** features@eduvault.app  
**GitHub Discussions:** github.com/eduvault/discussions

We review all requests and prioritize based on:
- User demand
- Alignment with mission
- Technical feasibility
- Resource availability

### I have a question not answered here.

**Email:** support@eduvault.app  
**Response time:** 24-48 hours

**Community Forum:** community.eduvault.app  
**For:** General discussions, tips, help from other users

---

## About EduVault

### Who built EduVault?

EduVault is built by a passionate team of:
- Educators
- Engineers
- Designers
- Accessibility experts
- Content creators

**Mission:** Make quality education accessible to every Indian student, regardless of connectivity or ability.

### What's the vision for EduVault?

**Near-term (2026):**
- 100M students using EduVault
- All Indian languages supported
- Full NCERT curriculum coverage
- Government partnership

**Long-term (2027+):**
- Default learning platform for rural India
- Integration with schools nationwide
- AI-powered personalization
- Social impact at scale

### How can I stay updated?

**Newsletter:** updates@eduvault.app  
**Twitter:** @EduVaultIndia  
**Telegram:** t.me/eduvault  
**Blog:** blog.eduvault.app  
**Release Notes:** docs/RELEASE_NOTES.md  

---

**Still have questions?** Email us at support@eduvault.app!

**Last Updated:** September 30, 2025  
**Next Update:** Monthly
