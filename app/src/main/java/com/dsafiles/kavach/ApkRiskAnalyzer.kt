package com.dsafiles.kavach
import android.Manifest
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

/*
 * Complete offline APK-analysis result.
 */
data class ApkRiskResult(

    val level: String,

    val score: Int,

    val appName: String,

    val packageName: String,

    val targetSdk: Int,

    val sha256: String,

    val reasonsEnglish: List<String>,

    val reasonsHindi: List<String>,

    val summaryEnglish: String,

    val summaryHindi: String,

    val actionEnglish: String,

    val actionHindi: String,

    val voiceEnglish: String,

    val voiceHindi: String
) {

    /*
     * Convert the native result into JSON for apk.js.
     */
    fun toJson(
        trustedContactAlerted: Boolean
    ): String {

        return JSONObject()
            .put(
                "level",
                level
            )
            .put(
                "score",
                score
            )
            .put(
                "appName",
                appName
            )
            .put(
                "packageName",
                packageName
            )
            .put(
                "targetSdk",
                targetSdk
            )
            .put(
                "sha256",
                sha256
            )
            .put(
                "reasonsEnglish",
                JSONArray(
                    reasonsEnglish
                )
            )
            .put(
                "reasonsHindi",
                JSONArray(
                    reasonsHindi
                )
            )
            .put(
                "summaryEnglish",
                summaryEnglish
            )
            .put(
                "summaryHindi",
                summaryHindi
            )
            .put(
                "actionEnglish",
                actionEnglish
            )
            .put(
                "actionHindi",
                actionHindi
            )
            .put(
                "voiceEnglish",
                voiceEnglish
            )
            .put(
                "voiceHindi",
                voiceHindi
            )
            .put(
                "trustedContactAlerted",
                trustedContactAlerted
            )
            .put(
                "canInstall",
                level != "HIGH"
            )
            .toString()
    }
}


/*
 * Offline APK static analyser.
 *
 * This analyser checks metadata, requested permissions,
 * components and dangerous permission combinations.
 *
 * It does not claim that an APK is guaranteed safe.
 */
object ApkRiskAnalyzer {

    fun analyse(
        context: Context,
        apkFile: File
    ): ApkRiskResult {

        if (
            !apkFile.exists() ||
            !apkFile.isFile
        ) {
            throw IllegalArgumentException(
                "The selected APK file does not exist."
            )
        }

        if (
            !apkFile.name
                .lowercase()
                .endsWith(".apk")
        ) {
            throw IllegalArgumentException(
                "The selected file is not an APK."
            )
        }


        val packageManager =
            context.packageManager

        val packageInfoFlags =
            PackageManager.GET_PERMISSIONS or
                    PackageManager.GET_SERVICES or
                    PackageManager.GET_RECEIVERS or
                    PackageManager.GET_ACTIVITIES or
                    PackageManager.GET_META_DATA


        @Suppress("DEPRECATION")
        val packageInfo =
            packageManager.getPackageArchiveInfo(
                apkFile.absolutePath,
                packageInfoFlags
            ) ?: throw IllegalArgumentException(
                "Android could not read this APK. The file may be invalid or damaged."
            )


        val applicationInfo =
            packageInfo.applicationInfo

        applicationInfo?.sourceDir =
            apkFile.absolutePath

        applicationInfo?.publicSourceDir =
            apkFile.absolutePath


        val appName =
            try {

                applicationInfo
                    ?.loadLabel(
                        packageManager
                    )
                    ?.toString()
                    ?.trim()
                    ?.takeIf {
                        it.isNotBlank()
                    }
                    ?: apkFile.nameWithoutExtension

            } catch (
                exception: Exception
            ) {
                apkFile.nameWithoutExtension
            }


        val packageName =
            packageInfo.packageName
                ?: "Unknown"


        val targetSdk =
            applicationInfo
                ?.targetSdkVersion
                ?: 0


        val requestedPermissions =
            packageInfo
                .requestedPermissions
                ?.toSet()
                ?: emptySet()


        var score = 0

        val reasonsEnglish =
            mutableListOf<String>()

        val reasonsHindi =
            mutableListOf<String>()


        fun addReason(
            points: Int,
            english: String,
            hindi: String
        ) {

            if (
                !reasonsEnglish.contains(
                    english
                )
            ) {
                score += points

                reasonsEnglish.add(
                    english
                )

                reasonsHindi.add(
                    hindi
                )
            }
        }


        /*
         * SMS permissions.
         */
        val readsSms =
            requestedPermissions.contains(
                Manifest.permission.READ_SMS
            )

        val receivesSms =
            requestedPermissions.contains(
                Manifest.permission.RECEIVE_SMS
            )

        val sendsSms =
            requestedPermissions.contains(
                Manifest.permission.SEND_SMS
            )

        val usesSms =
            readsSms ||
                    receivesSms ||
                    sendsSms

        if (readsSms || receivesSms) {
            addReason(
                3,
                "The app requests access to SMS messages.",
                "यह ऐप एसएमएस संदेशों तक पहुंच मांगता है।"
            )
        }

        if (sendsSms) {
            addReason(
                3,
                "The app can send SMS messages from the phone.",
                "यह ऐप फोन से एसएमएस भेज सकता है।"
            )
        }


        /*
         * Contacts access.
         */
        val readsContacts =
            requestedPermissions.contains(
                Manifest.permission.READ_CONTACTS
            )

        val writesContacts =
            requestedPermissions.contains(
                Manifest.permission.WRITE_CONTACTS
            )

        val usesContacts =
            readsContacts ||
                    writesContacts

        if (usesContacts) {
            addReason(
                2,
                "The app requests access to contacts.",
                "यह ऐप संपर्क सूची तक पहुंच मांगता है।"
            )
        }


        /*
         * Call-log and phone permissions.
         */
        val readsCallLog =
            requestedPermissions.contains(
                Manifest.permission.READ_CALL_LOG
            )

        val writesCallLog =
            requestedPermissions.contains(
                Manifest.permission.WRITE_CALL_LOG
            )

        if (readsCallLog || writesCallLog) {
            addReason(
                3,
                "The app requests access to the phone call log.",
                "यह ऐप फोन कॉल रिकॉर्ड तक पहुंच मांगता है।"
            )
        }


        /*
         * Screen-overlay permission.
         */
        val usesScreenOverlay =
            requestedPermissions.contains(
                Manifest.permission.SYSTEM_ALERT_WINDOW
            )

        if (usesScreenOverlay) {
            addReason(
                3,
                "The app can display content over other applications.",
                "यह ऐप दूसरे ऐप के ऊपर सामग्री दिखा सकता है।"
            )
        }


        /*
         * Ability to install additional APK files.
         */
        val canRequestInstallPackages =
            requestedPermissions.contains(
                Manifest.permission.REQUEST_INSTALL_PACKAGES
            )

        if (canRequestInstallPackages) {
            addReason(
                4,
                "The app can request installation of other applications.",
                "यह ऐप दूसरे एप्लिकेशन इंस्टॉल करने का अनुरोध कर सकता है।"
            )
        }


        /*
         * Accessibility service detection.
         */
        val hasAccessibilityService =
            packageInfo
                .services
                ?.any { serviceInfo ->

                    serviceInfo.permission ==
                            Manifest.permission
                                .BIND_ACCESSIBILITY_SERVICE
                }
                ?: false

        if (hasAccessibilityService) {
            addReason(
                5,
                "The app contains an Accessibility service that may control or observe the screen.",
                "इस ऐप में एक्सेसिबिलिटी सेवा है जो स्क्रीन को देख या नियंत्रित कर सकती है।"
            )
        }


        /*
         * Device-admin receiver detection.
         */
        val hasDeviceAdminReceiver =
            packageInfo
                .receivers
                ?.any { activityInfo ->

                    activityInfo.permission ==
                            Manifest.permission
                                .BIND_DEVICE_ADMIN
                }
                ?: false

        if (hasDeviceAdminReceiver) {
            addReason(
                4,
                "The app contains a device-administrator component.",
                "इस ऐप में डिवाइस-एडमिनिस्ट्रेटर घटक है।"
            )
        }


        /*
         * Camera and microphone.
         */
        val usesCamera =
            requestedPermissions.contains(
                Manifest.permission.CAMERA
            )

        val usesMicrophone =
            requestedPermissions.contains(
                Manifest.permission.RECORD_AUDIO
            )

        if (usesCamera && usesMicrophone) {
            addReason(
                2,
                "The app requests both camera and microphone access.",
                "यह ऐप कैमरा और माइक्रोफोन दोनों की अनुमति मांगता है।"
            )

        } else if (usesCamera) {

            addReason(
                1,
                "The app requests camera access.",
                "यह ऐप कैमरे की अनुमति मांगता है।"
            )

        } else if (usesMicrophone) {

            addReason(
                1,
                "The app requests microphone access.",
                "यह ऐप माइक्रोफोन की अनुमति मांगता है।"
            )
        }


        /*
         * Location access.
         */
        val usesLocation =
            requestedPermissions.contains(
                Manifest.permission.ACCESS_FINE_LOCATION
            ) ||
                    requestedPermissions.contains(
                        Manifest.permission
                            .ACCESS_COARSE_LOCATION
                    )

        if (usesLocation) {
            addReason(
                1,
                "The app requests location access.",
                "यह ऐप स्थान की जानकारी मांगता है।"
            )
        }


        /*
         * Very old target Android versions may bypass
         * newer security protections.
         */
        if (
            targetSdk in 1..25
        ) {
            addReason(
                4,
                "The app targets a very old Android version.",
                "यह ऐप बहुत पुराने एंड्रॉइड संस्करण के लिए बनाया गया है।"
            )

        } else if (
            targetSdk in 26..28
        ) {
            addReason(
                2,
                "The app targets an older Android version.",
                "यह ऐप पुराने एंड्रॉइड संस्करण के लिए बनाया गया है।"
            )
        }


        /*
         * Debuggable APK.
         */
        val isDebuggable =
            applicationInfo
                ?.flags
                ?.and(
                    ApplicationInfo.FLAG_DEBUGGABLE
                ) != 0

        if (isDebuggable) {
            addReason(
                2,
                "The APK is marked as debuggable.",
                "यह एपीके डिबग करने योग्य रूप में बनाया गया है।"
            )
        }


        /*
         * High-risk permission combinations.
         */
        if (
            usesSms &&
            hasAccessibilityService
        ) {
            addReason(
                4,
                "SMS access combined with Accessibility access is a high-risk combination.",
                "एसएमएस और एक्सेसिबिलिटी की अनुमति का मेल बहुत जोखिम वाला है।"
            )
        }

        if (
            usesSms &&
            usesScreenOverlay
        ) {
            addReason(
                4,
                "SMS access combined with screen-overlay access may be used to steal private information.",
                "एसएमएस और स्क्रीन-ओवरले का मेल निजी जानकारी चुराने के लिए उपयोग हो सकता है।"
            )
        }

        if (
            usesContacts &&
            usesSms &&
            canRequestInstallPackages
        ) {
            addReason(
                4,
                "The app combines contacts, SMS and app-installation permissions.",
                "ऐप संपर्क, एसएमएस और दूसरे ऐप इंस्टॉल करने की अनुमतियां एक साथ मांगता है।"
            )
        }

        if (
            hasAccessibilityService &&
            usesScreenOverlay
        ) {
            addReason(
                4,
                "Accessibility and screen-overlay access together can provide extensive control over the phone.",
                "एक्सेसिबिलिटी और स्क्रीन-ओवरले मिलकर फोन पर बहुत अधिक नियंत्रण दे सकते हैं।"
            )
        }


        val level =
            when {
                score >= 8 -> "HIGH"
                score >= 3 -> "SUSPICIOUS"
                else -> "LOW"
            }


        if (reasonsEnglish.isEmpty()) {

            reasonsEnglish.add(
                "No known dangerous permission combination was found."
            )

            reasonsHindi.add(
                "कोई जाना-पहचाना खतरनाक अनुमति संयोजन नहीं मिला।"
            )
        }


        val summaryEnglish: String
        val summaryHindi: String

        val actionEnglish: String
        val actionHindi: String

        val voiceEnglish: String
        val voiceHindi: String


        when (level) {

            "HIGH" -> {

                summaryEnglish =
                    "This APK contains high-risk permissions or components."

                summaryHindi =
                    "इस एपीके में बहुत जोखिम वाली अनुमतियां या घटक हैं।"

                actionEnglish =
                    "Do not install this APK. Delete it and verify the sender through a trusted official source."

                actionHindi =
                    "इस एपीके को इंस्टॉल न करें। इसे हटाएं और भेजने वाले की आधिकारिक माध्यम से पुष्टि करें।"

                voiceEnglish =
                    "Warning. This APK looks highly risky. " +
                            reasonsEnglish.joinToString(
                                " "
                            ) +
                            " Do not install it. Delete the APK and verify the sender."

                voiceHindi =
                    "सावधान। यह एपीके बहुत जोखिम भरा लगता है। " +
                            reasonsHindi.joinToString(
                                " "
                            ) +
                            " इसे इंस्टॉल न करें। एपीके हटाएं और भेजने वाले की पुष्टि करें।"
            }


            "SUSPICIOUS" -> {

                summaryEnglish =
                    "This APK contains permissions that should be reviewed carefully."

                summaryHindi =
                    "इस एपीके में ऐसी अनुमतियां हैं जिनकी सावधानी से जांच करनी चाहिए।"

                actionEnglish =
                    "Verify the application source and developer before installing it. Prefer the official Play Store."

                actionHindi =
                    "इंस्टॉल करने से पहले ऐप के स्रोत और डेवलपर की पुष्टि करें। आधिकारिक प्ले स्टोर को प्राथमिकता दें।"

                voiceEnglish =
                    "This APK looks suspicious. " +
                            reasonsEnglish.joinToString(
                                " "
                            ) +
                            " Verify the source and developer before installing it."

                voiceHindi =
                    "यह एपीके संदिग्ध लगता है। " +
                            reasonsHindi.joinToString(
                                " "
                            ) +
                            " इंस्टॉल करने से पहले स्रोत और डेवलपर की पुष्टि करें।"
            }


            else -> {

                summaryEnglish =
                    "No known danger was detected in the offline checks."

                summaryHindi =
                    "ऑफलाइन जांच में कोई जाना-पहचाना खतरा नहीं मिला।"

                actionEnglish =
                    "A low-risk result does not guarantee safety. Verify the source and keep Google Play Protect enabled."

                actionHindi =
                    "कम जोखिम का परिणाम पूरी सुरक्षा की गारंटी नहीं है। स्रोत की पुष्टि करें और Google Play Protect चालू रखें।"

                voiceEnglish =
                    "Kavach did not find a known dangerous permission combination in this APK. It appears low risk, but this does not guarantee that it is completely safe."

                voiceHindi =
                    "कवच को इस एपीके में कोई जाना-पहचाना खतरनाक अनुमति संयोजन नहीं मिला। यह कम जोखिम वाला लगता है, लेकिन यह पूरी सुरक्षा की गारंटी नहीं है।"
            }
        }


        val sha256 =
            calculateSha256(
                apkFile
            )


        return ApkRiskResult(
            level = level,
            score = score,
            appName = appName,
            packageName = packageName,
            targetSdk = targetSdk,
            sha256 = sha256,
            reasonsEnglish =
                reasonsEnglish.toList(),
            reasonsHindi =
                reasonsHindi.toList(),
            summaryEnglish =
                summaryEnglish,
            summaryHindi =
                summaryHindi,
            actionEnglish =
                actionEnglish,
            actionHindi =
                actionHindi,
            voiceEnglish =
                voiceEnglish,
            voiceHindi =
                voiceHindi
        )
    }


    /*
     * Calculate the APK file's SHA-256 hash.
     */
    private fun calculateSha256(
        file: File
    ): String {

        val digest =
            MessageDigest.getInstance(
                "SHA-256"
            )

        FileInputStream(file).use {
                inputStream ->

            val buffer =
                ByteArray(8192)

            while (true) {

                val bytesRead =
                    inputStream.read(
                        buffer
                    )

                if (bytesRead <= 0) {
                    break
                }

                digest.update(
                    buffer,
                    0,
                    bytesRead
                )
            }
        }

        return digest
            .digest()
            .joinToString(
                separator = ""
            ) { byte ->

                "%02x".format(
                    byte
                )
            }
    }
}