document.addEventListener("DOMContentLoaded", function () {

    const selectApkButton =
        document.getElementById("selectApkButton");

    const apkFileInput =
        document.getElementById("apkFileInput");

    const apkSelectionError =
        document.getElementById("apkSelectionError");

    const selectedApkCard =
        document.getElementById("selectedApkCard");

    const selectedApkName =
        document.getElementById("selectedApkName");

    const selectedApkSize =
        document.getElementById("selectedApkSize");

    const selectedApkSource =
        document.getElementById("selectedApkSource");

    const analyseApkButton =
        document.getElementById("analyseApkButton");

    const apkScanningCard =
        document.getElementById("apkScanningCard");

    const apkResultCard =
        document.getElementById("apkResultCard");

    const apkResultTitle =
        document.getElementById("apkResultTitle");

    const apkRiskBadge =
        document.getElementById("apkRiskBadge");

    const apkResultSummary =
        document.getElementById("apkResultSummary");

    const apkApplicationName =
        document.getElementById("apkApplicationName");

    const apkPackageName =
        document.getElementById("apkPackageName");

    const apkTargetSdk =
        document.getElementById("apkTargetSdk");

    const apkFileHash =
        document.getElementById("apkFileHash");

    const apkReasonList =
        document.getElementById("apkReasonList");

    const apkRecommendedAction =
        document.getElementById("apkRecommendedAction");

    const apkTrustedAlertCard =
        document.getElementById("apkTrustedAlertCard");

    const apkTrustedAlertStatus =
        document.getElementById("apkTrustedAlertStatus");

    const apkPlayVoiceButton =
        document.getElementById("apkPlayVoiceButton");

    const apkStopVoiceButton =
        document.getElementById("apkStopVoiceButton");

    const apkVoiceLanguage =
        document.getElementById("apkVoiceLanguage");

    const apkVoiceStatus =
        document.getElementById("apkVoiceStatus");

    const deleteApkButton =
        document.getElementById("deleteApkButton");

    const continueInstallationButton =
        document.getElementById("continueInstallationButton");

    const checkAnotherApkButton =
        document.getElementById("checkAnotherApkButton");


    let selectedApkAvailable = false;

    let currentResult = null;

    let currentVoiceText = "";

    let currentVoiceLanguage = "en";


    function getSelectedLanguage() {

        return localStorage.getItem(
            "kavachLanguage"
        ) === "hi"
            ? "hi"
            : "en";
    }


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


    function formatFileSize(bytes) {

        const size =
            Number(bytes || 0);

        if (size <= 0) {
            return getSelectedLanguage() === "hi"
                ? "आकार उपलब्ध नहीं है"
                : "Size unavailable";
        }

        if (size < 1024) {
            return size + " B";
        }

        if (size < 1024 * 1024) {
            return (
                size / 1024
            ).toFixed(1) + " KB";
        }

        return (
            size / (
                1024 * 1024
            )
        ).toFixed(1) + " MB";
    }


    /*
     * Display the APK selected through Kotlin.
     */
    function displaySelectedApk(selection) {

        if (
            !selection ||
            !selection.name
        ) {
            return;
        }

        selectedApkAvailable = true;

        currentResult = null;

        apkSelectionError.textContent = "";

        selectedApkName.textContent =
            selection.name;

        selectedApkSize.textContent =
            selection.sizeText ||
            formatFileSize(
                selection.size
            );

        selectedApkSource.textContent =
            selection.source ||
            (
                getSelectedLanguage() === "hi"
                    ? "कवच के साथ साझा किया गया"
                    : "Shared with Kavach"
            );

        selectedApkCard.classList.remove(
            "apk-hidden"
        );

        apkScanningCard.classList.add(
            "apk-hidden"
        );

        apkResultCard.classList.add(
            "apk-hidden"
        );

        selectedApkCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /*
     * Open native Android APK file picker.
     */
    selectApkButton.addEventListener(
        "click",
        function () {

            apkSelectionError.textContent = "";

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .pickApkFile === "function"
            ) {
                window.KavachAndroid
                    .pickApkFile();

                return;
            }

            /*
             * Browser fallback.
             */
            apkFileInput.click();
        }
    );


    /*
     * Browser fallback selection.
     *
     * Native Kotlin analysis still requires the Android picker.
     */
    apkFileInput.addEventListener(
        "change",
        function () {

            const selectedFile =
                apkFileInput.files[0];

            if (!selectedFile) {
                return;
            }

            if (
                !selectedFile.name
                    .toLowerCase()
                    .endsWith(".apk")
            ) {
                apkSelectionError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "केवल एपीके फाइल चुनें।"
                        : "Please select an APK file only.";

                apkFileInput.value = "";

                return;
            }

            displaySelectedApk({
                name: selectedFile.name,
                size: selectedFile.size,
                source:
                    getSelectedLanguage() === "hi"
                        ? "फाइल पिकर से चुना गया"
                        : "Selected from file picker"
            });

            apkSelectionError.textContent =
                getSelectedLanguage() === "hi"
                    ? "पूरी जांच के लिए एंड्रॉइड कवच ऐप का उपयोग करें।"
                    : "Use the Android Kavach app for complete native analysis.";
        }
    );


    /*
     * Analyse selected APK.
     */
    analyseApkButton.addEventListener(
        "click",
        function () {

            apkSelectionError.textContent = "";

            if (!selectedApkAvailable) {

                apkSelectionError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "पहले एक एपीके फाइल चुनें।"
                        : "Select an APK file first.";

                return;
            }

            if (
                !window.KavachAndroid ||
                typeof window.KavachAndroid
                    .analyseSelectedApk !== "function"
            ) {
                apkSelectionError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "एपीके जांच एंड्रॉइड ऐप से जुड़ी नहीं है।"
                        : "APK analysis is not connected to the Android app.";

                return;
            }

            analyseApkButton.disabled = true;

            selectedApkCard.classList.add(
                "apk-hidden"
            );

            apkResultCard.classList.add(
                "apk-hidden"
            );

            apkScanningCard.classList.remove(
                "apk-hidden"
            );

            apkScanningCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            window.KavachAndroid
                .analyseSelectedApk();
        }
    );


    /*
     * Display English/Hindi analysis result.
     */
    function displayApkResult(result) {

        if (!result) {

            window.onApkAnalysisError(
                getSelectedLanguage() === "hi"
                    ? "एपीके परिणाम उपलब्ध नहीं है।"
                    : "APK result is unavailable."
            );

            return;
        }

        currentResult = result;

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


        apkScanningCard.classList.add(
            "apk-hidden"
        );

        selectedApkCard.classList.add(
            "apk-hidden"
        );

        apkResultCard.classList.remove(
            "apk-hidden"
        );


        apkRiskBadge.textContent =
            result.level || "SUSPICIOUS";

        apkRiskBadge.classList.remove(
            "apk-risk-low",
            "apk-risk-suspicious",
            "apk-risk-high"
        );


        if (result.level === "LOW") {

            apkRiskBadge.classList.add(
                "apk-risk-low"
            );

            apkResultTitle.textContent =
                isHindi
                    ? "कोई जाना-पहचाना खतरा नहीं"
                    : "No known danger detected";
        }


        if (result.level === "SUSPICIOUS") {

            apkRiskBadge.classList.add(
                "apk-risk-suspicious"
            );

            apkResultTitle.textContent =
                isHindi
                    ? "संदिग्ध"
                    : "Suspicious";
        }


        if (result.level === "HIGH") {

            apkRiskBadge.classList.add(
                "apk-risk-high"
            );

            apkResultTitle.textContent =
                isHindi
                    ? "बहुत अधिक जोखिम"
                    : "High risk";
        }


        apkResultSummary.textContent =
            summary || "";

        apkRecommendedAction.textContent =
            action || "";

        apkApplicationName.textContent =
            result.appName ||
            (
                isHindi
                    ? "अज्ञात"
                    : "Unknown"
            );

        apkPackageName.textContent =
            result.packageName ||
            (
                isHindi
                    ? "अज्ञात"
                    : "Unknown"
            );

        apkTargetSdk.textContent =
            result.targetSdk
                ? "API " + result.targetSdk
                : (
                    isHindi
                        ? "अज्ञात"
                        : "Unknown"
                );

        apkFileHash.textContent =
            result.sha256 ||
            (
                isHindi
                    ? "उपलब्ध नहीं"
                    : "Not available"
            );


        apkReasonList.innerHTML = "";

        if (
            Array.isArray(reasons) &&
            reasons.length > 0
        ) {
            reasons.forEach(function (reason) {

                const listItem =
                    document.createElement("li");

                listItem.textContent =
                    reason;

                apkReasonList.appendChild(
                    listItem
                );
            });

        } else {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                isHindi
                    ? "कोई विशिष्ट कारण उपलब्ध नहीं है।"
                    : "No specific reason is available.";

            apkReasonList.appendChild(
                listItem
            );
        }


        apkVoiceLanguage.textContent =
            isHindi
                ? "हिन्दी"
                : "English";

        apkVoiceStatus.textContent =
            isHindi
                ? "परिणाम सुनने के लिए Play दबाएं"
                : "Tap Play to hear the result";


        /*
         * HIGH-risk APK:
         * trusted contact is informed,
         * installation button remains hidden.
         */
        if (result.level === "HIGH") {

            continueInstallationButton
                .classList.add(
                    "apk-hidden"
                );

            apkTrustedAlertCard
                .classList.remove(
                    "apk-hidden"
                );

            apkTrustedAlertStatus.textContent =
                result.trustedContactAlerted === true
                    ? (
                        isHindi
                            ? "विश्वसनीय संपर्क को अधिक जोखिम वाले एपीके के बारे में सूचित किया गया है।"
                            : "Your trusted contact was informed about this high-risk APK."
                    )
                    : (
                        isHindi
                            ? "विश्वसनीय संपर्क को सूचना नहीं भेजी जा सकी।"
                            : "The trusted-contact alert could not be sent."
                    );

        } else {

            apkTrustedAlertCard.classList.add(
                "apk-hidden"
            );

            continueInstallationButton
                .classList.remove(
                    "apk-hidden"
                );
        }


        apkResultCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /*
     * Kotlin callbacks.
     */
    window.onApkSelected =
        function (selectionJson) {

            const selection =
                parseNativeJson(
                    selectionJson
                );

            displaySelectedApk(
                selection
            );
        };


    window.onApkSelectionError =
        function (message) {

            analyseApkButton.disabled = false;

            apkScanningCard.classList.add(
                "apk-hidden"
            );

            apkSelectionError.textContent =
                message ||
                "Unable to select the APK.";
        };


    window.onApkAnalysisComplete =
        function (resultJson) {

            analyseApkButton.disabled = false;

            const result =
                parseNativeJson(
                    resultJson
                );

            displayApkResult(
                result
            );
        };


    window.onApkAnalysisError =
        function (message) {

            analyseApkButton.disabled = false;

            apkScanningCard.classList.add(
                "apk-hidden"
            );

            selectedApkCard.classList.remove(
                "apk-hidden"
            );

            apkSelectionError.textContent =
                message ||
                (
                    getSelectedLanguage() === "hi"
                        ? "एपीके की जांच नहीं हो सकी।"
                        : "The APK could not be analysed."
                );
        };


    /*
     * Play voice explanation.
     */
    apkPlayVoiceButton.addEventListener(
        "click",
        function () {

            if (!currentVoiceText) {
                return;
            }

            apkVoiceStatus.textContent =
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

                window.speechSynthesis.speak(
                    speech
                );
            }
        }
    );


    /*
     * Stop voice.
     */
    apkStopVoiceButton.addEventListener(
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

            apkVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ रोक दी गई"
                    : "Voice explanation stopped";
        }
    );


    window.onRiskVoiceStarted =
        function () {

            apkVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ चलाई जा रही है…"
                    : "Playing voice explanation…";
        };


    window.onRiskVoiceFinished =
        function () {

            apkVoiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ पूरी हुई"
                    : "Voice explanation finished";
        };


    window.onRiskVoiceError =
        function (message) {

            apkVoiceStatus.textContent =
                message ||
                "Voice is unavailable on this phone.";
        };


    /*
     * Delete selected APK.
     */
    deleteApkButton.addEventListener(
        "click",
        function () {

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .deleteSelectedApk === "function"
            ) {
                window.KavachAndroid
                    .deleteSelectedApk();

                return;
            }

            window.onApkDeleteResult(
                false,
                "Delete is not connected."
            );
        }
    );


    window.onApkDeleteResult =
        function (
            deleted,
            message
        ) {

            if (deleted === true) {

                resetApkPage();

                apkSelectionError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "एपीके फाइल हटा दी गई।"
                        : "The APK file was deleted.";

            } else {

                apkSelectionError.textContent =
                    message ||
                    (
                        getSelectedLanguage() === "hi"
                            ? "एपीके फाइल नहीं हटाई जा सकी।"
                            : "The APK file could not be deleted."
                    );
            }
        };


    /*
     * Continue to Android Package Installer.
     */
    continueInstallationButton.addEventListener(
        "click",
        function () {

            if (
                !currentResult ||
                currentResult.level === "HIGH"
            ) {
                return;
            }

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .continueApkInstallation === "function"
            ) {
                window.KavachAndroid
                    .continueApkInstallation();
            }
        }
    );


    /*
     * Check another APK.
     */
    checkAnotherApkButton.addEventListener(
        "click",
        function () {

            resetApkPage();

            selectApkButton.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    );


    function resetApkPage() {

        selectedApkAvailable = false;

        currentResult = null;

        currentVoiceText = "";

        apkFileInput.value = "";

        apkScanningCard.classList.add(
            "apk-hidden"
        );

        selectedApkCard.classList.add(
            "apk-hidden"
        );

        apkResultCard.classList.add(
            "apk-hidden"
        );

        apkSelectionError.textContent = "";

        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .clearSelectedApk === "function"
        ) {
            window.KavachAndroid
                .clearSelectedApk();
        }
    }


    /*
     * Reload visible result when the language changes.
     */
    window.addEventListener(
        "kavachLanguageChanged",
        function () {

            if (currentResult) {
                displayApkResult(
                    currentResult
                );
            }
        }
    );


    /*
     * Check whether MainActivity received an APK
     * through Open with or Share.
     */
    if (
        window.KavachAndroid &&
        typeof window.KavachAndroid
            .getPendingApkSelection === "function"
    ) {
        const pendingSelection =
            parseNativeJson(
                window.KavachAndroid
                    .getPendingApkSelection()
            );

        if (
            pendingSelection &&
            pendingSelection.name
        ) {
            displaySelectedApk(
                pendingSelection
            );
        }
    }
});