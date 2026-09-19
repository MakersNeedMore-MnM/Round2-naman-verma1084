document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const translations = {

        en: {

            /* MAIN MENU */

            mainMenu: "Main Menu",
            smsProtection: "SMS Protection",
            whatsappCheck: "WhatsApp Check",
            apkProtection: "APK Protection",
            trustedContact: "Trusted Contact",
            reportScam: "Report Scam",
            settings: "Settings",
            safetyReminder: "Never share your OTP, PIN, password or CVV with anyone.",


            /* SETTINGS */

            settingsTitle: "Settings",
            settingsDescription: "Manage your language, permissions and account",
            applicationLanguage: "Application Language",
            languageDescription: "Choose the language you understand best",
            selectedLanguage: "Selected language",
            applyLanguage: "Apply Language",
            protectionAndPermissions: "Protection and Permissions",
            permissionsDescription: "Permissions required for Kavach protection",
            detectIncomingSms: "Detect and check new incoming SMS messages",
            required: "Required",
            allow: "Allow",
            notifications: "Notifications",
            notificationDescription: "Receive warnings when a risky message is detected",
            trustedContactAlerts: "Trusted-contact Alerts",
            trustedAlertDescription: "Alert your trusted contact when risk is high",
            manageTrustedContact: "Manage the person who receives high-risk alerts",
            currentContact: "CURRENT CONTACT",
            noTrustedContact: "No trusted contact added",
            addTrustedContactDescription: "Add a trusted contact to enable alerts.",
            addOrChange: "Add or Change",
            account: "Account",
            accountDescription: "Your verified Kavach account",
            verifiedMobileNumber: "VERIFIED MOBILE NUMBER",
            verifiedWithFirebase: "Verified with Firebase",
            verified: "Verified",
            logout: "Log Out",
            digitalSafety: "Digital safety for senior citizens",


            /* TRUSTED CONTACT */

            trustedContactSubtitle: "Someone you trust during a risky moment",
            safetySupport: "SAFETY SUPPORT",
            addSomeoneYouTrust: "Add someone you trust",
            trustedContactExplanation: "With your permission, Kavach can alert this person when a high-risk message is detected.",
            contactDetails: "Contact details",
            contactDetailsDescription: "Enter the name and mobile number of one trusted person.",
            requiredWithStar: "* Required",
            contactName: "Contact name",
            contactNamePlaceholder: "For example, Rajesh Kumar",
            mobileNumber: "Mobile number",
            contactPhonePlaceholder: "Enter 10-digit number",
            phoneNumberHelp: "Enter an Indian mobile number that can receive SMS alerts.",
            allowSafetyAlerts: "Allow safety alerts",
            consentDescription: "I allow Kavach to alert this contact when a high-risk message is detected.",
            saveTrustedContact: "Save Trusted Contact",
            active: "Active",
            editContact: "Edit Contact",
            removeContact: "Remove",
            privacyProtected: "Your privacy is protected",
            contactPrivacyDescription: "Kavach will never include an OTP, PIN, password, CVV or complete private message in the alert.",
            chooseTrustedPerson: "Choose someone you know personally and can contact quickly during an emergency.",


            /* SMS PROTECTION */

            smsHeaderDescription: "Automatic protection from risky messages",
            protectionStatus: "PROTECTION STATUS",
            permissionRequired: "Permission required",
            permissionRequiredDescription: "Allow SMS access so Kavach can check new incoming messages.",
            enableSmsProtection: "Enable SMS Protection",
            enableSmsDescription: "Kavach needs permission to detect new incoming SMS messages.",
            allowSmsPermission: "Allow SMS Permission",
            smsPrivacyNote: "Kavach checks messages only to identify possible scam risks.",
            howProtectionWorks: "How protection works",
            howProtectionWorksDescription: "Kavach checks new messages in three simple steps.",
            detectMessage: "Detect message",
            detectMessageDescription: "Kavach detects a newly received SMS automatically.",
            checkRisk: "Check risk",
            smsCheckRiskDescription: "The message is checked for links, urgency and scam patterns.",
            showWarning: "Show warning",
            showWarningDescription: "Kavach displays a clear warning when danger is detected.",
            latestSmsResult: "Latest SMS Result",
            latestSmsDescription: "Your most recently checked SMS will appear here.",
            noResult: "No result",
            waitingForSms: "Waiting for a new SMS",
            waitingForSmsDescription: "When a new message arrives, Kavach will show its risk result here.",
            sender: "SENDER",
            riskResult: "RISK RESULT",
            viewFullResult: "View Full Result",
            remember: "Remember",
            smsSafetyMessage: "Do not click unknown links or share your OTP, PIN, password or CVV.",
            unknownSender: "Unknown sender",
            justNow: "Just now",
            suspicious: "Suspicious",
            riskyContent: "This message may contain risky content.",


            /* WHATSAPP CHECK */

            whatsappHeaderDescription: "Check a suspicious message before responding",
            yourChatsStayPrivate: "Your chats stay private",
            whatsappPrivacyDescription: "Kavach cannot open or read your WhatsApp chats. You decide which message to copy and check.",
            howToCheckMessage: "How to check a message",
            followSimpleSteps: "Follow these three simple steps",
            copyMessage: "Copy the message",
            copyMessageDescription: "Press and hold the suspicious message in WhatsApp, then tap Copy.",
            pasteMessage: "Paste it in Kavach",
            pasteMessageDescription: "Paste the copied message into the box below.",
            checkRiskDescription: "Kavach will show the risk level, reasons, recommended action and voice explanation.",
            pasteWhatsAppMessage: "Paste WhatsApp Message",
            pasteOnlyMessage: "Paste only the message you want Kavach to check.",
            clear: "Clear",
            messageToCheck: "Message to check",
            messageInputPlaceholder: "Paste the suspicious WhatsApp message here...",
            pasteCopiedMessage: "Paste Copied Message",
            checkMessage: "Check Message",
            whatKavachChecks: "What Kavach checks",
            riskPatternsDescription: "Common patterns found in online scams",
            unknownLinks: "Unknown links",
            urgentRequests: "Urgent requests",
            otpRequests: "OTP requests",
            paymentPressure: "Payment pressure",
            fakePrizes: "Fake prizes",
            accountThreats: "Account threats",
            important: "Important",
            whatsappSafetyMessage: "Do not click a suspicious link or send money while Kavach is checking the message.",


            /* APK PROTECTION */

            apkCheckTitle: "APK Safety Check",
            apkCheckSubtitle: "Check an Android app before installing it",
            beforeYouInstall: "BEFORE YOU INSTALL",
            checkDownloadedApp: "Check the downloaded app",
            apkIntroductionText: "Share or open a downloaded APK with Kavach. Kavach will inspect it before installation.",
            apkLimitationText: "Kavach provides an offline risk check. A low-risk result does not guarantee that an application is completely safe.",
            selectApkTitle: "Select an APK",
            selectApkDescription: "Choose an APK from Downloads or share it with Kavach.",
            chooseDownloadedApk: "Choose Downloaded APK",
            shareFromWhatsapp: "From WhatsApp",
            downloadApkStep: "Download the APK in WhatsApp.",
            openShareStep: "Open the file options and tap Share.",
            selectKavachStep: "Select Kavach to check it before installation.",
            selectedFile: "SELECTED FILE",
            analyseBeforeInstalling: "Analyse Before Installing",
            analysingApk: "Analysing APK…",
            analysingApkDescription: "Kavach is checking permissions, app details and risky behaviour indicators.",
            kavachApkResult: "KAVACH APK RESULT",
            applicationDetails: "Application details",
            applicationName: "App name",
            packageName: "Package name",
            targetAndroid: "Target Android",
            fileHash: "SHA-256",
            whyApkResult: "Why Kavach gave this result",
            recommendedAction: "Recommended action",
            trustedContactAlert: "Trusted contact alert",
            voiceExplanation: "Kavach voice explanation",
            deleteApk: "Delete APK",
            continueToInstaller: "Continue to Android Installer",
            checkAnotherApk: "Check Another APK",
            whatKavachChecksApk: "What Kavach checks",
            offlineApkChecks: "Offline checks performed before installation",
            sensitivePermissions: "Sensitive permissions",
            smsContactsAccess: "SMS and contacts access",
            overlayAccessibility: "Overlay and Accessibility",
            apkSourceIdentity: "App identity and source",
            targetAndroidVersion: "Target Android version",
            suspiciousCombinations: "Suspicious combinations",
            apkFinalSafetyNote: "Install applications only from sources you trust. Google Play Protect should remain enabled.",


            /* REPORT SCAM */

            reportTitle: "Report Scam",
            reportSubtitle: "Review detected threats and prepare a report",
            emergencyHelp: "URGENT HELP",
            lostMoneyQuestion: "Have you lost money?",
            emergencyDescription: "Contact your bank immediately and call India’s cyber-fraud helpline 1930.",
            call1930: "Call 1930",
            localThreatHistory: "LOCAL THREAT HISTORY",
            threatHistory: "Detected threats",
            threatHistoryDescription: "Suspicious SMS, WhatsApp messages and APK results saved by Kavach will appear here.",
            historyPrivacyNote: "Records stay on this device. OTPs, PINs, passwords and other sensitive details are removed from saved previews.",
            pendingReports: "Pending",
            savedThreats: "Saved threats",
            reportRecords: "REPORT RECORDS",
            chooseThreat: "Choose a threat to report",
            filterAll: "All",
            reportStatus: "Report status",
            allStatuses: "All statuses",
            statusPending: "Pending",
            statusPrepared: "Prepared",
            statusReported: "Reported",
            statusDismissed: "Dismissed",
            loadingThreats: "Loading threat history…",
            loadingThreatsDescription: "Kavach is reading saved records from this device.",
            noSavedThreats: "No saved threats",
            noSavedThreatsDescription: "Suspicious and high-risk SMS, WhatsApp and APK results will appear here automatically.",
            returnToProtection: "Return to Protection",
            noMatchingThreats: "No matching records",
            changeReportFilter: "Change the selected filter to view other saved threats.",
            recordSender: "Sender",
            recordPackage: "Package",
            recordDetected: "Detected",
            receivedCount: "Detected count",
            viewDetails: "View Details",
            prepareReport: "Prepare Report",
            backToThreatHistory: "Back to threat history",
            selectedThreat: "SELECTED THREAT",
            incidentType: "Incident type",
            detectedDate: "Detected",
            savedPreview: "Saved preview",
            detectionReasons: "Why Kavach flagged it",
            keepThisRecord: "Keep this record",
            keepRecordDescription: "Kept records will not be removed automatically.",
            markDismissed: "Mark as Dismissed",
            deleteRecord: "Delete this record",
            backToThreatDetails: "Back to threat details",
            prepareOfficialReport: "PREPARE REPORT",
            reviewBeforeReporting: "Review before reporting",
            reviewReportDescription: "Kavach will prepare a safe summary. You will review and complete the final submission.",
            moneyOrInformationLost: "Did you lose money or share sensitive information?",
            answerNo: "No",
            answerYes: "Yes",
            answerNotSure: "Not sure",
            additionalInformation: "Additional information",
            additionalInformationPlaceholder: "Add any useful detail. Do not enter an OTP, PIN, password or CVV.",
            generateSafeSummary: "Generate Safe Summary",
            preparedSummary: "PREPARED SUMMARY",
            reviewYourSummary: "Review your summary",
            preparedOnDevice: "Prepared on device",
            copySummary: "Copy Summary",
            nextOfficialStep: "Next official step",
            openCyberCrimePortal: "Open Cyber Crime Portal",
            openChakshu: "Open Chakshu",
            whatsappReportInstructions: "WhatsApp Report and Block Instructions",
            askTrustedContactForHelp: "Ask Trusted Contact for Help",
            didYouCompleteReport: "Did you complete the report?",
            completionDescription: "Opening a website does not mean that the report was submitted.",
            markAsReported: "Yes, Mark as Reported",
            keepAsPending: "No, Keep Pending",
            automaticHistoryCleanup: "Automatic history cleanup",
            historyCleanupDescription: "Pending records are kept for 30 days, reported records for 90 days and dismissed records for 7 days. You can keep important records for longer.",
            beforeYouReport: "Before you report",
            reportingDisclaimer: "Kavach helps you prepare and reach the appropriate official service. You must review and complete the final submission yourself."
        },


        hi: {

            /* MAIN MENU */

            mainMenu: "मुख्य मेन्यू",
            smsProtection: "एसएमएस सुरक्षा",
            whatsappCheck: "व्हाट्सऐप जांच",
            apkProtection: "एपीके सुरक्षा",
            trustedContact: "विश्वसनीय संपर्क",
            reportScam: "धोखाधड़ी की रिपोर्ट",
            settings: "सेटिंग्स",
            safetyReminder: "अपना ओटीपी, पिन, पासवर्ड या सीवीवी कभी किसी के साथ साझा न करें।",


            /* SETTINGS */

            settingsTitle: "सेटिंग्स",
            settingsDescription: "अपनी भाषा, अनुमतियां और खाते का प्रबंधन करें",
            applicationLanguage: "ऐप की भाषा",
            languageDescription: "वह भाषा चुनें जिसे आप सबसे अच्छी तरह समझते हैं",
            selectedLanguage: "चुनी गई भाषा",
            applyLanguage: "भाषा लागू करें",
            protectionAndPermissions: "सुरक्षा और अनुमतियां",
            permissionsDescription: "कवच सुरक्षा के लिए आवश्यक अनुमतियां",
            detectIncomingSms: "नए आने वाले एसएमएस का पता लगाएं और जांच करें",
            required: "आवश्यक",
            allow: "अनुमति दें",
            notifications: "सूचनाएं",
            notificationDescription: "जोखिम वाला संदेश मिलने पर चेतावनी प्राप्त करें",
            trustedContactAlerts: "विश्वसनीय संपर्क अलर्ट",
            trustedAlertDescription: "जोखिम अधिक होने पर विश्वसनीय संपर्क को सतर्क करें",
            manageTrustedContact: "अधिक जोखिम वाले अलर्ट पाने वाले व्यक्ति का प्रबंधन करें",
            currentContact: "वर्तमान संपर्क",
            noTrustedContact: "कोई विश्वसनीय संपर्क नहीं जोड़ा गया",
            addTrustedContactDescription: "अलर्ट चालू करने के लिए विश्वसनीय संपर्क जोड़ें।",
            addOrChange: "जोड़ें या बदलें",
            account: "खाता",
            accountDescription: "आपका सत्यापित कवच खाता",
            verifiedMobileNumber: "सत्यापित मोबाइल नंबर",
            verifiedWithFirebase: "फायरबेस से सत्यापित",
            verified: "सत्यापित",
            logout: "लॉग आउट",
            digitalSafety: "वरिष्ठ नागरिकों के लिए डिजिटल सुरक्षा",


            /* TRUSTED CONTACT */

            trustedContactSubtitle: "जोखिम के समय आपका भरोसेमंद व्यक्ति",
            safetySupport: "सुरक्षा सहायता",
            addSomeoneYouTrust: "अपने भरोसेमंद व्यक्ति को जोड़ें",
            trustedContactExplanation: "आपकी अनुमति से कवच अधिक जोखिम वाला संदेश मिलने पर इस व्यक्ति को सतर्क कर सकता है।",
            contactDetails: "संपर्क विवरण",
            contactDetailsDescription: "एक भरोसेमंद व्यक्ति का नाम और मोबाइल नंबर दर्ज करें।",
            requiredWithStar: "* आवश्यक",
            contactName: "संपर्क का नाम",
            contactNamePlaceholder: "उदाहरण: राजेश कुमार",
            mobileNumber: "मोबाइल नंबर",
            contactPhonePlaceholder: "10 अंकों का नंबर दर्ज करें",
            phoneNumberHelp: "ऐसा भारतीय मोबाइल नंबर दर्ज करें जिस पर एसएमएस अलर्ट मिल सके।",
            allowSafetyAlerts: "सुरक्षा अलर्ट की अनुमति दें",
            consentDescription: "अधिक जोखिम वाला संदेश मिलने पर मैं कवच को इस संपर्क को सतर्क करने की अनुमति देता हूं।",
            saveTrustedContact: "विश्वसनीय संपर्क सेव करें",
            active: "सक्रिय",
            editContact: "संपर्क बदलें",
            removeContact: "हटाएं",
            privacyProtected: "आपकी गोपनीयता सुरक्षित है",
            contactPrivacyDescription: "कवच अलर्ट में कभी भी ओटीपी, पिन, पासवर्ड, सीवीवी या पूरा निजी संदेश शामिल नहीं करेगा।",
            chooseTrustedPerson: "ऐसे व्यक्ति को चुनें जिसे आप व्यक्तिगत रूप से जानते हों और आपातकाल में तुरंत संपर्क कर सकें।",


            /* SMS PROTECTION */

            smsHeaderDescription: "जोखिम वाले संदेशों से स्वचालित सुरक्षा",
            protectionStatus: "सुरक्षा की स्थिति",
            permissionRequired: "अनुमति आवश्यक है",
            permissionRequiredDescription: "कवच को नए एसएमएस जांचने के लिए एसएमएस की अनुमति दें।",
            enableSmsProtection: "एसएमएस सुरक्षा चालू करें",
            enableSmsDescription: "कवच को नए आने वाले एसएमएस पहचानने की अनुमति चाहिए।",
            allowSmsPermission: "एसएमएस अनुमति दें",
            smsPrivacyNote: "कवच केवल संभावित धोखाधड़ी का जोखिम पहचानने के लिए संदेश जांचता है।",
            howProtectionWorks: "सुरक्षा कैसे काम करती है",
            howProtectionWorksDescription: "कवच तीन आसान चरणों में नए संदेशों की जांच करता है।",
            detectMessage: "संदेश पहचानें",
            detectMessageDescription: "कवच नए आने वाले एसएमएस को अपने आप पहचानता है।",
            checkRisk: "जोखिम जांचें",
            smsCheckRiskDescription: "संदेश में लिंक, जल्दबाजी और धोखाधड़ी के संकेतों की जांच की जाती है।",
            showWarning: "चेतावनी दिखाएं",
            showWarningDescription: "खतरा मिलने पर कवच साफ चेतावनी दिखाता है।",
            latestSmsResult: "नवीनतम एसएमएस परिणाम",
            latestSmsDescription: "सबसे हाल में जांचा गया एसएमएस यहां दिखाई देगा।",
            noResult: "कोई परिणाम नहीं",
            waitingForSms: "नए एसएमएस की प्रतीक्षा",
            waitingForSmsDescription: "नया संदेश आने पर कवच उसका जोखिम परिणाम यहां दिखाएगा।",
            sender: "भेजने वाला",
            riskResult: "जोखिम परिणाम",
            viewFullResult: "पूरा परिणाम देखें",
            remember: "याद रखें",
            smsSafetyMessage: "अनजान लिंक पर क्लिक न करें और अपना ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें।",
            unknownSender: "अनजान भेजने वाला",
            justNow: "अभी",
            suspicious: "संदिग्ध",
            riskyContent: "इस संदेश में जोखिम वाली सामग्री हो सकती है।",


            /* WHATSAPP CHECK */

            whatsappHeaderDescription: "जवाब देने से पहले संदिग्ध संदेश की जांच करें",
            yourChatsStayPrivate: "आपकी चैट निजी रहती है",
            whatsappPrivacyDescription: "कवच आपकी व्हाट्सऐप चैट खोल या पढ़ नहीं सकता। आप स्वयं तय करते हैं कि किस संदेश को कॉपी करके जांचना है।",
            howToCheckMessage: "संदेश की जांच कैसे करें",
            followSimpleSteps: "इन तीन आसान चरणों का पालन करें",
            copyMessage: "संदेश कॉपी करें",
            copyMessageDescription: "व्हाट्सऐप में संदिग्ध संदेश को दबाकर रखें और कॉपी पर टैप करें।",
            pasteMessage: "कवच में पेस्ट करें",
            pasteMessageDescription: "कॉपी किए गए संदेश को नीचे दिए गए बॉक्स में पेस्ट करें।",
            checkRiskDescription: "कवच जोखिम स्तर, कारण, सुझाया गया कदम और आवाज़ में जानकारी देगा।",
            pasteWhatsAppMessage: "व्हाट्सऐप संदेश पेस्ट करें",
            pasteOnlyMessage: "केवल वही संदेश पेस्ट करें जिसकी आप जांच करना चाहते हैं।",
            clear: "साफ करें",
            messageToCheck: "जांचने वाला संदेश",
            messageInputPlaceholder: "संदिग्ध व्हाट्सऐप संदेश यहां पेस्ट करें...",
            pasteCopiedMessage: "कॉपी किया संदेश पेस्ट करें",
            checkMessage: "संदेश जांचें",
            whatKavachChecks: "कवच क्या जांचता है",
            riskPatternsDescription: "ऑनलाइन धोखाधड़ी में पाए जाने वाले सामान्य संकेत",
            unknownLinks: "अनजान लिंक",
            urgentRequests: "जल्दी करने का दबाव",
            otpRequests: "ओटीपी की मांग",
            paymentPressure: "भुगतान का दबाव",
            fakePrizes: "नकली इनाम",
            accountThreats: "खाता बंद करने की धमकी",
            important: "महत्वपूर्ण",
            whatsappSafetyMessage: "जब कवच संदेश की जांच कर रहा हो, तब संदिग्ध लिंक पर क्लिक न करें और पैसे न भेजें।",


            /* APK PROTECTION */

            apkCheckTitle: "एपीके सुरक्षा जांच",
            apkCheckSubtitle: "एंड्रॉइड ऐप इंस्टॉल करने से पहले उसकी जांच करें",
            beforeYouInstall: "इंस्टॉल करने से पहले",
            checkDownloadedApp: "डाउनलोड किए गए ऐप की जांच करें",
            apkIntroductionText: "डाउनलोड किए गए एपीके को कवच के साथ साझा करें या खोलें। कवच इंस्टॉल करने से पहले इसकी जांच करेगा।",
            apkLimitationText: "कवच ऑफलाइन जोखिम जांच करता है। कम जोखिम का परिणाम ऐप के पूरी तरह सुरक्षित होने की गारंटी नहीं है।",
            selectApkTitle: "एपीके चुनें",
            selectApkDescription: "डाउनलोड से एपीके चुनें या उसे कवच के साथ साझा करें।",
            chooseDownloadedApk: "डाउनलोड किया गया एपीके चुनें",
            shareFromWhatsapp: "व्हाट्सऐप से",
            downloadApkStep: "व्हाट्सऐप में एपीके डाउनलोड करें।",
            openShareStep: "फाइल के विकल्प खोलें और शेयर पर टैप करें।",
            selectKavachStep: "इंस्टॉल करने से पहले जांच के लिए कवच चुनें।",
            selectedFile: "चुनी गई फाइल",
            analyseBeforeInstalling: "इंस्टॉल करने से पहले जांचें",
            analysingApk: "एपीके की जांच हो रही है…",
            analysingApkDescription: "कवच अनुमतियों, ऐप विवरण और जोखिम के संकेतों की जांच कर रहा है।",
            kavachApkResult: "कवच एपीके परिणाम",
            applicationDetails: "ऐप का विवरण",
            applicationName: "ऐप का नाम",
            packageName: "पैकेज का नाम",
            targetAndroid: "लक्षित एंड्रॉइड",
            fileHash: "एसएचए-256",
            whyApkResult: "कवच ने यह परिणाम क्यों दिया",
            recommendedAction: "सुझाया गया कदम",
            trustedContactAlert: "विश्वसनीय संपर्क अलर्ट",
            voiceExplanation: "कवच आवाज़ में जानकारी",
            deleteApk: "एपीके हटाएं",
            continueToInstaller: "एंड्रॉइड इंस्टॉलर पर जाएं",
            checkAnotherApk: "दूसरा एपीके जांचें",
            whatKavachChecksApk: "कवच क्या जांचता है",
            offlineApkChecks: "इंस्टॉल करने से पहले की जाने वाली ऑफलाइन जांच",
            sensitivePermissions: "संवेदनशील अनुमतियां",
            smsContactsAccess: "एसएमएस और संपर्क की पहुंच",
            overlayAccessibility: "स्क्रीन ओवरले और एक्सेसिबिलिटी",
            apkSourceIdentity: "ऐप की पहचान और स्रोत",
            targetAndroidVersion: "लक्षित एंड्रॉइड संस्करण",
            suspiciousCombinations: "संदिग्ध अनुमति संयोजन",
            apkFinalSafetyNote: "केवल भरोसेमंद स्रोत से ऐप इंस्टॉल करें। Google Play Protect चालू रखें।",


            /* REPORT SCAM */

            reportTitle: "धोखाधड़ी की रिपोर्ट",
            reportSubtitle: "पहचाने गए खतरों की समीक्षा करें और रिपोर्ट तैयार करें",
            emergencyHelp: "तत्काल सहायता",
            lostMoneyQuestion: "क्या आपके पैसे का नुकसान हुआ है?",
            emergencyDescription: "तुरंत अपने बैंक से संपर्क करें और भारत की साइबर धोखाधड़ी हेल्पलाइन 1930 पर कॉल करें।",
            call1930: "1930 पर कॉल करें",
            localThreatHistory: "स्थानीय खतरा इतिहास",
            threatHistory: "पहचाने गए खतरे",
            threatHistoryDescription: "कवच द्वारा सेव किए गए संदिग्ध एसएमएस, व्हाट्सऐप संदेश और एपीके परिणाम यहां दिखाई देंगे।",
            historyPrivacyNote: "रिकॉर्ड केवल इस डिवाइस पर रहते हैं। सेव किए गए पूर्वावलोकन से ओटीपी, पिन, पासवर्ड और अन्य संवेदनशील जानकारी हटा दी जाती है।",
            pendingReports: "लंबित",
            savedThreats: "सेव किए गए खतरे",
            reportRecords: "रिपोर्ट रिकॉर्ड",
            chooseThreat: "रिपोर्ट करने के लिए खतरा चुनें",
            filterAll: "सभी",
            reportStatus: "रिपोर्ट की स्थिति",
            allStatuses: "सभी स्थितियां",
            statusPending: "लंबित",
            statusPrepared: "तैयार",
            statusReported: "रिपोर्ट किया गया",
            statusDismissed: "खारिज",
            loadingThreats: "खतरे का इतिहास लोड हो रहा है…",
            loadingThreatsDescription: "कवच इस डिवाइस से सेव किए गए रिकॉर्ड पढ़ रहा है।",
            noSavedThreats: "कोई सेव किया गया खतरा नहीं",
            noSavedThreatsDescription: "संदिग्ध और अधिक जोखिम वाले एसएमएस, व्हाट्सऐप और एपीके परिणाम यहां अपने आप दिखाई देंगे।",
            returnToProtection: "सुरक्षा पर वापस जाएं",
            noMatchingThreats: "कोई मिलता-जुलता रिकॉर्ड नहीं",
            changeReportFilter: "दूसरे सेव किए गए खतरे देखने के लिए फिल्टर बदलें।",
            recordSender: "भेजने वाला",
            recordPackage: "पैकेज",
            recordDetected: "पता चला",
            receivedCount: "पता चलने की संख्या",
            viewDetails: "विवरण देखें",
            prepareReport: "रिपोर्ट तैयार करें",
            backToThreatHistory: "खतरे के इतिहास पर वापस जाएं",
            selectedThreat: "चुना गया खतरा",
            incidentType: "घटना का प्रकार",
            detectedDate: "पता चला",
            savedPreview: "सुरक्षित पूर्वावलोकन",
            detectionReasons: "कवच ने इसे खतरा क्यों माना",
            keepThisRecord: "यह रिकॉर्ड सुरक्षित रखें",
            keepRecordDescription: "सुरक्षित रखे गए रिकॉर्ड अपने आप नहीं हटाए जाएंगे।",
            markDismissed: "खारिज के रूप में चिह्नित करें",
            deleteRecord: "यह रिकॉर्ड हटाएं",
            backToThreatDetails: "खतरे के विवरण पर वापस जाएं",
            prepareOfficialReport: "रिपोर्ट तैयार करें",
            reviewBeforeReporting: "रिपोर्ट करने से पहले समीक्षा करें",
            reviewReportDescription: "कवच एक सुरक्षित सारांश तैयार करेगा। आप उसकी समीक्षा करके अंतिम रिपोर्ट स्वयं पूरी करेंगे।",
            moneyOrInformationLost: "क्या आपके पैसे का नुकसान हुआ या आपने संवेदनशील जानकारी साझा की?",
            answerNo: "नहीं",
            answerYes: "हां",
            answerNotSure: "निश्चित नहीं",
            additionalInformation: "अतिरिक्त जानकारी",
            additionalInformationPlaceholder: "उपयोगी जानकारी जोड़ें। ओटीपी, पिन, पासवर्ड या सीवीवी दर्ज न करें।",
            generateSafeSummary: "सुरक्षित सारांश तैयार करें",
            preparedSummary: "तैयार सारांश",
            reviewYourSummary: "अपने सारांश की समीक्षा करें",
            preparedOnDevice: "डिवाइस पर तैयार",
            copySummary: "सारांश कॉपी करें",
            nextOfficialStep: "अगला आधिकारिक कदम",
            openCyberCrimePortal: "साइबर क्राइम पोर्टल खोलें",
            openChakshu: "चक्षु खोलें",
            whatsappReportInstructions: "व्हाट्सऐप रिपोर्ट और ब्लॉक निर्देश",
            askTrustedContactForHelp: "विश्वसनीय संपर्क से मदद मांगें",
            didYouCompleteReport: "क्या आपने रिपोर्ट पूरी कर ली?",
            completionDescription: "केवल वेबसाइट खोलने का अर्थ यह नहीं है कि रिपोर्ट जमा हो गई।",
            markAsReported: "हां, रिपोर्ट किया गया चिह्नित करें",
            keepAsPending: "नहीं, लंबित रखें",
            automaticHistoryCleanup: "इतिहास की स्वचालित सफाई",
            historyCleanupDescription: "लंबित रिकॉर्ड 30 दिन, रिपोर्ट किए गए रिकॉर्ड 90 दिन और खारिज रिकॉर्ड 7 दिन रखे जाते हैं। महत्वपूर्ण रिकॉर्ड को अधिक समय तक सुरक्षित रखा जा सकता है।",
            beforeYouReport: "रिपोर्ट करने से पहले",
            reportingDisclaimer: "कवच रिपोर्ट तैयार करने और उचित आधिकारिक सेवा तक पहुंचने में सहायता करता है। आपको अंतिम रिपोर्ट की समीक्षा करके उसे स्वयं जमा करना होगा।"
        }
    };


    /*
     * Create a reverse English-text map for older
     * page elements that do not yet use data-i18n.
     */
    const englishTextToKey = {};

    Object.keys(
        translations.en
    ).forEach(function (key) {

        englishTextToKey[
            translations.en[key]
        ] = key;
    });


    function getSavedLanguage() {

        const savedLanguage =
            localStorage.getItem(
                "kavachLanguage"
            );

        return savedLanguage === "hi"
            ? "hi"
            : "en";
    }


    function translate(
        key,
        language
    ) {

        const selectedLanguage =
            language || getSavedLanguage();

        if (
            translations[selectedLanguage] &&
            translations[selectedLanguage][key]
        ) {
            return translations[selectedLanguage][key];
        }

        if (translations.en[key]) {
            return translations.en[key];
        }

        return "";
    }


    function preparePlainTextElements() {

        const elements =
            document.querySelectorAll(
                "h1, h2, h3, h4, p, label, button, a, span, small, li, dt, option"
            );

        elements.forEach(function (element) {

            if (
                element.hasAttribute("data-i18n") ||
                element.children.length > 0
            ) {
                return;
            }

            const currentText =
                element.textContent
                    .replace(/\s+/g, " ")
                    .trim();

            const key =
                englishTextToKey[currentText];

            if (key) {

                element.setAttribute(
                    "data-auto-i18n",
                    key
                );
            }
        });
    }


    function preparePlaceholders() {

        document
            .querySelectorAll(
                "input[placeholder], textarea[placeholder]"
            )
            .forEach(function (element) {

                if (
                    element.hasAttribute(
                        "data-i18n-placeholder"
                    )
                ) {
                    return;
                }

                const placeholder =
                    element.placeholder.trim();

                const key =
                    englishTextToKey[placeholder];

                if (key) {

                    element.setAttribute(
                        "data-auto-placeholder",
                        key
                    );
                }
            });
    }


    function applyLanguage(
        language
    ) {

        const selectedLanguage =
            language === "hi"
                ? "hi"
                : "en";

        document.documentElement.lang =
            selectedLanguage;


        document
            .querySelectorAll(
                "[data-i18n]"
            )
            .forEach(function (element) {

                const key =
                    element.getAttribute(
                        "data-i18n"
                    );

                const translatedText =
                    translate(
                        key,
                        selectedLanguage
                    );

                if (translatedText) {

                    element.textContent =
                        translatedText;
                }
            });


        document
            .querySelectorAll(
                "[data-auto-i18n]"
            )
            .forEach(function (element) {

                const key =
                    element.getAttribute(
                        "data-auto-i18n"
                    );

                const translatedText =
                    translate(
                        key,
                        selectedLanguage
                    );

                if (translatedText) {

                    element.textContent =
                        translatedText;
                }
            });


        document
            .querySelectorAll(
                "[data-i18n-placeholder]"
            )
            .forEach(function (element) {

                const key =
                    element.getAttribute(
                        "data-i18n-placeholder"
                    );

                const translatedText =
                    translate(
                        key,
                        selectedLanguage
                    );

                if (translatedText) {

                    element.placeholder =
                        translatedText;
                }
            });


        document
            .querySelectorAll(
                "[data-auto-placeholder]"
            )
            .forEach(function (element) {

                const key =
                    element.getAttribute(
                        "data-auto-placeholder"
                    );

                const translatedText =
                    translate(
                        key,
                        selectedLanguage
                    );

                if (translatedText) {

                    element.placeholder =
                        translatedText;
                }
            });


        const loginLanguageSelect =
            document.getElementById(
                "loginLanguageSelect"
            );

        const settingsLanguageSelect =
            document.getElementById(
                "languageSelect"
            );


        if (loginLanguageSelect) {

            loginLanguageSelect.value =
                selectedLanguage;
        }


        if (settingsLanguageSelect) {

            settingsLanguageSelect.value =
                selectedLanguage;
        }


        window.dispatchEvent(
            new CustomEvent(
                "kavachLanguageChanged",
                {
                    detail: {
                        language:
                            selectedLanguage
                    }
                }
            )
        );
    }


    function saveLanguage(
        language
    ) {

        const selectedLanguage =
            language === "hi"
                ? "hi"
                : "en";

        localStorage.setItem(
            "kavachLanguage",
            selectedLanguage
        );


        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .saveLanguage === "function"
        ) {

            window.KavachAndroid
                .saveLanguage(
                    selectedLanguage
                );
        }


        applyLanguage(
            selectedLanguage
        );
    }


    /*
     * Login language selector.
     */
    const loginLanguageSelect =
        document.getElementById(
            "loginLanguageSelect"
        );

    if (loginLanguageSelect) {

        loginLanguageSelect.value =
            getSavedLanguage();

        loginLanguageSelect.addEventListener(
            "change",
            function () {

                saveLanguage(
                    loginLanguageSelect.value
                );
            }
        );
    }


    /*
     * Settings language selector.
     */
    const settingsLanguageSelect =
        document.getElementById(
            "languageSelect"
        );

    const saveLanguageButton =
        document.getElementById(
            "saveLanguageButton"
        );


    if (settingsLanguageSelect) {

        settingsLanguageSelect.value =
            getSavedLanguage();
    }


    if (
        settingsLanguageSelect &&
        saveLanguageButton
    ) {

        saveLanguageButton.addEventListener(
            "click",
            function () {

                saveLanguage(
                    settingsLanguageSelect.value
                );

                saveLanguageButton.textContent =
                    settingsLanguageSelect.value === "hi"
                        ? "भाषा लागू हो गई"
                        : "Language applied";
            }
        );
    }


    /*
     * Public language helper for page-specific scripts.
     */
    window.KavachLanguage = {
        get: getSavedLanguage,
        set: saveLanguage,
        apply: applyLanguage,
        translate: translate
    };


    preparePlainTextElements();
    preparePlaceholders();

    applyLanguage(
        getSavedLanguage()
    );
});