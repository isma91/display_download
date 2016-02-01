/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
/* /home/isma91/Téléchargements/ */
$(document).ready(function () {
    function send_path () {
        "use strict";
        if ($('#path').val() !== "") {
            $.post('controllers/list_file.php', {directory: $('#path').val()}, function (data, textStatus, xhr) {
                if (textStatus === "success") {
                    data = JSON.parse(data);
                    console.log(data);
                    if (data.folder.length === 0 && data.file.length === 0) {
                        Materialize.toast('<p class="alert-failed">No folder or file here !!<p>', 2000, 'rounded alert-failed');
                    }
                }
            });
        } else {
            Materialize.toast('<p class="alert-failed">Empty path !!<p>', 2000, 'rounded alert-failed');
        }
    }
    $('#path').keypress(function (event){
        if(event.keyCode == 13){
            send_path();
            event.preventDefault();
        }
    });
    $('#send_path').click(function () {
        send_path();
    });
});