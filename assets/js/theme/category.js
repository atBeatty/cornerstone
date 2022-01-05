import { hooks, api } from "@bigcommerce/stencil-utils"
import CatalogPage from "./catalog"
import compareProducts from "./global/compare-products"
import FacetedSearch from "./common/faceted-search"
import { createTranslationDictionary } from "../theme/common/utils/translations-utils"

export default class Category extends CatalogPage {
  constructor(context) {
    super(context)
    this.validationDictionary = createTranslationDictionary(context)
  }

  setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
    $element.attr({
      role: roleType,
      "aria-live": ariaLiveStatus,
    })
  }

  makeShopByPriceFilterAccessible() {
    if (!$("[data-shop-by-price]").length) return

    if ($(".navList-action").hasClass("is-active")) {
      $("a.navList-action.is-active").focus()
    }

    $("a.navList-action").on("click", () =>
      this.setLiveRegionAttributes(
        $("span.price-filter-message"),
        "status",
        "assertive"
      )
    )
  }

  onReady() {
    this.addAlternateImage()
    this.addAllToCart()
    // const imageHover = $("div.image-hover")[0];
    // imageHover.addEventListener("mouseover", this.onProductListingHover);
    // console.log(imageHover)
    this.arrangeFocusOnSortBy()

    $('[data-button-type="add-cart"]').on("click", (e) =>
      this.setLiveRegionAttributes(
        $(e.currentTarget).next(),
        "status",
        "polite"
      )
    )

    this.makeShopByPriceFilterAccessible()

    compareProducts(this.context)

    if ($("#facetedSearch").length > 0) {
      this.initFacetedSearch()
    } else {
      this.onSortBySubmit = this.onSortBySubmit.bind(this)
      hooks.on("sortBy-submitted", this.onSortBySubmit)
    }

    $("a.reset-btn").on("click", () =>
      this.setLiveRegionsAttributes($("span.reset-message"), "status", "polite")
    )

    this.ariaNotifyNoProducts()
  }

  ariaNotifyNoProducts() {
    const $noProductsMessage = $("[data-no-products-notification]")
    if ($noProductsMessage.length) {
      $noProductsMessage.focus()
    }
  }

  initFacetedSearch() {
    const {
      price_min_evaluation: onMinPriceError,
      price_max_evaluation: onMaxPriceError,
      price_min_not_entered: minPriceNotEntered,
      price_max_not_entered: maxPriceNotEntered,
      price_invalid_value: onInvalidPrice,
    } = this.validationDictionary
    const $productListingContainer = $("#product-listing-container")
    const $facetedSearchContainer = $("#faceted-search-container")
    const productsPerPage = this.context.categoryProductsPerPage
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true,
          products: {
            limit: productsPerPage,
          },
        },
      },
      template: {
        productListing: "category/product-listing",
        sidebar: "category/sidebar",
      },
      showMore: "category/show-more",
    }

    this.facetedSearch = new FacetedSearch(
      requestOptions,
      (content) => {
        $productListingContainer.html(content.productListing)
        $facetedSearchContainer.html(content.sidebar)

        $("body").triggerHandler("compareReset")

        $("html, body").animate(
          {
            scrollTop: 0,
          },
          100
        )
      },
      {
        validationErrorMessages: {
          onMinPriceError,
          onMaxPriceError,
          minPriceNotEntered,
          maxPriceNotEntered,
          onInvalidPrice,
        },
      }
    )
  }

  addAllToCart() {
    let currentCart = {}
    function getCart(url) {
      return fetch(url, {
        method: "GET",
        credentials: "same-origin",
      }).then((response) => response.json())
    }
    getCart(
      "/api/storefront/carts?include=lineItems.digitalItems.options,lineItems.physicalItems.options"
    )
      .then((data) => {
        currentCart["data"] = data[0]
      })
      .catch((error) => console.error(error))
    const $button = $("#add-category-products")
    $button.on("click", (e) => {
      console.log(currentCart.data)
    })

    // All products from category
    const productIds = $('button[data-product-id!=""]')
    console.log(
      productIds.map((_, element) => $(element).data("product-id")),
      typeof productIds
    )
  }

  addAlternateImage() {
    // const cards = $('.card')
    const cards = document.querySelectorAll(".card")
    const cardArray = Array.from(cards)

    cardArray.forEach((card) => {
      const figCaption = card.querySelector("figcaption")
      const firstImg = card.querySelector(".card-img-container img")
      //   const secondImg = firstImg.nextElementSibling;
      card.addEventListener("mouseenter", (e) => {
        // secondImg.style.opacity = 0;
        firstImg.style.zIndex = 10
        figCaption.style.zIndex = 20
      })
      card.addEventListener("mouseleave", (e) => {
        // secondImg.style.opacity = 1;
        firstImg.style.zIndex = ""
        figCaption.style.zIndex = ""
      })
    })
  }
}
