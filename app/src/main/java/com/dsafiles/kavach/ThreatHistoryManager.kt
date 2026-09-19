package com.dsafiles.kavach
import android.content.Context
import org.json.JSONArray
import java.security.MessageDigest
import java.util.Locale

class ThreatHistoryManager(
    context: Context
) {

    companion object {

        private const val ONE_DAY_MILLIS =
            24L * 60L * 60L * 1000L

        private const val DEFAULT_RETENTION_DAYS =
            30L

        private const val MAX_PREVIEW_LENGTH =
            500
    }


    private val database =
        ThreatDatabaseHelper(
            context.applicationContext
        )


    /**
     * Saves a suspicious or high-risk SMS.
     *
     * LOW messages are not added to report history.
     */
    fun saveSmsThreat(
        sender: String?,
        message: String,
        riskLevel: String,
        reasons: List<String>,
        recommendedAction: String
    ): Long? {

        val normalizedRisk =
            normalizeRiskLevel(riskLevel)
                ?: return null


        val currentTime =
            System.currentTimeMillis()


        val cleanSender =
            sender
                ?.trim()
                ?.takeIf { it.isNotBlank() }


        val safePreview =
            createSafePreview(message)


        val fingerprint =
            createFingerprint(
                listOf(
                    ThreatDatabaseHelper.TYPE_SMS,
                    cleanSender.orEmpty(),
                    normalizeForFingerprint(message)
                )
            )


        val title =
            if (
                normalizedRisk ==
                ThreatDatabaseHelper.RISK_HIGH
            ) {
                "Possible high-risk SMS scam"
            } else {
                "Possible suspicious SMS"
            }


        val record = ThreatRecord(

            threatType =
                ThreatDatabaseHelper.TYPE_SMS,

            riskLevel =
                normalizedRisk,

            detectedAt =
                currentTime,

            lastDetectedAt =
                currentTime,

            title =
                title,

            senderAddress =
                cleanSender,

            maskedSender =
                maskSender(cleanSender),

            safeContent =
                safePreview,

            reasonsJson =
                reasonsToJson(reasons),

            recommendedAction =
                recommendedAction.trim(),

            expiresAt =
                calculateExpiryTime(
                    currentTime
                ),

            fingerprint =
                fingerprint
        )


        return database.saveOrUpdateThreat(
            record
        )
    }


    /**
     * Saves a suspicious or high-risk WhatsApp
     * message that the user pasted into Kavach.
     *
     * Kavach does not claim that the copied text
     * contains verified WhatsApp metadata.
     */
    fun saveWhatsAppThreat(
        message: String,
        riskLevel: String,
        reasons: List<String>,
        recommendedAction: String
    ): Long? {

        val normalizedRisk =
            normalizeRiskLevel(riskLevel)
                ?: return null


        val currentTime =
            System.currentTimeMillis()


        val safePreview =
            createSafePreview(message)


        val fingerprint =
            createFingerprint(
                listOf(
                    ThreatDatabaseHelper.TYPE_WHATSAPP,
                    normalizeForFingerprint(message)
                )
            )


        val title =
            if (
                normalizedRisk ==
                ThreatDatabaseHelper.RISK_HIGH
            ) {
                "Possible high-risk WhatsApp scam"
            } else {
                "Possible suspicious WhatsApp message"
            }


        val record = ThreatRecord(

            threatType =
                ThreatDatabaseHelper.TYPE_WHATSAPP,

            riskLevel =
                normalizedRisk,

            detectedAt =
                currentTime,

            lastDetectedAt =
                currentTime,

            title =
                title,

            safeContent =
                safePreview,

            reasonsJson =
                reasonsToJson(reasons),

            recommendedAction =
                recommendedAction.trim(),

            expiresAt =
                calculateExpiryTime(
                    currentTime
                ),

            fingerprint =
                fingerprint
        )


        return database.saveOrUpdateThreat(
            record
        )
    }


    /**
     * Saves APK metadata and analysis information.
     *
     * The APK binary is not stored in report history.
     */
    fun saveApkThreat(
        apkName: String?,
        apkFileName: String?,
        packageName: String?,
        sha256: String?,
        targetSdk: Int?,
        riskLevel: String,
        reasons: List<String>,
        recommendedAction: String,
        apkDeleted: Boolean = false
    ): Long? {

        val normalizedRisk =
            normalizeRiskLevel(riskLevel)
                ?: return null


        val currentTime =
            System.currentTimeMillis()


        val cleanApkName =
            apkName
                ?.trim()
                ?.takeIf { it.isNotBlank() }


        val cleanFileName =
            apkFileName
                ?.trim()
                ?.takeIf { it.isNotBlank() }


        val cleanPackageName =
            packageName
                ?.trim()
                ?.takeIf { it.isNotBlank() }


        val cleanHash =
            sha256
                ?.trim()
                ?.uppercase(Locale.ROOT)
                ?.takeIf { it.isNotBlank() }


        val displayName =
            cleanApkName
                ?: cleanFileName
                ?: "Downloaded APK"


        val safePreviewParts =
            mutableListOf<String>()


        safePreviewParts.add(
            "App: $displayName"
        )


        if (cleanPackageName != null) {

            safePreviewParts.add(
                "Package: $cleanPackageName"
            )
        }


        if (targetSdk != null) {

            safePreviewParts.add(
                "Target Android SDK: $targetSdk"
            )
        }


        val safePreview =
            safePreviewParts.joinToString(
                separator = "\n"
            )


        val fingerprintSource =
            when {

                !cleanHash.isNullOrBlank() ->
                    cleanHash

                !cleanPackageName.isNullOrBlank() ->
                    cleanPackageName

                else ->
                    cleanFileName.orEmpty()
            }


        val fingerprint =
            createFingerprint(
                listOf(
                    ThreatDatabaseHelper.TYPE_APK,
                    fingerprintSource
                )
            )


        val title =
            if (
                normalizedRisk ==
                ThreatDatabaseHelper.RISK_HIGH
            ) {
                "Possible high-risk APK"
            } else {
                "Possible suspicious APK"
            }


        val record = ThreatRecord(

            threatType =
                ThreatDatabaseHelper.TYPE_APK,

            riskLevel =
                normalizedRisk,

            detectedAt =
                currentTime,

            lastDetectedAt =
                currentTime,

            title =
                title,

            safeContent =
                safePreview,

            reasonsJson =
                reasonsToJson(reasons),

            recommendedAction =
                recommendedAction.trim(),

            apkName =
                cleanApkName,

            apkFileName =
                cleanFileName,

            packageName =
                cleanPackageName,

            apkSha256 =
                cleanHash,

            targetSdk =
                targetSdk,

            apkDeleted =
                apkDeleted,

            expiresAt =
                calculateExpiryTime(
                    currentTime
                ),

            fingerprint =
                fingerprint
        )


        return database.saveOrUpdateThreat(
            record
        )
    }


    /**
     * Replaces common sensitive information before
     * message text is added to report history.
     */
    fun createSafePreview(
        originalText: String
    ): String {

        var safeText =
            originalText
                .trim()
                .replace(
                    Regex("\\s+"),
                    " "
                )


        /*
         * OTP examples:
         * OTP is 527194
         * OTP: 527194
         * verification code 527194
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "(?i)\\b(otp|one[ -]?time password|" +
                            "verification code|security code)" +
                            "\\b\\s*(is|:|-)?\\s*[a-z0-9]{4,10}"
            ),
            "$1 [REDACTED]"
        )


        /*
         * PIN examples:
         * PIN 1234
         * UPI PIN: 123456
         * ATM PIN is 1234
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "(?i)\\b(upi pin|atm pin|pin)" +
                            "\\b\\s*(is|:|-)?\\s*\\d{4,8}"
            ),
            "$1 [REDACTED]"
        )


        /*
         * Password examples:
         * Password: example123
         * passcode is 887766
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "(?i)\\b(password|passcode)" +
                            "\\b\\s*(is|:|-)?\\s*[^\\s,.;]{4,30}"
            ),
            "$1 [REDACTED]"
        )


        /*
         * CVV examples:
         * CVV 123
         * CVV: 487
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "(?i)\\b(cvv|cvc)" +
                            "\\b\\s*(is|:|-)?\\s*\\d{3,4}"
            ),
            "$1 [REDACTED]"
        )


        /*
         * Aadhaar-like 12-digit numbers.
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b"
            ),
            "[REDACTED AADHAAR NUMBER]"
        )


        /*
         * Long payment-card-like numbers.
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "\\b(?:\\d[ -]?){13,19}\\b"
            ),
            "[REDACTED CARD NUMBER]"
        )


        /*
         * Bank account details where an account label
         * appears before the number.
         */
        safeText = safeText.replace(
            Regex(
                pattern =
                    "(?i)\\b(account|a/c|bank account)" +
                            "\\b\\s*(number|no\\.?|:|-)?\\s*\\d{6,20}"
            ),
            "$1 [REDACTED]"
        )


        return if (
            safeText.length >
            MAX_PREVIEW_LENGTH
        ) {

            safeText
                .take(MAX_PREVIEW_LENGTH)
                .trimEnd() + "…"

        } else {

            safeText
        }
    }


    /**
     * Masks sender information in normal card view.
     *
     * Example:
     * +919876543210 becomes *********3210
     */
    fun maskSender(
        sender: String?
    ): String? {

        if (sender.isNullOrBlank()) {
            return null
        }


        val cleanSender =
            sender.trim()


        if (cleanSender.length <= 4) {
            return "****"
        }


        val visibleEnding =
            cleanSender.takeLast(4)


        val maskLength =
            (cleanSender.length - 4)
                .coerceAtMost(10)
                .coerceAtLeast(4)


        return "*".repeat(maskLength) +
                visibleEnding
    }


    /**
     * Returns only SUSPICIOUS or HIGH.
     * LOW results return null and are not saved.
     */
    private fun normalizeRiskLevel(
        riskLevel: String
    ): String? {

        return when (
            riskLevel
                .trim()
                .uppercase(Locale.ROOT)
        ) {

            ThreatDatabaseHelper.RISK_HIGH ->
                ThreatDatabaseHelper.RISK_HIGH

            ThreatDatabaseHelper.RISK_SUSPICIOUS ->
                ThreatDatabaseHelper.RISK_SUSPICIOUS

            else ->
                null
        }
    }


    private fun reasonsToJson(
        reasons: List<String>
    ): String {

        val jsonArray =
            JSONArray()


        reasons
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .distinct()
            .forEach { reason ->

                jsonArray.put(reason)
            }


        return jsonArray.toString()
    }


    private fun calculateExpiryTime(
        currentTime: Long
    ): Long {

        return currentTime +
                DEFAULT_RETENTION_DAYS *
                ONE_DAY_MILLIS
    }


    private fun normalizeForFingerprint(
        text: String
    ): String {

        return text
            .lowercase(Locale.ROOT)
            .replace(
                Regex("https?://\\S+"),
                "[link]"
            )
            .replace(
                Regex("\\d+"),
                "#"
            )
            .replace(
                Regex("[^a-z0-9#\\p{L}]+"),
                " "
            )
            .replace(
                Regex("\\s+"),
                " "
            )
            .trim()
    }


    private fun createFingerprint(
        parts: List<String>
    ): String {

        val source =
            parts.joinToString(
                separator = "|"
            )


        val digest =
            MessageDigest
                .getInstance("SHA-256")
                .digest(
                    source.toByteArray(
                        Charsets.UTF_8
                    )
                )


        return digest.joinToString(
            separator = ""
        ) { byte ->

            "%02x".format(
                byte.toInt() and 0xff
            )
        }
    }
}