console.clear();

// Elements
const statusElem = document.querySelector("#status p");
const wakeButton = document.querySelector("[data-status]");
const reaquireCheck = document.querySelector("#reaquire");
const statusDiv = document.getElementById("status");

// Change UI based on wake lock status
const changeUI = (status = "acquired") => {
    const isActive = status === "acquired";
    wakeButton.dataset.status = isActive ? "on" : "off";
    wakeButton.textContent = `Αφυπνιση ${isActive ? "ΕΝΕΡΓΗ" : "ΑΝΕΝΕΡΓΗ"}`;
    statusElem.textContent = `Η λειτουργια αφυπνισης ${isActive ? "ενεργοποιήθηκε!" : "απενεργοποιήθηκε."}`;

    // Update status container styles
    statusDiv.classList.toggle("bg-success", isActive);
    statusDiv.classList.toggle("bg-danger", !isActive);
    statusDiv.classList.add("text-white"); // Always white text
};

// Test support
let isSupported = "wakeLock" in navigator;
if (isSupported) {
    statusElem.textContent = "Το Wake Lock API υποστηριζεται 🎉";
} else {
    wakeButton.disabled = true;
    statusElem.textContent = "Το Wake lock δεν υποστηριζεται απο τον browser.";
}

// Wake Lock functionality
if (isSupported) {
    let wakeLock = null;

    // Request Wake Lock
    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            changeUI("acquired");

            wakeLock.addEventListener("release", () => {
                changeUI("released");
                wakeLock = null;
            });
        } catch (err) {
            wakeButton.dataset.status = "off";
            wakeButton.textContent = "Αφυπνιση ΑΝΕΝΕΡΓΗ";
            statusElem.textContent = `${err.name}, ${err.message}`;
        }
    };

    // Toggle Wake Lock on button click
    wakeButton.addEventListener("click", () => {
        if (wakeButton.dataset.status === "off") {
            requestWakeLock();
        } else if (wakeLock) {
            wakeLock.release();
        }
    });

    // Handle wake lock reactivation when window regains focus
    const handleVisibilityChange = () => {
        if (reaquireCheck.checked && document.visibilityState === "visible") {
            requestWakeLock();
        }
    };

    // Update Wake Lock Status colors when reactivating Wake Lock
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && wakeButton.dataset.status === "off") {
            statusDiv.classList.remove("bg-success");
            statusDiv.classList.add("bg-danger");
        } else if (document.visibilityState === "visible" && wakeButton.dataset.status === "on") {
            statusDiv.classList.remove("bg-danger");
            statusDiv.classList.add("bg-success");
        }
    });

    // Enable or disable wake lock reacquisition
    reaquireCheck.addEventListener("change", () => {
        if (reaquireCheck.checked) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        } else {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    });
}