document.getElementById('add-row-button').addEventListener('click', function() {
    const tableBody = document.getElementById('table-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td><input type="text" placeholder="Resposta"></td>
        <td><input type="text" placeholder="Pergunta 1"></td>
        <td><input type="text" placeholder="Pergunta 2"></td>
        <td><input type="text" placeholder="Pergunta 3"></td>
    `;

    tableBody.appendChild(newRow);
});
