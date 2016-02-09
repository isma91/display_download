<?php
/**
* File_system.php
*
* Create, copy, delete and many thing
*
* PHP 5.6.17-0+deb8u1 (cli) (built: Jan 13 2016 09:10:12)
*
* @category Controller
* @package  Controller
* @author   isma91 <ismaydogmus@gmail.com>
* @license  http://opensource.org/licenses/gpl-license.php GNU Public License
* @link     https://github.com/isma91/display_download/blob/master/controllers/file_system.php
*/
function create_folder ($folder_name, $path) {
	if (!empty($folder_name) && !empty($path)) {
		$folder_name_path = realpath($path) . "/" . $folder_name;
		if (!file_exists($folder_name_path)) {
			if (!mkdir($folder_name_path)) {
				echo json_encode(array('error' => "The directory " . $folder_name . " can't be created !!", 'data' =>  array('folder_name' => $folder_name)));
			} else {
				echo json_encode(array('error' => null, 'data' =>  array('folder_name' => $folder_name)));
			}
		} else {
			echo json_encode(array('error' => "The directory " . $folder_name . " exists !!", 'data' =>  null));
		}
	}
}
function get_stat ($file_name, $path) {
	if (!empty($file_name && !empty($path))) {
		$file_name_path = realpath($path) . "/" . $file_name;
		if (file_exists($file_name_path)) {
			if (is_readable($file_name_path)) {
				$stat = stat($file_name_path);
				echo json_encode(array(
					'error' => null,
					'data' => array(
						"device number" => $stat["dev"],
						"inode number" => $stat["ino"],
						"inode protection mode" => $stat["mode"],
						"links number" => $stat["nlinks"],
						"size of the file" => $stat["size"],
						"user owner" => posix_getpwuid($stat["uid"]),
						"group owner" => posix_getgrgid($stat["gid"]),
						"device type" => $stat["rdev"],
						"last access date" => date("F d Y H:i:s.", $stat["atime"]),
						"last modification date" => date("F d Y H:i:s.", $stat["mtime"]),
						"last changing right date" => date("F d Y H:i:s.", $stat["ctime"]),
						"block size" => $stat["blksize"],
						"512 bits block allowed" => $stat["blocks"]
						)
					)
				);
			} else {
				echo json_encode(array('error' => "The file " . $file_name . "  can't be readable !! Check this project right !!", 'data' =>  null));
			}
		} else {
			echo json_encode(array('error' => "The file " . $file_name . "  don't exists !!", 'data' =>  null));
		}
	}
}
switch ($_POST["action"]) {
	case 'create_folder':
	create_folder($_POST["name"], rtrim($_POST["to"], '/') . '/');
	break;
	case 'copy':
	break;
	case 'delete':
	break;
	case 'archive':
	break;
	case 'properties':
	get_stat($_POST["name"], rtrim($_POST["to"], '/') . '/');
	break;
	default:
	break;
}