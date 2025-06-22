function fillTable(data) {
    let tableBody = $('#main-table tbody');
    $("#main-table #tdata").remove();

    $.each(data, (index, user) => {
        tableBody.append(
            "<tr id=\"tdata\">" +
            "<td id=\"id\">" + user.id + "</td>" +
            "<td>" + user.name + "</td>" +
            "<td>" + user.title + "</td>" +
            "<td>" + user.race + "</td>" +
            "<td>" + user.profession + "</td>" +
            "<td>" + user.level + "</td>" +
            "<td>" + new Date(user.birthday).toLocaleDateString("en-US") + "</td>" +
            "<td>" + user.banned + "</td>" +
            "<td>" + "<img alt=\"Edit\" src=\"/img/edit.png\" onclick=\"editPlayer(this)\" id=" + user.id + " />" + "</td>" +
            "<td>" + "<img alt=\"Delete\" src=\"/img/delete.png\" onclick=\"deletePlayer(this)\" id=" + user.id + " />" + "</td>" +
            "</tr>"
        );
    });
}

function getTotalAccounts(url) {
    let accs;
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: response => {
            accs = response;
        }
    });
    return accs;
}

function addPagesButtons(count) {
    let pages = $('#pages');
    pages.empty();
    for (let i = 1; i <= count; i++) {
        let button = $('<input/>').attr({
            type: "button",
            id: "page",
            value: i
        });
        pages.append(button);
    }
}

async function editPlayer(player) {
    let playerId = parseInt(player.parentElement.parentElement.cells.id.innerText);
    let tabIdx = player.parentElement.parentElement.rowIndex;
    let playerObject = await $.get('/rest/players', {pageNumber: currentPage - 1, pageSize: $('#count-selector').val()})
        .then(data => {
            return function () {
                let val;
                $.each(data, (index, value) => {
                    if (value.id === playerId) {
                        val = value;
                        return;
                    }
                });
                return val;
            }();
        });


    $('#main-table tbody tr').eq(tabIdx).after(createEditTableRow(playerObject));
    player.parentElement.parentElement.remove();
}

function createEditTableRow(player) {
    let nRow = [];
    nRow.push("<tr id=\"tdata\">",
        "<td id=\"id\">", player.id, "</td>",
        "<td><input type=\"text\" id=\"pname\" name=\"name\" value=\"", player.name, "\"/></td>",
        "<td><input type=\"text\" id=\"ptitle\" name=\"title\" value=\"", player.title, "\"/></td>",
        "<td><select id=\"race-select\">"
    );

    for (const race of races) {
        if (race !== player.race) {
            nRow.push("<option value=" + race + " >", race, "</option>");
        } else {
            nRow.push("<option value=", race, " selected>", race, "</option>");
        }
    }
    nRow.push("</select></td>");

    nRow.push("<td><select id=\"prof-select\">");

    for (const prof of professions) {
        if (prof !== player.profession) {
            nRow.push("<option value=" + prof + " >", prof, "</option>");
        } else {
            nRow.push("<option value=", prof, " selected>", prof, "</option>");
        }
    }
    nRow.push("</select></td>");

    nRow.push(
        "<td>" + player.level + "</td>" +
        "<td>" + new Date(player.birthday).toLocaleDateString("en-US") + "</td>"
    );

    nRow.push("<td><select id=\"ban-select\">");
    if (player.banned) {
        nRow.push("<option value=\"true\" selected>", "True", "</option>");
        nRow.push("<option value=\"false\">", "False", "</option>");
    } else {
        nRow.push("<option value=\"true\">", "True", "</option>");
        nRow.push("<option value=\"false\" selected>", "False", "</option>");
    }
    nRow.push("</select></td>");
    nRow.push(
        "<td>" + "<img alt=\"Save\" src=\"/img/save.png\" onclick=\"updatePlayer(this)\" />" + "</td>" +
        "<td></td>"
    );
    nRow.push("</tr>");
    return nRow.join("");
}

function updatePlayer(player) {
    let tableData = player.parentElement.parentElement;
    let id = tableData.cells.namedItem("id").innerText;
    let name = $(tableData).find("td input#pname").val();
    let title = $(tableData).find("td input#ptitle").val();
    let race = $(tableData).find("td select#race-select").val();
    let profession = $(tableData).find("td select#prof-select").val();
    let banned = $(tableData).find("td select#ban-select").val() === 'true';
    let reqBody = {name, title, race, profession, banned};
    $.ajax({
        url: "rest/players/" + id,
        data: JSON.stringify(reqBody),
        method: "POST",
        datatype: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: () => {
            getTableData(currentPage - 1);
        }
    });
}

function deletePlayer(player) {
    $.ajax({
        url: "/rest/players/" + player.id,
        method: 'DELETE',
        success: () => {
            getTableData(currentPage - 1);
            addPagesButtons(countPages(getTotalAccounts('/rest/players/count')));
        },
        error: function (xhr, status, error) {
            console.error('Error deleting player:', error);
        }
    });
}

function countPages(count) {
    let selectorValue = $('#count-selector').val();
    return Math.ceil(count / parseFloat(selectorValue));
}

function getTableData(pageNumber) {
    $.get('/rest/players', {pageNumber: pageNumber, pageSize: $('#count-selector').val()})
        .then(data => {
            fillTable(data);
        });
}

function fillSelector(selector, data) {
    let sel = $(selector);
    for (const item of data) {
        sel.append("<option value=" + item + " >" + item + "</option>");
    }
    $(selector + " option")[0].selected = "selected";
}

function createPlayer() {
    let form = $(".create-form");
    let formDataArray = $(".create-form").serializeArray();
    let data = {};
    for (const e of formDataArray) {
        if (e.name === "birthday"){
            data[e.name] = new Date(e.value).getTime();
        }else {
            data[e.name] = e.value;
        }
    }
    $.ajax({
        url: "rest/players/",
        data: JSON.stringify(data),
        method: "POST",
        datatype: 'json',
        contentType: 'application/json;charset=UTF-8',
        success: () => {
            form[0].reset();
            getTableData(currentPage-1);
        }
    });
}

///////////////////////////////////////////////////////
let races;
$.get("/rest/players/race")
    .then((data) => {
        races = data;
        fillSelector("#race-select", data);
    });
let professions;
$.get("/rest/players/prof")
    .then((data) => {
        professions = data;
        fillSelector("#prof-select", data);
    });
let totalAccounts = getTotalAccounts('/rest/players/count');
let currentPage = 1;

getTableData(currentPage - 1);

addPagesButtons(countPages(totalAccounts));
$('#count-selector').change(() => {
    let pages = countPages(totalAccounts);
    addPagesButtons(pages);
    if (currentPage - 1 > pages) {
        currentPage = pages;
        $('input#page')[currentPage - 1].style.color = 'red';
    }
    getTableData(currentPage - 1);
});
$('input#page')[currentPage - 1].style.color = 'red';

$("#pages").on("click", "#page", b => {
    b.target.style.color = 'red';
    if (currentPage !== b.target.value)
        $('input#page')[currentPage - 1].removeAttribute("style");
    currentPage = b.target.value;
    getTableData(currentPage - 1);
});
