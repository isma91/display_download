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
/* take the all path of the directory */
$directory = rtrim($_POST["directory"], '/') . '/';
$list_directory = scandir($directory);
$array_file = array();
$array_folder = array();
foreach ($list_directory as $file) {
	if ($file !== ".." && $file !== ".") {
		if (is_dir($directory.$file)) {
			array_push($array_folder, $file);
		} else {
			array_push($array_file, $file);
		}
	}
}
if ($directory === "/") {
	$array_path = array("/");
} else {
	$array_path = explode('/', $directory);
}
$all_array = array('folder' => $array_folder, 'file' => $array_file, 'path' => $array_path);
echo json_encode($all_array);