# AppFunctions metadata and service entry points are discovered by Android/Gemini.
-keep class it.simo.nothingclock.appfunctions.** { *; }
-keep class appfunctions_aggregated_deps.** { *; }
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep generated service and inventory contracts intact.
-keep class * extends androidx.appfunctions.AppFunctionService { *; }
-keepclassmembers class * {
    @androidx.appfunctions.AppFunctionDeclaration <methods>;
}

# Reflection intentionally bridges into the already-installed Clock engine.
-adaptclassstrings
