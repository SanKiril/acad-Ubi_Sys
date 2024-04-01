let nfc = {
    hTxt: null, // HTML data to write
    hWrite: null, // HTML write button
    hRead: null, // HTML read button
    hMsg: null, // HTML "console messages"

    init: () => {
        // Get HTML elements
        nfc.hTxt = document.getElementById("demoT");
        nfc.hWrite = document.getElementById("demoW");
        nfc.hRead = document.getElementById("demoR");
        nfc.hMsg = document.getElementById("demoMSG");

        // Check if Web NFC is supported
        if ("NDEFReader" in window) {
            nfc.logger("Ready");
            nfc.hWrite.disabled = false;
            nfc.hRead.disabled = false;
        } else {
            nfc.logger("Web NFC is not supported on this browser.");
        }
    },

    // Helper function to display log messages
    logger: msg => {
        let row = document.createElement("div");
        row.innerHTML = msg;
        nfc.hMsg.appendChild(row);
    },
    // ...
};

window.onload = nfc.init;

read: () => {
    nfc.logger("Approach NFC Tag");
    const ndef = new NDEFReader();
    ndef.scan()
        .then(() => {
            ndef.onreadingerror = err => nfc.logger("Read failed");
            ndef.onreading = evt => {
                const decoder = new TextDecoder();
                for (let record of evt.message.records) {
                    nfc.logger("Record type: " + record.recordType);
                    // Process the NFC data as needed
                }
            };
        })
        .catch(err => nfc.logger("ERROR - " + err.message));
}

write: () => {
    nfc.logger("Approach NFC Tag");
    const ndef = new NDEFReader();
    ndef.write(nfc.hTxt.value)
        .then(() => nfc.logger("Write OK"))
        .catch(err => nfc.logger("ERROR - " + err.message));
}