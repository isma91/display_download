/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
    var extension, parent_directory, array_audio, array_video, array_picture, i, j, k, properties, file;
    array_audio = ["mp3", "wav", "wma", "aac"];
    array_video = ["avi", "ogv", "mpg", "webm", "wmv", "flv", "mkv", "mp4", "mov"];
    array_picture = ["png", "jpg", "bmp"];
    array_code = ["php", "html", "css", "xhtml", "js", "json", "py", "sh", "phar"];
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
    function send_properties (file_name, path) {
        "use strict";
        $('#get_properties_modal').remove();
        $.post('controllers/file_system.php', {action: 'properties', name: file_name, from: null, to: path}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.error === null) {
                    properties = '';
                    $.each(data.data, function (name, value) {
                        properties = properties + '<p>' + name + ' : ' + value + '</p>';
                    });
                    $('#path_content').append('<div id="get_properties_modal" class="modal"><div class="modal-content"><h2>Properties of ' + file_name + '</h2>' + properties + '</div><div class="modal-footer"><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
                    $('#get_properties_modal').openModal();
                } else {
                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 2000, 'rounded alert-failed');
                }
            }
        });
    }
    function check_duplicate_archive (archive_name, path, extension) {
        "use strict";
        $.post('controllers/check_duplicate_archive.php', {archive_name: archive_name, path: path, extension: extension}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.file_exists === true) {
                    $('#create_archive_div').html('<p class="error">Archive name already taken !!</p>');
                    $("#create_archive_button").attr('disabled', "true");
                } else {
                    $("#create_archive_button").removeAttr('disabled');
                }
            }
        });
    }
    function send_archive () {
        "use strict";
        $('#archive_modal').remove();
        $('#path_content').append('<div id="archive_modal" class="modal bottom-sheet"><div class="modal-content"><h4>Name and the type of the archive</h4><div id="create_archive_div"></div><div class="row"><p><input class="with-gap" name="archive_extension" type="radio" id=".zip" value=".zip" checked /><label for=".zip">.zip</label></p><p><input class="with-gap" name="archive_extension" type="radio" id=".tar" value=".tar" /><label for=".tar">.tar</label></p><p><input class="with-gap" name="archive_extension" type="radio" id=".tar.gz" value=".tar.gz" /><label for=".tar.gz">.tar.gz</label></p><p><input class="with-gap" name="archive_extension" type="radio" id=".tar.bz2" value=".tar.bz2" /><label for=".tar.bz2">.tar.bz2</label></p></div><div class="row"><div class="input-field"><i class="material-icons prefix">archive</i><input id="create_archive_input" type="text"><label for="create_archive_input">Name</label></div></div></div><div class="modal-footer"><button id="create_archive_button" class="btn modal-action modal-close waves-effect waves-light btn-flat" disabled="true">Create</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        $('#archive_modal').openModal();
        $("input[name=archive_extension]").change(function () {
            check_duplicate_archive($("#create_archive_input").val(), $('#current_path').text(), $("input[name=archive_extension]:checked").val());
        });
        $("#create_archive_input").on('change paste keyup', function () {
            if ($.trim($(this).val()).match(/\//) !== null || $.trim($(this).val()) === "") {
                $("#create_archive_button").attr('disabled', "true");
            } else {
                check_duplicate_archive($.trim($(this).val()), $('#current_path').text(), $("input[name=archive_extension]:checked").val());
            }
        });
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
        parent_directory = $('#current_path').text().replace(/\/[^\/]+$/, '');
        if (parent_directory === "") {
            parent_directory = "/";
        }
        send_path(parent_directory);
    });
    $(document.body).on('click', '.file', function () {
        extension = $(this).children('p').text().split('.').pop().toLowerCase();
        for (i = 0; i < array_audio.length; i = i + 1) {
            if (extension === array_audio[i]) {
                $('.icons').css('display', 'inline');
                $('audio').remove();
                $(this).children('.icons').css('display', 'none');
                $(this).prepend('<audio controls autoplay><source src="' + $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/" + encodeURIComponent($(this).children('p').text()) + '" /></audio>');
                break;
            }
        }
        for (j = 0; j < array_video.length; j = j + 1) {
            if (extension === array_video[j]) {
                $('#video').remove();
                $('.cboxPhoto').remove();
                $.colorbox({html:'<h1 id="cboxTitle">Click on the close button at left bottom to close the window</h1><div id="video"><video controls="controls" preload="true"><source src="' + $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/" + encodeURIComponent($(this).children('p').text()) + '" /></video></div>', width:'90%', height: '90%'});
                break;
            }
        }
        for (k = 0; k < array_picture.length; k = k + 1) {
            if (extension === array_picture[k]) {
                $('#video').remove();
                $('.cboxPhoto').remove();
                $.colorbox({href: $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/" + encodeURIComponent($(this).children('p').text()), width:'90%', height: '90%'});
                break;
            }
        }
    });
    $(document.body).on('contextmenu', '.mui-panel', function () {
        extension = $(this).children('p').text().split('.').pop().toLowerCase();
        $.contextMenu({
            selector: '.mui-panel',
            items: {
                "Create": {name: "Create Folder", callback: function () {
                    $('#create_folder_modal').remove();
                    $('#path_content').append('<div id="create_folder_modal" class="modal"><div class="modal-content"><h4>Name of the created folder</h4><div class="row"><div class="input-field"><i class="material-icons prefix">folder_open</i><input id="create_folder_input" type="text"><label for="create_folder_input">Name</label></div></div><div class="modal-footer"><button id="create_folder_button" class="btn modal-action modal-close waves-effect waves-light btn-flat" disabled="true">Create</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
                    $('#create_folder_modal').openModal();
                    $('#create_folder_input').on('change paste keyup', function () {
                        if ($.trim($(this).val()).match(/\//) !== null || $.trim($(this).val()) === "") {
                            $("#create_folder_button").attr('disabled', "true");
                        } else {
                            $("#create_folder_button").removeAttr('disabled');
                        }
                    });
                    $('#create_folder_button').click(function () {
                        $.post('controllers/file_system.php', {action: 'create_folder', name: $.trim($('#create_folder_input').val()), from: null, to: $('#current_path').text()}, function (data, textStatus, xhr) {
                            if (textStatus === "success") {
                                data = JSON.parse(data);
                                if (data.error === null) {
                                    send_path($('#current_path').text());
                                    Materialize.toast('<p class="alert-success">Folder ' + data.data.folder_name + ' created successfully !!<p>', 1000, 'rounded alert-success');
                                } else {
                                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 2000, 'rounded alert-failed');
                                }
                            }
                        });
                    });
                }},
                "separator": "---------",
                "quit": {name: "Quit", callback: $.noop
            }
        }});
        $.contextMenu({
            selector: '.folder',
            items: {
                "copy": {name: "Copy"},
                "rename": {name: "Rename"},
                "delete": {name: "Delete"},
                "archive": {name: "Archive", callback: function () {
                    file = $(this).children('p').text();
                    send_archive();
                    $('#create_archive_button').click(function() {
                        $.post('controllers/file_system.php', {action: 'create_archive', files: [file], archive_name: $.trim($('#create_archive_input').val()), from: null, to: $('#current_path').text(), extension: $("input[name=archive_extension]:checked").val()}, function (data, textStatus) {
                            if (textStatus === "success") {
                                data = JSON.parse(data);
                                if (data.error === null) {
                                    send_path($('#current_path').text());
                                    Materialize.toast('<p class="alert-success">Archive ' + archive_name + extension + ' created successfully !!<p>', 1000, 'rounded alert-success');
                                } else {
                                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 2000, 'rounded alert-failed');
                                }
                            }
                        });
                    });
                }},
                "separator": "---------",
                "quit": {name: "Quit", callback: $.noop
            }
        }});
        $.contextMenu({
            selector: '.file',
            items: {
                "edit": {name: "Edit"},
                "copy": {name: "Copy"},
                "delete": {name: "Delete"},
                "archive": {name: "Archive", callback: function () {
                    file = $(this).children('p').text();
                    send_archive();
                    $('#create_archive_button').click(function() {
                        $.post('controllers/file_system.php', {action: 'create_archive', files: [file], archive_name: $.trim($('#create_archive_input').val()), from: null, to: $('#current_path').text(), extension: $("input[name=archive_extension]:checked").val()}, function (data, textStatus) {
                            if (textStatus === "success") {
                                data = JSON.parse(data);
                                if (data.error === null) {
                                    send_path($('#current_path').text());
                                    Materialize.toast('<p class="alert-success">Archive ' + archive_name + extension + ' created successfully !!<p>', 1000, 'rounded alert-success');
                                } else {
                                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 2000, 'rounded alert-failed');
                                }
                            }
                        });
                    });
                }},
                "properties": {name: "Properties", callback: function () {
                    send_properties($(this).children('p').text(), $('#current_path').text());
                }},
                "separator": "---------",
                "quit": {name: "Quit", callback: $.noop
            }
        }});
    });
});