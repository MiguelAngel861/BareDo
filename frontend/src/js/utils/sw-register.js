const SW_PATH = "/sw.js";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register(SW_PATH, { scope: "/" }).catch(() => {});
    });
}
