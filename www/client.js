const main_body = document.querySelector("main");
let productsList;
let favouritesList;
let cartList;
let products = [];

const loadList = (list, listType) => {
    if (!list) {
        list = document.createElement("ul");
        list.classList.add("products-list");

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
    }
    main_body.appendChild(list);
}

const loadFavourites = () => {
    // clear main body
    main_body.innerHTML = "";

    // favourites list
    loadList(favouritesList, "favouritesList");
}

const loadCart = () => {
    // clear main body
    main_body.innerHTML = "";

    // cart list
    loadList(cartList, "cartList");
}

const loadProductInfo = (product) => {
    // clear main body
    main_body.innerHTML = "";
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

    // load favourites
    favourites.addEventListener("pointerdown", event => {
        loadFavourites();
    });

    // add cart
    const cart = document.createElement("img");
    cart.src = "icon-cart.png";
    cart.alt = "Cart";
    footer.appendChild(cart);

    // load cart
    cart.addEventListener("pointerdown", event => {
        loadCart();
    });
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

    loadList(productsList, "productsList");
}

loadMain();