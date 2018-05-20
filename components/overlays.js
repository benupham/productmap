import Overlay from 'ol/overlay';
import {updateAddCartButton, updateCart} from '../components/cart.js';
import {productsVectorSource} from '../index.js';

/*
* Overlays
* 
*/

// Product Card Overlay (hover)
export const productCardOverlay = new Overlay({
  element: document.getElementById('product-card'),
  id: 'productCard',
  autoPan: false,
  stopEvent: false
});

// Product Overlay (click)
export const productDetailOverlay = new Overlay({
  element: document.getElementById('product-overlay'),
  id: 'productDetail',
  autoPan: true,
  stopEvent: false
});

const signs = {};
for (let i = 0; i < 4; i++) {
  signs[i] = new Overlay({
    element: document.getElementById('sign-' + i),
    autoPan: false,
    stopEvent: true
  });
  // map.addOverlay(signage[i]);
}

export const signage = signs; 

export const openProductDetail = function(e) {
  hideOverlay(productCardOverlay);
  const pId = this.getAttribute('data-pid');
  const p = productsVectorSource.getFeatureById(pId);
  renderProductOverlay(p,productDetailOverlay);
}

export const renderProductOverlay = function(product, overlay) {
  // need to hide all visible overlays on render...
  //SCREAMING OUT for React here...
  overlay.getElement().onpointermove = function(e) {e.stopPropagation()};
  overlay.getElement().onpointerdown = function(e) {e.stopPropagation()};
  overlay.getElement().style.display = 'block';
  overlay.set('product', product.getId());
  const coordinate = product.getGeometry().getCoordinates();

  const btn = overlay.getElement().querySelector('.add-to-cart');
  btn.setAttribute('data-pid', product.getId());
  const inCart = product.get('inCart') || false;
  updateAddCartButton(inCart, btn);
  btn.addEventListener('click', updateCart);

  overlay.setPosition(coordinate);

  let name = overlay.getElement().querySelector('.product-name');
  name.setAttribute('data-pid', product.getId());
  let price = overlay.getElement().querySelector('.product-price');
  price.setAttribute('data-pid', product.getId());
  let image = overlay.getElement().querySelector('.product-image');
  image.setAttribute('data-pid', product.getId());

  if (overlay.getId() == 'productCard') {
    image.addEventListener('click', openProductDetail);
    name.addEventListener('click', openProductDetail);
    price.addEventListener('click', openProductDetail);
  }

  name.textContent = product.get('name');
  price.textContent = product.get('price');

  image.src = '';
  image.src = product.get('src');
  const offset = [-100 - image.offsetLeft, -100 - image.offsetTop];
  overlay.setOffset(offset); 
} 

export const hideOverlay = function(overlay) {
  overlay.getElement().style.display = 'none';
}
