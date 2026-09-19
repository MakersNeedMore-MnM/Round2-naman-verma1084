document.addEventListener("DOMContentLoaded", function () {

    const smsStatusCard =
        document.getElementById("smsStatusCard");

    const smsStatusIcon =
        document.getElementById("smsStatusIcon");

    const smsStatusTitle =
        document.getElementById("smsStatusTitle");

    const smsStatusDescription =
        document.getElementById(
            "smsStatusDescription"
        );

    const smsPermissionSection =
        document.getElementById(
            "smsPermissionSection"
        );

    const enableSmsPermissionButton =
        document.getElementById(
            "enableSmsPermissionButton"
        );

    const smsPermissionMessage =
        document.getElementById(
            "smsPermissionMessage"
        );

    const emptySmsState =
        document.getElementById("emptySmsState");

    const latestSmsResult =
        document.getElementById("latestSmsResult");

    const latestResultStatus =
        document.getElementById(
            "latestResultStatus"
        );

    const smsSender =
        document.getElementById("smsSender");

    const smsTime =
        document.getElementById("smsTime");

    const smsMessagePreview =
        document.getElementById(
            "smsMessagePreview"
        );

    const riskLevel =
        document.getElementById("riskLevel");

    const riskReason =
        document.getElementById("riskReason");

    const smsRiskBadge =
        document.getElementById("smsRiskBadge");

    const smsReasonList =
        document.getElementById(
            "smsReasonList"
        );

    const smsRecommendedAction =
        document.getElementById(
            "smsRecommendedAction"
        );

    const smsPlayVoiceButton =
        document.getElementById(
            "smsPlayVoiceButton"
        );

    const smsStopVoiceButton =
        document.getElementById(
            "smsStopVoiceButton"
        );

    const smsVoiceLanguageLabel =
        document.getElementById(
            "smsVoiceLanguageLabel"
        );

    const smsVoiceStatus =
        document.getElementById(
            "smsVoiceStatus"
        );


    let currentVoiceText = "";
    let currentVoiceLanguage = "en";

    let lastResultTimestamp = 0;
    let firstResultLoad = true;


    /*
     * Selected application language.
     */
    function getSelectedLanguage() {

        const language =
            localStorage.getItem(
                "kavachLanguage"
            ) || "en";

        return language === "hi"
            ? "hi"
            : "en";
    }


    /*
     * Parse either a JSON string or an object.
     */
    function parseNativeJson(value) {

        if (!value) {
            return null;
        }

        if (typeof value === "object") {
            return value;
        }

        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }


    /*
     * Display current SMS permission status.
     */
    function updatePermissionDisplay(status) {

        if (!status) {
            return;
        }

        const language =
            getSelectedLanguage();

        const canReceiveSms =
            status.receiveSms === true;

        const canSendAlerts =
            status.sendSms === true;

        const canShowNotifications =
            status.notifications === true;


        if (
            canReceiveSms &&
            canSendAlerts &&
            canShowNotifications
        ) {
            smsStatusCard.classList.remove(
                "permission-needed"
            );

            smsStatusCard.classList.add(
                "protection-enabled"
            );

            smsStatusIcon.textContent = "✓";

            smsStatusTitle.textContent =
                language === "hi"
                    ? "एसएमएस सुरक्षा चालू है"
                    : "SMS protection is active";

            smsStatusDescription.textContent =
                language === "hi"
                    ? "कवच नए एसएमएस को अपने आप जांचेगा और अधिक जोखिम होने पर चेतावनी देगा।"
                    : "Kavach will automatically check new SMS messages and warn you when risk is high.";

            smsPermissionSection.style.display =
                "none";

            return;
        }


        smsStatusCard.classList.remove(
            "protection-enabled"
        );

        smsStatusCard.classList.add(
            "permission-needed"
        );

        smsStatusIcon.textContent = "!";

        smsStatusTitle.textContent =
            language === "hi"
                ? "अनुमति आवश्यक है"
                : "Permission required";


        if (!canReceiveSms) {

            smsStatusDescription.textContent =
                language === "hi"
                    ? "नए एसएमएस पहचानने के लिए एसएमएस की अनुमति दें।"
                    : "Allow SMS permission so Kavach can detect new messages.";

        } else if (!canShowNotifications) {

            smsStatusDescription.textContent =
                language === "hi"
                    ? "जोखिम की चेतावनी पाने के लिए नोटिफिकेशन की अनुमति दें।"
                    : "Allow notifications to receive risk warnings.";

        } else if (!canSendAlerts) {

            smsStatusDescription.textContent =
                language === "hi"
                    ? "विश्वसनीय संपर्क को सतर्क करने के लिए एसएमएस भेजने की अनुमति दें।"
                    : "Allow sending SMS to inform your trusted contact.";
        }

        smsPermissionSection.style.display =
            "";
    }


    /*
     * Read permissions from Kotlin.
     */
    function loadPermissionStatus() {

        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .getSmsPermissionStatus === "function"
        ) {
            const status =
                parseNativeJson(
                    window.KavachAndroid
                        .getSmsPermissionStatus()
                );

            updatePermissionDisplay(status);
        }
    }


    /*
     * Request permissions.
     */
    enableSmsPermissionButton.addEventListener(
        "click",
        function () {

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .requestSmsPermissions === "function"
            ) {
                enableSmsPermissionButton.disabled =
                    true;

                smsPermissionMessage.textContent =
                    getSelectedLanguage() === "hi"
                        ? "कृपया आवश्यक अनुमतियां दें।"
                        : "Please allow the required permissions.";

                window.KavachAndroid
                    .requestSmsPermissions();

            } else {

                smsPermissionMessage.textContent =
                    "SMS protection is available only inside the Kavach Android app.";
            }
        }
    );


    /*
     * Kotlin calls this after permission dialogs.
     */
    window.onSmsPermissionResult =
        function (permissionStatus) {

            enableSmsPermissionButton.disabled =
                false;

            const status =
                parseNativeJson(
                    permissionStatus
                );

            updatePermissionDisplay(status);

            if (
                status &&
                status.allGranted
            ) {
                smsPermissionMessage.textContent =
                    getSelectedLanguage() === "hi"
                        ? "एसएमएस सुरक्षा सफलतापूर्वक चालू हो गई।"
                        : "SMS protection was enabled successfully.";
            } else {
                smsPermissionMessage.textContent =
                    getSelectedLanguage() === "hi"
                        ? "पूरी सुरक्षा के लिए सभी अनुमतियां आवश्यक हैं।"
                        : "All permissions are required for complete protection.";
            }
        };


    /*
     * Format the SMS date and time.
     */
    function formatSmsTime(timestamp) {

        if (!timestamp) {
            return getSelectedLanguage() === "hi"
                ? "अभी"
                : "Just now";
        }

        const locale =
            getSelectedLanguage() === "hi"
                ? "hi-IN"
                : "en-IN";

        return new Date(timestamp)
            .toLocaleString(
                locale,
                {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    }


    /*
     * Display the latest analysed SMS.
     */
    function displaySmsResult(result) {

        if (
            !result ||
            result.hasResult !== true
        ) {
            emptySmsState.classList.remove(
                "hidden"
            );

            latestSmsResult.classList.add(
                "hidden"
            );

            return;
        }

        const language =
            getSelectedLanguage();

        const isHindi =
            language === "hi";


        const summary =
            isHindi
                ? result.summaryHindi
                : result.summaryEnglish;

        const action =
            isHindi
                ? result.actionHindi
                : result.actionEnglish;

        const reasons =
            isHindi
                ? result.reasonsHindi
                : result.reasonsEnglish;

        currentVoiceText =
            isHindi
                ? result.voiceHindi
                : result.voiceEnglish;

        currentVoiceLanguage =
            language;


        emptySmsState.classList.add(
            "hidden"
        );

        latestSmsResult.classList.remove(
            "hidden"
        );


        smsSender.textContent =
            result.sender ||
            (
                isHindi
                    ? "अनजान भेजने वाला"
                    : "Unknown sender"
            );

        smsTime.textContent =
            formatSmsTime(
                result.timestamp
            );

        smsMessagePreview.textContent =
            result.message || "";

        riskLevel.textContent =
            summary;

        riskReason.textContent =
            summary;

        smsRecommendedAction.textContent =
            action;


        latestResultStatus.textContent =
            result.level;

        smsRiskBadge.textContent =
            result.level;


        latestResultStatus.classList.remove(
            "no-result",
            "risk-low",
            "risk-suspicious",
            "risk-high"
        );

        smsRiskBadge.classList.remove(
            "risk-low",
            "risk-suspicious",
            "risk-high"
        );


        if (result.level === "LOW") {

            latestResultStatus.classList.add(
                "risk-low"
            );

            smsRiskBadge.classList.add(
                "risk-low"
            );
        }

        if (result.level === "SUSPICIOUS") {

            latestResultStatus.classList.add(
                "risk-suspicious"
            );

            smsRiskBadge.classList.add(
                "risk-suspicious"
            );
        }

        if (result.level === "HIGH") {

            latestResultStatus.classList.add(
                "risk-high"
            );

            smsRiskBadge.classList.add(
                "risk-high"
            );
        }


        smsReasonList.innerHTML = "";

        if (
            Array.isArray(reasons) &&
            reasons.length > 0
        ) {
            reasons.forEach(function (reason) {

                const listItem =
                    document.createElement("li");

                listItem.textContent =
                    reason;

                smsReasonList.appendChild(
                    listItem
                );
            });

        } else {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                isHindi
                    ? "कोई कारण उपलब्ध नहीं है।"
                    : "No reason is available.";

            smsReasonList.appendChild(
                listItem
            );
        }


        smsVoiceLanguageLabel.textContent =
            isHindi
                ? "हिन्दी"
                : "English";

        smsVoiceStatus.textContent =
            isHindi
                ? "परिणाम सुनने के लिए Play दबाएं"
                : "Tap Play to hear the result";


        /*
         * Tell Kotlin that the result was displayed.
         */
        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .markLatestSmsViewed === "function"
        ) {
            window.KavachAndroid
                .markLatestSmsViewed();
        }


        /*
         * Play automatically when opened through
         * a Kavach HIGH/SUSPICIOUS notification.
         */
        if (
            result.autoPlayVoice === true &&
            result.level !== "LOW"
        ) {
            window.setTimeout(
                function () {
                    playVoiceExplanation();
                },
                700
            );
        }
    }


    /*
     * Load the latest result from Kotlin.
     */
    function loadLatestSmsResult(
        isPolling
    ) {

        if (
            !window.KavachAndroid ||
            typeof window.KavachAndroid
                .getLatestSmsResult !== "function"
        ) {
            return;
        }

        const result =
            parseNativeJson(
                window.KavachAndroid
                    .getLatestSmsResult()
            );

        if (
            !result ||
            result.hasResult !== true
        ) {
            if (!isPolling) {
                displaySmsResult(result);
            }

            firstResultLoad = false;
            return;
        }


        const timestamp =
            Number(
                result.timestamp || 0
            );

        const isNewResult =
            timestamp > lastResultTimestamp;


        if (
            !isPolling ||
            isNewResult
        ) {
            displaySmsResult(result);
        }


        /*
         * SMS arrived while this page was already open.
         */
        if (
            isPolling &&
            !firstResultLoad &&
            isNewResult &&
            result.level !== "LOW"
        ) {
            window.setTimeout(
                function () {
                    playVoiceExplanation();
                },
                500
            );
        }


        lastResultTimestamp =
            Math.max(
                lastResultTimestamp,
                timestamp
            );

        firstResultLoad = false;
    }


    /*
     * Play SMS voice explanation.
     */
    function playVoiceExplanation() {

        if (!currentVoiceText) {
            return;
        }

        smsVoiceStatus.textContent =
            currentVoiceLanguage === "hi"
                ? "आवाज़ चलाई जा रही है…"
                : "Playing voice explanation…";


        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .speakRiskExplanation === "function"
        ) {
            window.KavachAndroid
                .speakRiskExplanation(
                    currentVoiceText,
                    currentVoiceLanguage
                );

            return;
        }


        /*
         * Browser fallback.
         */
        if ("speechSynthesis" in window) {

            window.speechSynthesis.cancel();

            const speech =
                new SpeechSynthesisUtterance(
                    currentVoiceText
                );

            speech.lang =
                currentVoiceLanguage === "hi"
                    ? "hi-IN"
                    : "en-IN";

            speech.rate = 0.88;

            speech.onend = function () {

                smsVoiceStatus.textContent =
                    currentVoiceLanguage === "hi"
                        ? "आवाज़ पूरी हुई"
                        : "Voice explanation finished";
            };

            window.speechSynthesis.speak(
                speech
            );
        }
    }


    smsPlayVoiceButton.addEventListener(
        "click",
        function () {
            playVoiceExplanation();
        }
    );


    /*
     * Stop voice.
     */
    smsStopVoiceButton.addEventListener(
        "click",
        function () {

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .stopRiskVoice === "function"
            ) {
                window.KavachAndroid
                    .stopRiskVoice();
            }

            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }

            smsVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ रोक दी गई"
                    : "Voice explanation stopped";
        }
    );


    /*
     * Kotlin Text-to-Speech callbacks.
     */
    window.onRiskVoiceStarted =
        function () {

            smsVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ चलाई जा रही है…"
                    : "Playing voice explanation…";
        };


    window.onRiskVoiceFinished =
        function () {

            smsVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ पूरी हुई"
                    : "Voice explanation finished";
        };


    window.onRiskVoiceError =
        function (message) {

            smsVoiceStatus.textContent =
                message ||
                (
                    currentVoiceLanguage === "hi"
                        ? "इस फोन पर आवाज़ उपलब्ध नहीं है।"
                        : "Voice is unavailable on this phone."
                );
        };


    /*
     * Refresh text if language changes while the page is open.
     */
    window.addEventListener(
        "kavachLanguageChanged",
        function () {

            loadPermissionStatus();

            loadLatestSmsResult(false);
        }
    );


    /*
     * Initial page setup.
     */
    loadPermissionStatus();

    loadLatestSmsResult(false);


    /*
     * Poll every two seconds.
     *
     * This allows the SMS page to update immediately
     * if a message arrives while Kavach is open.
     */
    window.setInterval(
        function () {
            loadLatestSmsResult(true);
        },
        2000
    );
});