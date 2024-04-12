import * as utils from "./utils.js";

const loadFooter = () => {
    // footer
    const footer = document.querySelector("footer");

    // add nfc reader
    const nfcReader = document.createElement("img");
    nfcReader.src = "icon-nfc.png";
    nfcReader.alt = "NFC Reader";
    footer.appendChild(nfcReader);

    // read nfc
    nfcReader.addEventListener("pointerdown", () => {
        utils.loadNFC();
    });
}

utils.loadNFC();
loadFooter();