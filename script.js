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
    wakeButton.textContent = `Turn Wake Lock ${isActive ? "OFF" : "ON"}`;
    statusElem.textContent = `Wake Lock ${isActive ? "is active!" : "has been released."}`;

    // Update status container styles
    statusDiv.classList.toggle("bg-success", isActive);
    statusDiv.classList.toggle("bg-danger", !isActive);
    statusDiv.classList.add("text-white"); // Always white text
};

// Test support
let isSupported = "wakeLock" in navigator;
if (isSupported) {
    statusElem.textContent = "Wake Lock API supported 🎉";
} else {
    wakeButton.disabled = true;
    statusElem.textContent = "Wake lock is not supported by this browser.";
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
            wakeButton.textContent = "Turn Wake Lock ON";
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

    // Handle wake lock reactivation
    const handleVisibilityChange = () => {
        if (wakeLock !== null && document.visibilityState === "visible") {
            requestWakeLock();
        }
    };

    // Change background to red if wake lock is inactive and page loses focus
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && wakeButton.dataset.status === "off") {
            statusDiv.classList.remove("bg-success");
            statusDiv.classList.add("bg-danger");
        }
    });

    reaquireCheck.addEventListener("change", () => {
        if (reaquireCheck.checked) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        } else {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    });
}

