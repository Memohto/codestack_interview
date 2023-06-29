var table;

// On load listener
window.addEventListener("load", async () => {
  let users = await fetchUsers();
  let data = filterActiveUsers(users);
  let headers = ["id", "name", "email", "gender", "status"];
  table = new Table(headers, data);
});

// Fetch data function
async function fetchUsers() {
  let res = await fetch("https://gorest.co.in/public/v2/users");
  return await res.json();
}

// Ignore inactive users
function filterActiveUsers(users) {
  return users.filter(user => user.status == "active");
}

// Search function
function search() {
  let text = document.getElementById("search-input")?.value;
  table.search(text);
}

// Pagination functions
function nextPage() {
  table.nextPage();
}

function prevPage() {
  table.prevPage();
}

function perPageChange() {
  let val = document.getElementById("perPage-select").value;
  table.perPageChange(parseInt(val));
}

// Table class to store all properties
class Table {
  constructor(headers, data) {
    this.headers = headers;
    this.data = data;
    this.searchHeader = this.headers[0];
    this.sortHeader = this.headers[0];
    this.isAsc = true;
    this.perPage = 3;
    this.page = 1;

    this.populateDropdownItems();
    this.populateHeaders();
    this.sort();
  }

  search(text) {
    this.clearTableData();
    let regex = new RegExp(text);
    let results = this.data.filter(user => regex.test(user[this.searchHeader]));
    this.populateData(results);
  }

  sort() {
    this.clearTableHeaders();
    this.populateHeaders();

    this.clearTableData();
    let sorted = this.isAsc
      ? this.data.sort((a, b) => { return String(a[this.sortHeader]).localeCompare(String(b[this.sortHeader])) })
      : this.data.sort((a, b) => { return String(b[this.sortHeader]).localeCompare(String(a[this.sortHeader])) });
    this.populateData(sorted);
  }

  perPageChange(perPage) {
    this.perPage = perPage;
    this.page = 1;
    this.clearTableData();
    this.populateData();
    this.changeDOMPage();

  }

  nextPage() {
    if(this.page < Math.ceil(this.data.length / this.perPage)) {
      this.page++;
      this.clearTableData();
      this.populateData();
      this.changeDOMPage();
    }
  }

  prevPage() {
    if(this.page > 1) {
      this.page--;
      this.clearTableData();
      this.populateData();
      this.changeDOMPage();
    }
  }

  changeDOMPage() {
    let DOMPageNo = document.getElementById("page-number");
    DOMPageNo.innerHTML = "\&nbsp;"+this.page+"\&nbsp;";
  }

  populateDropdownItems() {
    var headerList = document.getElementById("header-list");
    this.headers.forEach(header => {
      let listItem = document.createElement("li");
      let anchor = document.createElement("a");
      anchor.className = "dropdown-item";
      anchor.onclick = () => {
        this.searchHeader = header;
        let button = document.getElementById("filter-dropdown");
        button.innerHTML = this.searchHeader;
      }
      let text = document.createTextNode(header);
      anchor.appendChild(text);
      listItem.appendChild(anchor);
      headerList.appendChild(listItem);
    });
  }

  populateHeaders() {
    var tableHead = document.getElementById("user-table-head");
    let tableRow = document.createElement("tr");
    let upArrow = "\u2191    ";
    let downArrow = "\u2193    ";
      this.headers.forEach(header => {
        let tableHeader = document.createElement("th");
        tableHeader.onclick = () => {
          if(this.sortHeader == header) {
            this.isAsc = !this.isAsc;
          } else {
            this.isAsc = true;
          }
          this.sortHeader = header;
          this.sort();
        }
        let text = document.createTextNode(header);
        if(this.sortHeader == header) {
          text = this.isAsc
            ? document.createTextNode(upArrow + header)
            : document.createTextNode(downArrow + header);
        }
        tableHeader.append(text);
        tableRow.appendChild(tableHeader);
      });
    tableHead.appendChild(tableRow);
  }

  populateData(data) {
    let tableData = data;
    if(!tableData) tableData = this.data;

    var tableBody = document.getElementById("user-table-body");
    let startIndex = (this.page - 1) * this.perPage;
    let endIndex = startIndex + this.perPage;
    let tableDataPage = tableData.slice(startIndex, endIndex);
    tableDataPage.forEach(user => {
      let tableRow = document.createElement("tr");
      this.headers.forEach(header => {
        let tableData = document.createElement("td");
        let text = document.createTextNode(user[header]);
        tableData.append(text);
        tableRow.appendChild(tableData);
      });
      tableBody.appendChild(tableRow);
    });
  }

  clearTableHeaders() {
    var tableHead = document.getElementById("user-table-head");
    tableHead.innerHTML = '';
  }

  clearTableData() {
    var tableBody = document.getElementById("user-table-body");
    tableBody.innerHTML = '';
  }
}