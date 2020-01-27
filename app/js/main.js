// // ID of the Google Spreadsheet
// var spreadsheetID = "1UfJ6W1a3P3VcgW-jZxIs2ZAsYDxjEX4lsKEJkeFnTgg";

// // Make sure it is public or set to Anyone with link can view
// var url =
//   "https://spreadsheets.google.com/feeds/list/" +
//   spreadsheetID +
//   "/od6/public/values?alt=json";

// $.getJSON(url, function(data) {
//   var entry = data.feed.entry;

//   $(entry).each(function() {
//     // Column names are name, age, etc.
//     $(".results").prepend(
//       "<div class='col-lg-3 col-6'><div class='img-wrapper'><div class='img-bg' style='background-image: url(" +
//         this.gsx$foto.$t +
//         ");'></div><div class='card-title'><h5>" +
//         this.gsx$name.$t +
//         "</h5></div></div>"
//     );
//   });
// });

//тут
//у тебя нет jquery - ЗЛО
//смотри у меня json рендерится в nunjucks

console.log("Adress", window.location); //неа,

var queryString = window.location.href.toString(); // Насильно приводим к строке, что бы не было ошибок
var queryArray = queryString.split("?"); // Разбиваем строку на 2 массива строк, отделенные знаком ?
var formatedArray = queryArray[1].split("&"); // разбиваем второй блок на массив по параметрам.
console.log("Formated data", formatedArray);
//создаем паараматры!
function parametrs() {
  var params = {};
  var sorteringParams = formatedArray.map(paramGroup => {
    var paramToArray = paramGroup.split("=");
    var property = paramToArray[0];
    Object.defineProperty(params, property, { value: paramToArray[1] }); // Что за хуйня я поссу сек
  });
  return params;
}

function getData() {
  return fetch("./data.json").then(resp => {
    return resp.json();
  });
}

console.log("Parsed params", parametrs());
getData().then(res => {
  console.log("data", res);
  if (res.card) {
    var cardArray = res.card.map(card => card);
    console.log(cardArray);
    var currentPageData = cardArray.find(
      card => card.id === parseInt(parametrs().cardId, 10)
    );
    console.log("current data", { cardArray, currentPageData });
    createPage(currentPageData);
  }
});

function createPage(info) {
  var foto = document.createElement("img");
  var container = document.querySelector("#cardInfo");
  var title = document.createElement("div"); //выбираешь нужные теги
  var price = document.createElement("div");
  var desc = document.createElement("div");
  var shortDesc = document.createElement("div");

  title.innerText = info.title;
  title.classList.add("titleClass"); //выбираешь нужный класс
  desc.innerText = info.desc;
  shortDesc.innerText = info.short_desc;
  foto.src = info.foto;
  price.innerText = info.price;
  if (container) {
    container.append(title);
    container.append(price);
    container.append(desc);
    container.append(shortDesc);
    container.append(foto);
  }
}
//Где твоя страница с одиночным кардом?
