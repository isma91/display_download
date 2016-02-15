/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
    var extension, parent_directory, array_audio, array_video, array_picture, i, j, k, properties, file, archive_name, l, relative_path, encode_uri_component_file_name, m;
    array_audio = ["mp3", "wav", "wma", "aac"];
    array_video = ["avi", "ogv", "mpg", "webm", "wmv", "flv", "mkv", "mp4", "mov"];
    array_picture = ["png", "jpg", "bmp"];
    array_code = ["asp", "aspx", "bat", "cfm", "class", "conf", "cpp", "css", "db", "dbf", "dll", "htaccess", "html", "jar", "js", "jsp", "md", "odb", "pdb", "php", "py", "rb", "sql", "sh", "xhtml", "xml"];
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
                        Materialize.toast('<p class="alert-failed">No folder or file here !!<p>', 3000, 'rounded alert-failed');
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
                        $('#the_menu').html(' <nav><div class="nav-wrapper"><a href="#" class="brand-logo">Display_Download</a><i class="right medium material-icons" id="refresh">refresh</i><div class="right" id="menu_current_path">' + breadcrumb + '</div></div></nav>');
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
                            $('#the_body').append('<div class="row mui-panel"><i class="material-icons prefix menu_icons tooltipped" id="copy" data-position="top" data-tooltip="Copy">content_copy</i><i class="material-icons prefix menu_icons tooltipped" id="remove" data-position="top" data-tooltip="Delete">delete</i><i class="material-icons prefix menu_icons tooltipped" id="archive" data-position="top" data-tooltip="Archive">archive</i></div>');
                            $('#the_body').append('<div class="row mui-panel">There is ' + data.folder.length + ' folder(s) and ' + file_count + ' file(s)</div>');
                            $('#the_body').append('<div class="row mui-panel" id="selection"></div>');
                            $('#the_body').append('<div class="row"><div class="col s12" id="parent_directory"><i class="material-icons prefix">reply</i>Parent Directory</div><div class="mui-panel" id="path_content"><div class="row">' + folders + files + '</div></div></div>');
                            $('.tooltipped').tooltip({delay: 50});
                        }, 1000);
                    }
                }
            });
        } else {
            Materialize.toast('<p class="alert-failed">Empty path !!<p>', 3000, 'rounded alert-failed');
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
                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                }
            }
        });
    }
    function check_duplicate_archive (archive_name, path, extension) {
        "use strict";
        $.post('controllers/check_duplicate_file.php', {file_type: "archive", archive_name: archive_name, path: path, extension: extension}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.file_exists === true) {
                    $('#create_archive_div').html('<p class="error">Archive name already taken !!</p>');
                    $("#create_archive_button").attr('disabled', "true");
                } else {
                    $('#create_archive_div').html('<p class="error"></p>');
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
    function send_create_archive () {
        "use strict";
        $('#path_content').append('<div class="loader"></div>');
        $.post('controllers/file_system.php', {action: 'create_archive', files: [file], archive_name: $.trim($('#create_archive_input').val()), from: null, to: $('#current_path').text(), extension: $("input[name=archive_extension]:checked").val()}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.error === null) {
                    send_path($('#current_path').text());
                    Materialize.toast('<p class="alert-success">Archive ' + $.trim($('#create_archive_input').val()) + $("input[name=archive_extension]:checked").val() + ' created successfully !!<p>', 3000, 'rounded alert-success');
                    $('.loader').remove();
                } else {
                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                    $('.loader').remove();
                }
            }
        });
    }
    function display_pdf (url_pdf) {
        "use strict";
        var pdf;
        $('#pdf_modal').remove();
        $('#path_content').append('<div id="pdf_modal" class="modal modal-fixed-footer"><div class="modal-content" id="pdf_view"></div><div class="modal-footer"><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        pdf = new PDFObject({url: url_pdf, pdfOpenParams: { scrollbars: '1', toolbar: '1', statusbar: '1', messages: '1', navpanes: '1' }}).embed('pdf_view');
        $('#pdf_modal').openModal();
    }
    function check_duplicate_file(file_name, path, div_id_selector, button_id_selector) {
        "use strict";
        $.post('controllers/check_duplicate_file.php', {file_type: 'file', path: path, file_name: file_name}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.file_exists === true) {
                    $(div_id_selector).html('<p class="error">Name already taken !!</p>');
                    $(button_id_selector).attr('disabled', "true");
                } else {
                    $(div_id_selector).html('<p class="error"></p>');
                    $(button_id_selector).removeAttr('disabled');
                }
            }
        });
    }
    function send_rename (old_name) {
        "use strict";
        $('#rename_modal').remove();
        $('#path_content').append('<div id="rename_modal" class="modal"><div class="modal-content"><div class="row"><div id="check_new_name"></div><div class="input-field"><i class="material-icons prefix">fiber_new</i><input id="rename_input" type="text"><label for="rename_input">New name</label></div></div></div><div class="modal-footer"><button id="rename_button" class="btn modal-action modal-close waves-effect waves-light btn-flat" disabled="true">Rename</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        $('#rename_modal').openModal();
        $("#rename_input").on('change paste keyup', function () {
            if ($.trim($(this).val()).match(/\//) !== null || $.trim($(this).val()) === "") {
                $("#rename_button").attr('disabled', "true");
            } else {
                check_duplicate_file($.trim($(this).val()), $('#current_path').text(), '#check_new_name', "#rename_button");
            }
        });
        $('#rename_button').click(function () {
            $.post('controllers/file_system.php', {action: 'rename', old_name: old_name, new_name: $.trim($('#rename_input').val()), from: null, to: $('#current_path').text()}, function (data, textStatus) {
                if (textStatus === "success") {
                    data = JSON.parse(data);
                    if (data.error === null) {
                        send_path($('#current_path').text());
                        Materialize.toast('<p class="alert-success">' + old_name + ' rename in ' + data.data + ' successfully !!<p>', 3000, 'rounded alert-success');
                    } else {
                        Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                    }
                }
            });
        });
    }
    function send_copy(file_name) {
        "use strict";
        $('#copy_modal').remove();
        $('#path_content').append('<div id="copy_modal" class="modal bottom-sheet"><div class="modal-content"><div class="row"><h4>Enter the directory where you want to copy</h4><div id="checked_copy"></div><div class="input-field"><i class="material-icons prefix">content_copy</i><input id="copy_input" type="text"><label for="copy_input">Directory</label></div></div></div><div class="modal-footer"><button id="copy_button" class="btn modal-action modal-close waves-effect waves-light btn-flat" disabled="true">Copy</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        $('#copy_modal').openModal();
        $("#copy_input").on('change paste keyup', function () {
            if ($.trim($(this).val()) === "") {
                $("#copy_button").attr('disabled', "true");
            } else {
                check_duplicate_file(file_name, $.trim($(this).val()), '#checked_copy', "#copy_button");
            }
        });
        $('#copy_button').click(function () {
            $.post('controllers/file_system.php', {action: 'copy', file_name: file_name, to: $.trim($('#copy_input').val()), from: $('#current_path').text()}, function (data, textStatus) {
                if (textStatus === "success") {
                    data = JSON.parse(data);
                    if (data.error === null) {
                        send_path($('#current_path').text());
                        Materialize.toast('<p class="alert-success">' + file_name + ' copy in ' + data.data + ' successfully !!<p>', 3000, 'rounded alert-success');
                    } else {
                        Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                    }
                }
            });
        });
    }
    function send_remove(file_name) {
        "use strict";
        $('#remove_modal').remove();
        $('#path_content').append('<div id="remove_modal" class="modal"><div class="modal-content"><h4>Are you sure you want to delete ' + file_name  + ' ?</h4></div><div class="modal-footer"><button id="remove_button" class="btn modal-action modal-close waves-effect waves-light btn-flat">Remove</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        $('#remove_modal').openModal();
        $('#remove_button').click(function () {
            $.post('controllers/file_system.php', {action: 'remove', name: file_name, to: null, from: $('#current_path').text()}, function (data, textStatus) {
                if (textStatus === "success") {
                    data = JSON.parse(data);
                    if (data.error === null) {
                        send_path($('#current_path').text());
                        Materialize.toast('<p class="alert-success">' + file_name + ' deleted successfully !!<p>', 3000, 'rounded alert-success');
                    } else {
                        Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                    }
                }
            });
        });
    }
    function send_file_put_content (file_name, file_from, file_content) {
        "use strict";
        $.post('controllers/file_system.php', {action: 'file_put_content', name: file_name, from: file_from, file_content: file_content}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.error === null) {
                    send_path($('#current_path').text());
                    Materialize.toast('<p class="alert-success">' + file_name + ' was successfully saved !!<p>', 3000, 'rounded alert-success');
                } else {
                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                }
            }
        });
    }
    function code_mirror_load (code_mirror_value, file_name) {
        "use strict";
        var json_mime_type, code_mirror_extension_option, code_mirror_require, code_mirror_mode, code_mirror;
        json_mime_type = {
            "css" : "text/css",
            "sass" : "text/x-scss",
            "less" : "text/x-less",
            "html-xml-css-js" : "text/html",
            "html" : "text/html",
            "html-php" : "application/x-httpd-php",
            "http" : "message/http",
            "java" : "text/x-java",
            "objective-c" : "text/x-objectivec",
            "javascript" : "text/javascript",
            "json" : "application/json",
            "markdown" : "text/x-markdown",
            "nginx" : "text/nginx",
            "perl" : "text/x-perl",
            "php" : "text/php",
            "python" : "text/x-python",
            "ruby" : "text/x-ruby",
            "sql" : "text/x-sql",
            "mysql" : "text/x-mysql",
            "mariadb" : "text/x-mariadb",
            "cassandra" : "text/x-cassandra",
            "plsql" : "text/x-plsql",
            "mssql" : "text/x-mssql",
            "hive" : "text/x-hive",
            "pgsql" : "text/x-pgsql",
            "swift" : "text/x-swift",
            "twig" : "text/x-twig",
            "xml" : "application/xml",
            "yaml" : "text/x-yaml"
        };
        code_mirror_extension_option = "";
        $.each(json_mime_type, function (extension, mime_type) {
            code_mirror_extension_option = code_mirror_extension_option + '<option value="' + mime_type + '">' + extension + '</option>';
        });
        $('#code_mirror_extension_modal').remove();
        $('#path_content').append('<div id="code_mirror_extension_modal" class="modal modal-fixed-footer"><div class="modal-content"><h4>Please choose your code mode</h4><div class="input-field"><select id="code_mirror_extension_select">' + code_mirror_extension_option + '</select><label>Code mode</label></div></div><div class="modal-footer"><button id="code_mirror_extension_button" class="btn modal-action modal-close waves-effect waves-light btn-flat">Choose mode</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
        $('select').material_select();
        $('#code_mirror_extension_modal').openModal();
        $('#code_mirror_extension_button').click(function () {
            $('#code_mirror_extension_modal').closeModal();
            code_mirror_mode = $('#code_mirror_extension_select option:selected').val();
            code_mirror_require = $('#code_mirror_extension_select option:selected').text();
            if (code_mirror_require === "php" || code_mirror_require === "html" || code_mirror_require === "html-xml-css-js" || code_mirror_require === "html-php" || code_mirror_require === "css" || code_mirror_require === "javascript") {
                $.getScript('media/js/code_mirror_modes/php.js', function (data_php, textStatus_php) {
                    if (textStatus_php === "success") {
                        $.getScript('media/js/code_mirror_modes/xml.js', function (data_xml, textStatus_xml) {
                            if (textStatus_xml === "success") {
                                $.getScript('media/js/code_mirror_modes/css.js', function (data_css, textStatus_css) {
                                    if (textStatus_css === "success") {
                                        $.getScript('media/js/code_mirror_modes/javascript.js', function (data_javavscript, textStatus_javascript) {
                                            if (textStatus_javascript === "success") {
                                                $.getScript('media/js/code_mirror_modes/htmlmixed.js', function (data_htmlmixed, textStatus_htmlmixed) {
                                                    if (textStatus_htmlmixed === "success") {
                                                        if (code_mirror_value === "") {
                                                            Materialize.toast('<p class="alert-info">This file is empty !!<p>', 3000, 'rounded alert-info');
                                                        }
                                                        $('#code_mirror_modal').remove();
                                                        $('#path_content').append('<div id="code_mirror_modal" class="modal bottom-sheet"><div class="modal-content"><textarea id="code_mirror_textarea">' + code_mirror_value + '</textarea></div><div class="modal-footer"><button id="code_mirror_button" class="btn modal-action modal-close waves-effect waves-light btn-flat">Save Change</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
                                                        $('#code_mirror_modal').openModal();
                                                        code_mirror = CodeMirror.fromTextArea(document.getElementById('code_mirror_textarea'), {
                                                            lineNumbers: true,
                                                            indentWithTabs: true,
                                                            matchBrackets: true,
                                                            indentUnit: 4,
                                                            mode:  code_mirror_mode
                                                        });
                                                        code_mirror.on('change', function () {
                                                            code_mirror.save();
                                                        });
                                                        $('#code_mirror_button').click(function () {
                                                            send_file_put_content(file_name, $('#current_path').text(), $('#code_mirror_textarea').val());
                                                        });
                                                    } else {
                                                        Materialize.toast('<p class="alert-failed">A requested js file can\'t be loaded !!<p>', 3000, 'rounded alert-failed');
                                                    }
                                                });
                                            } else {
                                                Materialize.toast('<p class="alert-failed">A requested js file can\'t be loaded !!<p>', 3000, 'rounded alert-failed');
                                            }
                                        });
                                    } else {
                                        Materialize.toast('<p class="alert-failed">A requested js file can\'t be loaded !!<p>', 3000, 'rounded alert-failed');
                                    }
                                });
                            } else {
                                Materialize.toast('<p class="alert-failed">A requested js file can\'t be loaded !!<p>', 3000, 'rounded alert-failed');
                            }
                        });
                    } else {
                        Materialize.toast('<p class="alert-failed">A requested js file can\'t be loaded !!<p>', 3000, 'rounded alert-failed');
                    }
                });
            } else {
                $.getScript('media/js/code_mirror_modes/' + code_mirror_require + '.js', function (data, textStatus) {
                    if (textStatus === "success") {
                        $('#code_mirror_modal').remove();
                        $('#path_content').append('<div id="code_mirror_modal" class="modal bottom-sheet"><div class="modal-content"><textarea id="code_mirror_textarea">' + code_mirror_value + '</textarea></div><div class="modal-footer"><button id="code_mirror_button" class="btn modal-action modal-close waves-effect waves-light btn-flat">Apply Change</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
                        $('#code_mirror_modal').openModal();
                        CodeMirror.fromTextArea(document.getElementById('code_mirror_textarea'), {
                            lineNumbers: true,
                            indentWithTabs: true,
                            matchBrackets: true,
                            indentUnit: 4,
                            mode:  code_mirror_mode
                        });
                    }
                });
            }
        });
    }
    function send_file_content (file_name) {
        "use strict";
        $.post('controllers/file_system.php', {action: 'file_get_content', name: file_name, to: null, from: $('#current_path').text()}, function (data, textStatus) {
            if (textStatus === "success") {
                data = JSON.parse(data);
                if (data.error === null) {
                    code_mirror_load(data.data.file_content, file_name);
                } else {
                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
                }
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
        relative_path = $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/";
        relative_path = relative_path.replace('//', '/');
        encode_uri_component_file_name = encodeURIComponent($(this).children('p').text());
        for (i = 0; i < array_audio.length; i = i + 1) {
            if (extension === array_audio[i]) {
                $('#audio').remove();
                $('audio').remove();
                $.colorbox({html:'<h1 id="cboxTitle">Click on the close button at left bottom to close the window</h1><div id="audio"><audio controls autoplay><source src="' + relative_path + encode_uri_component_file_name + '" /></audio></div>', width:'90%', height: '90%'});
                break;
            }
        }
        for (j = 0; j < array_video.length; j = j + 1) {
            if (extension === array_video[j]) {
                $('#video').remove();
                $('.cboxPhoto').remove();
                $.colorbox({html:'<h1 id="cboxTitle">Click on the close button at left bottom to close the window</h1><div id="video"><video controls="controls" preload="true"><source src="' + relative_path + encode_uri_component_file_name + '" /></video></div>', width:'90%', height: '90%'});
                break;
            }
        }
        for (k = 0; k < array_picture.length; k = k + 1) {
            if (extension === array_picture[k]) {
                $('#video').remove();
                $('.cboxPhoto').remove();
                $.colorbox({href: relative_path + encode_uri_component_file_name, width:'90%', height: '90%'});
                break;
            }
        }
        if (extension === "pdf") {
            display_pdf(relative_path + encode_uri_component_file_name);
        }
        for (l = 0; l < array_code.length; l = l + 1) {
            if (extension === array_code[l]) {
                send_file_content(encode_uri_component_file_name);
                break;
            }
        }
    });
    $(document.body).on('contextmenu', '.mui-panel', function () {
        extension = $(this).children('p').text().split('.').pop().toLowerCase();
        relative_path = $('#current_path').text().replace($('#original_path').text(), "../").replace("//", "/") + "/";
        relative_path = relative_path.replace('//', '/');
        encode_uri_component_file_name = encodeURIComponent($(this).children('p').text());
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
                                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
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
                "copy": {name: "Copy", callback: function () {
                    send_copy($(this).children('p').text());
                }},
                "rename": {name: "Rename", callback: function () {
                    send_rename($(this).children('p').text());
                }},
                "delete": {name: "Delete", callback: function () {
                    send_remove($(this).children('p').text());
                }},
                "archive": {name: "Archive", callback: function () {
                    file = $(this).children('p').text();
                    send_archive();
                    $('#create_archive_button').click(function() {
                        send_create_archive();
                    });
                }},
                "separator": "---------",
                "quit": {name: "Quit", callback: $.noop
            }
        }});
        $.contextMenu({
            selector: '.file',
            items: {
                "edit": {name: "Edit", callback: function () {
                    for (m = 0; m < array_code.length; m = m + 1) {
                        if (extension === array_code[m]) {
                            send_file_content(encode_uri_component_file_name);
                            break;
                        }
                    }
                }},
                "copy": {name: "Copy", callback: function () {
                    send_copy($(this).children('p').text());
                }},
                "delete": {name: "Delete", callback: function () {
                    send_remove($(this).children('p').text());
                }},
                "rename": {name: "Rename", callback: function () {
                    send_rename($(this).children('p').text());
                }},
                "archive": {name: "Archive", callback: function () {
                    file = $(this).children('p').text();
                    send_archive();
                    $('#create_archive_button').click(function() {
                        send_create_archive();
                    });
                }},
                "extract": {name: "Extract archive here", callback: function () {
                    archive_name = $(this).children('p').text();
                    $('#archive_get_password_modal').remove();
                    $('#path_content').append('<div id="archive_get_password_modal" class="modal"><div class="modal-content"><h4>If your rar archive have a password, please enter here and click to the extract button, if not just click to extract button</h4><div class="row"><div class="input-field"><i class="material-icons prefix">archive</i><input id="archive_password" type="password"><label for="archive_password">Archive Password</label></div></div></div><div class="modal-footer"><button id="archive_password_button" class="btn modal-action modal-close waves-effect waves-light btn-flat">Extract</button><button class="btn modal-action modal-close waves-effect waves-light btn-flat">Quit</button></div></div>');
                    $('#archive_get_password_modal').openModal();
                    $('#archive_password_button').click(function () {
                        $.post('controllers/file_system.php', {action: 'extract_archive', archive_name: archive_name, archive_password: $('#archive_password').val(), from: null, to: $('#current_path').text()}, function (data, textStatus) {
                            if (textStatus === "success") {
                                data = JSON.parse(data);
                                if (data.error === null) {
                                    send_path($('#current_path').text());
                                    Materialize.toast('<p class="alert-success">Archive ' + archive_name + ' extracted in folder ' + data.data + ' !!<p>', 3000, 'rounded alert-success');
                                } else {
                                    Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 3000, 'rounded alert-failed');
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
    $(document.body).on('click', '#refresh', function () {
        send_path($('#current_path').text());
    });
    $(document.body).on('click', '.brand-logo', function () {
        send_path($('#original_path').text());
    });
    $(document.body).on('click', '#copy', function () {
        $('.folder').prepend('<i class="icons material-icons prefix add">add</i><i class="icons material-icons prefix remove">remove</i>');
        $('.file').prepend('<i class="icons material-icons prefix add">add</i><i class="icons material-icons prefix remove">remove</i>');
    });
    $(document.body).on('click', '#remove', function () {
    });
    $(document.body).on('click', '#archive', function () {
    });
});