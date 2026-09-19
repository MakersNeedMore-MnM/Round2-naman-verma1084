package com.dsafiles.kavach

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import android.provider.Settings
import android.telephony.SmsManager
import android.webkit.WebView
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors

class ApkController(
    private val activity: Activity,
    private val webView: WebView
) {

    companion object {

        const val APK_PICKER_REQUEST_CODE =
            701

        private const val PREFS_NAME =
            "kavach_preferences"

        private const val KEY_CONTACT_PHONE =
            "trusted_contact_phone"

        private const val KEY_SETUP_COMPLETE =
            "setup_complete"

        private const val KEY_LANGUAGE =
            "selected_language"

        private const val APK_MIME_TYPE =
            "application/vnd.android.package-archive"
    }

    private val executor =
        Executors.newSingleThreadExecutor()

    private var selectedApkFile: File? = null
    private var originalApkUri: Uri? = null

    private var pendingSelectionJson =
        JSONObject().toString()

    private var latestRiskLevel =
        ""

    /*
     * ID of the latest APK record saved in
     * Report Scam history.
     */
    private var latestThreatRecordId: Long? =
        null


    /*
     * Check whether Kavach was opened through
     * Share APK or Open with Kavach.
     */
    fun hasIncomingApk(
        intent: Intent?
    ): Boolean {

        if (intent == null) {
            return false
        }

        return extractApkUri(
            intent
        ) != null
    }


    /*
     * Process an APK shared/opened with Kavach.
     */
    fun handleIncomingIntent(
        intent: Intent?
    ) {

        if (intent == null) {
            return
        }

        val apkUri =
            extractApkUri(intent)
                ?: return

        prepareApkFromUri(
            uri = apkUri,
            sourceEnglish =
                "Shared or opened with Kavach",
            sourceHindi =
                "कवच के साथ साझा या खोला गया"
        )
    }


    /*
     * Open Android's file picker.
     */
    fun pickApkFile() {

        val pickerIntent =
            Intent(
                Intent.ACTION_OPEN_DOCUMENT
            ).apply {

                addCategory(
                    Intent.CATEGORY_OPENABLE
                )

                type = APK_MIME_TYPE

                putExtra(
                    Intent.EXTRA_MIME_TYPES,
                    arrayOf(
                        APK_MIME_TYPE,
                        "application/octet-stream"
                    )
                )
            }

        activity.startActivityForResult(
            pickerIntent,
            APK_PICKER_REQUEST_CODE
        )
    }


    /*
     * Receive the selected file from Android picker.
     */
    fun handleActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {

        if (
            requestCode !=
            APK_PICKER_REQUEST_CODE
        ) {
            return
        }

        if (
            resultCode !=
            Activity.RESULT_OK
        ) {
            sendSelectionError(
                "No APK was selected."
            )

            return
        }

        val selectedUri =
            data?.data

        if (selectedUri == null) {

            sendSelectionError(
                "Android did not return the selected APK."
            )

            return
        }

        try {

            activity.contentResolver
                .takePersistableUriPermission(
                    selectedUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or
                            Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

        } catch (_: Exception) {

            /*
             * Some providers give only temporary access.
             * APK analysis can still continue.
             */
        }

        prepareApkFromUri(
            uri = selectedUri,
            sourceEnglish =
                "Selected from Downloads",
            sourceHindi =
                "डाउनलोड से चुना गया"
        )
    }


    /*
     * Return current selected-file information to apk.js.
     */
    fun getPendingSelection(): String {

        return pendingSelectionJson
    }


    /*
     * Analyse the selected APK in a background thread.
     */
    fun analyseSelectedApk() {

        val apkFile =
            selectedApkFile

        if (
            apkFile == null ||
            !apkFile.exists()
        ) {

            sendAnalysisError(
                "Select an APK before starting the analysis."
            )

            return
        }

        executor.execute {

            try {

                val result =
                    ApkRiskAnalyzer.analyse(
                        context = activity,
                        apkFile = apkFile
                    )

                latestRiskLevel =
                    result.level

                /*
                 * Save only SUSPICIOUS and HIGH results
                 * in Report Scam history.
                 */
                latestThreatRecordId =
                    saveApkToThreatHistory(
                        result = result,
                        analysedFile = apkFile
                    )

                /*
                 * HIGH only:
                 * Send safe trusted-contact alert.
                 */
                val trustedContactAlerted =
                    if (
                        result.level == "HIGH"
                    ) {
                        sendTrustedContactAlert(
                            result
                        )
                    } else {
                        false
                    }

                val resultJson =
                    result.toJson(
                        trustedContactAlerted
                    )

                callJavaScript(
                    """
                    if (
                        typeof window.onApkAnalysisComplete
                        === "function"
                    ) {
                        window.onApkAnalysisComplete(
                            $resultJson
                        );
                    }
                    """.trimIndent()
                )

            } catch (
                exception: Exception
            ) {

                sendAnalysisError(
                    exception.localizedMessage
                        ?: "The APK could not be analysed."
                )
            }
        }
    }


    /*
     * Save APK analysis metadata in Report Scam.
     *
     * The APK binary is not saved in the database.
     */
    private fun saveApkToThreatHistory(
        result: ApkRiskResult,
        analysedFile: File
    ): Long? {

        if (
            result.level != "SUSPICIOUS" &&
            result.level != "HIGH"
        ) {
            return null
        }

        return try {

            /*
             * Reuse the JSON already generated by the
             * analyzer so this controller does not depend
             * on every ApkRiskResult property.
             */
            val resultObject =
                JSONObject(
                    result.toJson(false)
                )

            val preferences =
                activity.getSharedPreferences(
                    PREFS_NAME,
                    Context.MODE_PRIVATE
                )

            val selectedLanguage =
                preferences.getString(
                    KEY_LANGUAGE,
                    "en"
                ) ?: "en"

            val reasonsKey =
                if (selectedLanguage == "hi") {
                    "reasonsHindi"
                } else {
                    "reasonsEnglish"
                }

            val actionKey =
                if (selectedLanguage == "hi") {
                    "actionHindi"
                } else {
                    "actionEnglish"
                }

            val reasonsArray =
                resultObject.optJSONArray(
                    reasonsKey
                )

            val reasons =
                mutableListOf<String>()

            if (reasonsArray != null) {

                for (
                index in 0
                        until reasonsArray.length()
                ) {

                    val reason =
                        reasonsArray.optString(
                            index
                        ).trim()

                    if (reason.isNotBlank()) {
                        reasons.add(reason)
                    }
                }
            }

            /*
             * Try alternative JSON field names to remain
             * compatible with the existing analyzer.
             */
            val hash =
                firstNonBlank(
                    resultObject.optString(
                        "sha256"
                    ),
                    resultObject.optString(
                        "sha256Hash"
                    ),
                    resultObject.optString(
                        "fileHash"
                    ),
                    resultObject.optString(
                        "hash"
                    )
                )

            val appName =
                firstNonBlank(
                    resultObject.optString(
                        "appName"
                    ),
                    result.appName
                )

            val packageName =
                firstNonBlank(
                    resultObject.optString(
                        "packageName"
                    ),
                    result.packageName
                )

            val fileName =
                firstNonBlank(
                    resultObject.optString(
                        "fileName"
                    ),
                    analysedFile.name
                )

            val targetSdk =
                readOptionalInteger(
                    resultObject,
                    "targetSdk",
                    "targetSdkVersion",
                    "targetAndroid"
                )

            val recommendedAction =
                firstNonBlank(
                    resultObject.optString(
                        actionKey
                    ),
                    resultObject.optString(
                        "recommendedAction"
                    ),
                    if (result.level == "HIGH") {

                        if (selectedLanguage == "hi") {
                            "इस एपीके को इंस्टॉल न करें और इसे हटा दें।"
                        } else {
                            "Do not install this APK and delete it."
                        }

                    } else {

                        if (selectedLanguage == "hi") {
                            "इंस्टॉल करने से पहले ऐप और उसके स्रोत की सावधानी से जांच करें।"
                        } else {
                            "Check the app and its source carefully before installing."
                        }
                    }
                )

            ThreatHistoryManager(
                activity.applicationContext
            ).saveApkThreat(
                apkName = appName,
                apkFileName = fileName,
                packageName = packageName,
                sha256 = hash,
                targetSdk = targetSdk,
                riskLevel = result.level,
                reasons = reasons,
                recommendedAction =
                        recommendedAction
                            ?: if (selectedLanguage == "hi") {
                                "इंस्टॉल करने से पहले ऐप और उसके स्रोत की सावधानी से जांच करें।"
                            } else {
                                "Check the app and its source carefully before installing."
                            },
                apkDeleted = false
            )

        } catch (_: Exception) {

            /*
             * Report-history failure must not stop
             * the APK result from being displayed.
             */
            null
        }
    }


    /*
     * Delete the selected APK where Android allows it.
     */
    fun deleteSelectedApk() {

        executor.execute {

            var originalDeleted = false

            val uri =
                originalApkUri

            if (uri != null) {

                try {

                    originalDeleted =
                        DocumentsContract
                            .deleteDocument(
                                activity.contentResolver,
                                uri
                            )

                } catch (_: Exception) {

                    originalDeleted = false
                }
            }

            val cacheFile =
                selectedApkFile

            val cacheDeleted =
                if (
                    cacheFile != null &&
                    cacheFile.exists()
                ) {
                    cacheFile.delete()
                } else {
                    true
                }

            /*
             * Mark the history record as deleted only
             * when the original downloaded APK was
             * successfully deleted.
             */
            val recordId =
                latestThreatRecordId

            if (recordId != null) {

                try {

                    ThreatDatabaseHelper(
                        activity.applicationContext
                    ).markApkDeleted(
                        recordId = recordId,
                        deleted = originalDeleted
                    )

                } catch (_: Exception) {

                    /*
                     * Do not interrupt APK deletion.
                     */
                }
            }

            selectedApkFile = null
            originalApkUri = null
            latestRiskLevel = ""
            latestThreatRecordId = null

            pendingSelectionJson =
                JSONObject().toString()

            val message =
                if (originalDeleted) {

                    "The APK was deleted."

                } else {

                    "Kavach removed its copy. If the original remains, delete it from Downloads."
                }

            callJavaScript(
                """
                if (
                    typeof window.onApkDeleteResult
                    === "function"
                ) {
                    window.onApkDeleteResult(
                        ${cacheDeleted.toString()},
                        ${JSONObject.quote(message)}
                    );
                }
                """.trimIndent()
            )
        }
    }


    /*
     * Remove only Kavach's temporary copy.
     *
     * This does not delete the saved report metadata.
     */
    fun clearSelectedApk() {

        selectedApkFile
            ?.takeIf {
                it.exists()
            }
            ?.delete()

        selectedApkFile = null
        originalApkUri = null
        latestRiskLevel = ""
        latestThreatRecordId = null

        pendingSelectionJson =
            JSONObject().toString()
    }


    /*
     * Continue to Android Package Installer.
     *
     * HIGH-risk APK files are blocked here.
     */
    fun continueInstallation() {

        val apkFile =
            selectedApkFile

        if (
            apkFile == null ||
            !apkFile.exists()
        ) {

            sendAnalysisError(
                "The selected APK is no longer available."
            )

            return
        }

        if (latestRiskLevel == "HIGH") {

            sendAnalysisError(
                "Kavach blocked installation because this APK is high risk."
            )

            return
        }

        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.O &&
            !activity.packageManager
                .canRequestPackageInstalls()
        ) {

            val settingsIntent =
                Intent(
                    Settings
                        .ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse(
                        "package:${activity.packageName}"
                    )
                )

            activity.startActivity(
                settingsIntent
            )

            sendAnalysisError(
                "Allow installation from Kavach, then press Continue again."
            )

            return
        }

        val installationUri =
            FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                apkFile
            )

        val installerIntent =
            Intent(
                Intent.ACTION_VIEW
            ).apply {

                setDataAndType(
                    installationUri,
                    APK_MIME_TYPE
                )

                addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                )

                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK
                )
            }

        try {

            activity.startActivity(
                installerIntent
            )

        } catch (_: Exception) {

            sendAnalysisError(
                "Android Package Installer could not open this APK."
            )
        }
    }


    /*
     * Copy an APK URI into Kavach's private cache.
     */
    private fun prepareApkFromUri(
        uri: Uri,
        sourceEnglish: String,
        sourceHindi: String
    ) {

        executor.execute {

            try {

                val fileName =
                    getDisplayName(uri)
                        .ifBlank {
                            "shared-application.apk"
                        }

                val safeFileName =
                    createSafeFileName(
                        fileName
                    )

                if (
                    !safeFileName
                        .lowercase()
                        .endsWith(".apk")
                ) {
                    throw IllegalArgumentException(
                        "The selected file is not an APK."
                    )
                }

                val cacheDirectory =
                    File(
                        activity.cacheDir,
                        "apk_checks"
                    )

                if (!cacheDirectory.exists()) {
                    cacheDirectory.mkdirs()
                }

                selectedApkFile
                    ?.takeIf {
                        it.exists()
                    }
                    ?.delete()

                val destinationFile =
                    File(
                        cacheDirectory,
                        safeFileName
                    )

                activity.contentResolver
                    .openInputStream(uri)
                    ?.use { inputStream ->

                        FileOutputStream(
                            destinationFile
                        ).use { outputStream ->

                            inputStream.copyTo(
                                outputStream
                            )
                        }

                    } ?: throw IllegalArgumentException(
                    "Android could not read the selected APK."
                )

                if (
                    !destinationFile.exists() ||
                    destinationFile.length() == 0L
                ) {
                    throw IllegalArgumentException(
                        "The selected APK is empty or unreadable."
                    )
                }

                val maximumSize =
                    250L * 1024L * 1024L

                if (
                    destinationFile.length() >
                    maximumSize
                ) {

                    destinationFile.delete()

                    throw IllegalArgumentException(
                        "The APK is too large for this prototype."
                    )
                }

                selectedApkFile =
                    destinationFile

                originalApkUri =
                    uri

                latestRiskLevel =
                    ""

                latestThreatRecordId =
                    null

                val selectedLanguage =
                    activity
                        .getSharedPreferences(
                            PREFS_NAME,
                            Context.MODE_PRIVATE
                        )
                        .getString(
                            KEY_LANGUAGE,
                            "en"
                        ) ?: "en"

                val source =
                    if (
                        selectedLanguage == "hi"
                    ) {
                        sourceHindi
                    } else {
                        sourceEnglish
                    }

                val selectionJson =
                    JSONObject()
                        .put(
                            "name",
                            destinationFile.name
                        )
                        .put(
                            "size",
                            destinationFile.length()
                        )
                        .put(
                            "sizeText",
                            formatFileSize(
                                destinationFile.length()
                            )
                        )
                        .put(
                            "source",
                            source
                        )

                pendingSelectionJson =
                    selectionJson.toString()

                callJavaScript(
                    """
                    if (
                        typeof window.onApkSelected
                        === "function"
                    ) {
                        window.onApkSelected(
                            $pendingSelectionJson
                        );
                    }
                    """.trimIndent()
                )

            } catch (
                exception: Exception
            ) {

                sendSelectionError(
                    exception.localizedMessage
                        ?: "The APK could not be selected."
                )
            }
        }
    }


    /*
     * Extract APK URI from ACTION_SEND or ACTION_VIEW.
     */
    private fun extractApkUri(
        intent: Intent
    ): Uri? {

        return when (
            intent.action
        ) {

            Intent.ACTION_VIEW ->
                intent.data

            Intent.ACTION_SEND -> {

                if (
                    Build.VERSION.SDK_INT >=
                    Build.VERSION_CODES.TIRAMISU
                ) {

                    intent.getParcelableExtra(
                        Intent.EXTRA_STREAM,
                        Uri::class.java
                    )

                } else {

                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(
                        Intent.EXTRA_STREAM
                    )
                }
            }

            else ->
                null
        }
    }


    /*
     * Read original file name.
     */
    private fun getDisplayName(
        uri: Uri
    ): String {

        if (
            uri.scheme ==
            "file"
        ) {
            return uri.lastPathSegment
                ?: "shared-application.apk"
        }

        var result =
            "shared-application.apk"

        try {

            activity.contentResolver
                .query(
                    uri,
                    arrayOf(
                        OpenableColumns.DISPLAY_NAME
                    ),
                    null,
                    null,
                    null
                )
                ?.use { cursor ->

                    if (cursor.moveToFirst()) {

                        val columnIndex =
                            cursor.getColumnIndex(
                                OpenableColumns
                                    .DISPLAY_NAME
                            )

                        if (columnIndex >= 0) {

                            result =
                                cursor.getString(
                                    columnIndex
                                ) ?: result
                        }
                    }
                }

        } catch (_: Exception) {

            /*
             * Use fallback filename.
             */
        }

        return result
    }


    /*
     * Remove unsafe filename characters.
     */
    private fun createSafeFileName(
        originalName: String
    ): String {

        return originalName
            .replace(
                Regex(
                    "[^A-Za-z0-9._-]"
                ),
                "_"
            )
            .take(100)
            .ifBlank {
                "shared-application.apk"
            }
    }


    private fun formatFileSize(
        bytes: Long
    ): String {

        return when {

            bytes < 1024L ->
                "$bytes B"

            bytes <
                    1024L * 1024L ->

                String.format(
                    "%.1f KB",
                    bytes / 1024.0
                )

            else ->

                String.format(
                    "%.1f MB",
                    bytes /
                            (
                                    1024.0 *
                                            1024.0
                                    )
                )
        }
    }


    /*
     * Send a HIGH-risk APK alert to the saved
     * trusted contact.
     */
    private fun sendTrustedContactAlert(
        result: ApkRiskResult
    ): Boolean {

        if (
            activity.checkSelfPermission(
                Manifest.permission.SEND_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return false
        }

        val preferences =
            activity.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

        if (
            !preferences.getBoolean(
                KEY_SETUP_COMPLETE,
                false
            )
        ) {
            return false
        }

        val trustedContactPhone =
            preferences.getString(
                KEY_CONTACT_PHONE,
                ""
            ) ?: ""

        if (trustedContactPhone.isBlank()) {
            return false
        }

        val language =
            preferences.getString(
                KEY_LANGUAGE,
                "en"
            ) ?: "en"

        val alertText =
            if (language == "hi") {

                """
                कवच सुरक्षा अलर्ट
                
                उपयोगकर्ता ने एक बहुत जोखिम वाला एपीके जांचा है।
                
                ऐप: ${result.appName}
                पैकेज: ${result.packageName}
                
                कृपया उपयोगकर्ता से संपर्क करें और उन्हें यह एपीके इंस्टॉल न करने के लिए कहें।
                """.trimIndent()

            } else {

                """
                Kavach Safety Alert
                
                The user checked a high-risk APK.
                
                App: ${result.appName}
                Package: ${result.packageName}
                
                Please contact the user and ask them not to install this APK.
                """.trimIndent()
            }

        return try {

            @Suppress("DEPRECATION")
            val smsManager =
                SmsManager.getDefault()

            val messageParts =
                smsManager.divideMessage(
                    alertText
                )

            smsManager.sendMultipartTextMessage(
                trustedContactPhone,
                null,
                messageParts,
                null,
                null
            )

            true

        } catch (_: Exception) {

            false
        }
    }


    /*
     * Return the first non-empty JSON/string value.
     */
    private fun firstNonBlank(
        vararg values: String?
    ): String? {

        values.forEach { value ->

            val cleaned =
                value
                    ?.trim()
                    ?.takeIf {
                        it.isNotBlank() &&
                                !it.equals(
                                    "null",
                                    ignoreCase = true
                                )
                    }

            if (cleaned != null) {
                return cleaned
            }
        }

        return null
    }


    /*
     * Read an integer using any compatible JSON key.
     */
    private fun readOptionalInteger(
        jsonObject: JSONObject,
        vararg keys: String
    ): Int? {

        keys.forEach { key ->

            if (
                jsonObject.has(key) &&
                !jsonObject.isNull(key)
            ) {

                val value =
                    jsonObject.optInt(
                        key,
                        -1
                    )

                if (value >= 0) {
                    return value
                }
            }
        }

        return null
    }


    private fun sendSelectionError(
        message: String
    ) {

        callJavaScript(
            """
            if (
                typeof window.onApkSelectionError
                === "function"
            ) {
                window.onApkSelectionError(
                    ${JSONObject.quote(message)}
                );
            }
            """.trimIndent()
        )
    }


    private fun sendAnalysisError(
        message: String
    ) {

        callJavaScript(
            """
            if (
                typeof window.onApkAnalysisError
                === "function"
            ) {
                window.onApkAnalysisError(
                    ${JSONObject.quote(message)}
                );
            }
            """.trimIndent()
        )
    }


    private fun callJavaScript(
        javascript: String
    ) {

        webView.post {

            webView.evaluateJavascript(
                javascript,
                null
            )
        }
    }


    fun shutdown() {

        executor.shutdownNow()
    }
}