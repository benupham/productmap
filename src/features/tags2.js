import Feature from "ol/feature"
import Point from "ol/geom/point"
import Icon from "ol/style/icon"
import Style from "ol/style/style"

import { imagesDir, productsImageMax } from "../constants.js"
import { productsSource, tagsSource } from "./getFeatureData"
import { textFormatter, iconcache, styleCache, getFeatureJson } from "../utilities.js"
import { updateCart, checkCart } from "../components/cart.js"
import { omnibox } from "../components/omnibox.js"

/*
 * Product on Sale, in Cart, Tagged Features and Styles
 *
 */

const tagsData = {
  sale: { color: "", src: "sale-red.png" },
  add: { color: "", src: "add.png" },
  remove: { color: "", src: "remove.png" }
}

export const tagsFeatureRender = function (features, colors = null, tagType = "sale") {
  let tags = []
  features.forEach((f) => {
    if (f.properties.type == "product" && f.properties.price.indexOf("Reg") > -1) {
      const tag = new Feature({
        geometry: new Point([f.geometry.coordinates[0] - 75, f.geometry.coordinates[1] + 75]),
        name: f.id + "-" + tagType,
        type: tagType,
        style: "tag",
        fid: f.id
      })
      tag.setId(f.id + "-" + tagType)
      tags.push(tag)
    }
  })
  return tags
}

export const tagsStyle = function (tag, resolution) {
  const type = tag.get("type")
  const src = tagsData[type].src
  let style = {}

  let tagIcon = iconcache[src]

  if (!tagIcon) {
    tagIcon = new Icon({
      size: [48, 48],
      crossOrigin: "anonymous",
      src: imagesDir + "product-images/tags/" + src
    })
  }

  if (type === "sale") {
    tagIcon.setScale(1 / resolution)
  } else {
    const res = 1 / resolution + 0.2 > 1 ? 1 : 1 / resolution + 0.2
    tagIcon.setScale(res)
  }

  iconcache[src] = tagIcon

  style = new Style({
    image: tagIcon,
    zIndex: type === "remove" ? 10 : 0
  })

  return style
}

// TAG FUNCTIONS
export const cartAddIcon = new Feature({
  geometry: new Point([null, null]),
  name: "cart-add-icon",
  type: "add",
  style: "tag"
})
cartAddIcon.setId("cart-add-icon")

export const setCartAddIcon = function (product) {
  // send nowhere if false
  if (product === false) {
    cartAddIcon.getGeometry().setCoordinates([null, null])
    return
  }

  // get product coord
  const coordinate = product.getGeometry().getCoordinates()
  cartAddIcon.getGeometry().setCoordinates([coordinate[0] + 75, coordinate[1] + 75])
  cartAddIcon.set("fid", product.get("fid"))
}

export const setCartRemoveIcon = function (fid) {
  fid = Number(fid)
  if (!checkCart(fid)) {
    if (tagsSource.getFeatureById("remove-" + fid) != null) {
      const icon = tagsSource.getFeatureById("remove-" + fid)
      tagsSource.removeFeature(icon)
    }
  } else {
    const product = omnibox.featureData.find((f) => f.id === fid)
    const coord = product.geometry.coordinates
    const cartRemoveIcon = new Feature({
      type: "remove",
      src: tagsData["remove"].src,
      geometry: new Point([coord[0] + 75, coord[1] + 75]),
      fid: fid
    })
    cartRemoveIcon.setId("remove-" + fid)
    tagsSource.addFeature(cartRemoveIcon)
  }
}

export const cartIconHandleClick = function (cartIcon) {
  const fid = cartIcon.get("fid")
  updateCart(fid)
}
