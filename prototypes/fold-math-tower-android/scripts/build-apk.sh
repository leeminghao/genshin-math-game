#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SDK_DIR="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
COMPILE_SDK="34"
BUILD_TOOLS="34.0.0"
MIN_API="23"

AAPT2="$SDK_DIR/build-tools/$BUILD_TOOLS/aapt2"
D8="$SDK_DIR/build-tools/$BUILD_TOOLS/d8"
ZIPALIGN="$SDK_DIR/build-tools/$BUILD_TOOLS/zipalign"
APKSIGNER="$SDK_DIR/build-tools/$BUILD_TOOLS/apksigner"
ANDROID_JAR="$SDK_DIR/platforms/android-$COMPILE_SDK/android.jar"
BUILD_DIR="$ROOT_DIR/build/manual"
GEN_DIR="$BUILD_DIR/generated"
RES_FLAT_DIR="$BUILD_DIR/res-flat"
CLASSES_DIR="$BUILD_DIR/classes"
DEX_DIR="$BUILD_DIR/dex"
KEYSTORE="$ROOT_DIR/.debug/debug.keystore"

rm -rf "$BUILD_DIR"
mkdir -p "$GEN_DIR" "$RES_FLAT_DIR" "$CLASSES_DIR" "$DEX_DIR" "$(dirname "$KEYSTORE")"

"$AAPT2" compile --dir "$ROOT_DIR/src/main/res" -o "$RES_FLAT_DIR"
"$AAPT2" link \
  -o "$BUILD_DIR/app-unsigned.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$ROOT_DIR/src/main/AndroidManifest.xml" \
  --java "$GEN_DIR" \
  --min-sdk-version "$MIN_API" \
  --target-sdk-version "$COMPILE_SDK" \
  --version-code 1 \
  --version-name 0.1 \
  "$RES_FLAT_DIR"/*.flat

javac \
  -encoding UTF-8 \
  -classpath "$ANDROID_JAR" \
  -d "$CLASSES_DIR" \
  $(find "$ROOT_DIR/src/main/java" "$GEN_DIR" -name '*.java' | sort)

javac \
  -encoding UTF-8 \
  -classpath "$CLASSES_DIR" \
  -d "$BUILD_DIR/test-classes" \
  $(find "$ROOT_DIR/src/test/java" -name '*.java' | sort)
java -classpath "$CLASSES_DIR:$BUILD_DIR/test-classes" com.mathisland.foldtower.GameStateSmokeTest

"$D8" --min-api "$MIN_API" --lib "$ANDROID_JAR" --output "$DEX_DIR" $(find "$CLASSES_DIR" -name '*.class' | sort)
cp "$BUILD_DIR/app-unsigned.apk" "$BUILD_DIR/app-unsigned-dex.apk"
(cd "$DEX_DIR" && zip -q "$BUILD_DIR/app-unsigned-dex.apk" classes.dex)

"$ZIPALIGN" -f 4 "$BUILD_DIR/app-unsigned-dex.apk" "$BUILD_DIR/app-aligned.apk"

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null
fi

"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$BUILD_DIR/app-debug.apk" \
  "$BUILD_DIR/app-aligned.apk"

"$APKSIGNER" verify "$BUILD_DIR/app-debug.apk"
echo "$BUILD_DIR/app-debug.apk"
