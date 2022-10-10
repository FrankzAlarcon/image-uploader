import './style.css'

let file;

document.addEventListener('DOMContentLoaded', () => {
  initApp()
});

function initApp() {
  setDragAndDropEvents();

  setChooseFileButtonEvent();


}

function setChooseFileButtonEvent() {
  const button = document.querySelector('.choose-file-button');
  const inputFile = document.querySelector('#input-file');
  button.addEventListener('click', () => {
    inputFile.click()
  });

  inputFile.addEventListener('change', (e) => {
    file = e.target.files;
    const dropContainer = document.querySelector('.drag-drop-container');

    if (file.length !== 1) {
      alert('You can upload just one image')
      return;
    }
    if (!isValidFile(file[0])) {
      alert('Archivo no valido')
      return
    }
    dropContainer.replaceChildren('')
    imageReader(file[0], dropContainer)
  })
}

function setDragAndDropEvents() {
  const dropContainer = document.querySelector('.drag-drop-container');

  dropContainer.addEventListener('dragover', (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    dropContainer.classList.add('active');
    dropContainer.querySelector('p').textContent = 'Drop the images to upload them'
  })

  dropContainer.addEventListener('dragleave', (ev) => {
    ev.preventDefault();
    dropContainer.classList.remove('active');
    dropContainer.querySelector('p').textContent = 'Drag & Drop your image here'
  });

  dropContainer.addEventListener('drop', (ev) => {
    ev.preventDefault();
    
    file = ev.dataTransfer.files;
    if (file.length !== 1) {
      alert('You can upload just one image')
      return;
    }
    if (!isValidFile(file[0])) {
      alert('Archivo no valido')
      return
    }
    dropContainer.classList.remove('active');
    dropContainer.replaceChildren('')

    imageReader(file[0], dropContainer)
  });
}

function isValidFile(file) {
  const fileType = file.type;
  const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  return allowedTypes.includes(fileType);
}

function imageReader(file, container) {
  const fileReader = new FileReader();
  const id = `image-${Math.random().toString(32).substring(7)}`;
  fileReader.addEventListener('load', () => {
    showLoader()
    setTimeout(async () => {
      const fileUrl = fileReader.result;
      const image = document.createElement('img');
      image.id = id;
      image.src = fileUrl;
      image.alt = file.name;
      image.classList.add('uploaded-image');
      container.appendChild(image);
      const url = await uploadToImgBB(file)
      showUploadedImage(url)
    }, 1000)
  })
  
  fileReader.readAsDataURL(file);
}

function showLoader() {
  const container = document.querySelector('.container');
  container.style.display = 'none';
  const loaderContainer = document.querySelector('.spinner-container');
  loaderContainer.style.display = 'block';
}

function showUploadedImage(url) {
  const container = document.querySelector('.container');
  container.style.display = 'block';
 
  const title = container.querySelector('.top-title .title');
  title.textContent = 'Uploaded Successfully!!';
  title.style.margin = '1rem auto'

  const p = container.querySelector('.top-title p');
  p.remove()

  const checkedImage = document.createElement('img');
  checkedImage.src = '/img/checked.png'
  checkedImage.alt = 'Uploaded Successfully';
  checkedImage.classList.add('uploaded-successfully-icon');
  document.querySelector('.top-title').insertBefore(checkedImage, title)

  const bottom = document.querySelector('.container .bottom');
  bottom.remove();

  const linkContainer = document.createElement('div');
  linkContainer.classList.add('copy-link-container');

  const input = document.createElement('input');
  input.classList.add('link-text');
  input.value = url;

  const button = document.createElement('button');
  button.classList.add('copy-link-button');
  button.textContent = 'Copy Link';
  linkContainer.append(input, button);
  container.appendChild(linkContainer);

  button.addEventListener('click', () => {
    const inputLink = document.querySelector('.link-text');
    inputLink.select()
    inputLink.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(inputLink.value);
    button.textContent = 'Copied !!';
    setTimeout(() => {
      button.textContent = 'Copy Link';
    }, 1500)
  })

  const loaderContainer = document.querySelector('.spinner-container');
  loaderContainer.style.display = 'none';
}

async function uploadToImgBB(file) {
  const apiKey = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_API_KEY}`;
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(apiKey, {
    method: 'POST',
    body: formData
  })
  const data = await response.json();
  return data.data.url;
}
