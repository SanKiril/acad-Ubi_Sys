const main_body = document.querySelector("main");
let productsList;
let favouritesList;
let cartList;
let products = [];

const loadProducts = () => {
    // products list
    if (!productsList) {
        productsList = document.createElement("ul");
        productsList.classList.add("products-list");
        
        // add products to products list
        products.forEach(product => {
            // product item
            const productItem = document.createElement("li");
            productItem.classList.add("products-list-item");
            productsList.appendChild(productItem);

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
        productsList.addEventListener("pointerdown", event => {
            const targetProduct = event.target.closest(".products-list-item");
            if (targetProduct) {
                const index = Array.from(productsList.children).indexOf(targetProduct);
                const product = products[index];
                loadProductInfo(product);
            }
        });
    }
    main_body.appendChild(productsList);
}

const loadFavourites = () => {
    // clear main body
    main_body.innerHTML = "";

    // favourites list
    if (!favouritesList) {
        favouritesList = document.createElement("ul");
        favouritesList.classList.add("products-list");

        // add products to favourites list
        products.filter(product => product.favourite).forEach(product => {
            // product item
            const productItem = document.createElement("li");
            productItem.classList.add("products-list-item");
            favouritesList.appendChild(productItem);

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
        productsList.addEventListener("pointerdown", event => {
            const targetProduct = event.target.closest(".products-list-item");
            if (targetProduct) {
                const index = Array.from(productsList.children).indexOf(targetProduct);
                const product = products[index];
                loadProductInfo(product);
            }
        });
    }
    main_body.appendChild(favouritesList);
}

const loadCart = () => {
    // clear main body
    main_body.innerHTML = "";

    // cart list
    if (!cartList) {
        cartList = document.createElement("ul");
        cartList.classList.add("products-list");
    
        // add products to cart list
        products.filter(product => product.cart).forEach(product => {
            // product item
            const productItem = document.createElement("li");
            productItem.classList.add("products-list-item");
            cartList.appendChild(productItem);

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
        productsList.addEventListener("pointerdown", event => {
            const targetProduct = event.target.closest(".products-list-item");
            if (targetProduct) {
                const index = Array.from(productsList.children).indexOf(targetProduct);
                const product = products[index];
                loadProductInfo(product);
            }
        });
    }
    main_body.appendChild(cartList);
}

const loadProductInfo = (product) => {
    // TODO
}

const loadFooter = () => {
    // footer
    const footer = document.querySelector("footer");
    document.body.appendChild(footer);

    // add favourites
    const favourites = document.createElement("img");
    favourites.src = "icon-favourites.png";
    favourites.alt = "Favourites";
    footer.appendChild(favourites);
    favourites.addEventListener("pointerdown", event => {
        loadFavourites();
    });  // load favourites

    // add cart
    const cart = document.createElement("img");
    cart.src = "icon-cart.png";
    cart.alt = "Cart";
    footer.appendChild(cart);
    cart.addEventListener("pointerdown", event => {
        loadCart();
    });  // load cart
}

const loadMain = async () => {
    // clear main body
    main_body.innerHTML = "";
    
    // fetch products
    if (products.length === 0) {
        const response = await fetch("products.json");
        products = await response.json();
        loadFooter();
    }

    loadProducts();
}

loadMain();