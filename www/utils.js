export const main_body = document.querySelector("main");


export const readNFC = async () => {
    try {
        const ndef = new NDEFReader();

        // Start NFC scanning
        await ndef.scan();
        console.log("NFC scanning started successfully.");

        // resolve/reject synchronously
        return new Promise((resolve, reject) => {
            // read NFC token
            ndef.onreading = async (event) => {
                let productString = event.message.records[0].data;  // read only 1 record
                if (productString) {  // not empty NFC token data
                    try {
                        productString = new TextDecoder().decode(productString);  // from stream of bytes to string
                        const product = JSON.parse(productString);  // from string to JSON
                        console.log("NFC message read successfully.");
                        resolve(product);
                    }
                    catch (err) {
                        console.error("Error extracting the NFC token data:", err);
                        reject(err);
                    }
                }
            };
            ndef.onreadingerror = (err) => {
                console.error("Error reading NFC token:", err);
                reject(err);
            };
        });
    } catch (err) {
        console.error("Error initializing NFC:", err);
    }
};

export const writeNFC = async (product) => {
    try {
        const ndef = new NDEFReader();
        
        // resolve/reject synchronously
        return new Promise((resolve, reject) => {
            // write/overwrite NFC token
            ndef.write(JSON.stringify(product))
            .then (() => {
                console.log("NFC message written successfully.");
                resolve();
            })
            .catch ((err) => {
                console.error("Error writing NFC token:", err);
                reject(err);
            });
        });
    } catch (err) {
        console.error("Error initializing NFC:", err);
    }
}

export const loadHeader = (name) => {
    // header
    const title = document.querySelector("h1");

    // name header
    title.innerHTML = name;
}

export const loadNFC = async () => {
    // clear main body
    main_body.innerHTML = "";

    // rename header
    loadHeader("NFC");

    // add nfc info
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");
    main_body.appendChild(infoContainer);
    const lines = ["1. Activate NFC.", "2. Read NFC token."];
    lines.forEach(line => {
        const info = document.createElement("p");
        info.textContent = line;
        infoContainer.appendChild(info);
    });

    // add nfc image
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("info-container");
    imgContainer.style.backgroundColor = "transparent";
    main_body.appendChild(imgContainer);
    const nfcImage = document.createElement("img");
    nfcImage.src = "icon-nfc-big.png";
    nfcImage.alt = "NFC";
    nfcImage.classList.add('blink');
    imgContainer.appendChild(nfcImage);

    // read nfc    
    const result = await readNFC();
}