import * as utils from "./utils.js";

const loadFormNFC = async () => {
    // clear main body
    utils.mainBody.innerHTML = "";

    // rename header
    utils.loadHeader("NFC");
        
    // add form for product info
    const formProductInfo = document.createElement("form");
    formProductInfo.classList.add("form-product-info");
    utils.mainBody.appendChild(formProductInfo);

    // add name input
    const inputName = document.createElement("input");
    inputName.type = "text";
    inputName.name = "name";
    inputName.placeholder = "Name";
    inputName.required = true;
    formProductInfo.appendChild(inputName);

    // add image input
    const inputImage = document.createElement("input");
    inputImage.type = "text";
    inputImage.name = "image";
    inputImage.placeholder = "Image URL";
    inputImage.required = true;
    formProductInfo.appendChild(inputImage);

    // add product info input
    const inputProductInfo = document.createElement("textarea");
    inputProductInfo.name = "product_info";
    inputProductInfo.placeholder = "Product info";
    inputProductInfo.required = true;
    formProductInfo.appendChild(inputProductInfo);

    // add submit
    const inputSubmit = document.createElement("input");
    inputSubmit.type = "submit";
    formProductInfo.appendChild(inputSubmit);

    // submit form
    formProductInfo.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (formProductInfo.checkValidity()) {
            const product = {
                name: inputName.value,
                image: inputImage.value,
                product_info: inputProductInfo.value
            }

            // write NFC
            await utils.handleNFC("write", product);

            // load NFC form
            loadFormNFC();
        }
    });
}

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
        loadFormNFC();
    });
}

loadFormNFC();
loadFooter();