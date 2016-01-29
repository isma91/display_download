/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
    $.post('controllers/list_file.php', {directory: '/home/isma91/Téléchargements/'}, function (data, textStatus, xhr) {
        if (textStatus === "success") {
            data = JSON.parse(data);
            console.log(data);
        }
    });
});