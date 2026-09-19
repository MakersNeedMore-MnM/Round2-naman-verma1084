package com.dsafiles.kavach

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Telephony
import android.telephony.SmsManager
import org.json.JSONArray

class SmsReceiver : BroadcastReceiver() {

    companion object {

        private const val PREFS_NAME =
            "kavach_preferences"

        private const val CHANNEL_ID =
            "kavach_sms_risk_alerts"

        private const val KEY_CONTACT_PHONE =
            "trusted_contact_phone"

        private const val KEY_SETUP_COMPLETE =
            "setup_complete"

        private const val KEY_LANGUAGE =
            "selected_language"

        private const val KEY_SMS_SENDER =
            "latest_sms_sender"

        private const val KEY_SMS_BODY =
            "latest_sms_body"

        private const val KEY_SMS_LEVEL =
            "latest_sms_level"

        private const val KEY_SMS_SCORE =
            "latest_sms_score"

        private const val KEY_SMS_SUMMARY_ENGLISH =
            "latest_sms_summary_english"

        private const val KEY_SMS_SUMMARY_HINDI =
            "latest_sms_summary_hindi"

        private const val KEY_SMS_ACTION_ENGLISH =
            "latest_sms_action_english"

        private const val KEY_SMS_ACTION_HINDI =
            "latest_sms_action_hindi"

        private const val KEY_SMS_VOICE_ENGLISH =
            "latest_sms_voice_english"

        private const val KEY_SMS_VOICE_HINDI =
            "latest_sms_voice_hindi"

        private const val KEY_SMS_REASONS_ENGLISH =
            "latest_sms_reasons_english"

        private const val KEY_SMS_REASONS_HINDI =
            "latest_sms_reasons_hindi"

        private const val KEY_SMS_TIME =
            "latest_sms_time"

        private const val KEY_SMS_PENDING =
            "latest_sms_pending"
    }

    override fun onReceive(
        context: Context,
        intent: Intent
    ) {

        if (
            intent.action !=
            Telephony.Sms.Intents.SMS_RECEIVED_ACTION
        ) {
            return
        }

        val receivedMessages =
            Telephony.Sms.Intents
                .getMessagesFromIntent(intent)

        if (receivedMessages.isEmpty()) {
            return
        }

        /*
         * Combine all parts of a multipart SMS.
         */
        val sender =
            receivedMessages
                .firstOrNull()
                ?.displayOriginatingAddress
                ?: "Unknown sender"

        val messageBody =
            receivedMessages
                .joinToString(
                    separator = ""
                ) { smsMessage ->

                    smsMessage.messageBody
                        ?: ""
                }
                .trim()

        if (messageBody.isBlank()) {
            return
        }

        /*
         * Run the existing offline SMS analysis.
         */
        val result =
            SmsRiskAnalyzer.analyse(
                messageBody
            )

        /*
         * Save the latest result for sms.html.
         *
         * This preserves the existing SMS result screen.
         */
        saveSmsResult(
            context = context,
            sender = sender,
            messageBody = messageBody,
            result = result
        )

        /*
         * LOW:
         *
         * Do not create a Report Scam history record.
         * Do not show a notification.
         * Do not alert the trusted contact.
         */
        if (result.level == "LOW") {
            return
        }

        /*
         * SUSPICIOUS or HIGH:
         *
         * Save a privacy-protected record in the local
         * Report Scam threat history.
         */
        saveSmsToThreatHistory(
            context = context,
            sender = sender,
            messageBody = messageBody,
            result = result
        )

        /*
         * SUSPICIOUS or HIGH:
         *
         * Show Kavach's warning notification.
         */
        showRiskNotification(
            context = context,
            sender = sender,
            result = result
        )

        /*
         * HIGH only:
         *
         * Immediately send a safe alert to the
         * saved trusted contact.
         */
        if (result.level == "HIGH") {

            sendTrustedContactAlert(
                context = context,
                sender = sender,
                result = result
            )
        }
    }

    /*
     * Save the latest SMS result in SharedPreferences.
     *
     * This information is used by sms.html.
     */
    private fun saveSmsResult(
        context: Context,
        sender: String,
        messageBody: String,
        result: SmsRiskResult
    ) {

        val reasonsEnglishJson =
            JSONArray(
                result.reasonsEnglish
            ).toString()

        val reasonsHindiJson =
            JSONArray(
                result.reasonsHindi
            ).toString()

        context
            .getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )
            .edit()
            .putString(
                KEY_SMS_SENDER,
                sender
            )
            .putString(
                KEY_SMS_BODY,
                messageBody
            )
            .putString(
                KEY_SMS_LEVEL,
                result.level
            )
            .putInt(
                KEY_SMS_SCORE,
                result.score
            )
            .putString(
                KEY_SMS_SUMMARY_ENGLISH,
                result.summaryEnglish
            )
            .putString(
                KEY_SMS_SUMMARY_HINDI,
                result.summaryHindi
            )
            .putString(
                KEY_SMS_ACTION_ENGLISH,
                result.actionEnglish
            )
            .putString(
                KEY_SMS_ACTION_HINDI,
                result.actionHindi
            )
            .putString(
                KEY_SMS_VOICE_ENGLISH,
                result.voiceEnglish
            )
            .putString(
                KEY_SMS_VOICE_HINDI,
                result.voiceHindi
            )
            .putString(
                KEY_SMS_REASONS_ENGLISH,
                reasonsEnglishJson
            )
            .putString(
                KEY_SMS_REASONS_HINDI,
                reasonsHindiJson
            )
            .putLong(
                KEY_SMS_TIME,
                System.currentTimeMillis()
            )
            .putBoolean(
                KEY_SMS_PENDING,
                true
            )
            .apply()
    }

    /*
     * Save SUSPICIOUS and HIGH SMS results in the
     * local Report Scam history.
     *
     * ThreatHistoryManager automatically:
     *
     * - removes OTPs and sensitive information
     * - masks the sender for normal display
     * - groups duplicate messages
     * - applies the 30-day retention period
     */
    private fun saveSmsToThreatHistory(
        context: Context,
        sender: String,
        messageBody: String,
        result: SmsRiskResult
    ) {

        try {

            val preferences =
                context.getSharedPreferences(
                    PREFS_NAME,
                    Context.MODE_PRIVATE
                )

            val selectedLanguage =
                preferences.getString(
                    KEY_LANGUAGE,
                    "en"
                ) ?: "en"

            val reasons =
                if (selectedLanguage == "hi") {
                    result.reasonsHindi
                } else {
                    result.reasonsEnglish
                }

            val recommendedAction =
                if (selectedLanguage == "hi") {
                    result.actionHindi
                } else {
                    result.actionEnglish
                }

            ThreatHistoryManager(
                context.applicationContext
            ).saveSmsThreat(
                sender = sender,
                message = messageBody,
                riskLevel = result.level,
                reasons = reasons,
                recommendedAction =
                    recommendedAction
            )

        } catch (_: Exception) {

            /*
             * Threat-history storage must never prevent
             * notification or trusted-contact protection.
             */
        }
    }

    /*
     * Display a SUSPICIOUS or HIGH notification.
     *
     * Tapping the notification opens MainActivity,
     * which routes the user to sms.html.
     */
    private fun showRiskNotification(
        context: Context,
        sender: String,
        result: SmsRiskResult
    ) {

        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val preferences =
            context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

        val selectedLanguage =
            preferences.getString(
                KEY_LANGUAGE,
                "en"
            ) ?: "en"

        val isHindi =
            selectedLanguage == "hi"

        val notificationTitle =
            if (isHindi) {

                if (result.level == "HIGH") {
                    "कवच: बहुत जोखिम वाला एसएमएस"
                } else {
                    "कवच: संदिग्ध एसएमएस"
                }

            } else {

                if (result.level == "HIGH") {
                    "Kavach: High-risk SMS detected"
                } else {
                    "Kavach: Suspicious SMS detected"
                }
            }

        val notificationText =
            if (isHindi) {
                result.summaryHindi
            } else {
                result.summaryEnglish
            }

        val openKavachIntent =
            Intent(
                context,
                MainActivity::class.java
            ).apply {

                putExtra(
                    "open_sms_result",
                    true
                )

                putExtra(
                    "sms_sender",
                    sender
                )

                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP
            }

        val pendingIntentFlags =
            PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE

        val openKavachPendingIntent =
            PendingIntent.getActivity(
                context,
                2001,
                openKavachIntent,
                pendingIntentFlags
            )

        val notificationManager =
            context.getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager

        createNotificationChannel(
            notificationManager
        )

        val notification =
            Notification.Builder(
                context,
                CHANNEL_ID
            )
                .setSmallIcon(
                    android.R.drawable.ic_dialog_alert
                )
                .setContentTitle(
                    notificationTitle
                )
                .setContentText(
                    notificationText
                )
                .setStyle(
                    Notification.BigTextStyle()
                        .bigText(
                            "$notificationText\n${
                                maskSender(sender)
                            }"
                        )
                )
                .setCategory(
                    Notification.CATEGORY_MESSAGE
                )
                .setAutoCancel(true)
                .setContentIntent(
                    openKavachPendingIntent
                )
                .build()

        val notificationId =
            (
                    System.currentTimeMillis() %
                            Int.MAX_VALUE
                    ).toInt()

        notificationManager.notify(
            notificationId,
            notification
        )
    }

    /*
     * Create Android notification channel.
     */
    private fun createNotificationChannel(
        notificationManager: NotificationManager
    ) {

        val channel =
            NotificationChannel(
                CHANNEL_ID,
                "Kavach SMS risk alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {

                description =
                    "Warnings for suspicious and high-risk SMS messages"

                enableVibration(true)
            }

        notificationManager
            .createNotificationChannel(
                channel
            )
    }

    /*
     * Send a safe summary to the trusted contact
     * for every HIGH-risk SMS.
     */
    private fun sendTrustedContactAlert(
        context: Context,
        sender: String,
        result: SmsRiskResult
    ) {

        if (
            context.checkSelfPermission(
                Manifest.permission.SEND_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val preferences =
            context.getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

        val setupComplete =
            preferences.getBoolean(
                KEY_SETUP_COMPLETE,
                false
            )

        if (!setupComplete) {
            return
        }

        val trustedContactPhone =
            preferences.getString(
                KEY_CONTACT_PHONE,
                ""
            ) ?: ""

        if (trustedContactPhone.isBlank()) {
            return
        }

        val selectedLanguage =
            preferences.getString(
                KEY_LANGUAGE,
                "en"
            ) ?: "en"

        val trustedAlert =
            if (selectedLanguage == "hi") {

                """
                कवच सुरक्षा अलर्ट
                
                उपयोगकर्ता के फोन पर बहुत जोखिम वाला एसएमएस मिला है।
                
                भेजने वाला: ${maskSender(sender)}
                जोखिम: ${result.summaryHindi}
                
                कृपया उपयोगकर्ता से तुरंत संपर्क करें और उन्हें लिंक खोलने, पैसे भेजने या निजी जानकारी साझा करने से रोकें।
                """.trimIndent()

            } else {

                """
                Kavach Safety Alert
                
                A high-risk SMS was detected on the user's phone.
                
                Sender: ${maskSender(sender)}
                Risk: ${result.summaryEnglish}
                
                Please contact the user and ask them not to open links, send money, or share private information.
                """.trimIndent()
            }

        try {

            @Suppress("DEPRECATION")
            val smsManager =
                SmsManager.getDefault()

            val messageParts =
                smsManager.divideMessage(
                    trustedAlert
                )

            smsManager.sendMultipartTextMessage(
                trustedContactPhone,
                null,
                messageParts,
                null,
                null
            )

        } catch (_: Exception) {

            /*
             * Do not crash Kavach if the device cannot
             * send an external SMS.
             */
        }
    }

    /*
     * Hide most of the sender number in notifications
     * and trusted-contact alerts.
     */
    private fun maskSender(
        sender: String
    ): String {

        val digits =
            sender.filter {
                it.isDigit()
            }

        return if (digits.length >= 4) {
            "••••••" + digits.takeLast(4)
        } else {
            sender.take(18)
        }
    }
}