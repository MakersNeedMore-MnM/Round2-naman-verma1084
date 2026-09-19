document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* ========================================
       STATE
       ======================================== */

    let currentTypeFilter = "ALL";
    let currentStatusFilter = "ALL";
    let currentRecords = [];
    let selectedRecord = null;
    let deleteConfirmationTimer = null;


    /* ========================================
       ELEMENTS
       ======================================== */

    const pendingCount =
        document.getElementById("pendingCount");

    const savedThreatCount =
        document.getElementById("savedThreatCount");

    const threatList =
        document.getElementById("threatList");

    const emptyHistoryState =
        document.getElementById("emptyHistoryState");

    const filterEmptyState =
        document.getElementById("filterEmptyState");

    const recordsLoadingState =
        document.getElementById("recordsLoadingState");

    const threatCardTemplate =
        document.getElementById("threatCardTemplate");

    const filterButtons =
        document.querySelectorAll(".filter-button");

    const statusFilter =
        document.getElementById("statusFilter");

    const recordDetailView =
        document.getElementById("recordDetailView");

    const reportPreparationView =
        document.getElementById("reportPreparationView");

    const closeDetailButton =
        document.getElementById("closeDetailButton");

    const backToDetailButton =
        document.getElementById("backToDetailButton");

    const detailTitle =
        document.getElementById("detailTitle");

    const detailRiskBadge =
        document.getElementById("detailRiskBadge");

    const detailType =
        document.getElementById("detailType");

    const detailDate =
        document.getElementById("detailDate");

    const detailSenderRow =
        document.getElementById("detailSenderRow");

    const detailSender =
        document.getElementById("detailSender");

    const detailApkNameRow =
        document.getElementById("detailApkNameRow");

    const detailApkName =
        document.getElementById("detailApkName");

    const detailPackageRow =
        document.getElementById("detailPackageRow");

    const detailPackageName =
        document.getElementById("detailPackageName");

    const detailHashRow =
        document.getElementById("detailHashRow");

    const detailHash =
        document.getElementById("detailHash");

    const detailPreview =
        document.getElementById("detailPreview");

    const detailReasons =
        document.getElementById("detailReasons");

    const keepRecordToggle =
        document.getElementById("keepRecordToggle");

    const prepareSelectedReportButton =
        document.getElementById(
            "prepareSelectedReportButton"
        );

    const dismissRecordButton =
        document.getElementById(
            "dismissRecordButton"
        );

    const deleteRecordButton =
        document.getElementById(
            "deleteRecordButton"
        );

    const generateSummaryButton =
        document.getElementById(
            "generateSummaryButton"
        );

    const additionalInformation =
        document.getElementById(
            "additionalInformation"
        );

    const preparedSummarySection =
        document.getElementById(
            "preparedSummarySection"
        );

    const preparedSummary =
        document.getElementById(
            "preparedSummary"
        );

    const copySummaryButton =
        document.getElementById(
            "copySummaryButton"
        );

    const officialActionSection =
        document.getElementById(
            "officialActionSection"
        );

    const officialActionDescription =
        document.getElementById(
            "officialActionDescription"
        );

    const call1930Button =
        document.getElementById(
            "call1930Button"
        );

    const openCyberCrimeButton =
        document.getElementById(
            "openCyberCrimeButton"
        );

    const openChakshuButton =
        document.getElementById(
            "openChakshuButton"
        );

    const whatsappInstructionsButton =
        document.getElementById(
            "whatsappInstructionsButton"
        );

    const askTrustedContactButton =
        document.getElementById(
            "askTrustedContactButton"
        );

    const reportCompletionSection =
        document.getElementById(
            "reportCompletionSection"
        );

    const markReportedButton =
        document.getElementById(
            "markReportedButton"
        );

    const keepPendingButton =
        document.getElementById(
            "keepPendingButton"
        );

    const emergencyCallButton =
        document.getElementById(
            "emergencyCallButton"
        );


    const listPageSections =
        Array.from(
            document.querySelectorAll(
                ".page-container > section"
            )
        ).filter(function (section) {

            return (
                section.id !== "recordDetailView" &&
                section.id !== "reportPreparationView"
            );
        });


    /* ========================================
       LANGUAGE
       ======================================== */

    function getLanguage() {

        const saved =
            localStorage.getItem(
                "kavachLanguage"
            );

        return saved === "hi"
            ? "hi"
            : "en";
    }


    function text(
        englishText,
        hindiText
    ) {

        return getLanguage() === "hi"
            ? hindiText
            : englishText;
    }


    /* ========================================
       NATIVE BRIDGE
       ======================================== */

    function hasReportBridge() {

        return Boolean(
            window.KavachReport
        );
    }


    function parseNativeResult(
        rawResult
    ) {

        try {

            if (
                typeof rawResult === "object" &&
                rawResult !== null
            ) {
                return rawResult;
            }

            return JSON.parse(
                String(rawResult || "{}")
            );

        } catch (error) {

            console.error(
                "Unable to parse native result:",
                error
            );

            return {
                success: false,
                message:
                    "Unable to read native response."
            };
        }
    }


    /* ========================================
       PAGE VIEW MANAGEMENT
       ======================================== */

    function showListView() {

        listPageSections.forEach(function (section) {
            section.hidden = false;
        });

        recordDetailView.hidden = true;
        reportPreparationView.hidden = true;

        renderRecords();

        window.scrollTo(
            0,
            0
        );
    }


    function showDetailView() {

        listPageSections.forEach(function (section) {
            section.hidden = true;
        });

        reportPreparationView.hidden = true;
        recordDetailView.hidden = false;

        window.scrollTo(
            0,
            0
        );
    }


    function showPreparationView() {

        listPageSections.forEach(function (section) {
            section.hidden = true;
        });

        recordDetailView.hidden = true;
        reportPreparationView.hidden = false;

        resetPreparationForm();

        window.scrollTo(
            0,
            0
        );
    }


    /* ========================================
       LOAD RECORDS
       ======================================== */

    function loadRecords() {

        recordsLoadingState.hidden = false;
        emptyHistoryState.hidden = true;
        filterEmptyState.hidden = true;
        threatList.hidden = true;

        if (!hasReportBridge()) {

            currentRecords = [];

            pendingCount.textContent = "0";
            savedThreatCount.textContent = "0";

            recordsLoadingState.hidden = true;

            renderRecords();

            return;
        }

        try {

            const rawResult =
                window.KavachReport
                    .getThreatRecords(
                        currentTypeFilter,
                        currentStatusFilter
                    );

            const result =
                parseNativeResult(
                    rawResult
                );

            if (!result.success) {

                console.error(
                    result.message ||
                    "Unable to load records."
                );

                currentRecords = [];

                pendingCount.textContent = "0";
                savedThreatCount.textContent = "0";

            } else {

                currentRecords =
                    Array.isArray(result.records)
                        ? result.records
                        : [];

                pendingCount.textContent =
                    String(
                        result.pendingCount || 0
                    );

                savedThreatCount.textContent =
                    String(
                        result.totalCount || 0
                    );
            }

        } catch (error) {

            console.error(
                "Unable to load report history:",
                error
            );

            currentRecords = [];

            pendingCount.textContent = "0";
            savedThreatCount.textContent = "0";
        }

        recordsLoadingState.hidden = true;

        renderRecords();
    }


    /* ========================================
       RENDER RECORDS
       ======================================== */

    function renderRecords() {

        threatList.innerHTML = "";

        if (currentRecords.length === 0) {

            threatList.hidden = true;

            const isFiltering =
                currentTypeFilter !== "ALL" ||
                currentStatusFilter !== "ALL";

            emptyHistoryState.hidden =
                isFiltering;

            filterEmptyState.hidden =
                !isFiltering;

            return;
        }

        emptyHistoryState.hidden = true;
        filterEmptyState.hidden = true;
        threatList.hidden = false;

        currentRecords.forEach(function (record) {

            const card =
                createThreatCard(
                    record
                );

            threatList.appendChild(
                card
            );
        });
    }


    function createThreatCard(
        record
    ) {

        const fragment =
            threatCardTemplate.content
                .cloneNode(true);

        const card =
            fragment.querySelector(
                ".threat-card"
            );

        const recordIcon =
            fragment.querySelector(
                "[data-record-icon]"
            );

        const riskBadge =
            fragment.querySelector(
                "[data-record-risk]"
            );

        const typeElement =
            fragment.querySelector(
                "[data-record-type]"
            );

        const titleElement =
            fragment.querySelector(
                "[data-record-title]"
            );

        const previewElement =
            fragment.querySelector(
                "[data-record-preview]"
            );

        const senderRow =
            fragment.querySelector(
                "[data-sender-row]"
            );

        const senderElement =
            fragment.querySelector(
                "[data-record-sender]"
            );

        const packageRow =
            fragment.querySelector(
                "[data-package-row]"
            );

        const packageElement =
            fragment.querySelector(
                "[data-record-package]"
            );

        const dateElement =
            fragment.querySelector(
                "[data-record-date]"
            );

        const repeatRow =
            fragment.querySelector(
                "[data-repeat-row]"
            );

        const repeatElement =
            fragment.querySelector(
                "[data-record-count]"
            );

        const statusElement =
            fragment.querySelector(
                "[data-record-status]"
            );

        const expiryElement =
            fragment.querySelector(
                "[data-record-expiry]"
            );

        const pinButton =
            fragment.querySelector(
                "[data-pin-button]"
            );

        const viewButton =
            fragment.querySelector(
                "[data-view-button]"
            );

        const prepareButton =
            fragment.querySelector(
                "[data-prepare-button]"
            );


        card.dataset.recordId =
            String(record.id);


        recordIcon.textContent =
            getRecordIcon(
                record.threatType
            );


        riskBadge.textContent =
            getRiskLabel(
                record.riskLevel
            );

        riskBadge.classList.remove(
            "high",
            "suspicious"
        );

        riskBadge.classList.add(
            record.riskLevel === "HIGH"
                ? "high"
                : "suspicious"
        );


        typeElement.textContent =
            getTypeLabel(
                record.threatType
            );


        titleElement.textContent =
            getRecordTitle(
                record
            );


        previewElement.textContent =
            record.safeContent ||
            text(
                "No preview available.",
                "कोई पूर्वावलोकन उपलब्ध नहीं है।"
            );


        if (
            record.threatType === "APK"
        ) {
            senderRow.hidden = true;
            packageRow.hidden = false;

            packageElement.textContent =
                record.packageName ||
                "—";

        } else {
            senderRow.hidden = false;
            packageRow.hidden = true;

            senderElement.textContent =
                record.maskedSender ||
                text(
                    "Unknown",
                    "अज्ञात"
                );
        }


        dateElement.textContent =
            formatDate(
                record.lastDetectedAt ||
                record.detectedAt
            );


        if (
            Number(record.repeatCount) > 1
        ) {
            repeatRow.hidden = false;

            repeatElement.textContent =
                text(
                    `${record.repeatCount} times`,
                    `${record.repeatCount} बार`
                );

        } else {
            repeatRow.hidden = true;
        }


        statusElement.textContent =
            getStatusLabel(
                record.reportStatus
            );


        expiryElement.textContent =
            getExpiryLabel(
                record
            );


        pinButton.setAttribute(
            "aria-pressed",
            record.isPinned
                ? "true"
                : "false"
        );

        pinButton.querySelector("span")
            .textContent =
                record.isPinned
                    ? "★"
                    : "☆";


        pinButton.addEventListener(
            "click",
            function () {

                togglePin(
                    record.id,
                    !record.isPinned
                );
            }
        );


        viewButton.addEventListener(
            "click",
            function () {

                openRecordDetails(
                    record.id
                );
            }
        );


        prepareButton.addEventListener(
            "click",
            function () {

                openRecordDetails(
                    record.id,
                    true
                );
            }
        );


        return fragment;
    }


    /* ========================================
       RECORD LABELS
       ======================================== */

    function getRecordIcon(
        threatType
    ) {

        switch (threatType) {

            case "SMS":
                return "SMS";

            case "WHATSAPP":
                return "WA";

            case "APK":
                return "APK";

            default:
                return "!";
        }
    }


    function getTypeLabel(
        threatType
    ) {

        switch (threatType) {

            case "SMS":
                return text(
                    "SMS",
                    "एसएमएस"
                );

            case "WHATSAPP":
                return text(
                    "WhatsApp",
                    "व्हाट्सऐप"
                );

            case "APK":
                return text(
                    "APK",
                    "एपीके"
                );

            default:
                return text(
                    "Threat",
                    "खतरा"
                );
        }
    }


    function getRiskLabel(
        riskLevel
    ) {

        if (riskLevel === "HIGH") {

            return text(
                "HIGH RISK",
                "अधिक जोखिम"
            );
        }

        return text(
            "SUSPICIOUS",
            "संदिग्ध"
        );
    }


    function getRecordTitle(
        record
    ) {

        if (
            record.threatType === "SMS"
        ) {
            return record.riskLevel === "HIGH"
                ? text(
                    "Possible high-risk SMS scam",
                    "संभावित अधिक जोखिम वाला एसएमएस घोटाला"
                )
                : text(
                    "Possible suspicious SMS",
                    "संभावित संदिग्ध एसएमएस"
                );
        }


        if (
            record.threatType === "WHATSAPP"
        ) {
            return record.riskLevel === "HIGH"
                ? text(
                    "Possible high-risk WhatsApp scam",
                    "संभावित अधिक जोखिम वाला व्हाट्सऐप घोटाला"
                )
                : text(
                    "Possible suspicious WhatsApp message",
                    "संभावित संदिग्ध व्हाट्सऐप संदेश"
                );
        }


        if (
            record.threatType === "APK"
        ) {
            const name =
                record.apkName ||
                record.apkFileName;

            if (name) {
                return name;
            }

            return record.riskLevel === "HIGH"
                ? text(
                    "Possible high-risk APK",
                    "संभावित अधिक जोखिम वाला एपीके"
                )
                : text(
                    "Possible suspicious APK",
                    "संभावित संदिग्ध एपीके"
                );
        }


        return record.title ||
            text(
                "Possible threat",
                "संभावित खतरा"
            );
    }


    function getStatusLabel(
        status
    ) {

        switch (status) {

            case "PREPARED":
                return text(
                    "Prepared",
                    "तैयार"
                );

            case "REPORTED":
                return text(
                    "Reported",
                    "रिपोर्ट किया गया"
                );

            case "DISMISSED":
                return text(
                    "Dismissed",
                    "खारिज"
                );

            default:
                return text(
                    "Pending",
                    "लंबित"
                );
        }
    }


    function formatDate(
        timestamp
    ) {

        const numericTime =
            Number(timestamp);

        if (
            !numericTime ||
            Number.isNaN(numericTime)
        ) {
            return "—";
        }

        try {

            return new Intl.DateTimeFormat(
                getLanguage() === "hi"
                    ? "hi-IN"
                    : "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                }
            ).format(
                new Date(numericTime)
            );

        } catch (error) {

            return new Date(
                numericTime
            ).toLocaleString();
        }
    }


    function getExpiryLabel(
        record
    ) {

        if (record.isPinned) {

            return text(
                "Kept until deleted",
                "हटाने तक सुरक्षित"
            );
        }

        const remaining =
            Number(record.expiresAt) -
            Date.now();

        const days =
            Math.max(
                0,
                Math.ceil(
                    remaining /
                    (24 * 60 * 60 * 1000)
                )
            );

        return text(
            `${days} days remaining`,
            `${days} दिन शेष`
        );
    }


    /* ========================================
       FILTERS
       ======================================== */

    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                currentTypeFilter =
                    button.dataset.filter ||
                    "ALL";

                filterButtons.forEach(
                    function (item) {

                        const isActive =
                            item === button;

                        item.classList.toggle(
                            "active",
                            isActive
                        );

                        item.setAttribute(
                            "aria-pressed",
                            isActive
                                ? "true"
                                : "false"
                        );
                    }
                );

                loadRecords();
            }
        );
    });


    statusFilter.addEventListener(
        "change",
        function () {

            currentStatusFilter =
                statusFilter.value ||
                "ALL";

            loadRecords();
        }
    );


    /* ========================================
       RECORD DETAILS
       ======================================== */

    function openRecordDetails(
        recordId,
        openPreparationImmediately
    ) {

        let record =
            currentRecords.find(
                function (item) {

                    return Number(item.id) ===
                        Number(recordId);
                }
            );


        if (
            !record &&
            hasReportBridge()
        ) {
            try {

                const result =
                    parseNativeResult(
                        window.KavachReport
                            .getThreatRecord(
                                Number(recordId)
                            )
                    );

                if (result.success) {
                    record = result.record;
                }

            } catch (error) {

                console.error(
                    "Unable to open record:",
                    error
                );
            }
        }


        if (!record) {
            return;
        }


        selectedRecord = record;

        fillDetailView(
            record
        );


        if (openPreparationImmediately) {
            showPreparationView();
        } else {
            showDetailView();
        }
    }


    function fillDetailView(
        record
    ) {

        detailTitle.textContent =
            getRecordTitle(
                record
            );


        detailRiskBadge.textContent =
            getRiskLabel(
                record.riskLevel
            );

        detailRiskBadge.classList.remove(
            "high",
            "suspicious"
        );

        detailRiskBadge.classList.add(
            record.riskLevel === "HIGH"
                ? "high"
                : "suspicious"
        );


        detailType.textContent =
            getTypeLabel(
                record.threatType
            );


        detailDate.textContent =
            formatDate(
                record.lastDetectedAt ||
                record.detectedAt
            );


        if (
            record.threatType === "APK"
        ) {
            detailSenderRow.hidden = true;

            detailApkNameRow.hidden = false;
            detailPackageRow.hidden = false;
            detailHashRow.hidden = false;

            detailApkName.textContent =
                record.apkName ||
                record.apkFileName ||
                "—";

            detailPackageName.textContent =
                record.packageName ||
                "—";

            detailHash.textContent =
                record.apkSha256 ||
                "—";

        } else {
            detailSenderRow.hidden = false;

            detailApkNameRow.hidden = true;
            detailPackageRow.hidden = true;
            detailHashRow.hidden = true;

            detailSender.textContent =
                record.maskedSender ||
                text(
                    "Unknown",
                    "अज्ञात"
                );
        }


        detailPreview.textContent =
            record.safeContent ||
            "—";


        detailReasons.innerHTML = "";

        const reasons =
            Array.isArray(record.reasons)
                ? record.reasons
                : [];


        if (reasons.length === 0) {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                text(
                    "Kavach detected suspicious indicators.",
                    "कवच ने संदिग्ध संकेत पाए।"
                );

            detailReasons.appendChild(
                listItem
            );

        } else {

            reasons.forEach(function (reason) {

                const listItem =
                    document.createElement("li");

                listItem.textContent =
                    String(reason);

                detailReasons.appendChild(
                    listItem
                );
            });
        }


        keepRecordToggle.checked =
            Boolean(record.isPinned);


        resetDeleteButton();
    }


    /* ========================================
       PIN, DISMISS AND DELETE
       ======================================== */

    function togglePin(
        recordId,
        pinned
    ) {

        if (!hasReportBridge()) {
            return;
        }

        try {

            const result =
                parseNativeResult(
                    window.KavachReport
                        .setRecordPinned(
                            Number(recordId),
                            Boolean(pinned)
                        )
                );

            if (result.success) {

                if (
                    selectedRecord &&
                    Number(selectedRecord.id) ===
                    Number(recordId)
                ) {
                    selectedRecord.isPinned =
                        Boolean(pinned);

                    keepRecordToggle.checked =
                        Boolean(pinned);
                }

                loadRecords();
            }

        } catch (error) {

            console.error(
                "Unable to pin record:",
                error
            );
        }
    }


    keepRecordToggle.addEventListener(
        "change",
        function () {

            if (!selectedRecord) {
                return;
            }

            togglePin(
                selectedRecord.id,
                keepRecordToggle.checked
            );
        }
    );


    dismissRecordButton.addEventListener(
        "click",
        function () {

            if (
                !selectedRecord ||
                !hasReportBridge()
            ) {
                return;
            }

            const result =
                parseNativeResult(
                    window.KavachReport
                        .updateReportStatus(
                            Number(selectedRecord.id),
                            "DISMISSED"
                        )
                );

            if (result.success) {
                selectedRecord = null;
                loadRecords();
                showListView();
            }
        }
    );


    deleteRecordButton.addEventListener(
        "click",
        function () {

            if (!selectedRecord) {
                return;
            }


            if (
                deleteRecordButton.dataset
                    .confirmDelete !== "true"
            ) {
                deleteRecordButton.dataset
                    .confirmDelete = "true";

                deleteRecordButton.textContent =
                    text(
                        "Tap again to permanently delete",
                        "स्थायी रूप से हटाने के लिए फिर टैप करें"
                    );

                clearTimeout(
                    deleteConfirmationTimer
                );

                deleteConfirmationTimer =
                    setTimeout(
                        resetDeleteButton,
                        4000
                    );

                return;
            }


            if (!hasReportBridge()) {
                return;
            }


            const result =
                parseNativeResult(
                    window.KavachReport
                        .deleteThreatRecord(
                            Number(selectedRecord.id)
                        )
                );


            if (result.success) {

                clearTimeout(
                    deleteConfirmationTimer
                );

                selectedRecord = null;

                loadRecords();
                showListView();
            }
        }
    );


    function resetDeleteButton() {

        clearTimeout(
            deleteConfirmationTimer
        );

        deleteRecordButton.dataset
            .confirmDelete = "false";

        deleteRecordButton.textContent =
            text(
                "Delete this record",
                "यह रिकॉर्ड हटाएं"
            );
    }


    /* ========================================
       REPORT PREPARATION
       ======================================== */

    prepareSelectedReportButton.addEventListener(
        "click",
        function () {

            if (!selectedRecord) {
                return;
            }

            showPreparationView();
        }
    );


    function resetPreparationForm() {

        document
            .querySelectorAll(
                'input[name="lossStatus"]'
            )
            .forEach(function (radio) {
                radio.checked = false;
            });

        additionalInformation.value = "";
        preparedSummary.value = "";

        preparedSummarySection.hidden = true;
        officialActionSection.hidden = true;
        reportCompletionSection.hidden = true;

        call1930Button.hidden = true;
        openCyberCrimeButton.hidden = true;
        openChakshuButton.hidden = true;
        whatsappInstructionsButton.hidden = true;
    }


    generateSummaryButton.addEventListener(
        "click",
        function () {

            if (!selectedRecord) {
                return;
            }

            const selectedLossOption =
                document.querySelector(
                    'input[name="lossStatus"]:checked'
                );


            if (!selectedLossOption) {

                generateSummaryButton.textContent =
                    text(
                        "Please choose Yes, No or Not sure",
                        "कृपया हां, नहीं या निश्चित नहीं चुनें"
                    );

                setTimeout(
                    function () {

                        generateSummaryButton.textContent =
                            text(
                                "Generate Safe Summary",
                                "सुरक्षित सारांश तैयार करें"
                            );
                    },
                    2500
                );

                return;
            }


            const lossStatus =
                selectedLossOption.value;


            preparedSummary.value =
                createReportSummary(
                    selectedRecord,
                    lossStatus,
                    additionalInformation.value
                );


            preparedSummarySection.hidden = false;
            officialActionSection.hidden = false;
            reportCompletionSection.hidden = false;


            configureOfficialActions(
                selectedRecord,
                lossStatus
            );


            if (hasReportBridge()) {

                try {

                    window.KavachReport
                        .updateReportStatus(
                            Number(selectedRecord.id),
                            "PREPARED"
                        );

                } catch (error) {

                    console.error(
                        "Unable to mark prepared:",
                        error
                    );
                }
            }


            preparedSummarySection
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }
    );


    function createReportSummary(
        record,
        lossStatus,
        additionalText
    ) {

        const safeAdditionalText =
            redactSensitiveInformation(
                additionalText
            );


        const lines = [];


        lines.push(
            text(
                "KAVACH INCIDENT SUMMARY",
                "कवच घटना सारांश"
            )
        );

        lines.push(
            "------------------------------"
        );


        lines.push(
            text(
                `Incident type: ${getTypeLabel(record.threatType)}`,
                `घटना का प्रकार: ${getTypeLabel(record.threatType)}`
            )
        );


        lines.push(
            text(
                `Risk level: ${getRiskLabel(record.riskLevel)}`,
                `जोखिम स्तर: ${getRiskLabel(record.riskLevel)}`
            )
        );


        lines.push(
            text(
                `Detected: ${formatDate(record.detectedAt)}`,
                `पता चला: ${formatDate(record.detectedAt)}`
            )
        );


        if (
            record.threatType === "SMS"
        ) {
            lines.push(
                text(
                    `Sender: ${record.maskedSender || "Unknown"}`,
                    `भेजने वाला: ${record.maskedSender || "अज्ञात"}`
                )
            );
        }


        if (
            record.threatType === "APK"
        ) {

            lines.push(
                text(
                    `App name: ${record.apkName || record.apkFileName || "Unknown"}`,
                    `ऐप का नाम: ${record.apkName || record.apkFileName || "अज्ञात"}`
                )
            );


            lines.push(
                text(
                    `Package: ${record.packageName || "Unknown"}`,
                    `पैकेज: ${record.packageName || "अज्ञात"}`
                )
            );


            if (record.apkSha256) {

                lines.push(
                    `SHA-256: ${record.apkSha256}`
                );
            }
        }


        lines.push("");

        lines.push(
            text(
                "Saved preview:",
                "सुरक्षित पूर्वावलोकन:"
            )
        );

        lines.push(
            record.safeContent ||
            "—"
        );


        lines.push("");

        lines.push(
            text(
                "Reasons detected by Kavach:",
                "कवच द्वारा पाए गए कारण:"
            )
        );


        const reasons =
            Array.isArray(record.reasons)
                ? record.reasons
                : [];


        if (reasons.length === 0) {

            lines.push(
                text(
                    "• Suspicious indicators were detected.",
                    "• संदिग्ध संकेत पाए गए।"
                )
            );

        } else {

            reasons.forEach(function (reason) {

                lines.push(
                    `• ${reason}`
                );
            });
        }


        if (record.recommendedAction) {

            lines.push("");

            lines.push(
                text(
                    "Recommended action:",
                    "सुझाया गया कदम:"
                )
            );

            lines.push(
                record.recommendedAction
            );
        }


        lines.push("");

        lines.push(
            text(
                "Money or sensitive information lost:",
                "पैसे या संवेदनशील जानकारी का नुकसान:"
            ) + " " +
            getLossLabel(
                lossStatus
            )
        );


        if (safeAdditionalText) {

            lines.push("");

            lines.push(
                text(
                    "Additional information:",
                    "अतिरिक्त जानकारी:"
                )
            );

            lines.push(
                safeAdditionalText
            );
        }


        lines.push("");

        lines.push(
            text(
                "This summary was prepared on the user's device by Kavach. The user must review and complete the official submission.",
                "यह सारांश कवच द्वारा उपयोगकर्ता के डिवाइस पर तैयार किया गया है। उपयोगकर्ता को इसकी समीक्षा करके आधिकारिक रिपोर्ट स्वयं पूरी करनी होगी।"
            )
        );


        return lines.join("\n");
    }


    function getLossLabel(
        lossStatus
    ) {

        switch (lossStatus) {

            case "YES":
                return text(
                    "Yes",
                    "हां"
                );

            case "UNSURE":
                return text(
                    "Not sure",
                    "निश्चित नहीं"
                );

            default:
                return text(
                    "No",
                    "नहीं"
                );
        }
    }


    function redactSensitiveInformation(
        value
    ) {

        let safeValue =
            String(value || "")
                .trim();


        safeValue = safeValue.replace(
            /\b(otp|pin|cvv|cvc|password|passcode)\b\s*(is|:|-)?\s*[a-z0-9]{3,30}/gi,
            "$1 [REDACTED]"
        );


        safeValue = safeValue.replace(
            /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
            "[REDACTED NUMBER]"
        );


        safeValue = safeValue.replace(
            /\b(?:\d[ -]?){13,19}\b/g,
            "[REDACTED CARD NUMBER]"
        );


        return safeValue.slice(
            0,
            500
        );
    }


    /* ========================================
       OFFICIAL ACTIONS
       ======================================== */

    function configureOfficialActions(
        record,
        lossStatus
    ) {

        call1930Button.hidden = true;
        openCyberCrimeButton.hidden = true;
        openChakshuButton.hidden = true;
        whatsappInstructionsButton.hidden = true;


        if (
            lossStatus === "YES" ||
            lossStatus === "UNSURE"
        ) {

            officialActionDescription.textContent =
                text(
                    "Contact your bank immediately, call 1930 and complete your report on the Cyber Crime Portal.",
                    "तुरंत अपने बैंक से संपर्क करें, 1930 पर कॉल करें और साइबर क्राइम पोर्टल पर रिपोर्ट पूरी करें।"
                );

            call1930Button.hidden = false;
            openCyberCrimeButton.hidden = false;

            return;
        }


        if (record.threatType === "SMS") {

            officialActionDescription.textContent =
                text(
                    "You can report suspected fraudulent communication through Chakshu.",
                    "आप संदिग्ध धोखाधड़ी वाले संचार की रिपोर्ट चक्षु के माध्यम से कर सकते हैं।"
                );

            openChakshuButton.hidden = false;

            return;
        }


        if (
            record.threatType === "WHATSAPP"
        ) {

            officialActionDescription.textContent =
                text(
                    "Use WhatsApp's Report and Block option. You can also review the Chakshu reporting service.",
                    "व्हाट्सऐप के रिपोर्ट और ब्लॉक विकल्प का उपयोग करें। आप चक्षु रिपोर्टिंग सेवा भी देख सकते हैं।"
                );

            whatsappInstructionsButton.hidden = false;
            openChakshuButton.hidden = false;

            return;
        }


        officialActionDescription.textContent =
            text(
                "Keep the APK details and SHA-256 in your summary. If you were harmed, complete a report through the Cyber Crime Portal.",
                "सारांश में एपीके विवरण और एसएचए-256 रखें। यदि आपको नुकसान हुआ है, तो साइबर क्राइम पोर्टल पर रिपोर्ट पूरी करें।"
            );

        openCyberCrimeButton.hidden = false;
    }


    /* ========================================
       ACTION BUTTONS
       ======================================== */

    copySummaryButton.addEventListener(
        "click",
        function () {

            const summary =
                preparedSummary.value.trim();

            if (!summary) {
                return;
            }


            let copied = false;


            if (hasReportBridge()) {

                try {

                    copied =
                        Boolean(
                            window.KavachReport
                                .copyReportSummary(
                                    summary
                                )
                        );

                } catch (error) {

                    copied = false;
                }
            }


            if (
                !copied &&
                navigator.clipboard
            ) {
                navigator.clipboard
                    .writeText(summary)
                    .catch(function () {
                        return null;
                    });
            }


            copySummaryButton.textContent =
                text(
                    "Summary Copied",
                    "सारांश कॉपी हो गया"
                );


            setTimeout(
                function () {

                    copySummaryButton.textContent =
                        text(
                            "Copy Summary",
                            "सारांश कॉपी करें"
                        );
                },
                2000
            );
        }
    );


    emergencyCallButton.addEventListener(
        "click",
        call1930
    );


    call1930Button.addEventListener(
        "click",
        call1930
    );


    function call1930() {

        if (hasReportBridge()) {

            window.KavachReport
                .dial1930();
        }
    }


    openCyberCrimeButton.addEventListener(
        "click",
        function () {

            if (hasReportBridge()) {

                window.KavachReport
                    .openCyberCrimePortal();
            }
        }
    );


    openChakshuButton.addEventListener(
        "click",
        function () {

            if (hasReportBridge()) {

                window.KavachReport
                    .openChakshuPortal();
            }
        }
    );


    whatsappInstructionsButton.addEventListener(
        "click",
        function () {

            officialActionDescription.textContent =
                text(
                    "Open the suspicious chat in WhatsApp. Tap the sender or group name, scroll down, tap Report, and then choose Report and Block. Review the information before confirming.",
                    "व्हाट्सऐप में संदिग्ध चैट खोलें। भेजने वाले या समूह के नाम पर टैप करें, नीचे जाएं, रिपोर्ट पर टैप करें और फिर रिपोर्ट और ब्लॉक चुनें। पुष्टि से पहले जानकारी जांचें।"
                );

            whatsappInstructionsButton.hidden = true;
        }
    );


    askTrustedContactButton.addEventListener(
        "click",
        function () {

            let contactName = "";
            let contactPhone = "";


            try {

                if (
                    window.KavachAndroid &&
                    typeof window.KavachAndroid
                        .getTrustedContact ===
                        "function"
                ) {

                    const contact =
                        JSON.parse(
                            window.KavachAndroid
                                .getTrustedContact()
                        );

                    contactName =
                        contact.name || "";

                    contactPhone =
                        contact.phone || "";
                }

            } catch (error) {

                console.error(
                    "Unable to read trusted contact:",
                    error
                );
            }


            if (contactName || contactPhone) {

                officialActionDescription.textContent =
                    text(
                        `Ask ${contactName || "your trusted contact"} ${contactPhone ? `at ${contactPhone}` : ""} to help you review and complete the official report. Never share an OTP, PIN or password.`,
                        `${contactName || "अपने विश्वसनीय संपर्क"} ${contactPhone ? `${contactPhone} पर` : ""} से आधिकारिक रिपोर्ट की समीक्षा और उसे पूरा करने में मदद मांगें। ओटीपी, पिन या पासवर्ड साझा न करें।`
                    );

            } else {

                officialActionDescription.textContent =
                    text(
                        "Add a trusted contact in Kavach Settings, or ask someone you personally trust to help complete the report.",
                        "कवच सेटिंग्स में विश्वसनीय संपर्क जोड़ें या रिपोर्ट पूरी करने में किसी भरोसेमंद व्यक्ति से मदद लें।"
                    );
            }
        }
    );


    /* ========================================
       REPORT COMPLETION
       ======================================== */

    markReportedButton.addEventListener(
        "click",
        function () {

            updateSelectedRecordStatus(
                "REPORTED"
            );
        }
    );


    keepPendingButton.addEventListener(
        "click",
        function () {

            updateSelectedRecordStatus(
                "PENDING"
            );
        }
    );


    function updateSelectedRecordStatus(
        newStatus
    ) {

        if (
            !selectedRecord ||
            !hasReportBridge()
        ) {
            return;
        }


        const result =
            parseNativeResult(
                window.KavachReport
                    .updateReportStatus(
                        Number(selectedRecord.id),
                        newStatus
                    )
            );


        if (result.success) {

            selectedRecord = null;

            loadRecords();
            showListView();
        }
    }


    /* ========================================
       NAVIGATION
       ======================================== */

    closeDetailButton.addEventListener(
        "click",
        function () {

            selectedRecord = null;
            showListView();
        }
    );


    backToDetailButton.addEventListener(
        "click",
        function () {

            if (!selectedRecord) {
                showListView();
                return;
            }

            fillDetailView(
                selectedRecord
            );

            showDetailView();
        }
    );


    /* ========================================
       LANGUAGE CHANGE
       ======================================== */

    window.addEventListener(
        "kavachLanguageChanged",
        function () {

            if (selectedRecord) {
                fillDetailView(
                    selectedRecord
                );
            }

            renderRecords();
        }
    );


    /* ========================================
       INITIAL LOAD
       ======================================== */

    loadRecords();
});