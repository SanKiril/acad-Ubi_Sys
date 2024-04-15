import * as utils from "./utils.js";

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

const loadList = (listType) => {
    // list
    const list = document.createElement("ul");
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
        list.appendChild(productItem);

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
            const dropZone = event.target.alt || event.target.getData("text") || event.target.id;
            let dragged_order;
            let new_order;
            products.forEach(element => {
                if (dropZone == element.name){
                    console.log(element, element.order);
                    new_order = element.order;
                }
                else if (draggedObject.id == element.name){
                    console.log(element, element.order);
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
    let fisrtClick = 0;
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

        // Mantener presionado por 2 segundos para añadir/quitar al carrito
        pressTimeout = setTimeout(() => {
            if (firstTarget) {
                const index = Array.from(list.children).indexOf(firstTarget);
                const product = filteredProducts[index];
                toggleCart(product);
                if (listType == "cartList") {
                    loadCart();
                }
                navigator.vibrate(200);
                }
            }, 2000);
    });

    // clean variables
    list.addEventListener("pointerup", event => {
        // 
        clearTimeout(pressTimeout);
        const targetProduct = event.target.closest(".products-list-item");
        const pressDuration = Date.now() - pressStartTime;

        // Doble click para añadir/quitar de favoritos
        if (firstTarget == targetProduct && fisrtClick == 1) {
            const index = Array.from(list.children).indexOf(targetProduct);
            const product = filteredProducts[index];
            toggleFavourite(product);
            fisrtClick = 2;
            clearTimeout(timeoutId);
            if (listType == "favouritesList") {
                loadFavourites();
            }
            navigator.vibrate(500);
            console.log("togglefavorito hecho;")
        // Si no ha mantenido presionado significa que quiere ir a la pagina del producto
        } else if(pressDuration < 2000){
            timeoutId = setTimeout(() => {
                if (isNaN(endY)) {
                    endY = startY;
                }
                if (targetProduct && (Math.abs(startY-endY) < 5 )) {
                    const index = Array.from(list.children).indexOf(targetProduct);
                    const product = filteredProducts[index];
                    fisrtClick = 0;
                    loadProductInfo(product);
                }           
            }, 400);
        }
        // Ajustar variables
        endY = NaN;
        if(fisrtClick > 0) {startY = NaN;} 
        if (fisrtClick == 2) {fisrtClick = 0
        } else {fisrtClick = 1;}
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

    product_info_div.addEventListener("pointerdown", () => {
        click_count++;
        if (click_count == 1) {
            timer = setTimeout(() => {
                click_count = 0;
            }, 300);
        } else if (click_count == 2) {
            click_count = 0;
            clearTimeout(timer);
            toggleFavourite(product);
            if (product["favourite"]) {
                document.getElementById("added_to_favourites_image").style.visibility = "visible";
                setTimeout(() => {document.getElementById("added_to_favourites_image").style.visibility = "hidden";}, 300);
            }
            toggle_buttons([add_to_cart_button, favorite_button], product);
        }
    })
    
    return product_info_div;
}

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

    // add nfc reader
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

    // send products list
    await fetchProducts("send");
}

const toggleCart = async (product) => {
    // update products list
    product.cart = !product.cart;

    // send products list
    await fetchProducts("send");
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