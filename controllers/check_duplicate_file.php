<?php
/**
* Check_duplicate_file.php
*
* Check if a file have the same name as we send
*
* PHP 5.6.17-0+deb8u1 (cli) (built: Jan 13 2016 09:10:12)
*
* @category Controller
* @package  Controller
* @author   isma91 <ismaydogmus@gmail.com>
* @license  http://opensource.org/licenses/gpl-license.php GNU Public License
* @link     https://github.com/isma91/display_download/blob/master/controllers/check_duplicate_file.php
*/
if ($_POST["file_type"] === "archive") {
	$file_exists = rtrim(realpath($_POST["path"]), "/") . "/" . $_POST["archive_name"] . $_POST["extension"];
} else {
	$file_exists = rtrim(realpath($_POST["path"]), "/") . "/" . $_POST["file_name"];
}
echo json_encode(array('file_exists' => file_exists($file_exists)));