import * as utils from "./utils.js";

if (localStorage.getItem("firstTime") === null) {
    localStorage.setItem("firstTime", true);
}

const MAX_FETCH_RETRIES = 3;
let products = [];
const socket = io();

socket.on("reload", () => {
    window.location.reload();   
});

const fetchProducts = async (method) => {
    // adjust fetch options
    let options = {};
    if (method === "send") {
        options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(products)
        };
    }

    // fetch products list
    let retries = 0;
    while(retries < MAX_FETCH_RETRIES) {
        try {
            const response = await fetch("products.json", options);
            if (response.ok) {
                return response;
            }
            else {
                throw new Error("Failed to fetch products list");
            }
        }
        catch (err) {
            console.error("Error fetching products list:", err);
            retries++;
        }
    }
}

async function first_time_alert() {
    await new Promise(resolve => setTimeout(resolve, 100));
    window.alert("Mantén pulsado un producto para añadirlo al carrito.\nDoble toque para añadirlo a favoritos.");
}

function getProduct(productName) {
    for (let i = 0; i < products.length; i++) {
        if (products[i]["name"] === productName) {
            return products[i];
        }
    }
}

function toggleHeart(product) {
    const productItem = document.getElementById(product["name"]);
    if (!productItem)
        return;
    if (getProduct(product["name"])["favourite"]) {
        const rect = productItem.getBoundingClientRect();
        let added_to_favourites_image = document.createElement("img");
        added_to_favourites_image.className = "fav_corner_icon";
        added_to_favourites_image.style.width = "20px";
        added_to_favourites_image.src = "heart-icon.png";
        productItem.appendChild(added_to_favourites_image);
    } else {
        const added_to_favourites_image = productItem.querySelector(".fav_corner_icon");
        if (added_to_favourites_image) {
            productItem.removeChild(added_to_favourites_image);
        }
    }
}

function toggleCartInfo(product) {
    const productItem = document.getElementById(product["name"]);
    if (!productItem)
        return;
    const product_price = document.createElement("p");
    product_price.innerHTML =  product.price.toString() +"$";
    product_price.className = "product_price";
    productItem.appendChild(product_price)

    const product_quantity_value = product.quantity;
    if (product_quantity_value > 0){
        const product_quantity = document.createElement("p");
        product_quantity.id = "product_quantity_decorator";
        product_quantity.innerHTML =  product_quantity_value;
        product_quantity.className = "product_quantity";
        productItem.appendChild(product_quantity);
    } else {
        const product_quantity = productItem.querySelector("#product_quantity_decorator");
        if (product_quantity) {
            productItem.removeChild(product_quantity);
        }
    }
}

const loadList = async (listType) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (localStorage.getItem("firstTime") == "true") {
        console.log("first_time_alert");
        first_time_alert();
        localStorage.setItem("firstTime", false);
    }
    // list
    const list = document.createElement("ul");
    list.id = "list";
    list.classList.add("products-list");
    list.style.userSelect = "none";
    utils.mainBody.appendChild(list);

    // filter products
    let filteredProducts;
    switch (listType) {
        case "favouritesList":
            filteredProducts = products.filter(product => product.favourite);
            break;
        case "cartList":
            filteredProducts = products.filter(product => product.cart);
            break;
        case "productsList":
        default:
            filteredProducts = products;
    }
    filteredProducts.sort((a, b) => b.order - a.order);

    // add products to list
    filteredProducts.forEach(product => {
        // product item
        const productItem = document.createElement("li");
        productItem.classList.add("products-list-item");
        productItem.id = product.name;
        productItem.draggable = true;
        productItem.style.position = "relative";
        
        list.appendChild(productItem);
        toggleHeart(product);
        toggleCartInfo(product);

        productItem.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
        })
        productItem.addEventListener("dragover", (event) => {
            event.preventDefault();
        })

        productItem.addEventListener("drop", (event) => {
            event.preventDefault();
            const data = event.dataTransfer.getData("text");
            const draggedObject = document.getElementById(data);
            const dropZone = event.target.alt || event.target.dataset.text || event.target.id;
            let dragged_order;
            let new_order;
            products.forEach(element => {
                if (dropZone == element.name){
                    //console.log(element, element.order);
                    new_order = element.order;
                }
                else if (draggedObject.id == element.name){
                    //console.log(element, element.order);
                    dragged_order = element.order;
                }
            });
            products.forEach(element => {
                if (dropZone == element.name){
                    element.order = dragged_order;
                }
                else if (draggedObject.id == element.name){
                    element.order = new_order;
                }
            });
            utils.mainBody.innerHTML = "";
            loadList();
        })
        // product item image
        const productImage = document.createElement("img");
        productImage.src = product.image;
        productImage.alt = product.name;
        productImage.draggable = false;
        productItem.appendChild(productImage);

        // product item name
        const productName = document.createElement("p");
        productName.innerHTML = product.name;
        productItem.appendChild(productName);
    });

    // load product info
    let startY = NaN;
    let endY = NaN;
    let firstClick = 0;
    let firstTarget = null;
    let timeoutId;
    let pressTimeout;
    let pressStartTime = 0;

    list.addEventListener("contextmenu", event => {
        event.preventDefault(); // Evita que se abra el menú contextual
        event.stopPropagation();
    });

    list.addEventListener("touchstart", event => {
        event.preventDefault(); // Evitar vibración por long press
        event.stopPropagation();
    });

    list.addEventListener("pointerdown", event => {
        startY = event.clientY;
        pressStartTime = Date.now();
        firstTarget = event.target.closest(".products-list-item");
        if (!firstTarget) {
            return;
        }

        // Mantener presionado por 1 segundo para añadir/quitar al carrito
        pressTimeout = setTimeout(async () => {
            if (firstTarget) {
                const index = Array.from(list.children).indexOf(firstTarget);
                const product = filteredProducts[index];
                navigator.vibrate(200);
                firstClick = 0;
                const rect = firstTarget.getBoundingClientRect();
                let added_to_cart_image = document.createElement("img");
                added_to_cart_image.style.zIndex = "1000";
                added_to_cart_image.id = null;
                added_to_cart_image.style.width = rect.width/2 + "px";
                if (product["cart"])
                    added_to_cart_image.src = "remove-from-cart-icon.png";
                else
                    added_to_cart_image.src = "add-to-cart-icon.png";
                let toggle_cart_result = await toggleCart(product, true);
                if (toggle_cart_result == -1) {
                    return;
                };
                added_to_cart_image.style.position = "absolute";
                added_to_cart_image.style.top = rect.top + (rect.height/4) + "px";
                added_to_cart_image.style.left = rect.left + (rect.width/4) + "px";
                document.body.appendChild(added_to_cart_image);

                setTimeout(() => {
                    document.body.removeChild(added_to_cart_image);
                    toggleCartInfo(product);
                    if (listType == "cartList") {
                        loadCart();
                    }
                }, 500);
            }
            }, 1000);
    });

    // clean variables
    list.addEventListener("pointermove", () => {
        clearTimeout(pressTimeout);
    })

    list.addEventListener("pointerup", event => {
        // 
        clearTimeout(pressTimeout);
        const targetProduct = event.target.closest(".products-list-item");
        const pressDuration = Date.now() - pressStartTime;

        if (!targetProduct) {
            return;
        }

        // Doble click para añadir/quitar de favoritos
        if (firstTarget == targetProduct && firstClick == 1) {
            const index = Array.from(list.children).indexOf(targetProduct);
            const product = filteredProducts[index];
            firstClick = 2;
            clearTimeout(timeoutId);

            navigator.vibrate(500);
            const rect = targetProduct.getBoundingClientRect();
            let added_to_favourites_image = document.createElement("img");
            added_to_favourites_image.style.zIndex = "1000";
            added_to_favourites_image.id = null;
            added_to_favourites_image.style.width = rect.width/2 + "px";
            if (product["favourite"]) {
                added_to_favourites_image.src = "heart-icon-black.png";
            } else {
                added_to_favourites_image.src = "heart-icon.png";
            }
            toggleFavourite(product);

            added_to_favourites_image.style.position = "absolute";
            added_to_favourites_image.style.top = rect.top + (rect.height/4) + "px";
            added_to_favourites_image.style.left = rect.left + (rect.width/4) + "px";
            document.body.appendChild(added_to_favourites_image);
            
            setTimeout(() => {
                document.body.removeChild(added_to_favourites_image);
                if (listType == "favouritesList") {
                    loadFavourites();
                }
            }, 500);
        // Si no ha mantenido presionado significa que quiere ir a la pagina del producto
        } else if(pressDuration < 1000){
            timeoutId = setTimeout(() => {
                if (isNaN(endY)) {
                    endY = startY;
                }
                if (targetProduct && (Math.abs(startY-endY) < 5 )) {
                    const index = Array.from(list.children).indexOf(targetProduct);
                    const product = filteredProducts[index];
                    firstClick = 0;
                    loadProductInfo(product);
                }           
            }, 400);
        }
        // Ajustar variables
        endY = NaN;
        if(firstClick > 0) {startY = NaN;} 
        if (firstClick == 2) {firstClick = 0
        } else {firstClick = 1;}
    });

    // obtain movment
    list.addEventListener("pointermove",event =>{
        endY = event.clientY;  
    });
}

const loadFavourites = () => {
    // clear main body
    utils.mainBody.innerHTML = "";

    // rename header
    utils.loadHeader("Favourites");

    // favourites list
    loadList("favouritesList");
}

const loadCart = () => {
    // clear main body
    utils.mainBody.innerHTML = "";

    // rename header
    utils.loadHeader("Cart");

    // cart list
    loadList("cartList");
}

const loadProductInfo = (product) => {
    // clear main body
    utils.mainBody.innerHTML = "";
    utils.mainBody.appendChild(getProductInfoContent(product));

    // rename header
    utils.loadHeader("Product Info");
}

function getProductInfoContent(product) {
    let product_info_div = document.createElement("div");
    product_info_div.id = "product_info";

    let product_name_header = document.createElement("h1");
    product_name_header.innerHTML = product["name"];
    product_info_div.appendChild(product_name_header);

    let product_info_text = document.createElement("p");
    product_info_text.innerHTML = product["product_info"];
    product_info_text.style="white-space: pre-wrap;"
    product_info_div.appendChild(product_info_text);

    let product_info_image = document.createElement("img");
    product_info_image.className = "product_info_image";
    product_info_image.src = product["image"];
    product_info_image.alt = product["name"];
    product_info_div.appendChild(product_info_image);

    let buttons_div = document.createElement("div");
    buttons_div.className = "product_info_buttons_div";

    let add_to_cart_button = document.createElement("button");
    add_to_cart_button.className = "add_to_cart_button";
    buttons_div.appendChild(add_to_cart_button);

    
    add_to_cart_button.addEventListener("click", () => {
        toggleCart(product);
        toggle_buttons([add_to_cart_button, favorite_button], product);
    });

    let favorite_button = document.createElement("button");
    favorite_button.className = "favorite_button";
    buttons_div.appendChild(favorite_button);

    favorite_button.addEventListener("click", () => {
        toggleFavourite(product);
        toggle_buttons([add_to_cart_button, favorite_button], product);
    });

    toggle_buttons([add_to_cart_button, favorite_button], product);

    product_info_div.appendChild(buttons_div);

    var click_count = 0;
    var timer;

    product_info_image.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
    })

    let pressTimeout
    product_info_image.addEventListener("pointerdown", function(event) {
        // Mantener presionado por 1 segundo para añadir/quitar al carrito
        pressTimeout = setTimeout(async () => {
            navigator.vibrate(200);
            click_count = 0;
            const rect = product_info_image.getBoundingClientRect();
            let added_to_cart_image = document.createElement("img");
            added_to_cart_image.style.zIndex = "1000";
            added_to_cart_image.id = null;
            added_to_cart_image.style.width = rect.width/2 + "px";
            if (product["cart"])
                added_to_cart_image.src = "remove-from-cart-icon.png";
            else
                added_to_cart_image.src = "add-to-cart-icon.png";
            let toggle_cart_result = await toggleCart(product, true);
            if (toggle_cart_result == -1) {
                return;
            };
            toggle_buttons([add_to_cart_button, favorite_button], product);
            added_to_cart_image.style.position = "absolute";
            added_to_cart_image.style.top = rect.top + (rect.height/4) + "px";
            added_to_cart_image.style.left = rect.left + (rect.width/4) + "px";
            document.body.appendChild(added_to_cart_image);

            setTimeout(() => {
                document.body.removeChild(added_to_cart_image);
                toggleCartInfo(product);
            }, 500);
        }, 1000);
    });

    product_info_image.addEventListener("pointerup", () => {
        clearTimeout(pressTimeout);
    });

    product_info_image.addEventListener("pointerup", () => {
        click_count++;
        if (click_count == 1) {
            timer = setTimeout(() => {
                click_count = 0;
            }, 300);
        } else if (click_count == 2) {
            click_count = 0;
            clearTimeout(timer);
            const rect = product_info_image.getBoundingClientRect();
            let added_to_favourites_image = document.createElement("img");
            added_to_favourites_image.style.zIndex = "1000";
            added_to_favourites_image.id = null;
            added_to_favourites_image.style.width = rect.width/2 + "px";
            if (product["favourite"]) {
                added_to_favourites_image.src = "heart-icon-black.png";
            } else {
                added_to_favourites_image.src = "heart-icon.png";
            }
            toggleFavourite(product);
            added_to_favourites_image.style.position = "absolute";
            added_to_favourites_image.style.top = rect.top + (rect.height/4) + "px";
            added_to_favourites_image.style.left = rect.left + (rect.width/4) + "px";
            document.body.appendChild(added_to_favourites_image);
            setTimeout(() => {document.body.removeChild(added_to_favourites_image);}, 500);
            toggle_buttons([add_to_cart_button, favorite_button], product);
        }
    })
    
    return product_info_div;
}

let listening = false;

function toggle_buttons(buttons, product) {
    if (product["cart"]) {
        buttons[0].classList.add("add_to_cart_button_active");
        buttons[0].classList.remove("add_to_cart_button_inactive");
    } else {
        buttons[0].classList.add("add_to_cart_button_inactive");
        buttons[0].classList.remove("add_to_cart_button_active");
    }

    if (product["favourite"]) {
        buttons[1].classList.add("favourite_button_active");
        buttons[1].classList.remove("favorite_button_inactive");
    } else {
        buttons[1].classList.add("favorite_button_inactive");
        buttons[1].classList.remove("favourite_button_active");
    }
}

const loadFooter = () => {
    // footer
    const footer = document.querySelector("footer");

    // add search menu
    const search = document.createElement("img");
    search.src = "icon-search.png";
    search.alt = "Search";
    footer.appendChild(search);

    // load main
    search.addEventListener("pointerdown", () => {
        loadMain();
    });

    // add search menu
    
    try {
        new webkitSpeechRecognition();
        const searchByVoice = document.createElement("img");
        searchByVoice.id = "search_by_voice_icon";
        searchByVoice.style.borderRadius = "100px";
        searchByVoice.src = "mic-icon.png";
        searchByVoice.alt = "searchByVoice";
        footer.appendChild(searchByVoice);
        searchByVoice.addEventListener("pointerdown", () => {
        if (!listening)
            busquedaPorVoz();
        else
            cancelarBusquedaPorVoz();
        });
    } catch (ReferenceError){
        console.error("Webkit Speech Recognition not supported in this browser.");
    }
    
    // add nfc reader if enabled in browser
    try {
        new NDEFReader();
        const nfcReader = document.createElement("img");
        nfcReader.src = "icon-nfc.png";
        nfcReader.alt = "NFC Reader";
        footer.appendChild(nfcReader);
    
        // read nfc
        nfcReader.addEventListener("pointerdown", async () => {
            const product = await utils.handleNFC("read");
            if (product) {
                loadProductInfo(product);
            }
        });
    } catch (ReferenceError) {
        console.error("NFC Reading not supported in this browser.")
    }


    // add favourites
    const favourites = document.createElement("img");
    favourites.src = "icon-favourites.png";
    favourites.alt = "Favourites";
    footer.appendChild(favourites);

    // load favourites
    favourites.addEventListener("pointerdown", () => {
        loadFavourites();
    });

    // add cart
    const cart = document.createElement("img");
    cart.src = "icon-cart.png";
    cart.alt = "Cart";
    footer.appendChild(cart);

    // load cart
    cart.addEventListener("pointerdown", () => {
        loadCart();
    });
}

const loadMain = async () => {
    // clear main body
    utils.mainBody.innerHTML = "";

    // rename header
    utils.loadHeader("Products");

    // receive products list
    if (products.length === 0) {
        const response = await fetchProducts("receive");
        response && (products = await response.json());
    }

    loadList("productsList");
}

const toggleFavourite = async (product) => {
    // update products list
    product.favourite = !product.favourite;
    toggleHeart(product);

    // send products list
    await fetchProducts("send");
}

const toggleCart = async (product, notoggle = false) => {
    // update products list
    let numero = 0;
    if (product.cart == false) {
        do {
            numero = prompt("Por favor ingresa un número entre 1 y 100:");
            if (numero === null) {
                return -1;
            }
            numero = parseInt(numero); // Convertir el valor ingresado a un número entero
        } while (isNaN(numero) || numero < 1 || numero > 100); // Repetir hasta que se ingrese un número válido
    }
    product.quantity = numero;
    product.cart = !product.cart;
    if (!notoggle)
        toggleCartInfo(product);

    // send products list
    await fetchProducts("send");
    return 0;
}

let recognition;
try {
    recognition = new webkitSpeechRecognition();
} catch (ReferenceError) {}


//busqueda por voz
function busquedaPorVoz() {
    if (!webkitSpeechRecognition) {
        console.error("Webkit Speech Recognition not supported in this browser.");
        return;
    }

    document.getElementById("search_by_voice_icon").style.backgroundColor = "darkred";
    
    recognition.lang = 'en-GB'; // Establece el idioma
    recognition.interimResults = false; // Para obtener resultados intermedios o no

    recognition.start(); // Inicia la escucha por voz
    listening = true

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log('Texto capturado:', result);
        const product_obj = products.filter(producto => producto.name.toLowerCase() == result.toLowerCase());
        if (product_obj.length > 0) {
            loadProductInfo(product_obj[0]);
            //alert("producto econtrado");
        } else {
            alert("producto no encontrado");
        }
    };
}

function cancelarBusquedaPorVoz () {
    document.getElementById("search_by_voice_icon").style.backgroundColor = "transparent";
    recognition.stop();
    listening = false;
}

// Función para manejar el evento de movimiento del dispositivo
function handleDeviceMotion(event) {
    const acceleration = event.acceleration;
    const accelerationTotal = Math.sqrt(acceleration.x**2 + acceleration.y**2 + acceleration.z**2);
    if (!acceleration) return;

    const shakeThreshold = 25; 
    if (accelerationTotal > shakeThreshold) {
        // Agitar desde el carrito para borrar todo el carrito
        if(document.querySelector("h1").innerHTML== "Cart") {
            const confirmation = confirm("¿Estás seguro de vaciar el carrito?");
            if (confirmation) {
                console.log("Se ha detectado una sacudida. Vaciar carrito.");
                products.forEach((product) => {
                    if (product.cart) {
                        toggleCart(product);
                    }
                });
                console.log("Carrito vaciado");
                loadCart();
            } else {
                console.log("Operación cancelada. El carrito no se ha vaciado.");
            }
        // Agitar desde favoritos para borrar todos los favoritos
        } else if(document.querySelector("h1").innerHTML== "Favourites") {
            const confirmation = confirm("¿Estás seguro de vaciar la lista de favoritos?");
            if (confirmation) {
                console.log("Se ha detectado una sacudida. Vaciar favoritos.");
                products.forEach((product) => {
                    if (product.favourite) {
                        toggleFavourite(product);
                    }
                });
                console.log("favoritos vaciado");
                loadFavourites();
            } else {
                console.log("Operación cancelada. La lista de favoritos no se ha vaciado.");
            }
        }
    }
}

// Agregar un event listener para el evento devicemotion
window.addEventListener("devicemotion", handleDeviceMotion);

loadMain();
loadFooter();