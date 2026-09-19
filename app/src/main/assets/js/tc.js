document.addEventListener("DOMContentLoaded", function () {

    /*
     * Main Menu → Trusted Contact navigation.
     */
    const trustedContactMenuButton =
        document.querySelector(".button.contact");

    if (trustedContactMenuButton) {
        trustedContactMenuButton.addEventListener(
            "click",
            function () {
                window.location.href = "tc.html";
            }
        );
    }


    /*
     * Stop here if this is not tc.html.
     */
    const trustedContactForm =
        document.getElementById(
            "trustedContactForm"
        );

    if (!trustedContactForm) {
        return;
    }


    const contactFormCard =
        trustedContactForm.closest(
            ".tc-card"
        );

    const contactName =
        document.getElementById(
            "contactName"
        );

    const contactPhone =
        document.getElementById(
            "contactPhone"
        );

    const alertConsent =
        document.getElementById(
            "alertConsent"
        );

    const contactNameError =
        document.getElementById(
            "contactNameError"
        );

    const contactPhoneError =
        document.getElementById(
            "contactPhoneError"
        );

    const consentError =
        document.getElementById(
            "consentError"
        );

    const saveContactMessage =
        document.getElementById(
            "saveContactMessage"
        );

    const saveContactButton =
        document.getElementById(
            "saveContactButton"
        );

    const savedContactPanel =
        document.getElementById(
            "savedContactPanel"
        );

    const savedContactName =
        document.getElementById(
            "savedContactName"
        );

    const savedContactPhone =
        document.getElementById(
            "savedContactPhone"
        );

    const editContactButton =
        document.getElementById(
            "editContactButton"
        );

    const removeContactButton =
        document.getElementById(
            "removeContactButton"
        );


    let currentSavedContact = null;


    function getSelectedLanguage() {

        return localStorage.getItem(
            "kavachLanguage"
        ) === "hi"
            ? "hi"
            : "en";
    }


    function keepOnlyNumbers(
        input,
        maximumLength
    ) {

        input.value =
            input.value
                .replace(/\D/g, "")
                .slice(0, maximumLength);
    }


    function formatPhoneNumber(
        phoneNumber
    ) {

        const digits =
            String(phoneNumber)
                .replace(/\D/g, "")
                .slice(-10);

        if (digits.length !== 10) {
            return phoneNumber;
        }

        return (
            "+91 " +
            digits.slice(0, 5) +
            " " +
            digits.slice(5)
        );
    }


    /*
     * Show the saved-contact card.
     */
    function showSavedContact(
        name,
        phone
    ) {

        currentSavedContact = {
            name: name,
            phone: phone
        };

        savedContactName.textContent =
            name;

        savedContactPhone.textContent =
            formatPhoneNumber(phone);

        if (contactFormCard) {
            contactFormCard.classList.add(
                "tc-hidden"
            );
        }

        savedContactPanel.classList.remove(
            "tc-hidden"
        );
    }


    /*
     * Show the contact form.
     */
    function showContactForm(
        contact
    ) {

        savedContactPanel.classList.add(
            "tc-hidden"
        );

        if (contactFormCard) {
            contactFormCard.classList.remove(
                "tc-hidden"
            );
        }

        if (contact) {

            contactName.value =
                contact.name || "";

            contactPhone.value =
                String(contact.phone || "")
                    .replace(/\D/g, "")
                    .slice(-10);

            alertConsent.checked = true;

        } else {

            contactName.value = "";
            contactPhone.value = "";
            alertConsent.checked = false;
        }

        contactName.focus();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /*
     * Read the saved contact from Kotlin.
     */
    function loadSavedContact() {

        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid
                .getTrustedContact === "function"
        ) {
            try {

                const contactJson =
                    window.KavachAndroid
                        .getTrustedContact();

                const contact =
                    JSON.parse(contactJson);

                if (
                    contact.name &&
                    contact.phone
                ) {
                    showSavedContact(
                        contact.name,
                        contact.phone
                    );

                    return;
                }

            } catch (error) {
                /*
                 * If native data cannot be read,
                 * show the empty form.
                 */
            }
        }

        showContactForm(null);
    }


    /*
     * Contact-name validation.
     */
    contactName.addEventListener(
        "input",
        function () {

            contactNameError.textContent =
                "";
        }
    );


    /*
     * Contact-phone validation.
     */
    contactPhone.addEventListener(
        "input",
        function () {

            keepOnlyNumbers(
                contactPhone,
                10
            );

            contactPhoneError.textContent =
                "";
        }
    );


    alertConsent.addEventListener(
        "change",
        function () {

            consentError.textContent =
                "";
        }
    );


    /*
     * Save or update Trusted Contact.
     */
    trustedContactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                contactName.value.trim();

            const phone =
                contactPhone.value.trim();

            const consentGiven =
                alertConsent.checked;

            contactNameError.textContent = "";
            contactPhoneError.textContent = "";
            consentError.textContent = "";
            saveContactMessage.textContent = "";

            let formIsValid = true;

            const isHindi =
                getSelectedLanguage() === "hi";


            if (name.length < 2) {

                contactNameError.textContent =
                    isHindi
                        ? "विश्वसनीय संपर्क का नाम दर्ज करें।"
                        : "Enter the trusted contact's name.";

                formIsValid = false;
            }


            if (!/^[6-9]\d{9}$/.test(phone)) {

                contactPhoneError.textContent =
                    isHindi
                        ? "सही 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
                        : "Enter a valid 10-digit Indian mobile number.";

                formIsValid = false;
            }


            if (!consentGiven) {

                consentError.textContent =
                    isHindi
                        ? "सुरक्षा अलर्ट के लिए अनुमति आवश्यक है।"
                        : "Permission is required for safety alerts.";

                formIsValid = false;
            }


            if (!formIsValid) {
                return;
            }


            saveContactButton.disabled =
                true;

            saveContactMessage.textContent =
                isHindi
                    ? "विश्वसनीय संपर्क सेव किया जा रहा है…"
                    : "Saving trusted contact…";


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

                saveContactButton.disabled =
                    false;

                saveContactMessage.textContent =
                    isHindi
                        ? "एंड्रॉइड संपर्क स्टोरेज उपलब्ध नहीं है।"
                        : "Android contact storage is unavailable.";
            }
        }
    );


    /*
     * Edit saved contact.
     */
    if (editContactButton) {

        editContactButton.addEventListener(
            "click",
            function () {

                showContactForm(
                    currentSavedContact
                );
            }
        );
    }


    /*
     * Remove is not enabled yet because deleting the
     * mandatory contact also affects SMS protection.
     */
    if (removeContactButton) {

        removeContactButton.addEventListener(
            "click",
            function () {

                saveContactMessage.textContent =
                    getSelectedLanguage() === "hi"
                        ? "विश्वसनीय संपर्क आवश्यक है। आप इसे बदल सकते हैं।"
                        : "A trusted contact is required. You can edit it instead.";
            }
        );
    }


    /*
     * Display Kotlin errors on this page.
     */
    window.onAuthenticationError =
        function (message) {

            saveContactButton.disabled =
                false;

            saveContactMessage.textContent =
                message ||
                "Unable to save trusted contact.";
        };


    window.onAuthError =
        window.onAuthenticationError;


    /*
     * Load contact as soon as tc.html opens.
     */
    loadSavedContact();
});