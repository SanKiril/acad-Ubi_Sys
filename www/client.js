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
    utils.main_body.appendChild(list);

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
    list.addEventListener("pointerdown", event => {
        const targetProduct = event.target.closest(".products-list-item");
        if (targetProduct) {
            const index = Array.from(list.children).indexOf(targetProduct);
            const product = filteredProducts[index];
            loadProductInfo(product);
        }
    });
}

const loadFavourites = () => {
    // clear main body
    utils.main_body.innerHTML = "";

    // rename header
    utils.loadHeader("Favourites");

    // favourites list
    loadList("favouritesList");
}

const loadCart = () => {
    // clear main body
    utils.main_body.innerHTML = "";

    // rename header
    utils.loadHeader("Cart");

    // cart list
    loadList("cartList");
}

const loadProductInfo = (product) => {
    // clear main body
    utils.main_body.innerHTML = "";
    utils.main_body.appendChild(getProductInfoContent(product));

    // rename header
    utils.loadHeader("Product Info");
}

function getProductInfoContent(product) {
    let product_info_div = document.createElement("div");
    product_info_div.id = "product_info";

    let product_name_header = document.createElement("h1");
    product_name_header.innerHTML = product["name"];
    product_info_div.appendChild(product_name_header);

    let product_info_inner_div = document.createElement("div");
    product_info_inner_div.id = "product_info_inner";

    let product_info_text = document.createElement("p");
    product_info_text.innerHTML = product["product_info"];
    product_info_text.style="white-space: pre-wrap;"
    product_info_inner_div.appendChild(product_info_text);

    let product_info_image = document.createElement("img");
    product_info_image.src = product["image"];
    product_info_image.alt = product["name"];
    product_info_inner_div.appendChild(product_info_image);

    product_info_div.appendChild(product_info_inner_div);

    let buttons_div = document.createElement("div");
    buttons_div.className = "product_info_buttons_div";

    let add_to_cart_button = document.createElement("button");
    add_to_cart_button.className = "add_to_cart_button";
    buttons_div.appendChild(add_to_cart_button);

    add_to_cart_button.addEventListener("click", () => {
        product["cart"] = !product["cart"];
        toggle_buttons([add_to_cart_button, favorite_button], product);
    });

    let favorite_button = document.createElement("button");
    favorite_button.className = "favorite_button";
    buttons_div.appendChild(favorite_button);

    favorite_button.addEventListener("click", () => {
        product["favourite"] = !product["favourite"];
        toggle_buttons([add_to_cart_button, favorite_button], product);
    });

    toggle_buttons([add_to_cart_button, favorite_button], product);

    product_info_div.appendChild(buttons_div);
    
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
    nfcReader.addEventListener("pointerdown", () => {
        utils.loadNFC();
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
    utils.main_body.innerHTML = "";

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

loadMain();
loadFooter();