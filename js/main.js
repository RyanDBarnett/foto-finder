const addPhotoBtn = document.querySelector('.add-photo');
const cardsContainer = document.querySelector('.cards-container');
const reader = new FileReader();

let album = JSON.parse(localStorage.getItem('album')) || [];

window.addEventListener('load', onLoad);
addPhotoBtn.addEventListener('click', loadImg);
cardsContainer.addEventListener('click', clickHandler);
cardsContainer.addEventListener('mouseover', mouseOverHandler);
cardsContainer.addEventListener('mouseout', mouseOutHandler);

function onLoad() {
  var oldAlbum = album;
  album = [];
  oldAlbum.forEach( (photo) => {
    var recreatedPhoto = new Photo(photo.title, photo.caption, photo.image, photo.id, photo.favorite);
    album.push(recreatedPhoto);
    createCard(recreatedPhoto);
  });
  var favBtns = cardsContainer.querySelectorAll('.favorite');
  favBtns.forEach( (btn) => {
    if (JSON.parse(btn.dataset.favorite)) {
      activate(btn);
      addToFavCount();
    }
  });
}

function loadImg(e) {
  e.preventDefault();
  var imageInput = document.querySelector('#image-input');
  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]); 
    reader.onload = addPhoto;
  }
}

function addPhoto(e) {
  var title = document.querySelector('.title');
  var caption = document.querySelector('.caption');
  var newPhoto = new Photo(title.value, caption.value, e.target.result, Date.now());

  album.push(newPhoto);
  createCard(newPhoto);
  newPhoto.saveToStorage(album);

  clearInput(title);
  clearInput(caption);
}

function clearInput(element) {
  element.value = '';
}

function createCard(photo) {
  var card = `<section class="card" data-id="${photo.id}">
        <h2 contenteditable="true">${photo.title}</h2>
        <figure>
          <img src=${photo.image} />
          <figcaption contenteditable="true">
            ${photo.caption}
          </figcaption>
        </figure>
        <footer>
          <img class="delete" src="media/delete.svg" alt="delete button"/>
          <img class="favorite" data-favorite="${photo.favorite}" src="media/favorite.svg" alt="favorite button"/>
        </footer>
      </section>`
  cardsContainer.innerHTML += card;
}

function clickHandler(e) {
  if (notCard(e)) return;

  let card = e.target.closest('.card');
  let id = Number(card.dataset.id);
  let photo = findPhoto(id);
  let btn = e.target;

  if (deleteBtn(e)) deleteThe(photo, card);

  if (favoriteBtn(e)) favoriteThe(photo, btn);
}

function favoriteThe(photo, btn) {
  photo.toggleFavorite();
  favoritePhoto(btn);
}

function deleteThe(photo, card) {
  if (photo.favorite) minusFavCount();
  photo.deleteFromStorage();
  card.remove();
}

function notCard(e) {
  return e.target.className === 'cards-container';
}

function deleteBtn(e) {
  return e.target.className === 'delete';
}

function favoriteBtn(e) {
  return e.target.className === 'favorite';
}

function favoritePhoto(favBtn) {
  toggleFavoriteDataAttr(favBtn);
  let ifFavorited = JSON.parse(favBtn.dataset.favorite);
  changeFavoriteCounter(ifFavorited);
  ifFavorited ? activate(favBtn) : deactivate(favBtn);
}

function toggleFavoriteDataAttr(favBtn) {
  favBtn.dataset.favorite = !JSON.parse(favBtn.dataset.favorite);
}

function changeFavoriteCounter(ifFav) {
  ifFav ? addToFavCount() : minusFavCount();
}

function mouseOverHandler(e) {
  if (deleteBtn(e)) {
    activate(e.target);
  }
  if (favoriteBtn(e)) {
    activate(e.target);
  }
}

function mouseOutHandler(e) {
  if (e.target.className === 'delete') {
    deactivate(e.target);
  }
  if (e.target.className === 'favorite') {
    deactivate(e.target);
  }
}

function addToFavCount() {
  const favCountElement = document.querySelector('.total-favorites');
  let count = Number(favCountElement.innerHTML);
  count++;
  favCountElement.innerHTML = count;

}

function minusFavCount() {
  const favCountElement = document.querySelector('.total-favorites');
  let count = Number(favCountElement.innerHTML);
  count--;
  favCountElement.innerHTML = count;
}

function activate(element) {
  var src = element.getAttribute('src').split('.');
  if (!src[0].includes('-')) {
    element.setAttribute('src', `${src[0]}-active.svg`);
  }
}

function deactivate(element) {
  var favorite = false;
  if (element.dataset.favorite) {
    favorite = JSON.parse(element.dataset.favorite);
  }
  var src = element.getAttribute('src').split('-');
  if (!favorite && !src[0].includes('.svg')) {
    element.setAttribute('src', `${src[0]}.svg`);
  }
}

function findPhoto(id) {
  return album.find( (photo) => photo.id === id);
}