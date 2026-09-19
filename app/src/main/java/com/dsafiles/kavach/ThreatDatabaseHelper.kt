package com.dsafiles.kavach


import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class ThreatDatabaseHelper(
    context: Context
) : SQLiteOpenHelper(
    context,
    DATABASE_NAME,
    null,
    DATABASE_VERSION
) {

    companion object {

        private const val DATABASE_NAME =
            "kavach_threat_history.db"

        private const val DATABASE_VERSION = 1

        private const val TABLE_THREATS =
            "threat_records"

        private const val COLUMN_ID =
            "id"

        private const val COLUMN_THREAT_TYPE =
            "threat_type"

        private const val COLUMN_RISK_LEVEL =
            "risk_level"

        private const val COLUMN_DETECTED_AT =
            "detected_at"

        private const val COLUMN_LAST_DETECTED_AT =
            "last_detected_at"

        private const val COLUMN_REPEAT_COUNT =
            "repeat_count"

        private const val COLUMN_TITLE =
            "title"

        private const val COLUMN_SENDER_ADDRESS =
            "sender_address"

        private const val COLUMN_MASKED_SENDER =
            "masked_sender"

        private const val COLUMN_SAFE_CONTENT =
            "safe_content"

        private const val COLUMN_REASONS_JSON =
            "reasons_json"

        private const val COLUMN_RECOMMENDED_ACTION =
            "recommended_action"

        private const val COLUMN_APK_NAME =
            "apk_name"

        private const val COLUMN_APK_FILE_NAME =
            "apk_file_name"

        private const val COLUMN_PACKAGE_NAME =
            "package_name"

        private const val COLUMN_APK_SHA256 =
            "apk_sha256"

        private const val COLUMN_TARGET_SDK =
            "target_sdk"

        private const val COLUMN_APK_DELETED =
            "apk_deleted"

        private const val COLUMN_REPORT_STATUS =
            "report_status"

        private const val COLUMN_IS_PINNED =
            "is_pinned"

        private const val COLUMN_EXPIRES_AT =
            "expires_at"

        private const val COLUMN_FINGERPRINT =
            "fingerprint"

        private const val MAX_RECORDS = 100

        const val TYPE_SMS = "SMS"
        const val TYPE_WHATSAPP = "WHATSAPP"
        const val TYPE_APK = "APK"

        const val RISK_SUSPICIOUS = "SUSPICIOUS"
        const val RISK_HIGH = "HIGH"

        const val STATUS_PENDING = "PENDING"
        const val STATUS_PREPARED = "PREPARED"
        const val STATUS_REPORTED = "REPORTED"
        const val STATUS_DISMISSED = "DISMISSED"

        private const val ONE_DAY_MILLIS =
            24L * 60L * 60L * 1000L

        const val PENDING_RETENTION_DAYS = 30L
        const val REPORTED_RETENTION_DAYS = 90L
        const val DISMISSED_RETENTION_DAYS = 7L
    }


    override fun onCreate(
        database: SQLiteDatabase
    ) {

        val createTableSql = """
            CREATE TABLE $TABLE_THREATS (
                $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_THREAT_TYPE TEXT NOT NULL,
                $COLUMN_RISK_LEVEL TEXT NOT NULL,
                $COLUMN_DETECTED_AT INTEGER NOT NULL,
                $COLUMN_LAST_DETECTED_AT INTEGER NOT NULL,
                $COLUMN_REPEAT_COUNT INTEGER NOT NULL DEFAULT 1,
                $COLUMN_TITLE TEXT NOT NULL,
                $COLUMN_SENDER_ADDRESS TEXT,
                $COLUMN_MASKED_SENDER TEXT,
                $COLUMN_SAFE_CONTENT TEXT NOT NULL,
                $COLUMN_REASONS_JSON TEXT NOT NULL,
                $COLUMN_RECOMMENDED_ACTION TEXT NOT NULL,
                $COLUMN_APK_NAME TEXT,
                $COLUMN_APK_FILE_NAME TEXT,
                $COLUMN_PACKAGE_NAME TEXT,
                $COLUMN_APK_SHA256 TEXT,
                $COLUMN_TARGET_SDK INTEGER,
                $COLUMN_APK_DELETED INTEGER NOT NULL DEFAULT 0,
                $COLUMN_REPORT_STATUS TEXT NOT NULL DEFAULT 'PENDING',
                $COLUMN_IS_PINNED INTEGER NOT NULL DEFAULT 0,
                $COLUMN_EXPIRES_AT INTEGER NOT NULL,
                $COLUMN_FINGERPRINT TEXT NOT NULL UNIQUE
            )
        """.trimIndent()

        database.execSQL(createTableSql)


        database.execSQL(
            """
            CREATE INDEX index_threat_type
            ON $TABLE_THREATS ($COLUMN_THREAT_TYPE)
            """.trimIndent()
        )


        database.execSQL(
            """
            CREATE INDEX index_risk_level
            ON $TABLE_THREATS ($COLUMN_RISK_LEVEL)
            """.trimIndent()
        )


        database.execSQL(
            """
            CREATE INDEX index_report_status
            ON $TABLE_THREATS ($COLUMN_REPORT_STATUS)
            """.trimIndent()
        )


        database.execSQL(
            """
            CREATE INDEX index_last_detected
            ON $TABLE_THREATS ($COLUMN_LAST_DETECTED_AT DESC)
            """.trimIndent()
        )
    }


    override fun onUpgrade(
        database: SQLiteDatabase,
        oldVersion: Int,
        newVersion: Int
    ) {

        database.execSQL(
            "DROP TABLE IF EXISTS $TABLE_THREATS"
        )

        onCreate(database)
    }


    /**
     * Saves a new threat.
     *
     * If the fingerprint already exists, Kavach updates
     * the existing record and increases its repeat count.
     */
    fun saveOrUpdateThreat(
        record: ThreatRecord
    ): Long {

        val database = writableDatabase

        database.beginTransaction()

        try {

            val existingCursor = database.query(
                TABLE_THREATS,
                arrayOf(
                    COLUMN_ID,
                    COLUMN_REPEAT_COUNT,
                    COLUMN_RISK_LEVEL,
                    COLUMN_IS_PINNED
                ),
                "$COLUMN_FINGERPRINT = ?",
                arrayOf(record.fingerprint),
                null,
                null,
                null,
                "1"
            )

            existingCursor.use { cursor ->

                if (cursor.moveToFirst()) {

                    val existingId =
                        cursor.getLong(
                            cursor.getColumnIndexOrThrow(
                                COLUMN_ID
                            )
                        )

                    val existingCount =
                        cursor.getInt(
                            cursor.getColumnIndexOrThrow(
                                COLUMN_REPEAT_COUNT
                            )
                        )

                    val existingRisk =
                        cursor.getString(
                            cursor.getColumnIndexOrThrow(
                                COLUMN_RISK_LEVEL
                            )
                        )

                    val existingPinned =
                        cursor.getInt(
                            cursor.getColumnIndexOrThrow(
                                COLUMN_IS_PINNED
                            )
                        ) == 1

                    val finalRisk =
                        if (
                            existingRisk == RISK_HIGH ||
                            record.riskLevel == RISK_HIGH
                        ) {
                            RISK_HIGH
                        } else {
                            RISK_SUSPICIOUS
                        }

                    val values =
                        createContentValues(record)

                    values.remove(COLUMN_DETECTED_AT)
                    values.remove(COLUMN_REPORT_STATUS)
                    values.remove(COLUMN_IS_PINNED)
                    values.remove(COLUMN_FINGERPRINT)

                    values.put(
                        COLUMN_RISK_LEVEL,
                        finalRisk
                    )

                    values.put(
                        COLUMN_REPEAT_COUNT,
                        existingCount + 1
                    )

                    if (existingPinned) {
                        values.remove(COLUMN_EXPIRES_AT)
                    }

                    database.update(
                        TABLE_THREATS,
                        values,
                        "$COLUMN_ID = ?",
                        arrayOf(existingId.toString())
                    )

                    database.setTransactionSuccessful()

                    return existingId
                }
            }


            val newId = database.insertOrThrow(
                TABLE_THREATS,
                null,
                createContentValues(record)
            )

            database.setTransactionSuccessful()

            return newId

        } finally {

            database.endTransaction()

            enforceRecordLimit()
        }
    }


    /**
     * Returns all records, with pinned and newest
     * threats displayed first.
     */
    fun getAllThreats(): List<ThreatRecord> {

        removeExpiredRecords()

        val records =
            mutableListOf<ThreatRecord>()

        val cursor = readableDatabase.query(
            TABLE_THREATS,
            null,
            null,
            null,
            null,
            null,
            "$COLUMN_IS_PINNED DESC, " +
                    "$COLUMN_LAST_DETECTED_AT DESC"
        )

        cursor.use {

            while (it.moveToNext()) {
                records.add(
                    cursorToThreatRecord(it)
                )
            }
        }

        return records
    }


    /**
     * Returns records after applying type and status filters.
     *
     * Pass null or ALL to ignore a filter.
     */
    fun getFilteredThreats(
        threatType: String?,
        reportStatus: String?
    ): List<ThreatRecord> {

        removeExpiredRecords()

        val selectionParts =
            mutableListOf<String>()

        val selectionArguments =
            mutableListOf<String>()


        if (
            !threatType.isNullOrBlank() &&
            threatType != "ALL"
        ) {
            selectionParts.add(
                "$COLUMN_THREAT_TYPE = ?"
            )

            selectionArguments.add(
                threatType
            )
        }


        if (
            !reportStatus.isNullOrBlank() &&
            reportStatus != "ALL"
        ) {
            selectionParts.add(
                "$COLUMN_REPORT_STATUS = ?"
            )

            selectionArguments.add(
                reportStatus
            )
        }


        val selection =
            if (selectionParts.isEmpty()) {
                null
            } else {
                selectionParts.joinToString(
                    separator = " AND "
                )
            }


        val arguments =
            if (selectionArguments.isEmpty()) {
                null
            } else {
                selectionArguments.toTypedArray()
            }


        val records =
            mutableListOf<ThreatRecord>()


        val cursor = readableDatabase.query(
            TABLE_THREATS,
            null,
            selection,
            arguments,
            null,
            null,
            "$COLUMN_IS_PINNED DESC, " +
                    "$COLUMN_LAST_DETECTED_AT DESC"
        )


        cursor.use {

            while (it.moveToNext()) {
                records.add(
                    cursorToThreatRecord(it)
                )
            }
        }

        return records
    }


    /**
     * Returns one record by database ID.
     */
    fun getThreatById(
        recordId: Long
    ): ThreatRecord? {

        val cursor = readableDatabase.query(
            TABLE_THREATS,
            null,
            "$COLUMN_ID = ?",
            arrayOf(recordId.toString()),
            null,
            null,
            null,
            "1"
        )


        cursor.use {

            return if (it.moveToFirst()) {
                cursorToThreatRecord(it)
            } else {
                null
            }
        }
    }


    /**
     * Changes a record to:
     * PENDING, PREPARED, REPORTED or DISMISSED.
     *
     * The expiry time changes according to the status.
     */
    fun updateReportStatus(
        recordId: Long,
        newStatus: String
    ): Boolean {

        val allowedStatus =
            when (newStatus) {

                STATUS_PREPARED ->
                    STATUS_PREPARED

                STATUS_REPORTED ->
                    STATUS_REPORTED

                STATUS_DISMISSED ->
                    STATUS_DISMISSED

                else ->
                    STATUS_PENDING
            }


        val currentTime =
            System.currentTimeMillis()


        val retentionDays =
            when (allowedStatus) {

                STATUS_REPORTED ->
                    REPORTED_RETENTION_DAYS

                STATUS_DISMISSED ->
                    DISMISSED_RETENTION_DAYS

                else ->
                    PENDING_RETENTION_DAYS
            }


        val values = ContentValues().apply {

            put(
                COLUMN_REPORT_STATUS,
                allowedStatus
            )

            put(
                COLUMN_EXPIRES_AT,
                currentTime +
                        retentionDays *
                        ONE_DAY_MILLIS
            )
        }


        val updatedRows =
            writableDatabase.update(
                TABLE_THREATS,
                values,
                "$COLUMN_ID = ?",
                arrayOf(recordId.toString())
            )


        return updatedRows > 0
    }


    /**
     * Pinned records remain until the user deletes
     * or unpins them.
     */
    fun setRecordPinned(
        recordId: Long,
        pinned: Boolean
    ): Boolean {

        val values = ContentValues().apply {

            put(
                COLUMN_IS_PINNED,
                if (pinned) 1 else 0
            )

            if (!pinned) {

                put(
                    COLUMN_EXPIRES_AT,
                    System.currentTimeMillis() +
                            PENDING_RETENTION_DAYS *
                            ONE_DAY_MILLIS
                )
            }
        }


        val updatedRows =
            writableDatabase.update(
                TABLE_THREATS,
                values,
                "$COLUMN_ID = ?",
                arrayOf(recordId.toString())
            )


        return updatedRows > 0
    }


    /**
     * Marks whether the selected APK was deleted.
     */
    fun markApkDeleted(
        recordId: Long,
        deleted: Boolean
    ): Boolean {

        val values = ContentValues().apply {

            put(
                COLUMN_APK_DELETED,
                if (deleted) 1 else 0
            )
        }


        val updatedRows =
            writableDatabase.update(
                TABLE_THREATS,
                values,
                "$COLUMN_ID = ?",
                arrayOf(recordId.toString())
            )


        return updatedRows > 0
    }


    /**
     * Permanently deletes one record.
     */
    fun deleteThreat(
        recordId: Long
    ): Boolean {

        val deletedRows =
            writableDatabase.delete(
                TABLE_THREATS,
                "$COLUMN_ID = ?",
                arrayOf(recordId.toString())
            )

        return deletedRows > 0
    }


    /**
     * Permanently deletes all report history.
     */
    fun deleteAllThreats(): Boolean {

        val deletedRows =
            writableDatabase.delete(
                TABLE_THREATS,
                null,
                null
            )

        return deletedRows > 0
    }


    /**
     * Number shown under Pending.
     */
    fun getPendingCount(): Int {

        removeExpiredRecords()

        val cursor = readableDatabase.rawQuery(
            """
            SELECT COUNT(*)
            FROM $TABLE_THREATS
            WHERE $COLUMN_REPORT_STATUS = ?
               OR $COLUMN_REPORT_STATUS = ?
            """.trimIndent(),
            arrayOf(
                STATUS_PENDING,
                STATUS_PREPARED
            )
        )


        cursor.use {

            return if (it.moveToFirst()) {
                it.getInt(0)
            } else {
                0
            }
        }
    }


    /**
     * Total number shown under Saved threats.
     */
    fun getTotalCount(): Int {

        removeExpiredRecords()

        val cursor = readableDatabase.rawQuery(
            """
            SELECT COUNT(*)
            FROM $TABLE_THREATS
            """.trimIndent(),
            null
        )


        cursor.use {

            return if (it.moveToFirst()) {
                it.getInt(0)
            } else {
                0
            }
        }
    }


    /**
     * Removes expired records unless they are pinned.
     */
    fun removeExpiredRecords(): Int {

        val currentTime =
            System.currentTimeMillis()


        return writableDatabase.delete(
            TABLE_THREATS,
            "$COLUMN_IS_PINNED = 0 " +
                    "AND $COLUMN_EXPIRES_AT <= ?",
            arrayOf(currentTime.toString())
        )
    }


    /**
     * Keeps a maximum of 100 total records.
     *
     * Oldest unpinned records are removed first.
     * Pinned records are never removed automatically.
     */
    private fun enforceRecordLimit() {

        val cursor = readableDatabase.rawQuery(
            """
            SELECT COUNT(*)
            FROM $TABLE_THREATS
            """.trimIndent(),
            null
        )


        val totalRecords =
            cursor.use {

                if (it.moveToFirst()) {
                    it.getInt(0)
                } else {
                    0
                }
            }


        val extraRecords =
            totalRecords - MAX_RECORDS


        if (extraRecords <= 0) {
            return
        }


        writableDatabase.execSQL(
            """
            DELETE FROM $TABLE_THREATS
            WHERE $COLUMN_ID IN (
                SELECT $COLUMN_ID
                FROM $TABLE_THREATS
                WHERE $COLUMN_IS_PINNED = 0
                ORDER BY $COLUMN_LAST_DETECTED_AT ASC
                LIMIT $extraRecords
            )
            """.trimIndent()
        )
    }


    /**
     * Converts a ThreatRecord into database values.
     */
    private fun createContentValues(
        record: ThreatRecord
    ): ContentValues {

        return ContentValues().apply {

            put(
                COLUMN_THREAT_TYPE,
                record.threatType
            )

            put(
                COLUMN_RISK_LEVEL,
                record.riskLevel
            )

            put(
                COLUMN_DETECTED_AT,
                record.detectedAt
            )

            put(
                COLUMN_LAST_DETECTED_AT,
                record.lastDetectedAt
            )

            put(
                COLUMN_REPEAT_COUNT,
                record.repeatCount
            )

            put(
                COLUMN_TITLE,
                record.title
            )


            putNullableString(
                COLUMN_SENDER_ADDRESS,
                record.senderAddress
            )

            putNullableString(
                COLUMN_MASKED_SENDER,
                record.maskedSender
            )


            put(
                COLUMN_SAFE_CONTENT,
                record.safeContent
            )

            put(
                COLUMN_REASONS_JSON,
                record.reasonsJson
            )

            put(
                COLUMN_RECOMMENDED_ACTION,
                record.recommendedAction
            )


            putNullableString(
                COLUMN_APK_NAME,
                record.apkName
            )

            putNullableString(
                COLUMN_APK_FILE_NAME,
                record.apkFileName
            )

            putNullableString(
                COLUMN_PACKAGE_NAME,
                record.packageName
            )

            putNullableString(
                COLUMN_APK_SHA256,
                record.apkSha256
            )


            if (record.targetSdk == null) {
                putNull(COLUMN_TARGET_SDK)
            } else {
                put(
                    COLUMN_TARGET_SDK,
                    record.targetSdk
                )
            }


            put(
                COLUMN_APK_DELETED,
                if (record.apkDeleted) 1 else 0
            )

            put(
                COLUMN_REPORT_STATUS,
                record.reportStatus
            )

            put(
                COLUMN_IS_PINNED,
                if (record.isPinned) 1 else 0
            )

            put(
                COLUMN_EXPIRES_AT,
                record.expiresAt
            )

            put(
                COLUMN_FINGERPRINT,
                record.fingerprint
            )
        }
    }


    /**
     * Converts one database row into ThreatRecord.
     */
    private fun cursorToThreatRecord(
        cursor: Cursor
    ): ThreatRecord {

        return ThreatRecord(

            id = cursor.getLong(
                cursor.getColumnIndexOrThrow(
                    COLUMN_ID
                )
            ),

            threatType = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_THREAT_TYPE
                )
            ),

            riskLevel = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_RISK_LEVEL
                )
            ),

            detectedAt = cursor.getLong(
                cursor.getColumnIndexOrThrow(
                    COLUMN_DETECTED_AT
                )
            ),

            lastDetectedAt = cursor.getLong(
                cursor.getColumnIndexOrThrow(
                    COLUMN_LAST_DETECTED_AT
                )
            ),

            repeatCount = cursor.getInt(
                cursor.getColumnIndexOrThrow(
                    COLUMN_REPEAT_COUNT
                )
            ),

            title = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_TITLE
                )
            ),

            senderAddress =
                cursor.getNullableString(
                    COLUMN_SENDER_ADDRESS
                ),

            maskedSender =
                cursor.getNullableString(
                    COLUMN_MASKED_SENDER
                ),

            safeContent = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_SAFE_CONTENT
                )
            ),

            reasonsJson = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_REASONS_JSON
                )
            ),

            recommendedAction = cursor.getString(
                cursor.getColumnIndexOrThrow(
                    COLUMN_RECOMMENDED_ACTION
                )
            ),

            apkName =
                cursor.getNullableString(
                    COLUMN_APK_NAME
                ),

            apkFileName =
                cursor.getNullableString(
                    COLUMN_APK_FILE_NAME
                ),

            packageName =
                cursor.getNullableString(
                    COLUMN_PACKAGE_NAME
                ),

            apkSha256 =
                cursor.getNullableString(
                    COLUMN_APK_SHA256
                ),

            targetSdk =
                cursor.getNullableInt(
                    COLUMN_TARGET_SDK
                ),

            apkDeleted =
                cursor.getInt(
                    cursor.getColumnIndexOrThrow(
                        COLUMN_APK_DELETED
                    )
                ) == 1,

            reportStatus =
                cursor.getString(
                    cursor.getColumnIndexOrThrow(
                        COLUMN_REPORT_STATUS
                    )
                ),

            isPinned =
                cursor.getInt(
                    cursor.getColumnIndexOrThrow(
                        COLUMN_IS_PINNED
                    )
                ) == 1,

            expiresAt =
                cursor.getLong(
                    cursor.getColumnIndexOrThrow(
                        COLUMN_EXPIRES_AT
                    )
                ),

            fingerprint =
                cursor.getString(
                    cursor.getColumnIndexOrThrow(
                        COLUMN_FINGERPRINT
                    )
                )
        )
    }


    private fun ContentValues.putNullableString(
        columnName: String,
        value: String?
    ) {

        if (value == null) {
            putNull(columnName)
        } else {
            put(columnName, value)
        }
    }


    private fun Cursor.getNullableString(
        columnName: String
    ): String? {

        val index =
            getColumnIndexOrThrow(
                columnName
            )

        return if (isNull(index)) {
            null
        } else {
            getString(index)
        }
    }


    private fun Cursor.getNullableInt(
        columnName: String
    ): Int? {

        val index =
            getColumnIndexOrThrow(
                columnName
            )

        return if (isNull(index)) {
            null
        } else {
            getInt(index)
        }
    }
}