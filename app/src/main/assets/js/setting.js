document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /*
     * Main Menu → Settings navigation.
     */
    const settingsButton =
        document.querySelector(
            ".button.settings"
        );

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "setting.html";
            }
        );
    }


    /*
     * Language controls.
     */
    const languageSelect =
        document.getElementById(
            "languageSelect"
        );

    const saveLanguageButton =
        document.getElementById(
            "saveLanguageButton"
        );


    function getSavedLanguage() {

        const saved =
            localStorage.getItem(
                "kavachLanguage"
            );

        return saved === "hi"
            ? "hi"
            : "en";
    }


    if (languageSelect) {

        languageSelect.value =
            getSavedLanguage();
    }


    if (
        languageSelect &&
        saveLanguageButton
    ) {

        saveLanguageButton.addEventListener(
            "click",
            function () {

                const selectedLanguage =
                    languageSelect.value === "hi"
                        ? "hi"
                        : "en";


                /*
                 * Save language in WebView storage.
                 */
                localStorage.setItem(
                    "kavachLanguage",
                    selectedLanguage
                );

                localStorage.setItem(
                    "selectedLanguage",
                    selectedLanguage
                );

                localStorage.setItem(
                    "language",
                    selectedLanguage
                );


                /*
                 * Save language in Android preferences.
                 */
                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid
                        .saveLanguage ===
                        "function"
                ) {

                    window.KavachAndroid
                        .saveLanguage(
                            selectedLanguage
                        );
                }


                /*
                 * Apply language immediately.
                 */
                if (
                    window.KavachLanguage &&
                    typeof window.KavachLanguage
                        .apply ===
                        "function"
                ) {

                    window.KavachLanguage
                        .apply(
                            selectedLanguage
                        );
                }


                saveLanguageButton.textContent =
                    selectedLanguage === "hi"
                        ? "भाषा लागू हो गई"
                        : "Language applied";


                /*
                 * Reload after a short delay so all
                 * dynamically generated content also
                 * uses the newly selected language.
                 */
                setTimeout(
                    function () {

                        window.location.reload();
                    },
                    400
                );
            }
        );
    }


    /*
     * Display saved trusted contact.
     */
    const savedContactName =
        document.getElementById(
            "savedContactName"
        );

    const savedContactPhone =
        document.getElementById(
            "savedContactPhone"
        );


    function displayTrustedContact() {

        if (
            !savedContactName ||
            !savedContactPhone
        ) {
            return;
        }


        const isHindi =
            getSavedLanguage() === "hi";


        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .getTrustedContact ===
                "function"
        ) {

            try {

                const contactJson =
                    window.KavachAndroid
                        .getTrustedContact();

                const contact =
                    JSON.parse(
                        contactJson
                    );


                if (
                    contact.name &&
                    contact.phone
                ) {

                    savedContactName.textContent =
                        contact.name;

                    savedContactPhone.textContent =
                        contact.phone;

                } else {

                    savedContactName.textContent =
                        isHindi
                            ? "कोई विश्वसनीय संपर्क नहीं जोड़ा गया"
                            : "No trusted contact added";

                    savedContactPhone.textContent =
                        isHindi
                            ? "अलर्ट चालू करने के लिए विश्वसनीय संपर्क जोड़ें।"
                            : "Add a trusted contact to enable alerts.";
                }

            } catch (error) {

                savedContactName.textContent =
                    isHindi
                        ? "कोई विश्वसनीय संपर्क नहीं जोड़ा गया"
                        : "No trusted contact added";

                savedContactPhone.textContent =
                    isHindi
                        ? "विश्वसनीय संपर्क की जानकारी लोड नहीं हो सकी।"
                        : "Unable to load trusted-contact details.";
            }
        }
    }


    /*
     * Logout.
     */
    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    getSavedLanguage() === "hi"
                        ? "लॉग आउट हो रहा है…"
                        : "Logging out…";


                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid
                        .logout ===
                        "function"
                ) {

                    window.KavachAndroid
                        .logout();

                } else {

                    logoutButton.disabled = false;

                    logoutButton.textContent =
                        getSavedLanguage() === "hi"
                            ? "लॉग आउट"
                            : "Log Out";
                }
            }
        );
    }


    displayTrustedContact();
});