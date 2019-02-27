const addPhotoBtn = document.querySelector('.add-photo');
const favoriteButton = document.querySelector('.favorites');
const cardsContainer = document.querySelector('.cards-container');
const fileInput = document.querySelector('#image-input');
const form = document.querySelector('.form');
const searchInput = document.querySelector('.search-input');
const reader = new FileReader();

let album = JSON.parse(localStorage.getItem('album')) || [];

window.addEventListener('load', onLoad);
addPhotoBtn.addEventListener('click', loadImg);
favoriteButton.addEventListener('click', toggleViewFavs);
fileInput.addEventListener( 'change', fileChangeHandler);
form.addEventListener( 'keyup', formKeyHandler);
searchInput.addEventListener('keyup', searchCards);
cardsContainer.addEventListener('click', clickHandler);
cardsContainer.addEventListener('mouseover', mouseOverHandler);
cardsContainer.addEventListener('mouseout', mouseOutHandler);
cardsContainer.addEventListener('keyup', keyupHandler);
cardsContainer.addEventListener('focusout', focusoutHandler);

function keyupHandler(e) {
  let card = e.target.closest('.card');
  let id = Number(card.dataset.id);
  let photo = findPhoto(id);

  if (e.which == 13 && e.target.className === 'caption') {
    photo.caption = e.target.innerText;
    photo.updatePhoto();
    e.target.blur();
  }

  if (e.which == 13 && e.target.className === 'title') {
    photo.title = e.target.innerText;
    photo.updatePhoto();
    e.target.blur();
  }
}

function focusoutHandler(e) {
  let card = e.target.closest('.card');
  let id = Number(card.dataset.id);
  let photo = findPhoto(id);

  if (e.target.className === 'caption') {
    photo.caption = e.target.innerText;
    photo.updatePhoto();
  }

  if (e.target.className === 'title') {
    photo.title = e.target.innerText;
    photo.updatePhoto();
  }
}

function formKeyHandler(e) {
  let title = document.querySelector('#title').value;
  let caption = document.querySelector('#caption').value;

  addPhotoBtn.disabled = title || caption ? false : true;
}

function toggleViewFavs(e) {
  e.preventDefault();
  let showingAll = JSON.parse(favoriteButton.dataset.showing);
  showingAll = !showingAll;
  clearCards();
  favoriteButton.dataset.showing = showingAll;
  showingAll ? showAllCards() : showFavoritedCards();
  toggleBtnText();
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

function toggleBtnText() {
  let showingAll = JSON.parse(favoriteButton.dataset.showing)
  let count = favoriteButton.querySelector('span').dataset.favnum
  let showAllText = `Show All<span data-favnum="${count}" class="total-favorites"></span>`;
  let viewFavsText = `View <span data-favnum="${count}" class="total-favorites">${count}</span> Favorites`;
  favoriteButton.innerHTML = showingAll ? viewFavsText : showAllText;
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
    let label  = document.querySelector('.image-input-label')
    reader.readAsDataURL(fileInput.files[0]); 
    reader.onload = addPhoto;
    label.removeChild(label.firstChild);
    fileInput.insertAdjacentHTML('beforebegin', `Choose File`);
    addPhotoBtn.disabled = true;
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
        <h2 class="title" contenteditable="true">${photo.title}</h2>
        <figure>
          <img src=${photo.image} />
          <figcaption class="caption" contenteditable="true">
            ${photo.caption}
          </figcaption>
        </figure>
        <footer>
          <img class="delete" src="media/delete.svg" alt="delete button"/>
          <img class="favorite" data-favorite="${photo.favorite}" src="${src}" alt="favorite button"/>
        </footer>
      </section>`
  cardsContainer.insertAdjacentHTML('afterbegin', card);
  var indication = document.querySelector('.no-photo-indication');
  indication.classList.add('hide');
}

function fileChangeHandler(e) {
  let label  = fileInput.parentElement;
  let labelVal = label.innerText;
  let fileName = '';
  
  if (this.files) {
    fileName = this.value;
    addPhotoBtn.disabled = false;
  }
  label.removeChild(label.firstChild);
  fileName ? fileInput.insertAdjacentHTML('beforebegin', fileName) : fileInput.insertAdjacentHTML('beforebegin', labelVal);
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
  var indication = document.querySelector('.no-photo-indication');
  if(!cardsContainer.children.length) indication.classList.remove('hide');
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
  if (deleteBtn(e)) activateDelete(e.target);
  if (favoriteBtn(e)) activateFav(e.target);
}

function mouseOutHandler(e) {
  if (deleteBtn(e)) deactivateDelete(e.target);
  if (favoriteBtn(e)) deactivateFav(e.target);
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

function searchCards(e){
  var searchBarText = e.target.value;
  var regex = new RegExp(searchBarText, "i");
  var matchingIdeas = [];
  clearCards();
  for (let i = 0; i < album.length; i++) {
    if(regex.test(album[i].title) || regex.test(ablum[i].caption)) {
      matchingIdeas.push(album[i]);
      createCard(album[i]);
    }
  }
};
