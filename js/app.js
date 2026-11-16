let menuData = null;
let activeCategory = "all";

const productsContainer = document.getElementById("products");
const categoriesContainer = document.getElementById("categories");
const emptyState = document.getElementById("emptyState");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function loadMenu() {
    try {
        const response = await fetch("./data/menu.json");

        if (!response.ok) {
            throw new Error("Failed to load menu.json");
        }

        menuData = await response.json();

        applyCafeSettings();
        renderCategories();
        renderProducts();

    } catch (error) {
        console.error("Menu loading error:", error);

        if (productsContainer) {
            productsContainer.innerHTML =
                '<p class="error-message">خطا در بارگذاری منو. لطفاً صفحه را دوباره بارگذاری کنید.</p>';
        }
    }
}

function applyCafeSettings() {
    const cafe = menuData.cafe;

    document.title = `${cafe.name} | منوی کافه`;

    const cafeName = document.getElementById("cafeName");
    const cafeSubtitle = document.getElementById("cafeSubtitle");
    const cafeDescription = document.getElementById("cafeDescription");
    const cafeLogo = document.getElementById("cafeLogo");
    const hero = document.getElementById("hero");

    if (cafeName) {
        cafeName.textContent = cafe.name;
    }

    if (cafeSubtitle) {
        cafeSubtitle.textContent = cafe.subtitle;
    }

    if (cafeDescription) {
        cafeDescription.textContent = cafe.description;
    }

    if (cafeLogo && cafe.logo) {
        cafeLogo.src = cafe.logo;

        cafeLogo.onerror = function () {
            this.style.display = "none";
        };
    }

    if (hero && cafe.background) {
        hero.style.backgroundImage =
            `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url("${cafe.background}")`;
    }

    if (cafe.theme) {
        const root = document.documentElement;

        root.style.setProperty("--primary", cafe.theme.primary);
        root.style.setProperty("--background", cafe.theme.background);
        root.style.setProperty("--surface", cafe.theme.surface);
        root.style.setProperty("--text", cafe.theme.text);
        root.style.setProperty("--muted", cafe.theme.muted);
    }

    const footerCafeName = document.getElementById("footerCafeName");
    const cafeAddress = document.getElementById("cafeAddress");
    const cafePhone = document.getElementById("cafePhone");
    const cafeInstagram = document.getElementById("cafeInstagram");

    if (footerCafeName) {
        footerCafeName.textContent = cafe.name;
    }

    if (cafeAddress) {
        cafeAddress.textContent = cafe.address || "";
    }

    if (cafePhone) {
        cafePhone.textContent = cafe.phone || "";
        cafePhone.href = cafe.phone ? `tel:${cafe.phone}` : "#";
    }

    if (cafeInstagram) {
        cafeInstagram.textContent = cafe.instagram || "";

        if (cafe.instagram) {
            cafeInstagram.href = cafe.instagram.startsWith("http")
                ? cafe.instagram
                : `https://instagram.com/${cafe.instagram.replace("@", "")}`;
        } else {
            cafeInstagram.style.display = "none";
        }
    }
}

function renderCategories() {
    if (!categoriesContainer) return;

    const categories = [
        { id: "all", name: "همه محصولات" },
        ...menuData.categories
    ];

    categoriesContainer.innerHTML = categories.map(category => `
        <button
            class="category-btn ${activeCategory === category.id ? "active" : ""}"
            data-category="${escapeHTML(category.id)}"
        >
            ${escapeHTML(category.name)}
        </button>
    `).join("");

    categoriesContainer.querySelectorAll(".category-btn").forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category;

            renderCategories();
            renderProducts();
        });
    });
}

function renderProducts() {
    if (!productsContainer) return;

    let products = menuData.products;

    if (activeCategory !== "all") {
        products = products.filter(
            product => product.category === activeCategory
        );
    }

    if (emptyState) {
        emptyState.style.display = products.length === 0 ? "block" : "none";
    }

    productsContainer.innerHTML = products.map(product => {
        const imagePath = product.image
            ? escapeHTML(product.image)
            : "";

        return `
            <article class="product-card">

                <div class="product-image">
                    ${imagePath ? `
                        <img
                            src="${imagePath}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy"
                            onerror="this.parentElement.remove()"
                        >
                    ` : ""}
                </div>

                <div class="product-info">

                    <div class="product-header">
                        <h3 class="product-name">
                            ${escapeHTML(product.name)}
                        </h3>

                        ${product.featured ? `
                            <span class="featured-badge">
                                پیشنهاد کافه
                            </span>
                        ` : ""}
                    </div>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="product-footer">
                        <span class="product-price">
                            ${Number(product.price).toLocaleString("fa-IR")}
                            ${escapeHTML(menuData.cafe.currency)}
                        </span>
                    </div>

                </div>

            </article>
        `;
    }).join("");
}

loadMenu();