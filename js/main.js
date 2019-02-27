const addPhotoBtn = document.querySelector('.add-photo');
const favoriteButton = document.querySelector('.favorites');
const cardsContainer = document.querySelector('.cards-container');
const fileInput = document.querySelector('#image-input');
const reader = new FileReader();

let album = JSON.parse(localStorage.getItem('album')) || [];

window.addEventListener('load', onLoad);
addPhotoBtn.addEventListener('click', loadImg);
favoriteButton.addEventListener('click', toggleViewFavs);
cardsContainer.addEventListener('click', clickHandler);
cardsContainer.addEventListener('mouseover', mouseOverHandler);
cardsContainer.addEventListener('mouseout', mouseOutHandler);
fileInput.addEventListener( 'change', updateFileInputLabel);

noPhotosIndication();

function noPhotosIndication() {
  console.log(cardsContainer.children);
}

function toggleViewFavs(e) {
  e.preventDefault();
  let btn = e.target;
  let showingAll = JSON.parse(btn.dataset.showing);
  showingAll = !showingAll;
  clearCards();
  btn.dataset.showing = showingAll;
  showingAll ? showAllCards() : showFavoritedCards();
  toggleBtnText(btn, showingAll);
}

function showFavoritedCards() {
  for (let i = 0; i < album.length; i++) {
    if (album[i].favorite) {
      createCard(album[i]);
    }
  }
}

function showAllCards() {
  for (let i = 0; i < album.length; i++) {
    createCard(album[i]);
  }
}

function toggleBtnText(btn, showingAll) {
  let count = btn.querySelector('span').dataset.favnum
  let showAllText = `Show All<span data-favnum="${count}" class="total-favorites"></span>`;
  let viewFavsText = `View <span data-favnum="${count}" class="total-favorites">${count}</span> Favorites`;
  btn.innerHTML = showingAll ? viewFavsText : showAllText;
}

function clearCards() {
  cardsContainer.innerHTML = '';
}

function onLoad() {
  recreatePhotos();
  countFavorites();
}

function recreatePhotos() {
  let oldAlbum = album;
  album = [];
  oldAlbum.forEach( (photo) => {
    let recreatedPhoto = new Photo(photo.title, photo.caption, photo.image, photo.id, photo.favorite);
    album.push(recreatedPhoto);
    createCard(recreatedPhoto);
  });
}

function countFavorites() {
  let favBtns = cardsContainer.querySelectorAll('.favorite');
  favBtns.forEach( (btn) => {
    if (JSON.parse(btn.dataset.favorite)) {
      addToFavCount();
    }
  });
}

function loadImg(e) {
  e.preventDefault();
  if (fileInput.files[0]) {
    reader.readAsDataURL(fileInput.files[0]); 
    reader.onload = addPhoto;
  }
}

function addPhoto(e) {
  let title = document.querySelector('#title');
  let caption = document.querySelector('#caption');
  let newPhoto = new Photo(title.value, caption.value, e.target.result, Date.now());

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

  var src = photo.favorite ? `media/favorite-active.svg` : `media/favorite.svg`;
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
          <img class="favorite" data-favorite="${photo.favorite}" src="${src}" alt="favorite button"/>
        </footer>
      </section>`
  cardsContainer.innerHTML += card;
  var indication = document.querySelector('.no-photo-indication');
  indication.classList.add('hide');
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
  favCountElement.dataset.favnum = count;
  favCountElement.innerHTML = count;

}

function minusFavCount() {
  const favCountElement = document.querySelector('.total-favorites');
  let count = Number(favCountElement.dataset.favnum);
  count--;
  favCountElement.dataset.favnum = count;
  if (JSON.parse(favCountElement.parentElement.dataset.showing)) favCountElement.innerHTML = count;
}

function activateFav(element) {
  element.setAttribute('src', `media/favorite-active.svg`);
}

function deactivateFav(element) {
  if (!JSON.parse(element.dataset.favorite)) {
    element.setAttribute('src', `media/favorite.svg`);
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
