import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard,
  // Settings,
  SlidersHorizontal,
} from "lucide-react";

const AccessibilityEnhancer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibilitySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (newSettings) => {
    const root = document.documentElement;

    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Large text mode
    if (newSettings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Screen reader announcements
    if (newSettings.screenReader) {
      root.setAttribute("aria-live", "polite");
    } else {
      root.removeAttribute("aria-live");
    }
  };

  const announceToScreenReader = (message) => {
    if (settings.screenReader) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = message;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  const toggleSetting = (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    setSettings(newSettings);

    const action = newSettings[setting] ? "enabled" : "disabled";
    announceToScreenReader(
      `${setting.replace(/([A-Z])/g, " $1").toLowerCase()} ${action}`
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 group">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-300 border rounded-lg p-3 text-black hover:bg-gray-200 transition-colors relative"
          aria-label="Open accessibility settings"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>

        <span
          className="absolute bottom-14 right-3/4 translate-x-1/2 
                       bg-gray-800 text-white text-xs rounded-md px-2 py-1
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          Accessibility Settings
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 w-80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-jersey text-white">
          Accessibility Settings
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close accessibility settings"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* High Contrast Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings.highContrast ? (
              <Eye className="h-4 w-4 text-logocolor" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <div className="text-sm font-normaltext text-white">
                High Contrast
              </div>
              <div className="text-xs text-gray-400">
                Enhanced color contrast
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting("highContrast")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.highContrast ? "bg-logocolor" : "bg-gray-700"
            }`}
            aria-label={`${
              settings.highContrast ? "Disable" : "Enable"
            } high contrast mode`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.highContrast ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Large Text Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Keyboard className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-normaltext text-white">
                Large Text
              </div>
              <div className="text-xs text-gray-400">Increase font size</div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting("largeText")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.largeText ? "bg-logocolor" : "bg-gray-700"
            }`}
            aria-label={`${
              settings.largeText ? "Disable" : "Enable"
            } large text mode`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.largeText ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <VolumeX className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-normaltext text-white">
                Reduced Motion
              </div>
              <div className="text-xs text-gray-400">Minimize animations</div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting("reducedMotion")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.reducedMotion ? "bg-logocolor" : "bg-gray-700"
            }`}
            aria-label={`${
              settings.reducedMotion ? "Disable" : "Enable"
            } reduced motion`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.reducedMotion ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Screen Reader Support */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-normaltext text-white">
                Screen Reader
              </div>
              <div className="text-xs text-gray-400">
                Enhanced announcements
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting("screenReader")}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.screenReader ? "bg-logocolor" : "bg-gray-700"
            }`}
            aria-label={`${
              settings.screenReader ? "Disable" : "Enable"
            } screen reader support`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.screenReader ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Keyboard Navigation Info */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Keyboard className="h-4 w-4 text-logocolor" />
            <span className="text-sm font-normaltext text-white">
              Keyboard Navigation
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Tab: Navigate between elements</div>
            <div>• Enter/Space: Activate buttons</div>
            <div>• Escape: Close modals</div>
            <div>• Arrow keys: Navigate options</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityEnhancer;
