# 🛡️ Kavach — Cybersecurity for People

**Digital safety for senior citizens · वरिष्ठ नागरिकों के लिए डिजिटल सुरक्षा**

Kavach ("shield" in Hindi) is an Android app that protects senior citizens from the most common
digital frauds in India — OTP scams, fake KYC / "account blocked" messages, lottery and cashback
baits, digital-arrest threats, and malicious APKs shared on WhatsApp.

It works **completely offline**, explains every warning in **simple English or Hindi**, can **read
the warning out loud**, and can **alert a trusted family member** when something dangerous is detected.

[![Download APK](https://img.shields.io/badge/Download-Kavach%20APK-167A50?style=for-the-badge&logo=android&logoColor=white)](https://github.com/MakersNeedMore-MnM/Round2-naman-verma1084/releases/latest/download/kavach-debug.apk)
[![Platform](https://img.shields.io/badge/Platform-Android%208.0%2B-2E68AD?style=for-the-badge&logo=android&logoColor=white)](#-installation)
[![Languages](https://img.shields.io/badge/UI-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A5%80-A85D18?style=for-the-badge)](#-features-at-a-glance)

---

## 📑 Table of Contents

1. [The Problem](#-the-problem)
2. [Features at a Glance](#-features-at-a-glance)
3. [Installation](#-installation)
4. [Demo Login (Test Accounts)](#-demo-login-test-accounts)
5. [How to Try Every Feature](#-how-to-try-every-feature)
   - [SMS Protection](#1-sms-protection-automatic)
   - [WhatsApp Check](#2-whatsapp-check)
   - [APK Protection](#3-apk-protection)
   - [Trusted Contact](#4-trusted-contact)
   - [Report Scam & Threat History](#5-report-scam--threat-history)
   - [Settings, Language & Voice](#6-settings-language--voice)
6. [How It Works (Technical)](#-how-it-works-technical)
7. [Architecture & Project Structure](#-architecture--project-structure)
8. [Permissions & Privacy](#-permissions--privacy)
9. [Build from Source](#-build-from-source)
10. [Limitations & Roadmap](#-limitations--roadmap)
11. [Team](#-team)

---

## 🎯 The Problem

Senior citizens are the most targeted and least protected group online:

- A single SMS saying *"Your bank account will be blocked today, update KYC: bit.ly/xxxx"* is enough
  to steal a lifetime's savings.
- Scammers on WhatsApp send **APK files** disguised as "bank app", "electricity bill" or
  "wedding invitation" that silently read OTP messages once installed.
- Existing security apps are in English, full of jargon, and designed for tech-savvy users.
- Family members usually find out **after** the money is gone.

**Kavach's approach:** detect the threat *at the moment it arrives*, explain it in one or two plain
sentences in the user's language, say it out loud, and — for high-risk cases — tell a trusted family
member immediately.

---

## ✨ Features at a Glance

| Feature | What it does | Works offline |
|---|---|---|
| **📩 SMS Protection** | Automatically scans every incoming SMS, shows a notification for suspicious / high-risk messages, and explains why | ✅ |
| **💬 WhatsApp Check** | Paste any WhatsApp / Telegram message to get a risk level (LOW / SUSPICIOUS / HIGH) and reasons | ✅ |
| **📦 APK Protection** | Analyses an APK *before* installation — dangerous permissions, accessibility services, device-admin components — and blocks the installer for high-risk files | ✅ |
| **👨‍👩‍👧 Trusted Contact** | For HIGH-risk SMS or APK, sends a privacy-safe SMS alert to one trusted family member | ✅ |
| **🚨 Report Scam** | Keeps a local, privacy-protected history of detected threats; one-tap call to **1930** (national cyber-crime helpline), links to **cybercrime.gov.in** and **Sanchar Saathi (Chakshu)** | ✅ |
| **🔊 Voice Explanation** | Reads the risk explanation aloud (English / Hindi) using on-device text-to-speech | ✅ |
| **🌐 Bilingual UI** | Every screen, notification and alert is available in English and हिंदी | ✅ |
| **👴 Senior-friendly design** | Large buttons, high-contrast colours, minimal steps, no jargon | ✅ |
| **🔐 OTP Login** | Firebase Phone Authentication — no passwords to remember | needs internet once |

---

## 📲 Installation

**Requirements:** Android 8.0 (Oreo) or newer. No Play Store account needed.

1. On your Android phone, download the APK:
   **https://github.com/MakersNeedMore-MnM/Round2-naman-verma1084/releases/latest/download/kavach-debug.apk**
2. Open the downloaded file.
3. If Android asks for permission to install from this source (Chrome / Files / WhatsApp), tap
   **Settings → Allow from this source**, then go back.
4. Tap **Install**.

> ⚠️ **"Blocked by Play Protect" is expected.** Kavach is a hackathon build that is not published
> on the Play Store, so Google Play Protect shows a warning for it (as it does for *every*
> side-loaded APK). Tap **More details → Install anyway**. If the button is not visible, open
> *Play Store → profile picture → Play Protect → ⚙️ → turn off "Scan apps with Play Protect"*,
> install Kavach, then turn it back on.

**First launch:** Kavach opens the login screen → OTP → trusted-contact setup → main menu.
Grant the **SMS** and **Notification** permissions when asked; they are needed for automatic protection.

---

## 🔑 Demo Login (Test Accounts)

Kavach uses Firebase Phone Authentication. For evaluation, the following **Firebase test numbers**
are pre-configured. They **do not receive a real SMS** — just type the fixed OTP shown below.

| Phone number (enter 10 digits in the app) | OTP |
|---|---|
| `98765 43211` | `123456` |
| `87654 32199` | `123456` |
| `76543 21899` | `123456` |

**Steps**

1. Choose the language (EN / हिं) at the top of the login screen.
2. Enter one of the numbers above (without +91 — the app adds it) → **Send OTP**.
3. Enter `123456` → **Verify**.
4. Add a **trusted contact** (any name + a real 10-digit mobile number that can receive SMS — use a
   teammate's number if you want to see the alert arrive), tick the consent box → **Complete Setup**.
5. You land on the **Main Menu**.

> Logging in with your own real number also works — a real OTP SMS will be sent by Firebase.

---

## 🧪 How to Try Every Feature

### 1. SMS Protection (automatic)

**What you need:** the phone with Kavach installed (**receiver**) and any second phone (**sender**).

**One-time setup on the receiver phone**

1. Main Menu → **SMS Protection** (the *SMS* button) → tap **Allow SMS Permission** → allow *Receive SMS*, *Send SMS* and
   *Notifications* in the Android prompts.
2. The status card should now say **Protection is active**.

**Important — the test message must arrive as a real SMS, not an RCS chat**

Kavach listens to the Android `SMS_RECEIVED` broadcast. RCS ("chat") messages sent from Google Messages
travel over the internet, not the SMS network, and are therefore not visible to *any* SMS-based
protection app. On the **sending phone** (Google Messages):

1. Open **Google Messages**.
2. Tap your **profile picture** (top right).
3. Open **Messages settings**.
4. Open **RCS chats**.
5. Temporarily turn **off** **"Turn on RCS chats"**.
6. Go back to the conversation with the receiver phone.
7. Check the text box — it must say **"Text message"**, *not* "RCS message" or "Chat message".
8. Send the test message.

(Turn RCS back on after testing. On other messaging apps such as Samsung Messages, disable
"Chat features" in the same way.)

**Test messages to send** (copy-paste one at a time)

| Send this from the sender phone | Expected result on the receiver |
|---|---|
| `Dear customer, your SBI account will be blocked today. Update KYC immediately: http://bit.ly/kyc-sbi` | 🔴 **HIGH** — notification *"Kavach: High-risk SMS detected"*, result screen with reasons (hidden link, account-blocking threat, urgency), voice warning available, **trusted contact receives an SMS alert** |
| `Congratulations! You are the lucky winner of a free gift. Reply YES to claim.` | 🟠 **SUSPICIOUS** — notification *"Kavach: Suspicious SMS detected"*, reason: unexpected prize claim. No trusted-contact alert |
| `Your OTP for login is 482913. Do not share it with anyone.` | 🟢 **LOW** — no notification (a genuine OTP message that *tells you not to share* is recognised as safe). The result is still visible under *Latest SMS Result* |

**What to look at**

- Pull down the notification shade → tap the Kavach notification → the **SMS Protection** screen opens
  on the *Latest SMS Result* card: risk badge, score, sender (masked), reasons, recommended action.
- Tap **🔊 Voice explanation** to hear the warning in the selected language.
- Open **Report Scam** → the SUSPICIOUS / HIGH message is already saved in the threat history.
- Check the trusted contact's phone after the HIGH test — it receives:
  > *Kavach Safety Alert — A high-risk SMS was detected on the user's phone. Sender: ••••••1234.
  > Risk: This SMS looks highly risky. Please contact the user and ask them not to open links,
  > send money, or share private information.*

### 2. WhatsApp Check

For messages that arrive on WhatsApp / Telegram (which Kavach cannot read automatically — by design).

1. In WhatsApp, long-press a message → **Copy**.
2. Open Kavach → **WhatsApp Check** (the *WA* button) → tap **Paste copied message** (reads the clipboard) or paste manually.
3. Tap **Check Message**.
4. Kavach shows the risk level, the reasons, and what to do. Tap the speaker button for voice.
5. SUSPICIOUS / HIGH results are saved to the **Report Scam** history (LOW results are not stored).

Try it with the same three sample messages above — you will get the same three results.
Hindi messages are also detected (e.g. *"आपका खाता आज बंद हो जाएगा, तुरंत केवाईसी करें"*).

### 3. APK Protection

Checks an app file **before** Android installs it.

**Way A — pick a file**

1. Main Menu → **APK Protection** (the *APK* button) → **Choose downloaded APK** → select any `.apk` from *Downloads*.
   (You can even select the Kavach APK itself, or any APK downloaded from a browser.)
2. Tap **Analyse before installing**.

**Way B — share from WhatsApp (the real-world flow)**

1. In WhatsApp, open the received APK file → **Share** (or long-press → Share).
2. Choose **Kavach** in the share sheet. Kavach opens directly on the analysis screen.
3. Kavach also registers as an "Open with" handler for APK files in file managers.

**What you see**

- Application name, package name, target Android version, file size, **SHA-256 hash**.
- Risk level with reasons, e.g. *"The app requests access to SMS messages"*,
  *"The app contains an Accessibility service that may control or observe the screen"*.
- **Delete APK** — removes the file (recommended for HIGH).
- **Continue to installer** — hands the file to the Android package installer. **This button is
  disabled for HIGH-risk APKs.**
- For HIGH-risk APKs the trusted contact is alerted by SMS, and the result is saved to the history.

> Tip for evaluators: most legitimate apps score LOW / SUSPICIOUS. An APK that requests
> `READ_SMS` + `BIND_ACCESSIBILITY_SERVICE` (the classic banking-trojan combination) scores HIGH.

### 4. Trusted Contact

Main Menu → **Trusted Contact** (the *TC* button)

- Add / edit / remove the one person who receives HIGH-risk alerts.
- Requires an explicit consent checkbox — Kavach never alerts anyone without it.
- The alert **never** contains the message body, OTPs, PINs or links — only a masked sender and a
  one-line risk summary.

### 5. Report Scam & Threat History

Main Menu → **Report Scam** (the *RPT* button)

- **Emergency help:** *"Lost money?"* → **Call 1930** (opens the dialer with India's national
  cyber-crime helpline), plus links to **cybercrime.gov.in** and **Sanchar Saathi / Chakshu**.
- **Local threat history:** every SUSPICIOUS / HIGH SMS, WhatsApp message and APK, grouped by
  duplicates, with filters by type and status.
- Each record can be **pinned**, moved through **Pending → Prepared → Reported → Dismissed**,
  **copied as a report summary** (to paste into the cyber-crime portal), or deleted.
- Records are stored **only on the phone**, with OTPs / PINs / card numbers redacted and the sender
  masked, and are **auto-deleted after 30 days**.

### 6. Settings, Language & Voice

Main Menu → **Settings** (the *SET* button)

- **Application language:** English / हिंदी — applies instantly to every screen, notification,
  voice message and trusted-contact alert.
- **Protection & permissions:** see whether SMS and notification permissions are granted, and fix
  them with one tap.
- **Account:** shows the verified phone number, **Log Out**.
- **Voice:** every result screen has a speaker button; Kavach uses the phone's built-in
  text-to-speech engine in `en-IN` or `hi-IN`.

---

## ⚙️ How It Works (Technical)

### Architecture in one picture

```
┌────────────────────────────  Android (Kotlin)  ────────────────────────────┐
│                                                                            │
│  MainActivity ──── WebView ────── HTML / CSS / JS screens (assets/)        │
│      │                │                 login · menu · sms · wa · apk      │
│      │      JS bridges (addJavascriptInterface)   tc · report · setting    │
│      │        • KavachAndroid  (auth, prefs, SMS status, APK, TTS, clipboard)
│      │        • KavachReport   (threat history CRUD, 1930, portals)        │
│      │                                                                     │
│  SmsReceiver (BroadcastReceiver, SMS_RECEIVED, priority 999)               │
│      └─► SmsRiskAnalyzer ─► SharedPreferences (latest result)              │
│                          ─► Notification (SUSPICIOUS / HIGH)               │
│                          ─► ThreatHistoryManager ─► SQLite (threats table) │
│                          ─► SmsManager → trusted contact (HIGH only)       │
│                                                                            │
│  ApkController ─► copies APK to cache ─► ApkRiskAnalyzer (PackageManager)  │
│                ─► FileProvider ─► Android package installer (if allowed)   │
│                                                                            │
│  Firebase Auth (phone OTP)   ·   TextToSpeech (en-IN / hi-IN)              │
└────────────────────────────────────────────────────────────────────────────┘
```

The UI is a set of plain HTML pages loaded from `file:///android_asset/`. This keeps the screens
easy to design for accessibility, while all sensitive work (SMS interception, package parsing,
sending alerts) happens in native Kotlin.

### SMS / message risk engine (`SmsRiskAnalyzer.kt`, mirrored in `wa.js`)

A transparent, rule-based scorer. Each detected pattern adds points and a human-readable reason
(English + Hindi). Patterns are matched case-insensitively in English **and** Hindi.

| Signal | Example patterns | Points |
|---|---|---|
| Shortened / hidden link | `bit.ly`, `tinyurl`, `cutt.ly`, `rb.gy` | +3 |
| Normal external link | `http://`, `www.`, `.com/`, `t.me/`, `wa.me/` | +2 |
| Asks for private info (sensitive word **and** a request verb, unless it is safety advice like "do not share") | `otp` + `share`, `pin` + `send`, `cvv` + `enter` | +5 |
| Money / UPI / QR request | `send money`, `upi`, `scan qr`, `processing fee`, `₹`, `Rs 500` | +4 |
| Urgency / pressure | `urgent`, `immediately`, `today only`, `last chance`, `तुरंत` | +2 |
| Threat | `account blocked`, `sim blocked`, `kyc expired`, `legal action`, `arrest`, `electricity disconnect` | +4 |
| Prize / reward bait | `winner`, `lottery`, `free gift`, `cashback`, `refund approved` | +3 |
| Asks to install APK / remote-access app | `install apk`, `anydesk`, `teamviewer`, `screen share` | +5 |
| Impersonation | `bank officer`, `customer care`, `police officer`, `rbi`, `cyber cell`, `customs officer` | +2 |
| Secrecy | `do not tell`, `keep this secret`, `confidential transaction` | +3 |
| **Combination bonus:** any link **+** (urgency or money or threat or prize) | | +2 |

**Verdict:** score ≥ 7 → **HIGH** · score 3–6 → **SUSPICIOUS** · otherwise **LOW**.

Every verdict produces: a one-line summary, a recommended action, a voice script and the list of
reasons — each in English and Hindi.

### Automatic SMS flow (`SmsReceiver.kt`)

1. Android delivers `SMS_RECEIVED`; multipart messages are joined.
2. `SmsRiskAnalyzer.analyse()` runs **on-device** (no network).
3. The latest result is stored in `SharedPreferences` so `sms.html` can display it.
4. **LOW:** stop here — no notification, nothing stored in history.
5. **SUSPICIOUS / HIGH:** save a privacy-protected record in the threat history and post a
   high-importance notification (title and text in the selected language). Tapping it deep-links to
   the SMS result screen.
6. **HIGH only:** if setup is complete, consent was given and `SEND_SMS` is granted, send the
   trusted-contact alert (masked sender + summary; never the message body).

### APK static analysis (`ApkRiskAnalyzer.kt`, `ApkController.kt`)

The APK is copied to Kavach's private cache and parsed with
`PackageManager.getPackageArchiveInfo()` — nothing is installed or executed.

| Signal | Points |
|---|---|
| `READ_SMS` / `RECEIVE_SMS` | +3 |
| `SEND_SMS` | +3 |
| `READ_CONTACTS` / `WRITE_CONTACTS` | +2 |
| `READ_CALL_LOG` / `WRITE_CALL_LOG` | +3 |
| `SYSTEM_ALERT_WINDOW` (draw over other apps) | +3 |
| `REQUEST_INSTALL_PACKAGES` | +4 |
| Declares an **Accessibility service** | +5 |
| Declares a **device-administrator** receiver | +4 |
| Camera + microphone | +2 (or +1 each alone) |
| Location | +1 |
| `targetSdk` ≤ 25 (very old) / 26–28 (older) | +4 / +2 |
| APK marked `debuggable` | +2 |
| **Combos:** SMS + Accessibility · SMS + overlay · contacts + SMS + install · Accessibility + overlay | +4 each |

**Verdict:** score ≥ 8 → **HIGH** (installer blocked, trusted contact alerted) ·
3–7 → **SUSPICIOUS** · otherwise **LOW**. The SHA-256 hash is shown so the file can be looked up
on VirusTotal or shared with a helpline.

### Threat history & privacy (`ThreatHistoryManager.kt`, `ThreatDatabaseHelper.kt`)

- SQLite table `threats` with indexes on type, risk level, report status and time.
- Before storing, `createSafePreview()` redacts OTPs / one-time passwords / PINs / CVVs / card
  numbers and long digit sequences; `maskSender()` keeps only the last digits.
- Duplicate messages are grouped by a normalised **fingerprint** (links and digits stripped).
- Each record has a report status (`PENDING → PREPARED → REPORTED → DISMISSED`), a pin flag and
  an expiry timestamp; `removeExpiredRecords()` enforces **30-day retention**.
- Nothing is uploaded anywhere; there is no analytics SDK.

### Authentication (`MainActivity.kt`)

Firebase Phone Auth (`PhoneAuthProvider`) with a 60-second OTP timeout and resend support.
Login state, the verified number and the trusted contact are kept in `SharedPreferences`
(`kavach_preferences`). Test numbers are configured in the Firebase console, which is why they
work without a real SMS.

---

## 🗂️ Architecture & Project Structure

```
app/src/main/
├── AndroidManifest.xml            permissions, MainActivity (launcher + APK share/view intents),
│                                  FileProvider, SmsReceiver
├── java/com/dsafiles/kavach/
│   ├── MainActivity.kt            WebView host, KavachAndroid JS bridge, Firebase OTP, TTS,
│   │                              permission handling, deep links from notifications
│   ├── SmsReceiver.kt             SMS_RECEIVED → analyse → notify → history → trusted contact
│   ├── SmsRiskAnalyzer.kt         rule-based bilingual message scorer
│   ├── ApkController.kt           file picking, share/view intents, cache copy, install/delete
│   ├── ApkRiskAnalyzer.kt         permission / component analysis, SHA-256
│   ├── ReportController.kt        KavachReport JS bridge: history CRUD, 1930, portals, copy summary
│   ├── ThreatHistoryManager.kt    redaction, masking, fingerprinting, retention
│   ├── ThreatDatabaseHelper.kt    SQLite schema and queries
│   └── ThreatRecord.kt            data model
├── assets/                        WebView UI (HTML5 / CSS / vanilla JS, no frameworks)
│   ├── login.html   menu.html   sms.html   wa.html
│   ├── apk.html     tc.html     report.html   setting.html
│   ├── css/                       style.css, login.css, paste.css, apk.css, report.css, tc.css
│   └── js/                        common.js (i18n + shared helpers), one script per screen
└── res/                           launcher icons, theme, FileProvider paths, backup rules
```

**Tech stack:** Kotlin · Android SDK (min 26 / target 37) · AndroidX AppCompat, Activity, Core,
Credentials · Firebase Authentication · SQLite · Android TextToSpeech · WebView with
HTML5 / CSS3 / vanilla JavaScript · Gradle 9.6 / AGP 9.4 (Kotlin DSL, version catalog).

---

## 🔒 Permissions & Privacy

| Permission | Why Kavach needs it | When it is used |
|---|---|---|
| `RECEIVE_SMS` | Detect incoming SMS for automatic scanning | Only while a message arrives; content never leaves the phone |
| `SEND_SMS` | Send the trusted-contact alert | Only for HIGH-risk detections, only with consent |
| `POST_NOTIFICATIONS` | Show the warning notification | SUSPICIOUS / HIGH results |
| `REQUEST_INSTALL_PACKAGES` | Hand a *non-high-risk* APK to the Android installer after analysis | Only when the user taps *Continue to installer* |
| `INTERNET` | Firebase OTP login only | Login / logout. All threat analysis is offline |

Privacy principles: on-device analysis, no message upload, no analytics, OTPs and PINs redacted
before storage, sender numbers masked, 30-day automatic deletion, explicit consent for family alerts.

---

## 🛠️ Build from Source

```bash
git clone https://github.com/MakersNeedMore-MnM/Round2-naman-verma1084.git
cd Round2-naman-verma1084
# Open in Android Studio (Otter or newer, JDK 25 toolchain is auto-provisioned), or:
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

`google-services.json` for the Firebase project is included so the debug build works out of the box.
If OTP login fails on your own build, add your debug keystore's SHA-1 / SHA-256 to the Firebase
project (*Project settings → Your apps → Add fingerprint*), or use the test numbers above.

---

## ⚠️ Limitations & Roadmap

**Current limitations (honest list)**

- Detection is rule-based; unusual phrasing can be missed and some legitimate promotional SMS may
  be marked SUSPICIOUS. Rules are intentionally transparent so every verdict can be explained.
- RCS / iMessage-style chats are not visible to any SMS receiver — hence WhatsApp Check is manual.
- APK analysis is static (manifest-level); it does not detect obfuscated payloads or check
  reputation online yet.
- Android only (no iOS), debug-signed hackathon build.

**Planned (see `Contributing.md` for module ownership)**

- FastAPI backend with Gemini-based natural-language classification for messages the rules miss
- Google Safe Browsing lookup for links
- Androguard deep-analysis pipeline + VirusTotal reputation check by SHA-256
- Firebase Cloud Messaging so the trusted contact gets an app notification, not only SMS
- Voice-first onboarding and more Indian languages

---

## 👥 Team — MakersNeedMore (MnM)

| Member | Role |
|---|---|
| **Naman Verma** | Frontend & Android Native Lead — UI/UX, accessibility, SMS interceptor, APK intents, JS bridges |
| **Palak Prajapati** | Backend & Scam Intelligence Lead — REST API, LLM classification, Safe Browsing |
| **Om Pratap Singh** | APK Analysis & Database Lead — static analysis, hashing, database, FCM alerts |

---

<p align="center">
  <b>Never share your OTP, PIN, password or CVV with anyone.</b><br>
  अपना ओटीपी, पिन, पासवर्ड या सीवीवी किसी के साथ साझा न करें।
</p>
