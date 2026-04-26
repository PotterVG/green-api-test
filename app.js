(function () {
    "use strict";

    const API_BASE = "https://api.green-api.com";

    const els = {
        idInstance: document.getElementById("idInstance"),
        apiToken: document.getElementById("apiTokenInstance"),
        phoneMessage: document.getElementById("phoneMessage"),
        messageText: document.getElementById("messageText"),
        phoneFile: document.getElementById("phoneFile"),
        fileUrl: document.getElementById("fileUrl"),
        response: document.getElementById("responseField"),
        btnGetSettings: document.getElementById("btnGetSettings"),
        btnGetStateInstance: document.getElementById("btnGetStateInstance"),
        btnSendMessage: document.getElementById("btnSendMessage"),
        btnSendFileByUrl: document.getElementById("btnSendFileByUrl"),
    };

    function render(value) {
        try {
            els.response.value = JSON.stringify(value, null, 2);
        } catch (_) {
            els.response.value = String(value);
        }
    }

    function toChatId(rawPhone) {
        const digits = String(rawPhone || "").replace(/\D+/g, "");
        return digits ? digits + "@c.us" : "";
    }

    function fileNameFromUrl(url) {
        try {
            const u = new URL(url);
            const last = u.pathname.split("/").filter(Boolean).pop();
            return last || "file";
        } catch (_) {
            const tail = String(url || "").split("/").filter(Boolean).pop();
            return tail || "file";
        }
    }

    function getCreds() {
        const idInstance = els.idInstance.value.trim();
        const apiTokenInstance = els.apiToken.value.trim();
        if (!idInstance || !apiTokenInstance) {
            return { error: "idInstance и ApiTokenInstance обязательны" };
        }
        return { idInstance, apiTokenInstance };
    }

    function buildUrl(method, idInstance, apiTokenInstance) {
        return API_BASE + "/waInstance" + encodeURIComponent(idInstance) + "/" + method + "/" + encodeURIComponent(apiTokenInstance);
    }

    async function callApi(method, httpMethod, body) {
        const creds = getCreds();
        if (creds.error) {
            render({ error: creds.error });
            return;
        }

        const url = buildUrl(method, creds.idInstance, creds.apiTokenInstance);
        const init = { method: httpMethod, headers: {} };
        if (body !== undefined) {
            init.headers["Content-Type"] = "application/json";
            init.body = JSON.stringify(body);
        }

        let resp;
        try {
            resp = await fetch(url, init);
        } catch (err) {
            render({ error: "network error", message: String((err && err.message) || err) });
            return;
        }

        const text = await resp.text();
        let parsed;
        try {
            parsed = text ? JSON.parse(text) : null;
        } catch (_) {
            parsed = text;
        }

        if (!resp.ok) {
            render({ error: "HTTP " + resp.status, status: resp.status, body: parsed });
            return;
        }

        render(parsed);
    }

    function withBusy(button, fn) {
        return async function () {
            const original = button.textContent;
            button.disabled = true;
            button.textContent = "Loading...";
            try {
                await fn();
            } finally {
                button.disabled = false;
                button.textContent = original;
            }
        };
    }

    els.btnGetSettings.addEventListener("click", withBusy(els.btnGetSettings, async () => {
        await callApi("getSettings", "GET");
    }));

    els.btnGetStateInstance.addEventListener("click", withBusy(els.btnGetStateInstance, async () => {
        await callApi("getStateInstance", "GET");
    }));

    els.btnSendMessage.addEventListener("click", withBusy(els.btnSendMessage, async () => {
        const chatId = toChatId(els.phoneMessage.value);
        const message = els.messageText.value;
        if (!chatId) {
            render({ error: "Укажите номер телефона" });
            return;
        }
        if (!message) {
            render({ error: "Укажите текст сообщения" });
            return;
        }
        await callApi("sendMessage", "POST", { chatId, message });
    }));

    els.btnSendFileByUrl.addEventListener("click", withBusy(els.btnSendFileByUrl, async () => {
        const chatId = toChatId(els.phoneFile.value);
        const urlFile = els.fileUrl.value.trim();
        if (!chatId) {
            render({ error: "Укажите номер телефона" });
            return;
        }
        if (!urlFile) {
            render({ error: "Укажите URL файла" });
            return;
        }
        await callApi("sendFileByUrl", "POST", {
            chatId,
            urlFile,
            fileName: fileNameFromUrl(urlFile),
        });
    }));

    const SS_KEY_ID = "green_api_id_instance";
    const SS_KEY_TOKEN = "green_api_token";
    try {
        const savedId = sessionStorage.getItem(SS_KEY_ID);
        const savedToken = sessionStorage.getItem(SS_KEY_TOKEN);
        if (savedId) els.idInstance.value = savedId;
        if (savedToken) els.apiToken.value = savedToken;
        els.idInstance.addEventListener("input", () => sessionStorage.setItem(SS_KEY_ID, els.idInstance.value));
        els.apiToken.addEventListener("input", () => sessionStorage.setItem(SS_KEY_TOKEN, els.apiToken.value));
    } catch (_) {
        // sessionStorage недоступен — работаем без сохранения
    }
})();
