<?php
/**
* Get_file_by_extension.php
*
* List all file of a directory by a specific extension
*
* PHP 5.6.17-0+deb8u1 (cli) (built: Jan 13 2016 09:10:12)
*
* @category Controller
* @package  Controller
* @author   isma91 <ismaydogmus@gmail.com>
* @license  http://opensource.org/licenses/gpl-license.php GNU Public License
* @link     https://github.com/isma91/display_download/blob/master/controllers/get_file_by_extension.php
*/
/* take the all path of the directory */
$directory = rtrim($_POST["directory"], '/') . '/';
$array_extension = explode(",", $_POST["extension"]);
$list_directory = scandir($directory);
$array_file = array();
foreach ($list_directory as $file) {
	if ($file !== ".." && $file !== ".") {
		if (is_file($directory.$file)) {
			foreach ($array_extension as $extension) {
				if ($extension === pathinfo($file, PATHINFO_EXTENSION)) {
					$array_file[pathinfo($file, PATHINFO_EXTENSION)][] = $directory.$file;
				}
			}
		}
	}
}
if ($directory === "/") {
	$array_path = array("/");
} else {
	$array_path = explode('/', $directory);
}
$all_array = array('file' => $array_file, 'path' => $array_path);
echo json_encode($all_array);