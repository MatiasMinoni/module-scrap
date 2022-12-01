const feedDisplay = document.querySelector("#feed")
fetch('/resultado?resultado=')
    .then(response => {return response.json()})
    .then(data => {
        data.forEach(article => {
            const articleItem =`<tr><td>`+ article.title +`</td><td class="sorttable_numeric">`+ article.price +`</td><td><a href="`+ article.articleURL +`" target="_blank">`+ article.articleURL +`</a></td></tr>`
            feedDisplay.insertAdjacentHTML("beforeend", articleItem)
        })
    })
    .catch(err => console.log(err))

$(function() {
    $("#myTable").tablesorter();
});
$(function() {
    $("#myTable").tablesorter({ sortList: [[0,0], [1,0]] });
});

