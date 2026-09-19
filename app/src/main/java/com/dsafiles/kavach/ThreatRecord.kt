package com.dsafiles.kavach


data class ThreatRecord(

    val id: Long = 0L,

    /*
     * SMS, WHATSAPP or APK
     */
    val threatType: String,

    /*
     * SUSPICIOUS or HIGH
     */
    val riskLevel: String,

    /*
     * Time when the threat was first detected.
     */
    val detectedAt: Long,

    /*
     * Time when the same threat was most recently detected.
     */
    val lastDetectedAt: Long,

    /*
     * Similar threats are grouped instead of creating
     * multiple identical records.
     */
    val repeatCount: Int = 1,

    /*
     * Short heading displayed on the Report Scam card.
     */
    val title: String,

    /*
     * Original sender is stored only inside the app's
     * private local database.
     */
    val senderAddress: String? = null,

    /*
     * Masked sender shown in the normal user interface.
     */
    val maskedSender: String? = null,

    /*
     * Safe preview after removing OTPs, PINs,
     * passwords and other sensitive information.
     */
    val safeContent: String,

    /*
     * Reasons stored as a JSON array string.
     */
    val reasonsJson: String,

    /*
     * Recommended safety action.
     */
    val recommendedAction: String,

    /*
     * APK-specific information.
     * These values remain null for SMS and WhatsApp records.
     */
    val apkName: String? = null,
    val apkFileName: String? = null,
    val packageName: String? = null,
    val apkSha256: String? = null,
    val targetSdk: Int? = null,
    val apkDeleted: Boolean = false,

    /*
     * PENDING, PREPARED, REPORTED or DISMISSED
     */
    val reportStatus: String = "PENDING",

    /*
     * Pinned records are not automatically deleted.
     */
    val isPinned: Boolean = false,

    /*
     * Automatic deletion time.
     */
    val expiresAt: Long,

    /*
     * Used to identify and group duplicate threats.
     */
    val fingerprint: String
)