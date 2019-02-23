var addPhotoBtn = document.querySelector('.add-photo-button');

var album = [];
var reader = new FileReader();

addPhotoBtn.addEventListener('click', loadImg);

function loadImg(e) {
  e.preventDefault();
  var imageInput = document.querySelector('.image-input');
  console.log(imageInput);
  console.log(imageInput.files);
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

  clearInput(title);
  clearInput(caption);
}

function clearInput(element) {
  element.value = '';
}

function createCard(photo) {
  var cardsContainer = document.querySelector('.cards-container');
  var card = `<section class="card" data-id="${photo.id}">
        <h2>${photo.title}</h2>
        <figure>
          <img src=${photo.image} />
          <figcaption>
            ${photo.caption}
          </figcaption>
        </figure>
        <footer>
          <img src="media/delete.svg" alt="delete button"/>
          <img src="media/favorite.svg" alt="favorite button"/>
        </footer>
      </section>`
  cardsContainer.innerHTML += card;
}

// create.addEventListener('click', loadImg);

// function addPhoto(e) {
//   // console.log(e.target.result);
//   var newPhoto = new Photo(Date.now(), e.target.result);
//   photoGallery.innerHTML += `<img src=${e.target.result} />`;
//   imagesArr.push(newPhoto)
//   newPhoto.saveToStorage(imagesArr)
// }