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
function send_json ($error, $data) {
	echo json_encode(array('error' => $error, 'data' => $data));
}
function create_folder ($folder_name, $path) {
	if (!empty($folder_name) && !empty($path)) {
		$folder_name_path = realpath($path) . "/" . $folder_name;
		if (!file_exists($folder_name_path)) {
			if (!mkdir($folder_name_path)) {
				send_json("The directory " . $folder_name . " can't be created !!", null);
			} else {
				send_json(null, array('folder_name' => $folder_name));
			}
		} else {
			send_json("The directory " . $folder_name . " exists !!", null);
		}
	}
}
function get_stat ($file_name, $path) {
	if (!empty($file_name && !empty($path))) {
		$file_name_path = realpath($path) . "/" . $file_name;
		if (file_exists($file_name_path)) {
			if (is_readable($file_name_path)) {
				$stat = stat($file_name_path);
				$size = $stat["size"];
				if ($size < 1024) {
					$size = $stat["size"] . ' octets';
				} elseif ($size > 1024 && $size < 1024000) {
					$size = ($stat["size"] / 1024) . ' Ko (' . $stat["size"] . ' octets)';
				} elseif ($size > 1024000 && $size < 1048576000) {
					$size = ($stat["size"] / 1024 / 1024) . ' Mo (' . $stat["size"] . ' octets)';
				} elseif ($size > 1048576000 && $size < 1073741824000) {
					$size = ($stat["size"] / 1024 / 1024 / 1024) . ' Go (' . $stat["size"] . ' octets)';
				} elseif ($size > 1073741824000 && $size < 1099511627776000) {
					$size = ($stat["size"] / 1024 / 1024 / 1024 / 1024) . ' To (' . $stat["size"] . ' octets)';
				} else {
					$size = ($stat["size"] / 1024 / 1024 / 1024 / 1024 / 1024) . ' Po (' . $stat["size"] . ' octets)';
				}
				send_json(null, array(
					"device number" => $stat["dev"],
					"inode number" => $stat["ino"],
					"inode protection mode" => $stat["mode"],
					"links number" => $stat["nlinks"],
					"size of the file" => $size,
					"user owner" => posix_getpwuid($stat["uid"]),
					"group owner" => posix_getgrgid($stat["gid"]),
					"device type" => $stat["rdev"],
					"last access date" => date("F d Y H:i:s.", $stat["atime"]),
					"last modification date" => date("F d Y H:i:s.", $stat["mtime"]),
					"last changing right date" => date("F d Y H:i:s.", $stat["ctime"]),
					"block size" => $stat["blksize"],
					"512 bits block allowed" => $stat["blocks"]
					)
				);
			} else {
				send_json("The file " . $file_name . "  can't be readable !! Check this project right !!", null);
			}
		} else {
			send_json("The file " . $file_name . "  don't exists !!", null);
		}
	}
}
function create_archive ($archive_name, $path, $extension, $files) {
	if (!empty($archive_name) && !empty($path) && !empty($extension) && !empty($files)) {
		$accepted_extension = false;
		$array_files = array();
		$array_path_files = array();
		$array_path_folders = array();
		$array_all = array();
		$array_extension = array(".zip", ".tar", ".tar.gz", ".tar.bz2");
		foreach ($array_extension as $archive_extension) {
			if ($archive_extension === $extension) {
				$accepted_extension = true;
				break;
			}
		}
		if ($accepted_extension === false) {
			send_json("Archive extension is not supported !!", null);
		}
		//$compression_id = sha1(rand());
		//$progress_file_compression = file_put_contents($compression_id, "");
		$max_size = 4294967296;
		foreach ($files as $file) {
			if (is_file($path . $file)) {
				if (filesize($path . $file) > $max_size || filesize($path . $file) < 1) {
				} else {
					array_push($array_path_files, $path . $file);
					array_push($array_files, substr($path . $file, strlen($path)));
				}
			} else {
				array_push($array_path_folders, $path . $file);
			}
		}
		foreach ($array_path_folders as $folder) {
			$list_folder = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($folder));
			foreach ($list_folder as $file_in_folder) {
				if ($file_in_folder->isDir()) {
					continue;
				}
				array_push($array_path_files, $file_in_folder->getPathname());
				array_push($array_files, substr($file_in_folder->getPathname(), strlen($path)));
			}
		}
		if ($extension === ".zip") {
			$tmp_zip = tempnam("tmp", "zip");
			$zip = new ZipArchive();
			$create_zip = $zip->open($tmp_zip, ZipArchive::OVERWRITE);
			$array_all = array_combine($array_path_files, $array_files);
			if ($create_zip === true) {
				foreach ($array_all as $full_path => $file_name) {
					if (file_exists($full_path)) {
						if (is_readable($full_path)) {
							$zip->addFile($full_path, $file_name);
						}
					}
				}
				$zip->close();
				rename($tmp_zip, $path . $archive_name . $extension);
				send_json(null, null);
			} else {
				send_json("Can't create zip archive !!", null);
			}

			//unlink("/tmp/" . $archive_name . $extension);
		} else {
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
	case 'create_archive':
	create_archive($_POST["archive_name"], rtrim($_POST["to"], '/') . '/', $_POST["extension"], $_POST["files"]);
	break;
	case 'properties':
	get_stat($_POST["name"], rtrim($_POST["to"], '/') . '/');
	break;
	default:
	break;
}