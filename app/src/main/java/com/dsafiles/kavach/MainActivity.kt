package com.dsafiles.kavach

import android.Manifest
import android.annotation.SuppressLint
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.TimeUnit

class MainActivity :
    AppCompatActivity(),
    TextToSpeech.OnInitListener {

    private lateinit var webView: WebView
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var apkController: ApkController

    private var verificationId: String? = null

    private var textToSpeech: TextToSpeech? = null
    private var textToSpeechReady = false

    @Volatile
    private var openedFromSmsNotification = false

    @Volatile
    private var openedFromApkIntent = false

    companion object {

        private const val PREFS_NAME =
            "kavach_preferences"

        private const val KEY_IS_LOGGED_IN =
            "is_logged_in"

        private const val KEY_USER_PHONE =
            "user_phone"

        private const val KEY_FIREBASE_UID =
            "firebase_uid"

        private const val KEY_CONTACT_NAME =
            "trusted_contact_name"

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

        private const val SMS_PERMISSION_REQUEST_CODE =
            401
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(
        savedInstanceState: Bundle?
    ) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

        firebaseAuth =
            FirebaseAuth.getInstance()

        webView =
            findViewById(R.id.webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
        }

        webView.webViewClient =
            object : WebViewClient() {

                override fun onPageFinished(
                    view: WebView?,
                    url: String?
                ) {
                    super.onPageFinished(
                        view,
                        url
                    )

                    if (
                        url?.endsWith("/login.html") == true &&
                        firebaseAuth.currentUser != null &&
                        !isSetupComplete()
                    ) {
                        callJavaScript(
                            """
                            if (
                                typeof window.onOtpVerified
                                === "function"
                            ) {
                                window.onOtpVerified();
                            }
                            """.trimIndent()
                        )
                    }
                }
            }

        apkController =
            ApkController(
                this,
                webView
            )

        /*
         * Main bridge used by the existing Kavach pages.
         */
        webView.addJavascriptInterface(
            WebAppInterface(),
            "KavachAndroid"
        )

        /*
         * Report Scam and local threat-history bridge.
         */
        webView.addJavascriptInterface(
            ReportController(this),
            "KavachReport"
        )

        textToSpeech =
            TextToSpeech(
                this,
                this
            )

        openedFromSmsNotification =
            intent?.getBooleanExtra(
                "open_sms_result",
                false
            ) ?: false

        openedFromApkIntent =
            apkController.hasIncomingApk(
                intent
            )

        openStartingPage()

        if (openedFromApkIntent) {
            apkController.handleIncomingIntent(
                intent
            )
        }
    }

    /*
     * Handle a notification tap or a newly shared APK
     * while MainActivity already exists.
     */
    override fun onNewIntent(
        intent: Intent
    ) {
        super.onNewIntent(intent)

        setIntent(intent)

        if (
            apkController.hasIncomingApk(
                intent
            )
        ) {
            openedFromApkIntent = true
            openedFromSmsNotification = false

            if (
                firebaseAuth.currentUser != null &&
                isSetupComplete()
            ) {
                openApkPage()
            } else {
                openLoginPage()
            }

            apkController.handleIncomingIntent(
                intent
            )

            return
        }

        if (
            intent.getBooleanExtra(
                "open_sms_result",
                false
            )
        ) {
            openedFromSmsNotification = true
            openedFromApkIntent = false

            if (
                firebaseAuth.currentUser != null &&
                isSetupComplete()
            ) {
                openSmsPage()
            } else {
                openLoginPage()
            }
        }
    }

    /*
     * Receive an APK selected through Android's file picker.
     */
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(
            requestCode,
            resultCode,
            data
        )

        apkController.handleActivityResult(
            requestCode,
            resultCode,
            data
        )
    }

    /*
     * Text-to-Speech initialization.
     */
    override fun onInit(
        status: Int
    ) {
        if (status != TextToSpeech.SUCCESS) {
            textToSpeechReady = false
            return
        }

        textToSpeechReady = true

        textToSpeech
            ?.setOnUtteranceProgressListener(
                object : UtteranceProgressListener() {

                    override fun onStart(
                        utteranceId: String?
                    ) {
                        callJavaScript(
                            """
                            if (
                                typeof window.onRiskVoiceStarted
                                === "function"
                            ) {
                                window.onRiskVoiceStarted();
                            }
                            """.trimIndent()
                        )
                    }

                    override fun onDone(
                        utteranceId: String?
                    ) {
                        callJavaScript(
                            """
                            if (
                                typeof window.onRiskVoiceFinished
                                === "function"
                            ) {
                                window.onRiskVoiceFinished();
                            }
                            """.trimIndent()
                        )
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(
                        utteranceId: String?
                    ) {
                        sendVoiceError(
                            "Unable to play voice explanation."
                        )
                    }

                    override fun onError(
                        utteranceId: String?,
                        errorCode: Int
                    ) {
                        sendVoiceError(
                            "Unable to play voice explanation."
                        )
                    }
                }
            )
    }

    /*
     * Decide which page should open.
     */
    private fun openStartingPage() {

        if (
            firebaseAuth.currentUser != null &&
            isSetupComplete()
        ) {
            when {

                openedFromApkIntent ->
                    openApkPage()

                openedFromSmsNotification ->
                    openSmsPage()

                else ->
                    openMainMenu()
            }

        } else {
            openLoginPage()
        }
    }

    private fun openLoginPage() {
        webView.loadUrl(
            "file:///android_asset/login.html"
        )
    }

    private fun openMainMenu() {
        webView.loadUrl(
            "file:///android_asset/menu.html"
        )
    }

    private fun openSmsPage() {
        webView.loadUrl(
            "file:///android_asset/sms.html"
        )
    }

    private fun openApkPage() {
        webView.loadUrl(
            "file:///android_asset/apk.html"
        )
    }

    private fun isSetupComplete(): Boolean {

        return getSharedPreferences(
            PREFS_NAME,
            MODE_PRIVATE
        ).getBoolean(
            KEY_SETUP_COMPLETE,
            false
        )
    }

    inner class WebAppInterface {

        /*
         * Firebase Phone Authentication.
         */
        @JavascriptInterface
        fun sendOtp(
            phoneNumber: String
        ) {
            runOnUiThread {
                sendFirebaseOtp(
                    phoneNumber.trim()
                )
            }
        }

        @JavascriptInterface
        fun verifyOtp(
            otp: String
        ) {
            runOnUiThread {
                verifyFirebaseOtp(
                    otp.trim()
                )
            }
        }

        /*
         * Language.
         */
        @JavascriptInterface
        fun saveLanguage(
            languageCode: String
        ) {
            getSharedPreferences(
                PREFS_NAME,
                MODE_PRIVATE
            )
                .edit()
                .putString(
                    KEY_LANGUAGE,
                    if (languageCode == "hi") {
                        "hi"
                    } else {
                        "en"
                    }
                )
                .apply()
        }

        /*
         * Trusted Contact.
         */
        @JavascriptInterface
        fun saveTrustedContact(
            name: String,
            phoneNumber: String
        ) {
            runOnUiThread {

                val cleanName =
                    name.trim()

                val cleanPhone =
                    phoneNumber
                        .filter {
                            it.isDigit()
                        }
                        .takeLast(10)

                val userPhone =
                    firebaseAuth
                        .currentUser
                        ?.phoneNumber
                        ?.filter {
                            it.isDigit()
                        }
                        ?.takeLast(10)
                        ?: ""

                if (cleanName.length < 2) {
                    showAuthenticationError(
                        "Please enter the trusted contact's name."
                    )
                    return@runOnUiThread
                }

                if (
                    !cleanPhone.matches(
                        Regex("^[6-9][0-9]{9}$")
                    )
                ) {
                    showAuthenticationError(
                        "Please enter a valid trusted-contact number."
                    )
                    return@runOnUiThread
                }

                if (cleanPhone == userPhone) {
                    showAuthenticationError(
                        "Trusted contact must be different from your number."
                    )
                    return@runOnUiThread
                }

                val saved =
                    getSharedPreferences(
                        PREFS_NAME,
                        MODE_PRIVATE
                    )
                        .edit()
                        .putString(
                            KEY_CONTACT_NAME,
                            cleanName
                        )
                        .putString(
                            KEY_CONTACT_PHONE,
                            "+91$cleanPhone"
                        )
                        .putBoolean(
                            KEY_SETUP_COMPLETE,
                            true
                        )
                        .commit()

                if (saved) {

                    webView.clearHistory()

                    if (openedFromApkIntent) {
                        openApkPage()
                    } else {
                        openMainMenu()
                    }

                } else {
                    showAuthenticationError(
                        "Unable to save trusted contact."
                    )
                }
            }
        }

        @JavascriptInterface
        fun getTrustedContact(): String {

            val preferences =
                getSharedPreferences(
                    PREFS_NAME,
                    MODE_PRIVATE
                )

            return JSONObject()
                .put(
                    "name",
                    preferences.getString(
                        KEY_CONTACT_NAME,
                        ""
                    ) ?: ""
                )
                .put(
                    "phone",
                    preferences.getString(
                        KEY_CONTACT_PHONE,
                        ""
                    ) ?: ""
                )
                .toString()
        }

        @JavascriptInterface
        fun getVerifiedPhoneNumber(): String {

            return firebaseAuth
                .currentUser
                ?.phoneNumber
                ?: ""
        }

        /*
         * SMS permissions and latest result.
         */
        @JavascriptInterface
        fun requestSmsPermissions() {
            runOnUiThread {
                requestRequiredSmsPermissions()
            }
        }

        @JavascriptInterface
        fun getSmsPermissionStatus(): String {

            return createSmsPermissionStatus()
                .toString()
        }

        @JavascriptInterface
        fun getLatestSmsResult(): String {

            val preferences =
                getSharedPreferences(
                    PREFS_NAME,
                    MODE_PRIVATE
                )

            val body =
                preferences.getString(
                    KEY_SMS_BODY,
                    ""
                ) ?: ""

            val level =
                preferences.getString(
                    KEY_SMS_LEVEL,
                    ""
                ) ?: ""

            val reasonsEnglish =
                preferences.getString(
                    KEY_SMS_REASONS_ENGLISH,
                    "[]"
                ) ?: "[]"

            val reasonsHindi =
                preferences.getString(
                    KEY_SMS_REASONS_HINDI,
                    "[]"
                ) ?: "[]"

            val result =
                JSONObject()
                    .put(
                        "hasResult",
                        body.isNotBlank() &&
                                level.isNotBlank()
                    )
                    .put(
                        "sender",
                        preferences.getString(
                            KEY_SMS_SENDER,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "message",
                        body
                    )
                    .put(
                        "level",
                        level
                    )
                    .put(
                        "score",
                        preferences.getInt(
                            KEY_SMS_SCORE,
                            0
                        )
                    )
                    .put(
                        "summaryEnglish",
                        preferences.getString(
                            KEY_SMS_SUMMARY_ENGLISH,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "summaryHindi",
                        preferences.getString(
                            KEY_SMS_SUMMARY_HINDI,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "actionEnglish",
                        preferences.getString(
                            KEY_SMS_ACTION_ENGLISH,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "actionHindi",
                        preferences.getString(
                            KEY_SMS_ACTION_HINDI,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "voiceEnglish",
                        preferences.getString(
                            KEY_SMS_VOICE_ENGLISH,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "voiceHindi",
                        preferences.getString(
                            KEY_SMS_VOICE_HINDI,
                            ""
                        ) ?: ""
                    )
                    .put(
                        "reasonsEnglish",
                        JSONArray(reasonsEnglish)
                    )
                    .put(
                        "reasonsHindi",
                        JSONArray(reasonsHindi)
                    )
                    .put(
                        "timestamp",
                        preferences.getLong(
                            KEY_SMS_TIME,
                            0L
                        )
                    )
                    .put(
                        "pending",
                        preferences.getBoolean(
                            KEY_SMS_PENDING,
                            false
                        )
                    )
                    .put(
                        "autoPlayVoice",
                        openedFromSmsNotification
                    )

            openedFromSmsNotification = false

            return result.toString()
        }

        @JavascriptInterface
        fun markLatestSmsViewed() {

            getSharedPreferences(
                PREFS_NAME,
                MODE_PRIVATE
            )
                .edit()
                .putBoolean(
                    KEY_SMS_PENDING,
                    false
                )
                .apply()
        }

        /*
         * WhatsApp clipboard.
         */
        @JavascriptInterface
        fun getClipboardText(): String {

            return try {

                val clipboard =
                    getSystemService(
                        Context.CLIPBOARD_SERVICE
                    ) as ClipboardManager

                val clip =
                    clipboard.primaryClip
                        ?: return ""

                if (clip.itemCount == 0) {
                    return ""
                }

                clip.getItemAt(0)
                    .coerceToText(
                        this@MainActivity
                    )
                    .toString()

            } catch (_: Exception) {
                ""
            }
        }

        /*
         * APK functions used by apk.js.
         */
        @JavascriptInterface
        fun pickApkFile() {
            runOnUiThread {
                apkController.pickApkFile()
            }
        }

        @JavascriptInterface
        fun getPendingApkSelection(): String {

            return apkController
                .getPendingSelection()
        }

        @JavascriptInterface
        fun analyseSelectedApk() {

            apkController
                .analyseSelectedApk()
        }

        @JavascriptInterface
        fun deleteSelectedApk() {

            apkController
                .deleteSelectedApk()
        }

        @JavascriptInterface
        fun clearSelectedApk() {

            apkController
                .clearSelectedApk()
        }

        @JavascriptInterface
        fun continueApkInstallation() {
            runOnUiThread {
                apkController
                    .continueInstallation()
            }
        }

        /*
         * English/Hindi voice.
         */
        @JavascriptInterface
        fun speakRiskExplanation(
            text: String,
            languageCode: String
        ) {
            runOnUiThread {
                speakRiskText(
                    text,
                    languageCode
                )
            }
        }

        @JavascriptInterface
        fun stopRiskVoice() {
            runOnUiThread {

                textToSpeech?.stop()

                callJavaScript(
                    """
                    if (
                        typeof window.onRiskVoiceFinished
                        === "function"
                    ) {
                        window.onRiskVoiceFinished();
                    }
                    """.trimIndent()
                )
            }
        }

        /*
         * Logout.
         */
        @JavascriptInterface
        fun logout() {
            runOnUiThread {

                firebaseAuth.signOut()

                val preferences =
                    getSharedPreferences(
                        PREFS_NAME,
                        MODE_PRIVATE
                    )

                val language =
                    preferences.getString(
                        KEY_LANGUAGE,
                        "en"
                    ) ?: "en"

                preferences
                    .edit()
                    .clear()
                    .putString(
                        KEY_LANGUAGE,
                        language
                    )
                    .commit()

                apkController.clearSelectedApk()

                textToSpeech?.stop()

                openedFromSmsNotification = false
                openedFromApkIntent = false

                webView.clearHistory()

                openLoginPage()
            }
        }
    }

    /*
     * SMS runtime permissions.
     */
    private fun requestRequiredSmsPermissions() {

        val missingPermissions =
            mutableListOf<String>()

        if (
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECEIVE_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            missingPermissions.add(
                Manifest.permission.RECEIVE_SMS
            )
        }

        if (
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.SEND_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            missingPermissions.add(
                Manifest.permission.SEND_SMS
            )
        }

        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            missingPermissions.add(
                Manifest.permission.POST_NOTIFICATIONS
            )
        }

        if (missingPermissions.isEmpty()) {
            sendSmsPermissionStatusToJavaScript()
            return
        }

        ActivityCompat.requestPermissions(
            this,
            missingPermissions.toTypedArray(),
            SMS_PERMISSION_REQUEST_CODE
        )
    }

    private fun createSmsPermissionStatus():
            JSONObject {

        val receiveSms =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECEIVE_SMS
            ) == PackageManager.PERMISSION_GRANTED

        val sendSms =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.SEND_SMS
            ) == PackageManager.PERMISSION_GRANTED

        val notifications =
            Build.VERSION.SDK_INT <
                    Build.VERSION_CODES.TIRAMISU ||
                    ContextCompat.checkSelfPermission(
                        this,
                        Manifest.permission.POST_NOTIFICATIONS
                    ) == PackageManager.PERMISSION_GRANTED

        return JSONObject()
            .put(
                "receiveSms",
                receiveSms
            )
            .put(
                "sendSms",
                sendSms
            )
            .put(
                "notifications",
                notifications
            )
            .put(
                "allGranted",
                receiveSms &&
                        sendSms &&
                        notifications
            )
    }

    private fun sendSmsPermissionStatusToJavaScript() {

        val status =
            createSmsPermissionStatus()
                .toString()

        callJavaScript(
            """
            if (
                typeof window.onSmsPermissionResult
                === "function"
            ) {
                window.onSmsPermissionResult(
                    $status
                );
            }
            """.trimIndent()
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(
            requestCode,
            permissions,
            grantResults
        )

        if (
            requestCode ==
            SMS_PERMISSION_REQUEST_CODE
        ) {
            sendSmsPermissionStatusToJavaScript()
        }
    }

    /*
     * Android Text-to-Speech.
     */
    private fun speakRiskText(
        text: String,
        languageCode: String
    ) {

        if (text.isBlank()) {
            sendVoiceError(
                "No voice explanation is available."
            )
            return
        }

        if (!textToSpeechReady) {
            sendVoiceError(
                "Voice is still loading. Try again."
            )
            return
        }

        val locale =
            if (languageCode == "hi") {
                Locale(
                    "hi",
                    "IN"
                )
            } else {
                Locale(
                    "en",
                    "IN"
                )
            }

        val languageResult =
            textToSpeech?.setLanguage(
                locale
            )

        if (
            languageResult ==
            TextToSpeech.LANG_MISSING_DATA ||
            languageResult ==
            TextToSpeech.LANG_NOT_SUPPORTED
        ) {
            sendVoiceError(
                if (languageCode == "hi") {
                    "Hindi voice is not installed."
                } else {
                    "English voice is not installed."
                }
            )
            return
        }

        textToSpeech?.setSpeechRate(
            0.88f
        )

        textToSpeech?.setPitch(
            1.0f
        )

        val utteranceId =
            "kavach-risk-" +
                    System.currentTimeMillis()

        val speakResult =
            textToSpeech?.speak(
                text,
                TextToSpeech.QUEUE_FLUSH,
                null,
                utteranceId
            )

        if (speakResult == TextToSpeech.ERROR) {
            sendVoiceError(
                "Unable to start voice explanation."
            )
        }
    }

    /*
     * Firebase Phone Authentication.
     */
    private fun sendFirebaseOtp(
        phoneNumber: String
    ) {

        if (
            !phoneNumber.matches(
                Regex("^\\+91[6-9][0-9]{9}$")
            )
        ) {
            showAuthenticationError(
                "Please enter a valid +91 mobile number."
            )
            return
        }

        val callbacks =
            object :
                PhoneAuthProvider
                .OnVerificationStateChangedCallbacks() {

                override fun onVerificationCompleted(
                    credential: PhoneAuthCredential
                ) {
                    signInWithCredential(
                        credential
                    )
                }

                override fun onVerificationFailed(
                    exception: FirebaseException
                ) {
                    showAuthenticationError(
                        exception.localizedMessage
                            ?: "Unable to send OTP."
                    )
                }

                override fun onCodeSent(
                    newVerificationId: String,
                    token: PhoneAuthProvider
                    .ForceResendingToken
                ) {
                    super.onCodeSent(
                        newVerificationId,
                        token
                    )

                    verificationId =
                        newVerificationId

                    callJavaScript(
                        """
                        if (
                            typeof window.onOtpSent
                            === "function"
                        ) {
                            window.onOtpSent();
                        }
                        """.trimIndent()
                    )
                }
            }

        val options =
            PhoneAuthOptions
                .newBuilder(firebaseAuth)
                .setPhoneNumber(phoneNumber)
                .setTimeout(
                    60L,
                    TimeUnit.SECONDS
                )
                .setActivity(this)
                .setCallbacks(callbacks)
                .build()

        PhoneAuthProvider.verifyPhoneNumber(
            options
        )
    }

    private fun verifyFirebaseOtp(
        otp: String
    ) {

        if (
            !otp.matches(
                Regex("^[0-9]{6}$")
            )
        ) {
            showAuthenticationError(
                "Please enter a valid six-digit OTP."
            )
            return
        }

        val savedVerificationId =
            verificationId

        if (savedVerificationId == null) {
            showAuthenticationError(
                "Please request a new OTP first."
            )
            return
        }

        val credential =
            PhoneAuthProvider.getCredential(
                savedVerificationId,
                otp
            )

        signInWithCredential(
            credential
        )
    }

    private fun signInWithCredential(
        credential: PhoneAuthCredential
    ) {

        firebaseAuth
            .signInWithCredential(
                credential
            )
            .addOnCompleteListener(this) { task ->

                if (task.isSuccessful) {

                    val user =
                        task.result?.user

                    getSharedPreferences(
                        PREFS_NAME,
                        MODE_PRIVATE
                    )
                        .edit()
                        .putBoolean(
                            KEY_IS_LOGGED_IN,
                            true
                        )
                        .putString(
                            KEY_USER_PHONE,
                            user?.phoneNumber
                                ?: ""
                        )
                        .putString(
                            KEY_FIREBASE_UID,
                            user?.uid
                                ?: ""
                        )
                        .apply()

                    callJavaScript(
                        """
                        if (
                            typeof window.onOtpVerified
                            === "function"
                        ) {
                            window.onOtpVerified();
                        }
                        """.trimIndent()
                    )

                } else {

                    val message =
                        if (
                            task.exception
                                    is FirebaseAuthInvalidCredentialsException
                        ) {
                            "The OTP is incorrect."
                        } else {
                            task.exception
                                ?.localizedMessage
                                ?: "OTP verification failed."
                        }

                    showAuthenticationError(
                        message
                    )
                }
            }
    }

    private fun callJavaScript(
        javascript: String
    ) {
        runOnUiThread {
            webView.evaluateJavascript(
                javascript,
                null
            )
        }
    }

    private fun showAuthenticationError(
        message: String
    ) {

        val safeMessage =
            JSONObject.quote(message)

        callJavaScript(
            """
            if (
                typeof window.onAuthenticationError
                === "function"
            ) {
                window.onAuthenticationError(
                    $safeMessage
                );
            } else if (
                typeof window.onAuthError
                === "function"
            ) {
                window.onAuthError(
                    $safeMessage
                );
            }
            """.trimIndent()
        )
    }

    private fun sendVoiceError(
        message: String
    ) {

        val safeMessage =
            JSONObject.quote(message)

        callJavaScript(
            """
            if (
                typeof window.onRiskVoiceError
                === "function"
            ) {
                window.onRiskVoiceError(
                    $safeMessage
                );
            }
            """.trimIndent()
        )
    }

    override fun onDestroy() {

        apkController.shutdown()

        textToSpeech?.stop()
        textToSpeech?.shutdown()

        textToSpeech = null
        textToSpeechReady = false

        super.onDestroy()
    }
}