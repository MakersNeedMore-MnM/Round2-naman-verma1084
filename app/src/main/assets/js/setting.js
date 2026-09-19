document.addEventListener("DOMContentLoaded", function () {

    /*
     * Main Menu → Settings
     */
    const settingsButton =
        document.querySelector(".button.settings");

    if (settingsButton) {
        settingsButton.addEventListener("click", function () {
            window.location.href = "setting.html";
        });
    }


    /*
     * Display saved trusted contact.
     */
    const savedContactName =
        document.getElementById("savedContactName");

    const savedContactPhone =
        document.getElementById("savedContactPhone");


    function displayTrustedContact() {

        if (!savedContactName || !savedContactPhone) {
            return;
        }

        if (
            window.KavachAndroid &&
            typeof window.KavachAndroid.getTrustedContact
                === "function"
        ) {
            try {

                const contactJson =
                    window.KavachAndroid.getTrustedContact();

                const contact =
                    JSON.parse(contactJson);

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
                        "No trusted contact added";

                    savedContactPhone.textContent =
                        "Add a trusted contact to enable alerts.";
                }

            } catch (error) {

                savedContactName.textContent =
                    "No trusted contact added";

                savedContactPhone.textContent =
                    "Unable to load trusted-contact details.";
            }
        }
    }


    /*
     * Logout
     */
    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {

            logoutButton.disabled = true;
            logoutButton.textContent =
                "Logging out...";

            if (
                window.KavachAndroid &&
                typeof window.KavachAndroid.logout
                    === "function"
            ) {
                window.KavachAndroid.logout();
            } else {
                logoutButton.disabled = false;
                logoutButton.textContent =
                    "Log Out";
            }
        });
    }


    /*
     * Load saved contact when Settings opens.
     */
    displayTrustedContact();
});