document.addEventListener("DOMContentLoaded", function () {

    const phoneStep =
        document.getElementById("phoneStep");

    const otpStep =
        document.getElementById("otpStep");

    const contactStep =
        document.getElementById("contactStep");

    const phoneNumber =
        document.getElementById("phoneNumber") ||
        document.getElementById("loginPhone");

    const otpNumber =
        document.getElementById("otpNumber") ||
        document.getElementById("otpCode");

    const changeNumberButton =
        document.getElementById("changeNumberButton") ||
        document.getElementById("backToPhoneButton");

    const resendOtpButton =
        document.getElementById("resendOtpButton");

    /*
     * These selectors support both possible trusted-contact
     * element names.
     */
    const contactForm =
        document.getElementById("contactForm") ||
        document.getElementById("trustedContactForm") ||
        document.getElementById("onboardingContactForm") ||
        contactStep.querySelector("form");

    const contactName =
        document.getElementById("contactName") ||
        document.getElementById("trustedContactName") ||
        document.getElementById("onboardingContactName") ||
        contactStep.querySelector('input[type="text"]');

    const contactPhone =
        document.getElementById("contactPhone") ||
        document.getElementById("trustedContactPhone") ||
        document.getElementById("onboardingContactPhone") ||
        contactStep.querySelector('input[type="tel"]');

    const contactConsent =
        document.getElementById("contactConsent") ||
        document.getElementById("alertConsent") ||
        document.getElementById("onboardingConsent") ||
        contactStep.querySelector('input[type="checkbox"]');

    const completeSetupButton =
        document.getElementById("completeSetupButton") ||
        contactStep.querySelector('button[type="submit"]');

    let userPhoneNumber = "";
    let resendTimer = null;


    function keepOnlyNumbers(input, maximumLength) {

        if (!input) {
            return;
        }

        input.value = input.value
            .replace(/\D/g, "")
            .slice(0, maximumLength);
    }


    function setText(elementId, message) {

        const element =
            document.getElementById(elementId);

        if (element) {
            element.textContent = message;
        }
    }


    function setFirstAvailableText(
        elementIds,
        message
    ) {
        for (const elementId of elementIds) {

            const element =
                document.getElementById(elementId);

            if (element) {
                element.textContent = message;
                return;
            }
        }
    }


    /*
     * Update Phone, OTP and Contact progress indicators.
     */
    function updateProgress(stepName) {

        const progressPhone =
            document.getElementById("progressPhone");

        const progressOtp =
            document.getElementById("progressOtp");

        const progressContact =
            document.getElementById("progressContact");

        const linePhoneOtp =
            document.getElementById("linePhoneOtp");

        const lineOtpContact =
            document.getElementById("lineOtpContact");

        const progressItems = [
            progressPhone,
            progressOtp,
            progressContact
        ];

        progressItems.forEach(function (item) {
            if (item) {
                item.classList.remove(
                    "active",
                    "complete"
                );
            }
        });

        if (linePhoneOtp) {
            linePhoneOtp.classList.remove("complete");
        }

        if (lineOtpContact) {
            lineOtpContact.classList.remove("complete");
        }


        if (stepName === "phone") {

            if (progressPhone) {
                progressPhone.classList.add("active");
            }
        }


        if (stepName === "otp") {

            if (progressPhone) {
                progressPhone.classList.add("complete");
            }

            if (progressOtp) {
                progressOtp.classList.add("active");
            }

            if (linePhoneOtp) {
                linePhoneOtp.classList.add("complete");
            }
        }


        if (stepName === "contact") {

            if (progressPhone) {
                progressPhone.classList.add("complete");
            }

            if (progressOtp) {
                progressOtp.classList.add("complete");
            }

            if (progressContact) {
                progressContact.classList.add("active");
            }

            if (linePhoneOtp) {
                linePhoneOtp.classList.add("complete");
            }

            if (lineOtpContact) {
                lineOtpContact.classList.add("complete");
            }
        }
    }


    /*
     * Display one onboarding step.
     */
    function showStep(stepName) {

        const allSteps = [
            phoneStep,
            otpStep,
            contactStep
        ];

        allSteps.forEach(function (step) {

            if (!step) {
                return;
            }

            step.classList.remove(
                "active-step",
                "active-panel"
            );

            step.setAttribute(
                "aria-hidden",
                "true"
            );
        });


        let selectedStep = null;

        if (stepName === "phone") {
            selectedStep = phoneStep;
        }

        if (stepName === "otp") {
            selectedStep = otpStep;
        }

        if (stepName === "contact") {
            selectedStep = contactStep;
        }


        if (selectedStep) {

            /*
             * Support both CSS class names.
             */
            selectedStep.classList.add(
                "active-step",
                "active-panel"
            );

            selectedStep.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        updateProgress(stepName);

        window.scrollTo(0, 0);
    }


    /*
     * Phone-number input.
     */
    if (phoneNumber) {

        phoneNumber.addEventListener(
            "input",
            function () {

                keepOnlyNumbers(
                    phoneNumber,
                    10
                );

                setText(
                    "phoneError",
                    ""
                );
            }
        );
    }


    /*
     * OTP input.
     */
    if (otpNumber) {

        otpNumber.addEventListener(
            "input",
            function () {

                keepOnlyNumbers(
                    otpNumber,
                    6
                );

                setText(
                    "otpError",
                    ""
                );
            }
        );
    }


    /*
     * Trusted-contact phone input.
     */
    if (contactPhone) {

        contactPhone.addEventListener(
            "input",
            function () {

                keepOnlyNumbers(
                    contactPhone,
                    10
                );

                setFirstAvailableText(
                    [
                        "contactPhoneError",
                        "trustedContactPhoneError"
                    ],
                    ""
                );
            }
        );
    }


    /*
     * Request OTP.
     */
    const phoneForm =
        document.getElementById("phoneForm");

    if (phoneForm) {

        phoneForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const phone =
                    phoneNumber
                        ? phoneNumber.value.trim()
                        : "";

                setText("phoneError", "");
                setText("phoneStatus", "");

                if (!/^[6-9]\d{9}$/.test(phone)) {

                    setText(
                        "phoneError",
                        "Enter a valid 10-digit Indian mobile number."
                    );

                    return;
                }

                userPhoneNumber = phone;

                setText(
                    "phoneStatus",
                    "Sending OTP…"
                );

                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid.sendOtp
                        === "function"
                ) {
                    window.KavachAndroid.sendOtp(
                        "+91" + phone
                    );
                } else {
                    setText(
                        "phoneStatus",
                        "Android authentication is not connected."
                    );
                }
            }
        );
    }


    /*
     * Verify OTP.
     */
    const otpForm =
        document.getElementById("otpForm");

    if (otpForm) {

        otpForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const otp =
                    otpNumber
                        ? otpNumber.value.trim()
                        : "";

                setText("otpError", "");
                setText("otpStatus", "");

                if (!/^\d{6}$/.test(otp)) {

                    setText(
                        "otpError",
                        "Enter the complete 6-digit OTP."
                    );

                    return;
                }

                setText(
                    "otpStatus",
                    "Verifying OTP…"
                );

                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid.verifyOtp
                        === "function"
                ) {
                    window.KavachAndroid.verifyOtp(otp);
                } else {
                    setText(
                        "otpStatus",
                        "Android authentication is not connected."
                    );
                }
            }
        );
    }


    /*
     * Return from OTP to Phone.
     */
    if (changeNumberButton) {

        changeNumberButton.addEventListener(
            "click",
            function () {

                if (otpNumber) {
                    otpNumber.value = "";
                }

                showStep("phone");
            }
        );
    }


    /*
     * Resend OTP.
     */
    if (resendOtpButton) {

        resendOtpButton.addEventListener(
            "click",
            function () {

                if (
                    userPhoneNumber &&
                    window.KavachAndroid &&
                    typeof window.KavachAndroid.sendOtp
                        === "function"
                ) {
                    window.KavachAndroid.sendOtp(
                        "+91" + userPhoneNumber
                    );
                }
            }
        );
    }


    /*
     * Mandatory trusted-contact form.
     *
     * This was missing from the previous login.js,
     * which caused the Login → OTP → Contact → Login loop.
     */
    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (event) {

                /*
                 * Important: stop HTML form reload.
                 */
                event.preventDefault();

                const name =
                    contactName
                        ? contactName.value.trim()
                        : "";

                const phone =
                    contactPhone
                        ? contactPhone.value.trim()
                        : "";

                const consentGiven =
                    contactConsent
                        ? contactConsent.checked
                        : false;

                setFirstAvailableText(
                    [
                        "contactNameError",
                        "trustedContactNameError"
                    ],
                    ""
                );

                setFirstAvailableText(
                    [
                        "contactPhoneError",
                        "trustedContactPhoneError"
                    ],
                    ""
                );

                setFirstAvailableText(
                    [
                        "contactConsentError",
                        "consentError"
                    ],
                    ""
                );

                setFirstAvailableText(
                    [
                        "contactStatus",
                        "trustedContactStatus"
                    ],
                    ""
                );

                let formIsValid = true;


                if (name.length < 2) {

                    setFirstAvailableText(
                        [
                            "contactNameError",
                            "trustedContactNameError"
                        ],
                        "Enter the trusted contact's name."
                    );

                    formIsValid = false;
                }


                if (!/^[6-9]\d{9}$/.test(phone)) {

                    setFirstAvailableText(
                        [
                            "contactPhoneError",
                            "trustedContactPhoneError"
                        ],
                        "Enter a valid 10-digit Indian mobile number."
                    );

                    formIsValid = false;

                } else if (
                    userPhoneNumber &&
                    phone === userPhoneNumber
                ) {

                    setFirstAvailableText(
                        [
                            "contactPhoneError",
                            "trustedContactPhoneError"
                        ],
                        "Trusted contact must be different from your number."
                    );

                    formIsValid = false;
                }


                if (!consentGiven) {

                    setFirstAvailableText(
                        [
                            "contactConsentError",
                            "consentError"
                        ],
                        "Permission is required for high-risk alerts."
                    );

                    formIsValid = false;
                }


                if (!formIsValid) {
                    return;
                }


                setFirstAvailableText(
                    [
                        "contactStatus",
                        "trustedContactStatus"
                    ],
                    "Saving trusted contact…"
                );


                if (completeSetupButton) {
                    completeSetupButton.disabled = true;
                }


                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid
                        .saveTrustedContact === "function"
                ) {

                    window.KavachAndroid
                        .saveTrustedContact(
                            name,
                            "+91" + phone
                        );

                } else {

                    if (completeSetupButton) {
                        completeSetupButton.disabled = false;
                    }

                    setFirstAvailableText(
                        [
                            "contactStatus",
                            "trustedContactStatus"
                        ],
                        "Android trusted-contact storage is not connected."
                    );
                }
            }
        );
    }


    /*
     * Called by Kotlin after OTP is sent.
     */
    window.onOtpSent = function () {

        setText(
            "phoneStatus",
            ""
        );

        const otpPhoneDisplay =
            document.getElementById(
                "otpPhoneDisplay"
            );

        if (otpPhoneDisplay) {

            otpPhoneDisplay.textContent =
                "+91 ••••••" +
                userPhoneNumber.slice(-4);
        }

        showStep("otp");

        if (otpNumber) {
            otpNumber.focus();
        }
    };


    /*
     * Called by Kotlin after OTP verification.
     */
    window.onOtpVerified = function () {

        setText(
            "otpStatus",
            "Mobile number verified successfully."
        );

        window.setTimeout(
            function () {
                showStep("contact");
            },
            400
        );
    };


    /*
     * Called when Kotlin/Firebase reports an error.
     */
    window.onAuthenticationError =
        function (message) {

            const errorMessage =
                message ||
                "Authentication failed. Please try again.";

            const contactVisible =
                contactStep &&
                (
                    contactStep.classList.contains(
                        "active-step"
                    ) ||
                    contactStep.classList.contains(
                        "active-panel"
                    )
                );

            const phoneVisible =
                phoneStep &&
                (
                    phoneStep.classList.contains(
                        "active-step"
                    ) ||
                    phoneStep.classList.contains(
                        "active-panel"
                    )
                );


            if (contactVisible) {

                setFirstAvailableText(
                    [
                        "contactStatus",
                        "trustedContactStatus"
                    ],
                    errorMessage
                );

                if (completeSetupButton) {
                    completeSetupButton.disabled = false;
                }

            } else if (phoneVisible) {

                setText(
                    "phoneStatus",
                    errorMessage
                );

            } else {

                setText(
                    "otpStatus",
                    errorMessage
                );
            }
        };


    /*
     * Support the older Kotlin callback name too.
     */
    window.onAuthError =
        window.onAuthenticationError;


    /*
     * Fresh page starts from Phone.
     *
     * If Firebase is already authenticated but setup is
     * incomplete, MainActivity calls onOtpVerified after
     * the page finishes loading.
     */
    showStep("phone");
});