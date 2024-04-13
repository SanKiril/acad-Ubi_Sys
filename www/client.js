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

    // add products to list
    filteredProducts.forEach(product => {
        // product item
        const productItem = document.createElement("li");
        productItem.classList.add("products-list-item");
        list.appendChild(productItem);

        // product item image
        const productImage = document.createElement("img");
        productImage.src = product.image;
        productImage.alt = product.name;
        productItem.appendChild(productImage);

        // product item name
        const productName = document.createElement("p");
        productName.innerHTML = product.name;
        productItem.appendChild(productName);
    });

    // load product info
    let startY = NaN;
    let endY = NaN;
    let fisrtClick = false;
    let firstTarget = null;
    let timeoutId; 

    list.addEventListener("pointerdown", event => {
        startY = event.clientY;
        const targetProduct = event.target.closest(".products-list-item");
        if (firstTarget == targetProduct && fisrtClick == true) {
            const index = Array.from(list.children).indexOf(targetProduct);
            const product = filteredProducts[index];
            toggleFavourite(product);
            fisrtClick = false;
            clearTimeout(timeoutId);
        } else {
            timeoutId = setTimeout(() => {
                if (isNaN(endY)) {
                    endY = startY;
                }
                if (targetProduct && (Math.abs(startY-endY) < 5 )) {
                    const index = Array.from(list.children).indexOf(targetProduct);
                    const product = filteredProducts[index];
                    fisrtClick = false;
                    loadProductInfo(product);
                }           
            }, 400);
        }
        firstTarget = targetProduct;
    });

    // clean variables
    list.addEventListener("pointerup", event => {
        endY = NaN;
        if(fisrtClick == true) {
            startY = NaN;
        }
        fisrtClick = true;
    });

    // obtain movment
    list.addEventListener("pointermove",event =>{
        endY = event.clientY;
    });

    //para favoritos doble click toggle favorite

    //para borrar desplizar togglecart 170px que sea visible

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
        if(document.querySelector("h1").innerHTML== "Cart") { //  meter confirmacion estas seguro?  duplicar para favoritos
            const confirmation = confirm("¿Estás seguro de vaciar el carrito?");
            if (confirmation) {
                console.log("Se ha detectado una sacudida. Vaciar carrito.");
                products.forEach((product) => product.cart = false);
                console.log("Carrito vaciado");
                loadCart();
            } else {
                console.log("Operación cancelada. El carrito no se ha vaciado.");
            }
        }
    }
}

// Agregar un event listener para el evento devicemotion
window.addEventListener("devicemotion", handleDeviceMotion);

loadMain();
loadFooter();