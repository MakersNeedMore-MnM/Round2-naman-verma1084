document.addEventListener("DOMContentLoaded", function () {

    const smsButton =
        document.querySelector(".button.sms");

    if (smsButton) {
        smsButton.addEventListener("click", function () {
            window.location.href = "sms.html";
        });
    }


    const whatsappButton =
        document.querySelector(".button.whatsapp");

    if (whatsappButton) {
        whatsappButton.addEventListener("click", function () {
            window.location.href = "wa.html";
        });
    }


    const apkButton =
        document.querySelector(".button.apk");

    if (apkButton) {
        apkButton.addEventListener("click", function () {
            window.location.href = "apk.html";
        });
    }


    const contactButton =
        document.querySelector(".button.contact");

    if (contactButton) {
        contactButton.addEventListener("click", function () {
            window.location.href = "tc.html";
        });
    }


    const reportButton =
        document.querySelector(".button.report");

    if (reportButton) {
        reportButton.addEventListener("click", function () {
            window.location.href = "report.html";
        });
    }


    const settingsButton =
        document.querySelector(".button.settings");

    if (settingsButton) {
        settingsButton.addEventListener("click", function () {
            window.location.href = "setting.html";
        });
    }
});