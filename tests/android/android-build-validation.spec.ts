/**
 * Android Build Validation Tests
 *
 * These tests validate that the Android build configuration is correct
 * and that all required files and configurations are in place.
 */

import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const ANDROID_DIR = join(PROJECT_ROOT, 'android');
const APP_DIR = join(ANDROID_DIR, 'app');

test.describe('Android Build Validation', () => {
  test('Android directory exists', () => {
    expect(existsSync(ANDROID_DIR)).toBe(true);
  });

  test('AndroidManifest.xml exists', () => {
    const manifestPath = join(APP_DIR, 'src/main/AndroidManifest.xml');
    expect(existsSync(manifestPath)).toBe(true);
  });

  test('AndroidManifest.xml has correct package name', () => {
    const manifestPath = join(APP_DIR, 'src/main/AndroidManifest.xml');
    const manifest = readFileSync(manifestPath, 'utf-8');

    expect(manifest).toContain('com.debiasdaily.app');
    expect(manifest).toContain('MainActivity');
  });

  test('build.gradle exists', () => {
    const buildGradle = join(APP_DIR, 'build.gradle');
    expect(existsSync(buildGradle)).toBe(true);
  });

  test('build.gradle has correct applicationId', () => {
    const buildGradle = join(APP_DIR, 'build.gradle');
    const content = readFileSync(buildGradle, 'utf-8');

    expect(content).toContain('applicationId "com.debiasdaily.app"');
  });

  test('build.gradle has version configuration', () => {
    const buildGradle = join(APP_DIR, 'build.gradle');
    const content = readFileSync(buildGradle, 'utf-8');

    expect(content).toContain('versionCode');
    expect(content).toContain('versionName');
  });

  test('build.gradle has signing configuration', () => {
    const buildGradle = join(APP_DIR, 'build.gradle');
    const content = readFileSync(buildGradle, 'utf-8');

    expect(content).toContain('signingConfigs');
    expect(content).toContain('release');
  });

  test('MainActivity.java exists', () => {
    const mainActivity = join(APP_DIR, 'src/main/java/com/debiasdaily/app/MainActivity.java');
    expect(existsSync(mainActivity)).toBe(true);
  });

  test('Capacitor config exists', () => {
    const capacitorConfig = join(PROJECT_ROOT, 'capacitor.config.ts');
    expect(existsSync(capacitorConfig)).toBe(true);
  });

  test('Capacitor config has correct appId', () => {
    const capacitorConfig = join(PROJECT_ROOT, 'capacitor.config.ts');
    const content = readFileSync(capacitorConfig, 'utf-8');

    expect(content).toContain('com.debiasdaily.app');
  });

  test('Gradle wrapper exists', () => {
    const gradlew = join(ANDROID_DIR, 'gradlew');
    expect(existsSync(gradlew)).toBe(true);
  });

  test('gradle.properties exists', () => {
    const gradleProps = join(ANDROID_DIR, 'gradle.properties');
    expect(existsSync(gradleProps)).toBe(true);
  });

  test('Release notes directory exists', () => {
    const releaseNotes = join(ANDROID_DIR, 'release-notes');
    expect(existsSync(releaseNotes)).toBe(true);
  });

  test('Release notes file exists', () => {
    const releaseNotesFile = join(ANDROID_DIR, 'release-notes/en-US.txt');
    expect(existsSync(releaseNotesFile)).toBe(true);
  });

  test('Release notes file has content', () => {
    const releaseNotesFile = join(ANDROID_DIR, 'release-notes/en-US.txt');
    const content = readFileSync(releaseNotesFile, 'utf-8');

    expect(content.length).toBeGreaterThan(0);
  });
});
