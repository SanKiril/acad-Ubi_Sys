const main_body = document.querySelector("main");
const MAX_FETCH_RETRIES = 3;
let products = [];


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
    list = document.createElement("ul");
    list.classList.add("products-list");
    main_body.appendChild(list);

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

    // toggle favourite
    // ! TODO
    //toggleFavourite(product);
}

const loadFavourites = () => {
    // clear main body
    main_body.innerHTML = "";
    document.getElementById("back_arrow").style.display = "block";

    // rename header
    loadHeader("Favourites");

    // favourites list
    loadList("favouritesList");
}

const loadCart = () => {
    // clear main body
    main_body.innerHTML = "";
    document.getElementById("back_arrow").style.display = "block";
    // rename header
    loadHeader("Cart");

    // cart list
    loadList("cartList");
}

const loadProductInfo = (product) => {
    // clear main body
    main_body.innerHTML = "";
    document.getElementById("back_arrow").style.display = "block";

    // rename header
    loadHeader("Product Info");

    // ! TODO
}

const loadHeader = (name) => {
    // header
    const header = document.querySelector("header");
    const title = document.querySelector("h1");

    // load main
    if (title.innerHTML === "") {
        document.getElementById("back_arrow").addEventListener("pointerdown", () => {
            loadMain();
        });
    }

    // name header
    title.innerHTML = name;
}

const loadFooter = () => {
    // footer
    const footer = document.querySelector("footer");

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
    main_body.innerHTML = "";
    document.getElementById("back_arrow").style.display = "none";
    // rename header
    loadHeader("Products");

    // receive products list
    if (products.length === 0) {
        response = await fetchProducts("receive");
        response && (products = await response.json());
        loadFooter();
    }

    loadList("productsList");
}

const toggleFavourite = async (product) => {
    // update products list
    product.favourite = !product.favourite;

    // send products list
    await fetchProducts("send");
}

const readNFC = async () => {
    try {
        const nfc = new NDEFReader();
        await nfc.scan();
        nfc.onreading = (event) => {
            loadHeader("WORKS");
        }
        nfc.onerror = (err) => {
            loadHeader("NO WORKS");
            console.error("Error reading NFC token:", err);
        }
    } catch (err) {
        loadHeader("NO WORKS");
        console.error("Error initializing NFC:", err);
    }
}

// Call the function to start NFC scanning
readNFC();

loadMain();