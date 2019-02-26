const addPhotoBtn = document.querySelector('.add-photo');
const cardsContainer = document.querySelector('.cards-container');
const fileInput = document.querySelector('#image-input');
const reader = new FileReader();

let album = JSON.parse(localStorage.getItem('album')) || [];

window.addEventListener('load', onLoad);
addPhotoBtn.addEventListener('click', loadImg);
cardsContainer.addEventListener('click', clickHandler);
cardsContainer.addEventListener('mouseover', mouseOverHandler);
cardsContainer.addEventListener('mouseout', mouseOutHandler);
fileInput.addEventListener( 'change', updateFileInputLabel);

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
      activateFav(btn);
      addToFavCount();
    }
  });
}

function loadImg(e) {
  e.preventDefault();
  if (fileInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]); 
    reader.onload = addPhoto;
  }
}

function addPhoto(e) {
  var title = document.querySelector('#title');
  var caption = document.querySelector('#caption');
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

function updateFileInputLabel(e) {
  let label  = fileInput.parentElement;
  let labelVal = label.innerText;
  let fileName = '';
  
  if (this.files) {
    fileName = e.target.value;
  }

  fileName ? label.querySelector( 'span' ).innerHTML = fileName : label.innerHTML = labelVal;
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
  ifFavorited ? activateFav(favBtn) : deactivateFav(favBtn);
}

function toggleFavoriteDataAttr(favBtn) {
  favBtn.dataset.favorite = !JSON.parse(favBtn.dataset.favorite);
}

function changeFavoriteCounter(ifFav) {
  ifFav ? addToFavCount() : minusFavCount();
}

function mouseOverHandler(e) {
  if (deleteBtn(e)) {
    activateDelete(e.target);
  }
  if (favoriteBtn(e)) {
    activateFav(e.target);
  }
}

function mouseOutHandler(e) {
  if (e.target.className === 'delete') {
    deactivateDelete(e.target);
  }
  if (e.target.className === 'favorite') {
    deactivateFav(e.target);
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

function activateFav(element) {
  element.setAttribute('src', `media/favorite-active.svg`);
}

function deactivateFav(element) {
  if (!JSON.parse(element.dataset.favorite)) {
    element.setAttribute('src', `media/delete.svg`);
  }
}

function activateDelete(element) {
  element.setAttribute('src', `media/delete-active.svg`);
}

function deactivateDelete(element) {
  element.setAttribute('src', `media/delete.svg`);
}

function findPhoto(id) {
  return album.find( (photo) => photo.id === id);
}
