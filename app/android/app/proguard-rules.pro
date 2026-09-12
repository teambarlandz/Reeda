# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-quick-sqlite
-keep class com.reactnativequicksqlite.** { *; }

# react-native-fast-image (Glide)
-keep public class com.dylanvann.fastimage.** { *; }
-keep public class com.bumptech.glide.** { *; }

# react-native-svg
-keep public class com.horcrux.svg.** { *; }

# react-native-fs (RNFS)
-keep class com.facebook.react.modules.network.** { *; }
-keep class com.ihn.** { *; }
-keep class org.devio.** { *; }
