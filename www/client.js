const main_body = document.querySelector("main");
let products = [];

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
            const product = products[index];
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

    // rename header
    loadHeader("Favourites");

    // favourites list
    loadList("favouritesList");
}

const loadCart = () => {
    // clear main body
    main_body.innerHTML = "";

    // rename header
    loadHeader("Cart");

    // cart list
    loadList("cartList");
}

const loadProductInfo = (product) => {
    // clear main body
    main_body.innerHTML = "";

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
        header.addEventListener("pointerdown", () => {
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
    
    // rename header
    loadHeader("Products");

    // fetch products
    if (products.length === 0) {
        const response = await fetch("products.json");
        products = await response.json();
        loadFooter();
    }

    loadList("productsList");
}

const toggleFavourite = (product) => {
    product.favourite = !product.favourite;
}

loadMain();