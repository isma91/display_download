/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
/* /home/isma91/Téléchargements/ */
$(document).ready(function () {
    function send_path () {
        "use strict";
        var path, breadcrumb;
        path = $('#path').val();
        if (path !== "") {
            $.post('controllers/list_file.php', {directory: path}, function (data, textStatus, xhr) {
                if (textStatus === "success") {
                    data = JSON.parse(data);
                    if (data.folder.length === 0 && data.file.length === 0) {
                        Materialize.toast('<p class="alert-failed">No folder or file here !!<p>', 2000, 'rounded alert-failed');
                    } else {
                        $('#absolute_center_form').remove();
                        breadcrumb = '<a href="#" class="breadcrumb">/</a>';
                        if (data.path.length !== 1) {
                            $.each(data.path, function (index, name_path) {
                                if (name_path !== "") {
                                    breadcrumb = breadcrumb + '<a href="#" class="breadcrumb">' + name_path + '</a>';
                                }
                            });
                        }
                        $('#the_menu').html(' <nav><div class="nav-wrapper"><a href="#" class="brand-logo">Logo</a><div class="right hide-on-med-and-down">' + breadcrumb + '</div></div></nav>');
                        $('#the_body').append('<div class="row mui-panel " id="loader"><div class="progress"><div class="indeterminate"></div></div></div>');
                        $('#loader').css({'margin-top': '25%'});
                        $('#the_menu').html();
                        setTimeout(function () {
                            $('#loader').remove();
                            $('#the_body').append('<div class="row mui-panel">There is ' + data.folder.length + ' folder(s) and ' + data.file.length + ' file(s)</div>');
                            $('#the_body').append('<div class="row mui-panel"></div>');
                            console.log(data);
                        }, 1000);
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