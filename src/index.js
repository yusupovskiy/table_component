function drawingPaginations(countPages, keyActivePage) {
  const newPanelPaginations = document.createElement('div');
  newPanelPaginations.className = 'paginations';

  for (var i = 1; i <= countPages; i++) {
    const newPagination = document.createElement('div');
    newPagination.className = 'pagination';
    const numberPage = document.createTextNode(i);
    newPagination.appendChild(numberPage);

    if (i == keyActivePage)
      newPagination.className = newPagination.className + ' active';

    newPanelPaginations.appendChild(newPagination);
  }

  return newPanelPaginations;
}

function drawingHeaderTable(columns, column, reverse) {
  const newTHead = document.createElement('thead');
  const newRow = document.createElement('tr');

  newTHead.className = 'table__thead';
  newRow.className = 'table__thead__tr';

  for (const c of columns) {
    const newCell = document.createElement('th');
    const datum = document.createTextNode(c.header);
    newCell.className = 'table__thead__tr__th';

    if (reverse == true && c.column == column)
      newCell.className = newCell.className + ' increase';
    else if (reverse == false && c.column == column)
      newCell.className = newCell.className + ' decrease';

    newCell.appendChild(datum);
    newRow.appendChild(newCell);
  }
  return newTHead.appendChild(newRow);
}

function drawingBodyTable(columns, data, column, reverse) {
  const newTBody = document.createElement('tbody');
  newTBody.className = 'table__tbody';

  for (const d of data) {
    const newRow = document.createElement('tr');
    newRow.className = 'table__tbody__tr';

    for (const c of columns) {
      const newCell = document.createElement('td');
      const datum = document.createTextNode(c.accessor(d));
      newCell.className = 'table__tbody__tr__td';

      if (reverse == true && c.column == column)
        newCell.className = newCell.className + ' increase';
      else if (reverse == false && c.column == column)
        newCell.className = newCell.className + ' decrease';

      newCell.appendChild(datum);
      newRow.appendChild(newCell);
    }
    newTBody.appendChild(newRow);
  }
  return newTBody;
}

function drawingTable(columns, data, column, reverse) {
  const newTable = document.createElement('table');
  newTable.className = 'table';

  const newTHead = drawingHeaderTable(columns, column, reverse);
  newTable.appendChild(newTHead);

  const newTBody = drawingBodyTable(columns, data, column, reverse);
  newTable.appendChild(newTBody);

  return newTable;
}

function getSortData(data, sortKey, reverse) {
  const k = sortKey;
  return data.sort(
    (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * [1, -1][+reverse],
  );
}
function validSpaces(text) {
  text = text.trim();
  text = text.replace(/ {1,}/g, ' ');
  text = text.toLowerCase();

  return text;
}
function getFilterData(data, search) {
  const s = validSpaces(search);
  return data.filter(n =>
    Object.values(n.name.split()).some(m =>
      m
        .toString()
        .toLowerCase()
        .includes(s),
    ),
  );
}
function getPagesData(data) {
  let countFields = 5;
  let dataPages = [];

  function pages(lastKeyData, numberPages) {
    let currentData = [];
    numberPages = numberPages + 1;
    let keyData = lastKeyData;

    for (var i = 1; i <= countFields; i++) {
      if (data[keyData] != undefined) currentData.push(data[keyData]);
      keyData = keyData + 1;
    }

    dataPages.push({ page: numberPages, data: currentData });

    if (keyData >= data.length) return;

    pages(keyData, numberPages);
  }

  pages(0, 0);

  return dataPages;
}

function eventsTable(parantElem, columns, data, nameClassTable) {
  parantElem.onclick = function(e) {
    const querySearch = parantElem.getElementsByClassName('search')[0];

    if (querySearch.value.length <= 0 
      && e.target.tagName != 'TH' 
      && e.target.className != 'pagination') return;

    const elem = parantElem.getElementsByClassName(nameClassTable)[0];
    const elemPaginations = parantElem.getElementsByClassName('paginations')[0];
    let column;
    let reverse = false;
    let numberPages = 1;

    if (e.target.tagName == 'TH') {
      const indexColumn = e.target.cellIndex,
        classColumn = e.target.className;

      column = columns[indexColumn].column;
      if (classColumn.search('increase') > 0) reverse = false;
      else if (classColumn.search('decrease') > 0) reverse = true;
    } else if (querySearch.value.length > 0) {
      const elemsHeaderTable = parantElem.getElementsByClassName(
        'table__thead__tr__th',
      );

      for (const th of elemsHeaderTable) {
        if (
          th.className.search('increase') > 0 ||
          th.className.search('decrease') > 0
        ) {
          column = columns[th.cellIndex].column;

          if (th.className.search('increase') > 0) reverse = true;
          else if (th.className.search('decrease') > 0) reverse = false;
        }
      }
    } else if (e.target.className == 'pagination') {
      numberPages = e.target.textContent;
      // let parent = e.target.parentNode;
    }

    const filtData = getFilterData(data, querySearch.value);
    const sortData = getSortData(filtData, column, reverse);
    const pagesData = getPagesData(sortData);

    const newTable = drawingTable(
      columns,
      pagesData[numberPages - 1].data,
      column,
      reverse,
    );
    parantElem.replaceChild(newTable, elem);

    const newPaginations = drawingPaginations(pagesData.length, numberPages);
    parantElem.replaceChild(newPaginations, elemPaginations);
  };
}

function createTable(idBoxTable, title, columns, data) {
  const pagesData = getPagesData(data);
  const newTable = drawingTable(columns, pagesData[1 - 1].data, '', '');
  let boxTable = document.getElementById(idBoxTable);
  const elemBoxTable = boxTable.getElementsByClassName('table')[0];

  if (elemBoxTable == undefined) boxTable.appendChild(newTable);
  else boxTable.replaceChild(newTable, elemBoxTable);

  const newPaginations = drawingPaginations(pagesData.length, 1);
  boxTable.appendChild(newPaginations);

  eventsTable(boxTable, columns, data, 'table');
}

window.createTable = createTable;
