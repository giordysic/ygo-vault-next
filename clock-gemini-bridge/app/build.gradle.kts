plugins {
    id("com.android.application")
    id("com.google.devtools.ksp")
}

android {
    namespace = "it.simo.nothingclock.geminibridge"
    compileSdk = 37
    defaultConfig {
        applicationId = "it.simo.nothingclock.connect"
        minSdk = 26
        targetSdk = 37
        versionCode = 2200
        versionName = "2.2.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }
}

ksp { arg("appfunctions:aggregateAppFunctions", "true") }

dependencies {
    implementation("androidx.appfunctions:appfunctions:1.0.0-rc01")
    ksp("androidx.appfunctions:appfunctions-compiler:1.0.0-rc01")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}
