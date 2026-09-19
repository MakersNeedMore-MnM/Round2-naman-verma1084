document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /*
     * Main Menu → WhatsApp Check.
     */
    const whatsappButton =
        document.querySelector(
            ".button.whatsapp"
        );

    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "wa.html";
            }
        );
    }


    /*
     * Stop if this is not wa.html.
     */
    const messageInput =
        document.getElementById(
            "messageInput"
        );

    if (!messageInput) {
        return;
    }


    /*
     * WhatsApp page elements.
     */
    const characterCount =
        document.getElementById(
            "characterCount"
        );

    const messageError =
        document.getElementById(
            "messageError"
        );

    const clearMessageButton =
        document.getElementById(
            "clearMessageButton"
        );

    const pasteMessageButton =
        document.getElementById(
            "pasteMessageButton"
        );

    const checkMessageButton =
        document.getElementById(
            "checkMessageButton"
        );

    const riskResultCard =
        document.getElementById(
            "riskResultCard"
        );

    const riskLevelBadge =
        document.getElementById(
            "riskLevelBadge"
        );

    const riskResultTitle =
        document.getElementById(
            "riskResultTitle"
        );

    const riskResultSummary =
        document.getElementById(
            "riskResultSummary"
        );

    const riskReasonList =
        document.getElementById(
            "riskReasonList"
        );

    const recommendedAction =
        document.getElementById(
            "recommendedAction"
        );

    const playVoiceButton =
        document.getElementById(
            "playVoiceButton"
        );

    const stopVoiceButton =
        document.getElementById(
            "stopVoiceButton"
        );

    const voiceLanguageLabel =
        document.getElementById(
            "voiceLanguageLabel"
        );

    const voiceStatus =
        document.getElementById(
            "voiceStatus"
        );

    const checkAnotherMessageButton =
        document.getElementById(
            "checkAnotherMessageButton"
        );


    let currentVoiceText = "";
    let currentVoiceLanguage = "en";


    /*
     * Read selected app language.
     */
    function getSelectedLanguage() {

        const language =
            localStorage.getItem(
                "kavachLanguage"
            ) ||
            localStorage.getItem(
                "selectedLanguage"
            ) ||
            localStorage.getItem(
                "language"
            ) ||
            "en";

        return language === "hi"
            ? "hi"
            : "en";
    }


    function updateCharacterCount() {

        if (characterCount) {

            characterCount.textContent =
                String(
                    messageInput.value.length
                );
        }
    }


    /*
     * Add one unique risk reason.
     */
    function addReason(
        result,
        id,
        score,
        englishReason,
        hindiReason
    ) {

        const alreadyAdded =
            result.reasons.some(
                function (reason) {

                    return reason.id === id;
                }
            );

        if (alreadyAdded) {
            return;
        }

        result.score += score;

        result.reasons.push({
            id: id,
            en: englishReason,
            hi: hindiReason
        });
    }


    /*
     * Offline WhatsApp-message analysis.
     */
    function analyseMessage(
        originalMessage
    ) {

        const message =
            originalMessage
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        const result = {
            score: 0,
            level: "LOW",
            reasons: []
        };


        /*
         * Suspicious links.
         */
        const shortLink =
            /(bit\.ly|tinyurl|goo\.gl|cutt\.ly|rb\.gy|shorturl)/i
                .test(message);

        const normalLink =
            /(https?:\/\/|www\.|\.com\/|\.in\/|t\.me\/|wa\.me\/)/i
                .test(message);

        if (shortLink) {

            addReason(
                result,
                "short-link",
                3,
                "It contains a shortened or hidden link.",
                "इसमें छोटा या छिपा हुआ लिंक है।"
            );

        } else if (normalLink) {

            addReason(
                result,
                "link",
                2,
                "It contains an external link.",
                "इसमें एक बाहरी लिंक है।"
            );
        }


        /*
         * OTP, PIN, password and CVV requests.
         */
        const sensitiveInformation =
            /(otp|one.time.password|pin|password|cvv|verification code|card number|bank details|ओटीपी|पिन|पासवर्ड|सीवीवी)/i
                .test(message);

        const informationRequest =
            /(share|send|tell|provide|enter|submit|reply|forward|verify|confirm|बताओ|भेजो|साझा|दर्ज|शेयर|फॉरवर्ड)/i
                .test(message);

        const safetyWarning =
            /(do not share|never share|don't share|मत बताना|मत भेजना|साझा न करें|शेयर न करें)/i
                .test(message);

        if (
            sensitiveInformation &&
            informationRequest &&
            !safetyWarning
        ) {

            addReason(
                result,
                "private-information",
                5,
                "It asks for an OTP, PIN, password or other private information.",
                "यह ओटीपी, पिन, पासवर्ड या निजी जानकारी मांगता है।"
            );
        }


        /*
         * Money and payment requests.
         */
        const moneyRequest =
            /(send money|transfer money|pay now|payment required|upi|scan qr|security deposit|processing fee|advance payment|refund fee|₹|rs\.?\s?\d+|पैसे भेजो|भुगतान|यूपीआई|क्यूआर|रुपये|जमा राशि)/i
                .test(message);

        if (moneyRequest) {

            addReason(
                result,
                "money",
                4,
                "It asks for money, payment or a UPI transaction.",
                "यह पैसे, भुगतान या यूपीआई लेन-देन के लिए कहता है।"
            );
        }


        /*
         * Urgency and pressure.
         */
        const urgency =
            /(urgent|immediately|right now|today only|last chance|act now|within \d+ minutes|जल्दी|तुरंत|अभी|आज ही|आखिरी मौका)/i
                .test(message);

        if (urgency) {

            addReason(
                result,
                "urgency",
                2,
                "It creates urgency and pressures you to act quickly.",
                "यह जल्दी करने का दबाव बनाता है।"
            );
        }


        /*
         * Account and legal threats.
         */
        const accountThreat =
            /(account.*blocked|account.*suspended|account.*freeze|sim.*blocked|kyc.*expired|legal action|police case|arrest|electricity.*disconnect|खाता.*बंद|सिम.*बंद|केवाईसी.*समाप्त|गिरफ्तार|कानूनी कार्रवाई|बिजली.*काट)/i
                .test(message);

        if (accountThreat) {

            addReason(
                result,
                "threat",
                4,
                "It threatens account blocking, legal action or service disconnection.",
                "यह खाता बंद करने, कानूनी कार्रवाई या सेवा काटने की धमकी देता है।"
            );
        }


        /*
         * Prize, reward and refund scams.
         */
        const prizeClaim =
            /(won|winner|lottery|prize|reward|free gift|cashback|refund approved|claim now|इनाम|लॉटरी|विजेता|मुफ्त उपहार|कैशबैक|रिफंड)/i
                .test(message);

        if (prizeClaim) {

            addReason(
                result,
                "prize",
                3,
                "It makes an unexpected prize, reward or refund claim.",
                "यह अचानक इनाम, पुरस्कार या रिफंड का दावा करता है।"
            );
        }


        /*
         * APK or remote-access application.
         */
        const dangerousApplication =
            /(download.*apk|install.*apk|anydesk|teamviewer|quicksupport|remote access|screen share|unknown app|एपीके|ऐप इंस्टॉल|स्क्रीन शेयर|रिमोट एक्सेस)/i
                .test(message);

        if (dangerousApplication) {

            addReason(
                result,
                "dangerous-app",
                5,
                "It asks you to install an APK or remote-access application.",
                "यह एपीके या रिमोट-एक्सेस ऐप इंस्टॉल करने के लिए कहता है।"
            );
        }


        /*
         * Fake officials and organisations.
         */
        const impersonation =
            /(bank officer|customer care|police officer|government official|income tax|rbi|cyber cell|courier officer|customs officer|बैंक अधिकारी|कस्टमर केयर|पुलिस अधिकारी|सरकारी अधिकारी|आरबीआई|कूरियर)/i
                .test(message);

        if (impersonation) {

            addReason(
                result,
                "impersonation",
                2,
                "The sender may be impersonating an official or trusted organisation.",
                "भेजने वाला किसी अधिकारी या भरोसेमंद संस्था की नकल कर सकता है।"
            );
        }


        /*
         * Secrecy request.
         */
        const secrecy =
            /(do not tell|keep this secret|don't inform|confidential transaction|किसी को मत बताना|गुप्त रखें|किसी को न बताएं)/i
                .test(message);

        if (secrecy) {

            addReason(
                result,
                "secrecy",
                3,
                "It asks you to hide the conversation or transaction.",
                "यह बातचीत या लेन-देन छिपाने के लिए कहता है।"
            );
        }


        /*
         * Add score for dangerous combinations.
         */
        if (
            (normalLink || shortLink) &&
            (
                urgency ||
                moneyRequest ||
                accountThreat ||
                prizeClaim
            )
        ) {
            result.score += 2;
        }


        /*
         * Final risk level.
         */
        if (result.score >= 7) {

            result.level = "HIGH";

        } else if (result.score >= 3) {

            result.level = "SUSPICIOUS";

        } else {

            result.level = "LOW";
        }


        if (result.reasons.length === 0) {

            result.reasons.push({
                id: "safe",
                en:
                    "No known dangerous pattern was found.",
                hi:
                    "कोई जाना-पहचाना खतरनाक पैटर्न नहीं मिला।"
            });
        }


        return result;
    }


    /*
     * Create English or Hindi result text.
     */
    function createResultText(
        result,
        language
    ) {

        const reasons =
            result.reasons
                .map(function (reason) {

                    return language === "hi"
                        ? reason.hi
                        : reason.en;
                })
                .join(" ");


        if (language === "hi") {

            if (result.level === "HIGH") {

                return {
                    title:
                        "बहुत अधिक जोखिम",

                    summary:
                        "यह संदेश बहुत जोखिम भरा लगता है।",

                    action:
                        "लिंक पर क्लिक न करें, पैसे न भेजें और ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें। आधिकारिक नंबर से पुष्टि करें।",

                    voice:
                        "सावधान। यह संदेश बहुत जोखिम भरा लगता है। " +
                        reasons +
                        " लिंक पर क्लिक न करें। पैसे न भेजें। ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें।"
                };
            }


            if (
                result.level ===
                "SUSPICIOUS"
            ) {

                return {
                    title:
                        "संदिग्ध",

                    summary:
                        "यह संदेश संदिग्ध लगता है।",

                    action:
                        "जवाब देने से पहले भेजने वाले की पहचान आधिकारिक नंबर से जांचें।",

                    voice:
                        "यह संदेश संदिग्ध लगता है। " +
                        reasons +
                        " जवाब देने से पहले भेजने वाले की सही पहचान जांचें।"
                };
            }


            return {
                title:
                    "कोई जाना-पहचाना खतरा नहीं",

                summary:
                    "कवच को इस संदेश में कोई जाना-पहचाना खतरा नहीं मिला।",

                action:
                    "यह संदेश कम जोखिम वाला लगता है, लेकिन अनजान भेजने वाले से सावधान रहें।",

                voice:
                    "कवच को इस संदेश में कोई जाना-पहचाना खतरा नहीं मिला। यह संदेश कम जोखिम वाला लगता है। फिर भी अनजान व्यक्ति के संदेश से सावधान रहें।"
            };
        }


        if (result.level === "HIGH") {

            return {
                title:
                    "High risk",

                summary:
                    "This message looks highly risky.",

                action:
                    "Do not click links, send money, or share an OTP, PIN, password or CVV. Verify the request using an official number.",

                voice:
                    "Warning. This message looks highly risky. " +
                    reasons +
                    " Do not click links, send money, or share your OTP, PIN, password or CVV."
            };
        }


        if (
            result.level ===
            "SUSPICIOUS"
        ) {

            return {
                title:
                    "Suspicious",

                summary:
                    "This message looks suspicious and should be verified.",

                action:
                    "Verify the sender using an official number before responding.",

                voice:
                    "This message looks suspicious. " +
                    reasons +
                    " Verify the sender before responding."
            };
        }


        return {
            title:
                "No known danger detected",

            summary:
                "Kavach did not find a known dangerous pattern.",

            action:
                "The message appears low risk, but remain careful if the sender is unknown.",

            voice:
                "Kavach did not find any known dangerous pattern in this message. It appears low risk, but remain careful if the sender is unknown."
        };
    }


    /*
     * Display result and return translated result text.
     */
    function displayResult(
        result
    ) {

        const language =
            getSelectedLanguage();

        const resultText =
            createResultText(
                result,
                language
            );

        currentVoiceLanguage =
            language;

        currentVoiceText =
            resultText.voice;

        riskLevelBadge.textContent =
            result.level;

        riskResultTitle.textContent =
            resultText.title;

        riskResultSummary.textContent =
            resultText.summary;

        recommendedAction.textContent =
            resultText.action;

        voiceLanguageLabel.textContent =
            language === "hi"
                ? "हिन्दी"
                : "English";

        voiceStatus.textContent =
            language === "hi"
                ? "परिणाम सुनने के लिए Play दबाएं"
                : "Tap Play to hear the result";


        riskLevelBadge.classList.remove(
            "risk-low",
            "risk-suspicious",
            "risk-high"
        );


        if (result.level === "LOW") {

            riskLevelBadge.classList.add(
                "risk-low"
            );
        }


        if (
            result.level ===
            "SUSPICIOUS"
        ) {

            riskLevelBadge.classList.add(
                "risk-suspicious"
            );
        }


        if (result.level === "HIGH") {

            riskLevelBadge.classList.add(
                "risk-high"
            );
        }


        riskReasonList.innerHTML = "";


        result.reasons.forEach(
            function (reason) {

                const listItem =
                    document.createElement(
                        "li"
                    );

                listItem.textContent =
                    language === "hi"
                        ? reason.hi
                        : reason.en;

                riskReasonList.appendChild(
                    listItem
                );
            }
        );


        riskResultCard.hidden = false;

        riskResultCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        /*
         * Keep existing optional HIGH trusted-contact
         * bridge behaviour if it exists.
         */
        if (
            result.level === "HIGH" &&
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .notifyTrustedContact ===
                "function"
        ) {

            window.KavachAndroid
                .notifyTrustedContact(
                    resultText.summary
                );
        }


        return resultText;
    }


    /*
     * Save SUSPICIOUS and HIGH WhatsApp results
     * in local Report Scam history.
     */
    function saveThreatToReportHistory(
        originalMessage,
        result,
        resultText
    ) {

        /*
         * LOW results are not stored.
         */
        if (result.level === "LOW") {
            return;
        }


        if (
            !window.KavachReport ||
            typeof window.KavachReport
                .saveWhatsAppThreat !==
                "function"
        ) {
            return;
        }


        const language =
            getSelectedLanguage();


        const translatedReasons =
            result.reasons.map(
                function (reason) {

                    return language === "hi"
                        ? reason.hi
                        : reason.en;
                }
            );


        try {

            window.KavachReport
                .saveWhatsAppThreat(
                    originalMessage,
                    result.level,
                    JSON.stringify(
                        translatedReasons
                    ),
                    resultText.action
                );

        } catch (error) {

            /*
             * History failure must not prevent the user
             * from viewing the WhatsApp risk result.
             */
            console.error(
                "Unable to save WhatsApp threat:",
                error
            );
        }
    }


    /*
     * Character counter.
     */
    messageInput.addEventListener(
        "input",
        function () {

            updateCharacterCount();

            messageError.textContent = "";
        }
    );


    /*
     * Clear message.
     */
    clearMessageButton.addEventListener(
        "click",
        function () {

            stopVoice();

            messageInput.value = "";

            if (characterCount) {
                characterCount.textContent = "0";
            }

            messageError.textContent = "";
            riskResultCard.hidden = true;

            currentVoiceText = "";
        }
    );


    /*
     * Paste copied message.
     */
    pasteMessageButton.addEventListener(
        "click",
        async function () {

            messageError.textContent = "";

            try {

                let copiedText = "";


                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid
                        .getClipboardText ===
                        "function"
                ) {

                    copiedText =
                        window.KavachAndroid
                            .getClipboardText();

                } else if (
                    navigator.clipboard &&
                    typeof navigator.clipboard
                        .readText ===
                        "function"
                ) {

                    copiedText =
                        await navigator.clipboard
                            .readText();
                }


                if (!copiedText) {

                    messageError.textContent =
                        getSelectedLanguage() === "hi"
                            ? "कोई कॉपी किया संदेश नहीं मिला। बॉक्स को दबाकर मैन्युअल रूप से पेस्ट करें।"
                            : "No copied message found. Press and hold the box to paste manually.";

                    return;
                }


                messageInput.value =
                    copiedText.slice(
                        0,
                        3000
                    );

                updateCharacterCount();

            } catch (error) {

                messageError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "संदेश बॉक्स को दबाकर रखें और पेस्ट चुनें।"
                        : "Press and hold the message box, then select Paste.";
            }
        }
    );


    /*
     * Analyse message.
     */
    checkMessageButton.addEventListener(
        "click",
        function () {

            stopVoice();

            const message =
                messageInput.value.trim();

            messageError.textContent = "";


            if (message.length < 5) {

                messageError.textContent =
                    getSelectedLanguage() === "hi"
                        ? "जांच से पहले पूरा संदेश पेस्ट करें।"
                        : "Paste a complete message before checking.";

                messageInput.focus();

                return;
            }


            const result =
                analyseMessage(
                    message
                );


            const resultText =
                displayResult(
                    result
                );


            /*
             * Save only SUSPICIOUS or HIGH results.
             */
            saveThreatToReportHistory(
                message,
                result,
                resultText
            );
        }
    );


    /*
     * Play voice explanation.
     */
    playVoiceButton.addEventListener(
        "click",
        function () {

            if (!currentVoiceText) {
                return;
            }


            voiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ चलाई जा रही है…"
                    : "Playing voice explanation…";


            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid
                    .speakRiskExplanation ===
                    "function"
            ) {

                window.KavachAndroid
                    .speakRiskExplanation(
                        currentVoiceText,
                        currentVoiceLanguage
                    );

                return;
            }


            /*
             * Browser speech fallback.
             */
            if (
                "speechSynthesis" in window
            ) {

                window.speechSynthesis
                    .cancel();

                const speech =
                    new SpeechSynthesisUtterance(
                        currentVoiceText
                    );

                speech.lang =
                    currentVoiceLanguage === "hi"
                        ? "hi-IN"
                        : "en-IN";

                speech.rate = 0.9;


                speech.onend =
                    function () {

                        voiceStatus.textContent =
                            currentVoiceLanguage === "hi"
                                ? "आवाज़ पूरी हुई"
                                : "Voice explanation finished";
                    };


                window.speechSynthesis
                    .speak(
                        speech
                    );
            }
        }
    );


    /*
     * Stop voice explanation.
     */
    function stopVoice() {

        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .stopRiskVoice ===
                "function"
        ) {

            window.KavachAndroid
                .stopRiskVoice();
        }


        if (
            "speechSynthesis" in window
        ) {

            window.speechSynthesis
                .cancel();
        }


        if (voiceStatus) {

            voiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ रोक दी गई"
                    : "Voice explanation stopped";
        }
    }


    stopVoiceButton.addEventListener(
        "click",
        stopVoice
    );


    /*
     * Kotlin TTS callbacks.
     */
    window.onRiskVoiceStarted =
        function () {

            voiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ चलाई जा रही है…"
                    : "Playing voice explanation…";
        };


    window.onRiskVoiceFinished =
        function () {

            voiceStatus.textContent =
                currentVoiceLanguage === "hi"
                    ? "आवाज़ पूरी हुई"
                    : "Voice explanation finished";
        };


    window.onRiskVoiceError =
        function (message) {

            voiceStatus.textContent =
                message ||
                "Voice is unavailable on this device.";
        };


    /*
     * Check another message.
     */
    checkAnotherMessageButton.addEventListener(
        "click",
        function () {

            stopVoice();

            messageInput.value = "";

            if (characterCount) {
                characterCount.textContent = "0";
            }

            messageError.textContent = "";
            riskResultCard.hidden = true;

            currentVoiceText = "";

            messageInput.focus();

            messageInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    );


    updateCharacterCount();
});