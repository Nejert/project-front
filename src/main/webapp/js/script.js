let races;
let professions;
let countAccsURL = 'rest/players/count';
let currentPage = 1;

function init() {
    $.get("rest/players/race")
        .then((data) => {
            races = fillSelector(data);
            $("#race-select").append(races);
        });
    $.get("rest/players/prof")
        .then((data) => {
            professions = fillSelector(data);
            $("#prof-select").append(professions);
        });

    getTableData(currentPage - 1);

    addPagesButtons(countPages(getTotalAccounts(countAccsURL)));
    $('#count-selector').change(() => {
        let pages = countPages(getTotalAccounts(countAccsURL));
        addPagesButtons(pages);
        if (currentPage >= pages) {
            currentPage = pages;
            $('input#page')[currentPage - 1].style.color = 'red';
        }
        getTableData(currentPage - 1);
    });
    $('input#page')[currentPage - 1].style.color = 'red';

    $("#pages").on("click", "#page", b => {
        b.target.style.color = 'red';
        if (currentPage !== b.target.value)
            if ($('input#page')[currentPage - 1] !== undefined)
                $('input#page')[currentPage - 1].removeAttribute("style");
        currentPage = b.target.value;
        getTableData(currentPage - 1);
    });
}

init();

function fillTable(data) {
    let tableBody = $('#main-table tbody');
    $("#main-table #tdata").remove();
    $.each(data, (index, player) => {
        let row = `
        <tr id='tdata'> 
            <td id='id'>${player.id}</td> 
            <td>${player.name}</td> 
            <td>${player.title}</td> 
            <td>${player.race}</td> 
            <td>${player.profession}</td> 
            <td>${player.level}</td> 
            <td>${new Date(player.birthday).toLocaleDateString('en-US')}</td> 
            <td>${player.banned}</td> 
            <td><img alt='Edit' src='img/edit.png' onclick='editPlayer(this)' id='${player.id}'/></td> 
            <td><img alt='Delete' src='img/delete.png' onclick='deletePlayer(this)' id='${player.id}'/></td> 
        </tr>
        `;
        tableBody.append(row);
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
    let playerObject = await $.get('rest/players', {pageNumber: currentPage - 1, pageSize: $('#count-selector').val()})
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
    $(`table #race-select option[value='${playerObject.race}']`).prop("selected", true);
    $(`table #prof-select option[value='${playerObject.profession}']`).prop("selected", true);
    $(`table #ban-select option[value='${playerObject.banned}']`).prop("selected", true);
    player.parentElement.parentElement.remove();
}

function createEditTableRow(player) {
    let editRow = `
        <tr id='tdata'> 
            <td id='id'>${player.id}</td> 
            <td><input type='text' id='pname' name='name' value='${player.name}'/></td> 
            <td><input type='text' id='ptitle' name='title' value='${player.title}'/></td> 
            <td>
                <select id='race-select'>
                    ${races}
                </select>
            </td> 
            <td>
                <select id="prof-select">
                    ${professions}            
                </select>
            </td> 
            <td>${player.level}</td> 
            <td>${new Date(player.birthday).toLocaleDateString('en-US')}</td> 
            <td>
                <select id="ban-select">
                    ${document.getElementById("ban-select").innerHTML}
                </select>
            </td> 
            <td><img alt='Save' src='img/save.png' onclick='updatePlayer(this)' /></td> 
            <td></td>
        </tr>`;
    return editRow;
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
        url: "rest/players/" + player.id,
        method: 'DELETE',
        success: () => {
            let pages = countPages(getTotalAccounts(countAccsURL));
            addPagesButtons(pages);
            if (pages < currentPage) {
                currentPage = pages;
            }
            $('input#page')[currentPage - 1].style.color = 'red';
            getTableData(currentPage - 1);
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
    $.get('rest/players', {pageNumber: pageNumber, pageSize: $('#count-selector').val()})
        .then(data => {
            fillTable(data);
        });
}

function fillSelector(data) {
    let res;
    for (const item of data) {
        res += `<option value=${item}>${item}</option>\n`;
    }
    return res;
}

function createPlayer() {
    let form = $(".create-form");
    let formDataArray = $(".create-form").serializeArray();
    let data = {};
    for (const e of formDataArray) {
        if (e.name === "birthday") {
            data[e.name] = new Date(e.value).getTime();
        } else {
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
            getTableData(currentPage - 1);
            addPagesButtons(countPages(getTotalAccounts(countAccsURL)));
        }
    });
}
