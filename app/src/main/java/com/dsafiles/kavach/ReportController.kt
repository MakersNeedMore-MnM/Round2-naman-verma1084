package com.dsafiles.kavach

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject

class ReportController(
    private val activity: Activity
) {

    private val database =
        ThreatDatabaseHelper(
            activity.applicationContext
        )

    private val historyManager =
        ThreatHistoryManager(
            activity.applicationContext
        )


    /*
     * Return all records or apply type/status filters.
     *
     * Type:
     * ALL, SMS, WHATSAPP or APK
     *
     * Status:
     * ALL, PENDING, PREPARED, REPORTED or DISMISSED
     */
    @JavascriptInterface
    fun getThreatRecords(
        threatType: String,
        reportStatus: String
    ): String {

        return try {

            val records =
                database.getFilteredThreats(
                    threatType = threatType,
                    reportStatus = reportStatus
                )

            val recordsArray =
                JSONArray()

            records.forEach { record ->

                recordsArray.put(
                    recordToJson(record)
                )
            }

            JSONObject().apply {

                put(
                    "success",
                    true
                )

                put(
                    "pendingCount",
                    database.getPendingCount()
                )

                put(
                    "totalCount",
                    database.getTotalCount()
                )

                put(
                    "records",
                    recordsArray
                )
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to read threat history."
            )
        }
    }


    /*
     * Return one selected record.
     */
    @JavascriptInterface
    fun getThreatRecord(
        recordId: Long
    ): String {

        return try {

            val record =
                database.getThreatById(
                    recordId
                )

            if (record == null) {

                errorResponse(
                    "Threat record was not found."
                )

            } else {

                JSONObject().apply {

                    put(
                        "success",
                        true
                    )

                    put(
                        "record",
                        recordToJson(record)
                    )
                }.toString()
            }

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to read the threat record."
            )
        }
    }


    /*
     * Pin or unpin a record.
     */
    @JavascriptInterface
    fun setRecordPinned(
        recordId: Long,
        pinned: Boolean
    ): String {

        return try {

            val updated =
                database.setRecordPinned(
                    recordId,
                    pinned
                )

            JSONObject().apply {

                put(
                    "success",
                    updated
                )

                put(
                    "pinned",
                    pinned
                )
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to update the record."
            )
        }
    }


    /*
     * Change status to:
     * PENDING, PREPARED, REPORTED or DISMISSED.
     */
    @JavascriptInterface
    fun updateReportStatus(
        recordId: Long,
        newStatus: String
    ): String {

        return try {

            val updated =
                database.updateReportStatus(
                    recordId,
                    newStatus
                )

            JSONObject().apply {

                put(
                    "success",
                    updated
                )

                put(
                    "status",
                    newStatus
                )
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to update report status."
            )
        }
    }


    /*
     * Permanently delete one threat record.
     */
    @JavascriptInterface
    fun deleteThreatRecord(
        recordId: Long
    ): String {

        return try {

            val deleted =
                database.deleteThreat(
                    recordId
                )

            JSONObject().apply {

                put(
                    "success",
                    deleted
                )
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to delete the record."
            )
        }
    }


    /*
     * Remove all expired unpinned records.
     */
    @JavascriptInterface
    fun removeExpiredRecords(): String {

        return try {

            val deletedCount =
                database.removeExpiredRecords()

            JSONObject().apply {

                put(
                    "success",
                    true
                )

                put(
                    "deletedCount",
                    deletedCount
                )
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to clean threat history."
            )
        }
    }


    /*
     * Save a suspicious or high-risk WhatsApp
     * message in Report Scam history.
     *
     * LOW results are ignored by ThreatHistoryManager.
     */
    @JavascriptInterface
    fun saveWhatsAppThreat(
        message: String,
        riskLevel: String,
        reasonsJson: String,
        recommendedAction: String
    ): String {

        return try {

            val reasonsArray =
                JSONArray(
                    reasonsJson
                )

            val reasons =
                mutableListOf<String>()

            for (
            index in 0
                    until reasonsArray.length()
            ) {

                val reason =
                    reasonsArray
                        .optString(index)
                        .trim()

                if (reason.isNotBlank()) {
                    reasons.add(reason)
                }
            }

            val recordId =
                historyManager.saveWhatsAppThreat(
                    message = message,
                    riskLevel = riskLevel,
                    reasons = reasons,
                    recommendedAction =
                        recommendedAction
                )

            JSONObject().apply {

                put(
                    "success",
                    recordId != null
                )

                if (recordId != null) {

                    put(
                        "recordId",
                        recordId
                    )
                }

                if (recordId == null) {

                    put(
                        "ignored",
                        riskLevel == "LOW"
                    )
                }
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to save WhatsApp threat."
            )
        }
    }


    /*
     * Copy the user-reviewed report summary.
     */
    @JavascriptInterface
    fun copyReportSummary(
        summary: String
    ): Boolean {

        if (summary.isBlank()) {
            return false
        }

        return try {

            val clipboardManager =
                activity.getSystemService(
                    Context.CLIPBOARD_SERVICE
                ) as ClipboardManager

            val clipData =
                ClipData.newPlainText(
                    "Kavach incident summary",
                    summary
                )

            clipboardManager.setPrimaryClip(
                clipData
            )

            activity.runOnUiThread {

                Toast.makeText(
                    activity,
                    "Report summary copied",
                    Toast.LENGTH_SHORT
                ).show()
            }

            true

        } catch (_: Exception) {

            false
        }
    }


    /*
     * Open Android's dial screen with 1930.
     *
     * Kavach does not place the call automatically.
     */
    @JavascriptInterface
    fun dial1930(): Boolean {

        return openIntent(
            Intent(
                Intent.ACTION_DIAL,
                Uri.parse("tel:1930")
            )
        )
    }


    /*
     * Open India's official Cyber Crime Portal.
     */
    @JavascriptInterface
    fun openCyberCrimePortal(): Boolean {

        return openWebPage(
            "https://www.cybercrime.gov.in/"
        )
    }


    /*
     * Open the Sanchar Saathi website for Chakshu.
     */
    @JavascriptInterface
    fun openChakshuPortal(): Boolean {

        return openWebPage(
            "https://sancharsaathi.gov.in/"
        )
    }


    /*
     * Safe temporary test method.
     *
     * It creates one fictional SMS record for testing.
     * Remove this method before producing the final release.
     */
    @JavascriptInterface
    fun addDemoThreatRecord(): String {

        return try {

            val recordId =
                historyManager.saveSmsThreat(
                    sender = "+919876543210",
                    message =
                        "Your bank account will be blocked. " +
                                "Verify immediately at " +
                                "https://example.invalid/verify. " +
                                "Your OTP is 527194.",
                    riskLevel =
                        ThreatDatabaseHelper.RISK_HIGH,
                    reasons =
                        listOf(
                            "Urgent account threat",
                            "Unknown link detected",
                            "Request to verify account details"
                        ),
                    recommendedAction =
                        "Do not open the link or share personal information."
                )

            JSONObject().apply {

                put(
                    "success",
                    recordId != null
                )

                if (recordId != null) {

                    put(
                        "recordId",
                        recordId
                    )
                }
            }.toString()

        } catch (exception: Exception) {

            errorResponse(
                exception.message
                    ?: "Unable to create demo record."
            )
        }
    }


    /*
     * Convert one ThreatRecord into JSON for report.js.
     */
    private fun recordToJson(
        record: ThreatRecord
    ): JSONObject {

        val reasons =
            try {

                JSONArray(
                    record.reasonsJson
                )

            } catch (_: Exception) {

                JSONArray()
            }

        return JSONObject().apply {

            put(
                "id",
                record.id
            )

            put(
                "threatType",
                record.threatType
            )

            put(
                "riskLevel",
                record.riskLevel
            )

            put(
                "detectedAt",
                record.detectedAt
            )

            put(
                "lastDetectedAt",
                record.lastDetectedAt
            )

            put(
                "repeatCount",
                record.repeatCount
            )

            put(
                "title",
                record.title
            )

            putNullable(
                "senderAddress",
                record.senderAddress
            )

            putNullable(
                "maskedSender",
                record.maskedSender
            )

            put(
                "safeContent",
                record.safeContent
            )

            put(
                "reasons",
                reasons
            )

            put(
                "recommendedAction",
                record.recommendedAction
            )

            putNullable(
                "apkName",
                record.apkName
            )

            putNullable(
                "apkFileName",
                record.apkFileName
            )

            putNullable(
                "packageName",
                record.packageName
            )

            putNullable(
                "apkSha256",
                record.apkSha256
            )

            if (record.targetSdk == null) {

                put(
                    "targetSdk",
                    JSONObject.NULL
                )

            } else {

                put(
                    "targetSdk",
                    record.targetSdk
                )
            }

            put(
                "apkDeleted",
                record.apkDeleted
            )

            put(
                "reportStatus",
                record.reportStatus
            )

            put(
                "isPinned",
                record.isPinned
            )

            put(
                "expiresAt",
                record.expiresAt
            )
        }
    }


    /*
     * Add a nullable String safely to JSONObject.
     */
    private fun JSONObject.putNullable(
        key: String,
        value: String?
    ) {

        if (value == null) {

            put(
                key,
                JSONObject.NULL
            )

        } else {

            put(
                key,
                value
            )
        }
    }


    /*
     * Open an external web page.
     */
    private fun openWebPage(
        url: String
    ): Boolean {

        return openIntent(
            Intent(
                Intent.ACTION_VIEW,
                Uri.parse(url)
            )
        )
    }


    /*
     * Start an Android intent safely.
     */
    private fun openIntent(
        intent: Intent
    ): Boolean {

        return try {

            activity.runOnUiThread {

                try {

                    activity.startActivity(
                        intent
                    )

                } catch (_: Exception) {

                    Toast.makeText(
                        activity,
                        "Unable to open this service.",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            true

        } catch (_: Exception) {

            false
        }
    }


    /*
     * Return a standard JSON error response.
     */
    private fun errorResponse(
        message: String
    ): String {

        return JSONObject().apply {

            put(
                "success",
                false
            )

            put(
                "message",
                message
            )
        }.toString()
    }
}