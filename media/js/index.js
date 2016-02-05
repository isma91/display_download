/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
/* /home/isma91/Téléchargements/ */
$(document).ready(function () {
    function get_original_path () {
        "use strict";
        $.post('controllers/get_original_path.php', function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                $('#original_path').html(data.original_path);
                $('#project_path').html(data.project_path);
            }
        });
    }
    function send_path (path) {
        "use strict";
        var breadcrumb, folders, files, file_count;
        file_count = 0;
        if (path !== "") {
            $.post('controllers/list_file.php', {directory: path}, function (data, textStatus) {
                if (textStatus === "success") {
                    $('#current_path').html(path);
                    $('#the_body').html('<div class="row mui-panel" id="the_menu"></div>');
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
                        $('#the_menu').html(' <nav><div class="nav-wrapper"><a href="#" class="brand-logo">Display_Download</a><div class="right" id="menu_current_path">' + breadcrumb + '</div></div></nav>');
                        $('#the_body').append('<div class="row mui-panel " id="loader"><div class="progress"><div class="indeterminate"></div></div></div>');
                        $('#loader').css({'margin-top': '25%'});
                        setTimeout(function () {
                            $('#loader').remove();
                            folders = '';
                            if (data.folder.length !== 0) {
                                $.each(data.folder, function (index, folder) {
                                    if (folder === ".git") {
                                        folders = folders + '<div class="folder col s3"><img class="icons" src="media/img/icons/git.png" alt="git folder" /><p class="folder_name">' + folder + '</p></div>';
                                    } else if (folder === ".idea") {
                                        folders = folders + '<div class="folder col s3"><img class="icons" src="media/img/icons/phpstorm.png" alt="phpstorm folder" /><p class="folder_name">' + folder + '</p></div>';
                                    } else {
                                        folders = folders + '<div class="folder col s3"><img class="icons" src="media/img/icons/folder.png" alt="folder" /><p class="folder_name">' + folder + '</p></div>';
                                    }
                                });
                            }
                            files = '';
                            if (Object.keys(data.file).length !== 0) {
                                $.each(data.file, function (extension, array_file) {
                                    if (extension === "") {
                                        extension = "txt";
                                    } else if (extension === "phar") {
                                        extension = "php";
                                    }
                                    $.each(array_file, function (index, file) {
                                        files = files + '<div class="file col s3"><img class="icons" src="media/img/icons/' + extension + '.png" alt="' + extension + ' file" /><p class="file_name">' + file + '</p></div>';
                                        file_count = file_count + 1;
                                    });
                                });
                            }
                            $('#the_body').append('<div class="row mui-panel">There is ' + data.folder.length + ' folder(s) and ' + file_count + ' file(s)</div>');
                            $('#the_body').append('<div class="row"><div class="col s12" id="parent_directory"><i class="material-icons prefix">reply</i>Parent Directory</div><div class="mui-panel" id="path_content"><div class="row">' + folders + files + '</div></div></div>');
                        }, 1000);
                    }
                }
            });
        } else {
            Materialize.toast('<p class="alert-failed">Empty path !!<p>', 2000, 'rounded alert-failed');
        }
    }
    $('#send_path').click(function () {
        get_original_path();
        setTimeout(function () {
            send_path($('#original_path').text());
        }, 500);
    });
    $(document.body).on('click', '.folder', function () {
        send_path($('#current_path').text() + '/' + $(this).children('p').text());
    });
    $(document.body).on('click', '#parent_directory', function () {
        send_path($('#current_path').text().replace(/\/[^\/]+$/, ''));
    });
    $(document.body).on('click', '.file', function () {
        $('.icons').css('display', 'inline');
        $('audio').remove();
        $(this).children('.icons').css('display', 'none');
        $(this).prepend('<audio controls autoplay><source src="' + $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/" + encodeURIComponent($(this).children('p').text()) + '" /></audio>');
    });
    $(document.body).on('contextmenu', '.folder', function () {
        console.log('right click on folder');
    });
    $(document.body).on('contextmenu', '.file', function () {
        console.log('right click on file');
    });
});