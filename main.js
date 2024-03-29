let currPageIdx = 0;
let textBlocks = [[]];
const pagesList = document.querySelector('.pages');
const addNewPageBtn = document.querySelector('.add-new-page-btn');
const textBlockForm = document.querySelector('.text-block-form');
const textBlockInp = document.querySelector('.text-block-inp');
const textBlockSubmitBtn = document.querySelector('.text-block-submit-btn');
const indexesList = document.querySelector('.indexes-list');
const textBlocksList = document.querySelector('.text-blocks-list');

function addNewPageHandler(e) {
  const existingPagesCount = pagesList.querySelectorAll('.page[data-page-idx]').length;
  const newPageEl = document.createElement('li');
  newPageEl.className = 'page';
  newPageEl.innerText = existingPagesCount + 1;
  newPageEl.setAttribute('data-page-idx', existingPagesCount);
  newPageEl.setAttribute('onclick', 'changePageHandler(event)');
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-page-btn';
  deleteBtn.innerHTML = '<i class="bi bi-x"></i>';
  deleteBtn.onclick = function(event) {
    deletePageHandler(event);
  };
  newPageEl.appendChild(deleteBtn);
  pagesList.insertBefore(newPageEl, addNewPageBtn);
  textBlocks.push([]);
  changePageHandler({target: newPageEl});
}

function deletePageHandler(event) {
  const pageToDelete = event.target.closest('.page');
  const pageIdxToDelete = parseInt(pageToDelete.dataset.pageIdx);
  pageToDelete.remove();
  textBlocks.splice(pageIdxToDelete, 1);
  if (currPageIdx === pageIdxToDelete) {
    currPageIdx = 0;
    const firstPage = pagesList.querySelector('.page[data-page-idx="0"]');
    if (firstPage) firstPage.classList.add('active');
  }
  renderIndexes();
  renderTextBlocks();
}

function changePageHandler(e) {
  const currPageEl = pagesList.querySelector(`.page[data-page-idx="${currPageIdx}"]`);
  if (currPageEl) currPageEl.classList.remove('active');
  e.target.classList.add('active');
  currPageIdx = Number(e.target.getAttribute('data-page-idx'));
  renderIndexes();
  renderTextBlocks();
}

function ctc(text) {
  const textareaInp = document.createElement('textarea');
  textareaInp.value = text;
  document.body.appendChild(textareaInp);
  textareaInp.select();
  navigator.clipboard.writeText(textareaInp.value);
  textareaInp.remove();
}

function ctcHandler() {
  const appendedText = textBlocks[currPageIdx].reduce((text, ele) => text + `[code]<pre>\n${ele.text}\n</pre>[/code]\n`, '');
  ctc(appendedText);
}

function renderIndexes() {
  indexesList.innerHTML = '';
  textBlocks[currPageIdx].forEach(function(textBlock, idx) {
    indexesList.innerHTML += `<li draggable="true" ondragstart="onDragStartItem(event)" ondragover="onDragOverItem(event)" ondrop="onDropItem(event)" class="indexes-item" data-idx="${idx}"><div class="move-up-down-icons"><i class="move-up-icon bi bi-arrow-up-circle-fill" onclick=reorderTextBlocksHandler(event)></i><i class="move-down-icon bi bi-arrow-down-circle-fill" onclick=reorderTextBlocksHandler(event)></i></div><span class="indexes-item-content">${truncateText(textBlock.text, 40)}</span><i class="delete-icon bi bi-x-circle-fill" onclick="deleteTextBlockHandler(event)"></i></li>`;
  });
  if (textBlocks[currPageIdx].length) {
    indexesList.innerHTML += `<li class="indexes-item ctc-item"><button onclick="ctcHandler()" class="ctc-btn">Copy to Clipboard</button></li>`;
  }
}

function renderTextBlocks() {
  textBlocksList.innerHTML = '';
  textBlocks[currPageIdx].forEach(function(textBlock, idx) {
    textBlocksList.innerHTML += `<li draggable="true" ondragstart="onDragStartItem(event)" ondragover="onDragOverItem(event)" ondrop="onDropItem(event)" class="text-blocks-item" data-idx="${idx}"><div class="move-up-down-icons"><i class="move-up-icon bi bi-arrow-up-circle-fill" onclick=reorderTextBlocksHandler(event)></i><i class="move-down-icon bi bi-arrow-down-circle-fill" onclick=reorderTextBlocksHandler(event)></i></div><span class="text-blocks-item-content">${textBlock.text}</span><i class="delete-icon bi bi-x-circle-fill" onclick="deleteTextBlockHandler(event)"></i></li>`;
  });
}

function addTextBlockHandler(e) {
  e.preventDefault();
  const text = textBlockInp.value.trim();
  if (!text.length) return;
  const index = text.split(/\s+/).length === 1 ? text.split(/\s+/).slice(0, 1) : text.split(/\s+/).slice(0, 2).join(' ');
  let duplicateIndexId = 0;
  textBlocks[currPageIdx].forEach((ele) => {
    if (ele.index == index) duplicateIndexId = ele.duplicateIndexId + 1;
  });
  textBlocks[currPageIdx].push({ index, duplicateIndexId, text });
  renderIndexes();
  renderTextBlocks();
  textBlockInp.value = '';
}

function deleteTextBlockHandler(e) {
  const li = e.target.closest('li');
  const dataIdx = li.getAttribute('data-idx');
  textBlocks[currPageIdx] = textBlocks[currPageIdx].filter((ele, idx) => idx != dataIdx);
  renderIndexes();
  renderTextBlocks();
}

function reorderTextBlocksHandler(e) {
  const li = e.target.closest('li');
  const upIconClicked = e.target.className.indexOf('up') != -1;
  const clickedIdx = li.getAttribute('data-idx');
  let exchangeIdx = clickedIdx;
  if (upIconClicked && clickedIdx != 0) exchangeIdx--;
  else if (!upIconClicked && clickedIdx != textBlocks[currPageIdx].length - 1) exchangeIdx++;
  const temp = textBlocks[currPageIdx][clickedIdx];
  textBlocks[currPageIdx][clickedIdx] = textBlocks[currPageIdx][exchangeIdx];
  textBlocks[currPageIdx][exchangeIdx] = temp;
  renderIndexes();
  renderTextBlocks();
}

function onDragStartItem(e) {
  e.dataTransfer.setData('idx', e.target.getAttribute('data-idx'));
}

function onDragOverItem(e) {
  e.preventDefault();
}

function onDropItem(e) {
  e.preventDefault();
  const dragItemIdx = Number(e.dataTransfer.getData('idx'));
  const dropItemIdx = Number(e.target.closest('[draggable="true"]').getAttribute('data-idx'));
  const dragItem = textBlocks[currPageIdx][dragItemIdx];
  textBlocks[currPageIdx].splice(dragItemIdx, 1);
  textBlocks[currPageIdx].splice(dropItemIdx, 0, dragItem);
  renderIndexes();
  renderTextBlocks();
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

document.addEventListener('DOMContentLoaded', function() {
  const clearAllBtn = document.getElementById('clearAllBtn'); // Select the Clear All button

  clearAllBtn.addEventListener('click', function() { // Add click event listener
    location.reload(); // Reload the page
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const updateTimeZones = () => {
    const timeZones = [
      { elementId: 'time-US-West', timeZone: 'America/Los_Angeles' },
      { elementId: 'time-Denver', timeZone: 'America/Denver' },
      { elementId: 'time-UTC', timeZone: 'UTC' },
      { elementId: 'time-Amsterdam', timeZone: 'Europe/Amsterdam' },
      { elementId: 'time-India', timeZone: 'Asia/Kolkata' },
      { elementId: 'time-Korea', timeZone: 'Asia/Seoul' },
      { elementId: 'time-Singapore', timeZone: 'Asia/Singapore' },
    ];

    timeZones.forEach(({ elementId, timeZone }) => {
      const now = new Date();

      const timeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timeZone,
        hour12: false // Adjust based on preference
      };
      const dateFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: timeZone
      };

      const timeFormatter = new Intl.DateTimeFormat('en-US', timeFormatOptions);
      const dateFormatter = new Intl.DateTimeFormat('en-US', dateFormatOptions);

      const timeString = timeFormatter.format(now);
      const dateString = dateFormatter.format(now);

      document.getElementById(elementId).textContent = `${timeString} on ${dateString}`;
    });
  };

  const timeZonesBtn = document.getElementById('timeZonesBtn');
  timeZonesBtn.addEventListener('mouseenter', updateTimeZones);
});
