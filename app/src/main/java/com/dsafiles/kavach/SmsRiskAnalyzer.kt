package com.dsafiles.kavach

/*
 * Result returned after offline SMS analysis.
 */
data class SmsRiskResult(

    val level: String,

    val score: Int,

    val reasonsEnglish: List<String>,

    val reasonsHindi: List<String>,

    val summaryEnglish: String,

    val summaryHindi: String,

    val actionEnglish: String,

    val actionHindi: String,

    val voiceEnglish: String,

    val voiceHindi: String
)


/*
 * Offline SMS risk analyser.
 *
 * No internet, server or cloud AI is required.
 */
object SmsRiskAnalyzer {

    fun analyse(
        originalMessage: String
    ): SmsRiskResult {

        val message =
            originalMessage
                .lowercase()
                .replace(
                    Regex("\\s+"),
                    " "
                )
                .trim()

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
         * Detect links.
         */
        val containsShortLink =
            containsPattern(
                message,
                """
                bit\.ly|
                tinyurl|
                goo\.gl|
                cutt\.ly|
                rb\.gy|
                shorturl
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        val containsNormalLink =
            containsPattern(
                message,
                """
                https?://|
                www\.|
                \.com/|
                \.in/|
                t\.me/|
                wa\.me/
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsShortLink) {

            addReason(
                3,
                "The message contains a shortened or hidden link.",
                "संदेश में छोटा या छिपा हुआ लिंक है।"
            )

        } else if (containsNormalLink) {

            addReason(
                2,
                "The message contains an external link.",
                "संदेश में एक बाहरी लिंक है।"
            )
        }


        /*
         * Detect requests for private information.
         */
        val containsSensitiveWord =
            containsPattern(
                message,
                """
                otp|
                one.?time.?password|
                pin|
                password|
                cvv|
                card.number|
                bank.details|
                verification.code|
                ओटीपी|
                पिन|
                पासवर्ड|
                सीवीवी
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        val containsRequestWord =
            containsPattern(
                message,
                """
                share|
                send|
                tell|
                provide|
                enter|
                submit|
                reply|
                forward|
                verify|
                confirm|
                बताओ|
                भेजो|
                साझा|
                दर्ज|
                शेयर|
                फॉरवर्ड
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        val isSafetyAdvice =
            containsPattern(
                message,
                """
                do.not.share|
                never.share|
                don't.share|
                मत.बताना|
                मत.भेजना|
                साझा.न.करें|
                शेयर.न.करें
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (
            containsSensitiveWord &&
            containsRequestWord &&
            !isSafetyAdvice
        ) {
            addReason(
                5,
                "The message asks for an OTP, PIN, password or other private information.",
                "संदेश ओटीपी, पिन, पासवर्ड या दूसरी निजी जानकारी मांगता है।"
            )
        }


        /*
         * Detect money, QR and UPI requests.
         */
        val containsMoneyRequest =
            containsPattern(
                message,
                """
                send.money|
                transfer.money|
                pay.now|
                payment.required|
                upi|
                scan.qr|
                security.deposit|
                processing.fee|
                advance.payment|
                refund.fee|
                ₹|
                rs\.?\s?\d+|
                पैसे.भेजो|
                भुगतान|
                यूपीआई|
                क्यूआर|
                रुपये|
                जमा.राशि
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsMoneyRequest) {
            addReason(
                4,
                "The message asks for money, payment or a UPI transaction.",
                "संदेश पैसे, भुगतान या यूपीआई लेन-देन के लिए कहता है।"
            )
        }


        /*
         * Detect urgency and pressure.
         */
        val containsUrgency =
            containsPattern(
                message,
                """
                urgent|
                immediately|
                right.now|
                today.only|
                last.chance|
                act.now|
                within.\d+.minutes|
                जल्दी|
                तुरंत|
                अभी|
                आज.ही|
                आखिरी.मौका
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsUrgency) {
            addReason(
                2,
                "The message creates urgency and pressures the user to act quickly.",
                "संदेश जल्दी करने का दबाव बनाता है।"
            )
        }


        /*
         * Detect account, SIM and legal threats.
         */
        val containsThreat =
            containsPattern(
                message,
                """
                account.*blocked|
                account.*suspended|
                account.*freeze|
                sim.*blocked|
                kyc.*expired|
                legal.action|
                police.case|
                arrest|
                electricity.*disconnect|
                खाता.*बंद|
                सिम.*बंद|
                केवाईसी.*समाप्त|
                गिरफ्तारी|
                कानूनी.कार्रवाई|
                बिजली.*काट
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsThreat) {
            addReason(
                4,
                "The message threatens account blocking, legal action or service disconnection.",
                "संदेश खाता बंद करने, कानूनी कार्रवाई या सेवा काटने की धमकी देता है।"
            )
        }


        /*
         * Detect prizes, lotteries and fake refunds.
         */
        val containsPrizeClaim =
            containsPattern(
                message,
                """
                won|
                winner|
                lottery|
                prize|
                reward|
                free.gift|
                cashback|
                refund.approved|
                claim.now|
                इनाम|
                लॉटरी|
                विजेता|
                मुफ्त.उपहार|
                कैशबैक|
                रिफंड
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsPrizeClaim) {
            addReason(
                3,
                "The message makes an unexpected prize, reward or refund claim.",
                "संदेश अचानक इनाम, पुरस्कार या रिफंड का दावा करता है।"
            )
        }


        /*
         * Detect APK and remote-access applications.
         */
        val containsDangerousApplication =
            containsPattern(
                message,
                """
                download.*apk|
                install.*apk|
                anydesk|
                teamviewer|
                quicksupport|
                remote.access|
                screen.share|
                unknown.app|
                एपीके|
                ऐप.इंस्टॉल|
                स्क्रीन.शेयर|
                रिमोट.एक्सेस
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsDangerousApplication) {
            addReason(
                5,
                "The message asks the user to install an APK or remote-access application.",
                "संदेश एपीके या रिमोट-एक्सेस ऐप इंस्टॉल करने के लिए कहता है।"
            )
        }


        /*
         * Detect impersonation.
         */
        val containsImpersonation =
            containsPattern(
                message,
                """
                bank.officer|
                customer.care|
                police.officer|
                government.official|
                income.tax|
                rbi|
                cyber.cell|
                courier.officer|
                customs.officer|
                बैंक.अधिकारी|
                कस्टमर.केयर|
                पुलिस.अधिकारी|
                सरकारी.अधिकारी|
                आरबीआई|
                कूरियर
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsImpersonation) {
            addReason(
                2,
                "The sender may be impersonating an official or trusted organisation.",
                "भेजने वाला किसी अधिकारी या भरोसेमंद संस्था की नकल कर सकता है।"
            )
        }


        /*
         * Detect requests for secrecy.
         */
        val containsSecrecyRequest =
            containsPattern(
                message,
                """
                do.not.tell|
                keep.this.secret|
                don't.inform|
                confidential.transaction|
                किसी.को.मत.बताना|
                गुप्त.रखें|
                किसी.को.न.बताएं
                """.trimIndent()
                    .replace(
                        "\n",
                        ""
                    )
            )

        if (containsSecrecyRequest) {
            addReason(
                3,
                "The message asks the user to hide the conversation or transaction.",
                "संदेश बातचीत या लेन-देन छिपाने के लिए कहता है।"
            )
        }


        /*
         * Dangerous combinations increase the score.
         */
        if (
            (
                    containsShortLink ||
                            containsNormalLink
                    ) &&
            (
                    containsUrgency ||
                            containsMoneyRequest ||
                            containsThreat ||
                            containsPrizeClaim
                    )
        ) {
            score += 2
        }


        val level =
            when {
                score >= 7 -> "HIGH"
                score >= 3 -> "SUSPICIOUS"
                else -> "LOW"
            }


        if (reasonsEnglish.isEmpty()) {

            reasonsEnglish.add(
                "No known dangerous pattern was found."
            )

            reasonsHindi.add(
                "कोई जाना-पहचाना खतरनाक संकेत नहीं मिला।"
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
                    "This SMS looks highly risky."

                summaryHindi =
                    "यह एसएमएस बहुत जोखिम भरा लगता है।"

                actionEnglish =
                    "Do not click links, send money, or share an OTP, PIN, password or CVV. Verify the request using an official number."

                actionHindi =
                    "लिंक पर क्लिक न करें, पैसे न भेजें और ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें। आधिकारिक नंबर से पुष्टि करें।"

                voiceEnglish =
                    "Warning. This SMS looks highly risky. " +
                            reasonsEnglish.joinToString(
                                " "
                            ) +
                            " Do not click links, send money, or share private information."

                voiceHindi =
                    "सावधान। यह एसएमएस बहुत जोखिम भरा लगता है। " +
                            reasonsHindi.joinToString(
                                " "
                            ) +
                            " लिंक पर क्लिक न करें, पैसे न भेजें और निजी जानकारी साझा न करें।"
            }


            "SUSPICIOUS" -> {

                summaryEnglish =
                    "This SMS looks suspicious."

                summaryHindi =
                    "यह एसएमएस संदिग्ध लगता है।"

                actionEnglish =
                    "Verify the sender using an official number before responding."

                actionHindi =
                    "जवाब देने से पहले आधिकारिक नंबर से भेजने वाले की पहचान जांचें।"

                voiceEnglish =
                    "This SMS looks suspicious. " +
                            reasonsEnglish.joinToString(
                                " "
                            ) +
                            " Verify the sender before responding."

                voiceHindi =
                    "यह एसएमएस संदिग्ध लगता है। " +
                            reasonsHindi.joinToString(
                                " "
                            ) +
                            " जवाब देने से पहले भेजने वाले की पहचान जांचें।"
            }


            else -> {

                summaryEnglish =
                    "No known danger was detected."

                summaryHindi =
                    "कोई जाना-पहचाना खतरा नहीं मिला।"

                actionEnglish =
                    "The SMS appears low risk, but remain careful if the sender is unknown."

                actionHindi =
                    "यह एसएमएस कम जोखिम वाला लगता है, लेकिन अनजान भेजने वाले से सावधान रहें।"

                voiceEnglish =
                    "Kavach did not find any known dangerous pattern in this SMS. It appears low risk."

                voiceHindi =
                    "कवच को इस एसएमएस में कोई जाना-पहचाना खतरा नहीं मिला। यह कम जोखिम वाला लगता है।"
            }
        }


        return SmsRiskResult(
            level = level,
            score = score,
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


    private fun containsPattern(
        message: String,
        pattern: String
    ): Boolean {

        return Regex(
            pattern,
            RegexOption.IGNORE_CASE
        ).containsMatchIn(
            message
        )
    }
}