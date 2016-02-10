<?php
/**
* List_file.php
*
* List all file of a directory
*
* PHP 5.6.17-0+deb8u1 (cli) (built: Jan 13 2016 09:10:12)
*
* @category Controller
* @package  Controller
* @author   isma91 <ismaydogmus@gmail.com>
* @license  http://opensource.org/licenses/gpl-license.php GNU Public License
* @link     https://github.com/isma91/display_download/blob/master/controllers/list_file.php
*/
$archive_path = rtrim(realpath($_POST["path"]), "/") . "/" . $_POST["archive_name"] . $_POST["extension"];
echo json_encode(array('file_exists' => file_exists($archive_path)));