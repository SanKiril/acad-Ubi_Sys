const main_body = document.querySelector("main");
let products = [];

const loadProducts = () => {
    // products list
    const productsList = document.createElement("ul");
    productsList.classList.add("products-list");
    main_body.appendChild(productsList);

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

    // add cart
    const cart = document.createElement("img");
    cart.src = "icon-cart.png";
    cart.alt = "Cart";
    footer.appendChild(cart);
}

const loadMainMenu = async () => {
    // SERVER-CLIENT
    const response = await fetch("products.json");

    // CLIENT ONLY
    products = await response.json();
    loadProducts();
    loadFooter();
}

const loadProductInfo = () => {
    // TODO
}

loadMainMenu();