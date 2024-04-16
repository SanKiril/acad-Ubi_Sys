export const mainBody = document.querySelector("main");


const readNFC = async () => {
    try {
        const ndef = new NDEFReader();

        // Start NFC scanning
        await ndef.scan();
        console.log("NFC scanning started successfully.");

        // resolve/reject synchronously
        return new Promise((resolve, reject) => {
            // read NFC token
            ndef.onreading = (event) => {
                try {
                    // read only 1 record
                    const productString = new TextDecoder().decode(event.message.records[0].data);  // from stream of bytes to string
                    const product = JSON.parse(productString);  // from string to JSON

                    console.log("NFC message read successfully.");
                    resolve(product);
                }
                catch (err) {
                    console.error("Error extracting the NFC token data:", err);
                    reject(err);
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

const writeNFC = async (product) => {
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

const loadNFC = () => {
    // clear main body
    mainBody.innerHTML = "";

    // rename header
    loadHeader("NFC");

    // add nfc info
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");
    mainBody.appendChild(infoContainer);
    const lines = ["1. Activate NFC.", "2. Hold NFC token close."];
    lines.forEach(line => {
        const info = document.createElement("p");
        info.textContent = line;
        infoContainer.appendChild(info);
    });

    // add nfc image
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("info-container");
    imgContainer.style.backgroundColor = "transparent";
    mainBody.appendChild(imgContainer);
    const nfcImage = document.createElement("img");
    nfcImage.src = "icon-nfc-big.png";
    nfcImage.alt = "NFC";
    nfcImage.classList.add('blink');
    imgContainer.appendChild(nfcImage);
}

export const handleNFC = async (method, product) => {
    // operate over NFC token
    if (method === "read") {  // read NFC token
        loadNFC();
        return await readNFC();
    } else {  // write NFC token
        loadNFC();
        await writeNFC(product);
    }
}