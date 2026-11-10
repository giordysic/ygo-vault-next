package it.simo.nothingclock.appfunctions

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.annotation.RequiresApi
import androidx.appfunctions.AppFunctionAppUnknownException
import androidx.appfunctions.AppFunctionDeclaration
import androidx.appfunctions.AppFunctionInvalidArgumentException
import androidx.appfunctions.AppFunctionService
import androidx.appfunctions.AppFunctionServiceEntryPoint
import androidx.appfunctions.AppFunctionStringValueConstraint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.lang.reflect.InvocationTargetException
import java.time.Instant
import java.util.UUID

/** Gemini/AppFunctions bridge for the existing Clock application. */
@RequiresApi(36)
@AppFunctionServiceEntryPoint(
    serviceName = "ClockGeminiAppFunctionService",
    appFunctionXmlFileName = "clock_gemini_app_function_service",
)
abstract class ClockGeminiService : AppFunctionService() {

    /** Start a persistent timer through Clock's existing exact scheduling engine. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun startTimer(
        title: String? = null,
        durationSeconds: Long,
        requestId: String? = null,
    ): String = onIo {
        val actualTitle = normalizedTitle(title, "Timer")
        if (durationSeconds !in 1L..604800L) invalid("durationSeconds must be between 1 and 604800")
        executeClockRequest("timer", actualTitle, durationSeconds, null, requestId)
    }

    /** Start a Focus countdown through Clock's existing Timer Engine. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun startFocus(
        title: String? = null,
        durationMinutes: Int? = null,
        requestId: String? = null,
    ): String = onIo {
        val actualTitle = normalizedTitle(title, "Focus")
        val actualDuration = durationMinutes ?: 25
        if (actualDuration !in 1..1440) invalid("durationMinutes must be between 1 and 1440")
        executeClockRequest("focus", actualTitle, actualDuration * 60L, null, requestId)
    }

    /** Create a one-time alarm at a future ISO-8601 instant, for example 2026-11-11T07:30:00Z. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun createOneTimeAlarm(
        title: String? = null,
        atIsoInstant: String,
        requestId: String? = null,
    ): String = onIo {
        val actualTitle = normalizedTitle(title, "Sveglia")
        val at = parseFutureInstant(atIsoInstant)
        executeClockRequest("alarm", actualTitle, 0, at, requestId)
    }

    /** Create a countdown toward a future ISO-8601 instant. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun createCountdown(
        title: String? = null,
        atIsoInstant: String,
        requestId: String? = null,
    ): String = onIo {
        val actualTitle = normalizedTitle(title, "Countdown")
        val at = parseFutureInstant(atIsoInstant)
        executeClockRequest("countdown", actualTitle, 0, at, requestId)
    }

    /** Control the persistent stopwatch. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun controlStopwatch(
        @AppFunctionStringValueConstraint(enumValues = ["start", "pause", "lap", "reset"])
        action: String,
    ): String = onIo {
        if (action !in setOf("start", "pause", "lap", "reset")) invalid("Unsupported stopwatch action")
        val repo = bridgeClass().getMethod("repo", Context::class.java).invoke(null, this@ClockGeminiService)
        bridgeClass().getMethod("await", Any::class.java, String::class.java, Array<Any>::class.java)
            .invoke(null, repo, "stopwatchAction", arrayOf(action))
        "Cronometro: $action completato."
    }

    /** Open a specific Clock section. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun openClock(
        @AppFunctionStringValueConstraint(enumValues = ["now", "alarms", "timer", "sleep", "more", "focus", "countdown", "stopwatch", "ai"])
        section: String? = null,
    ): PendingIntent {
        val normalized = (section ?: "now").lowercase()
        if (normalized !in setOf("now", "alarms", "timer", "sleep", "more", "focus", "countdown", "stopwatch", "ai")) {
            invalid("Unsupported Clock section")
        }
        val target = if (normalized == "ai") {
            "it.simo.nothingclock.connect.VoiceCommandActivity"
        } else {
            "it.simo.nothingclock.MainActivity"
        }
        val intent = Intent().setClassName(packageName, target)
            .putExtra("page", normalized)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(
            this,
            normalized.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /** Prepare an Italian natural-language command in Clock AI for explicit user review. */
    @AppFunctionDeclaration(isDescribedByKDoc = true)
    suspend fun prepareNaturalLanguageCommand(command: String): PendingIntent {
        val clean = command.trim()
        if (clean.isEmpty() || clean.length > 2048 || clean.any { it.code < 32 && it != '\n' && it != '\t' }) {
            invalid("Command must contain between 1 and 2048 valid characters")
        }
        val intent = Intent().setClassName(packageName, "it.simo.nothingclock.connect.VoiceCommandActivity")
            .setAction("it.simo.nothingclock.VOICE_COMMAND")
            .setData(Uri.parse("nothingclock://voice"))
            .putExtra("command", clean)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(
            this,
            clean.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private suspend fun <T> onIo(block: () -> T): T = withContext(Dispatchers.IO) {
        try {
            block()
        } catch (e: AppFunctionInvalidArgumentException) {
            throw e
        } catch (e: Throwable) {
            val cause = unwrap(e)
            throw AppFunctionAppUnknownException(cause.message ?: "Clock operation failed")
        }
    }

    private fun executeClockRequest(kind: String, title: String, seconds: Long, at: Instant?, requestId: String?): String {
        val id = requestId?.takeIf { it.isNotBlank() } ?: "gemini-${UUID.randomUUID()}"
        if (!id.matches(Regex("[A-Za-z0-9_-]{8,80}"))) invalid("requestId must contain 8 to 80 letters, digits, underscores, or hyphens")
        val requestClass = Class.forName("it.simo.nothingclock.connect.ClockRequest")
        val request = requestClass.getConstructor(
            String::class.java,
            String::class.java,
            String::class.java,
            java.lang.Long.TYPE,
            Instant::class.java,
            Instant::class.java,
        ).newInstance(id, kind, title, seconds, at, Instant.now())
        val result = bridgeClass().methods.first {
            it.name == "execute" && it.parameterTypes.size == 2
        }.invoke(null, this, request) as String
        val created = result.startsWith("CREATED:")
        val recordId = result.substringAfter(':')
        return if (created) "$kind creato correttamente. ID: $recordId" else "$kind già esistente, nessun duplicato creato. ID: $recordId"
    }

    private fun bridgeClass(): Class<*> = Class.forName("it.simo.nothingclock.connect.Bridge")

    private fun normalizedTitle(title: String?, fallback: String): String {
        val actual = title?.trim()?.takeIf { it.isNotEmpty() } ?: fallback
        validateTitle(actual)
        return actual
    }

    private fun validateTitle(title: String) {
        if (title.isBlank() || title.length > 120 || title.any { it.code < 32 }) invalid("Title must contain between 1 and 120 valid characters")
    }

    private fun parseFutureInstant(value: String): Instant {
        val at = try { Instant.parse(value) } catch (_: Exception) { invalid("atIsoInstant must be a valid ISO-8601 instant") }
        if (!at.isAfter(Instant.now()) || at.isAfter(Instant.now().plusSeconds(86400L * 36525L))) invalid("The instant must be in the future")
        return at
    }

    private fun invalid(message: String): Nothing = throw AppFunctionInvalidArgumentException(message)

    private fun unwrap(error: Throwable): Throwable {
        var current = error
        while (current is InvocationTargetException && current.cause != null) current = current.cause!!
        return current
    }
}
