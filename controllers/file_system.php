<?php
/**
* File_system.php
*
* A PHP script to do some things with files
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
		if ($extension === ".zip") {
			$tmp_archive = tempnam("tmp", "zip");
			$archive = new ZipArchive();
			$create_archive = $archive->open($tmp_archive, ZipArchive::OVERWRITE);
			if ($create_archive !== true) {
				unlink($tmp_archive);
				send_json("Can't create zip archive !!", null);
				throw new Exception("Can't create zip archive !!");
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
			$array_all = array_combine($array_path_files, $array_files);
			foreach ($array_all as $full_path => $file_name) {
				if (file_exists($full_path)) {
					if (is_readable($full_path)) {
						$archive->addFile($full_path, $file_name);
					}
				}
			}
			$archive->close();
		} else {
			$tmp_archive = tempnam("tmp", "tar") . ".tar";
			$archive = new PharData($tmp_archive);
			if (count($array_path_folders) > 0) {
				$tmp_archive = tempnam("tmp", "tar") . ".tar";
				$archive = new PharData($tmp_archive);
				foreach ($array_path_folders as $folder) {
					try {
						$archive->buildFromDirectory($folder);
					} catch (Exception $e) {
						send_json($e->getMessage(), null);
						throw new Exception($e->getMessage());
						
					}
				}
			}
			if (count($array_path_files) > 0 && count($array_files) > 0) {
				$array_all = array_combine($array_path_files, $array_files);
				foreach ($array_all as $full_path => $file_name) {
					$archive->addFile($full_path, $file_name);
				}
			}
		}
		if ($extension !== ".tar" && $extension !== ".zip") {
			$archive_type_compress = substr(strrchr($extension, "."), 1);
			if ($archive_type_compress == "gz") {
				$archive->compress(Phar::GZ);
			} elseif ($archive_type_compress == "bz2") {
				$archive->compress(Phar::BZ2);
			}
			$tmp_archive = $tmp_archive . "." . $archive_type_compress;
		}
		rename($tmp_archive, $path . $archive_name . $extension);
		/*if (file_exists($tmp_archive)) {
			unlink($tmp_archive);
		}*/
		send_json(null, null);
	}
}
function extract_archive ($archive_name, $path, $password) {
	if (!empty($archive_name) && !empty($path)) {
		$extension = pathinfo($path . $archive_name, PATHINFO_EXTENSION);
		$array_extension = array("tar" => 4, "gz" => 7, "bz2" => 8, "zip" => 4, "rar" => 4);
		$accepted_extension = false;
		$strlen_extension = "";
		foreach ($array_extension as $archive_extension => $strlen_archive_extension) {
			if ($extension === $archive_extension) {
				$accepted_extension = true;
				$strlen_extension = $strlen_archive_extension;
				break;
			}
		}
		if ($accepted_extension === false) {
			send_json('Extension not supported !!', null);
			throw new Exception("Extension not supported !!");
		}
		$only_file_name = substr($archive_name, 0, -$strlen_extension);
		$last_pos_only_file_name =  strrpos($only_file_name, "-");
		$tmp_only_file_name = substr($only_file_name, 0, $last_pos_only_file_name);
		$counter_duplicate = substr($only_file_name, $last_pos_only_file_name + 1);
		if (!is_int($last_pos_only_file_name) || !is_int($counter_duplicate)) {
			$tmp_only_file_name = $only_file_name;
			$counter_duplicate = 1;
		}
		while (file_exists($path . $only_file_name)) {
			$only_file_name = $tmp_only_file_name . "-" . $counter_duplicate;
			$counter_duplicate++;
		}
		mkdir($path . $only_file_name);
		if ($extension === "zip") {
			try {
				$zip = zip_open($path . $archive_name);
				if ($zip) {
					while ($zip_read = zip_read($zip)) {
						$zip_entry_name = zip_entry_name($zip_read);
						if (zip_entry_open($zip, $zip_read)) {
							$file_in_archive =  zip_entry_read($zip_read, zip_entry_filesize($zip_read));
							$exploded = explode("/", substr($path . $only_file_name . "/" . zip_entry_name($zip_read), strlen($path . $only_file_name) + 1));
							for ($i = 0; $i < count($exploded) - 1; $i++) {
								if ($i === 0) {
									$path_after_onyl_file_name = $exploded[0];
								} else {
									$path_after_onyl_file_name = $path_after_onyl_file_name . "/" . $exploded[$i];
								}
								if (!file_exists($path . $only_file_name . "/" . $path_after_onyl_file_name)) {
									mkdir($path . $only_file_name . "/" . $path_after_onyl_file_name, 0777, true);
								}
							}
							file_put_contents($path . $only_file_name . "/" . zip_entry_name($zip_read), $file_in_archive);
						}
					}
					zip_close($zip);
				}
			} catch (Exception $e) {
				send_json($e->getMessage(), null);
				throw new Exception($e->getMessage());
			}
		} elseif ($extension === "rar") {
			if ($password === "") {
				$rar = RarArchive::open($path . $archive_name);
			} else {
				$rar = RarArchive::open($path . $archive_name, $password);
			}
			if ($rar->isBroken()) {
				send_json("Rar archive broken !!", null);
				throw new Exception("Rar archive broken !!");
			}
			$rar_file = rar_open($path . $archive_name);
			$list = rar_list($rar_file);
			foreach($list as $file) {
				$entry = rar_entry_get($rar_file, $file->getName());
				$entry->extract($path . $only_file_name);
			}
			rar_close($rar_file);
		} else {
			$archive = new PharData($path . $archive_name);
			try {
				$archive->extractTo($path . $only_file_name);
			} catch (Exception $e) {
				send_json($e->getMessage(), null);
				throw new Exception($e->getMessage());
			}
		}
		send_json(null, $only_file_name);
	}
}
function rename_file($old_name, $new_name, $path) {
	if (!empty($old_name) && !empty($new_name) && !empty($path)) {
		if (file_exists($path . $old_name)) {
			if (!file_exists($path . $new_name)) {
				try {
					$extension = "";
					if (is_file($path . $old_name)) {
						$extension = "." . pathinfo($path . $old_name, PATHINFO_EXTENSION);
						if ($extension === ".gz" || $extension === ".bz2") {
							$extension = ".tar" . $extension;
						}
					}
					rename($path . $old_name, $path . $new_name . $extension);
					send_json(null, $new_name . $extension);
				} catch (Exception $e) {
					send_json($e->getMessage(), null);
					throw new Exception($e->getMessage());
				}
			} else {
				send_json("File " . $new_name . " already exist !!", null);
				throw new Exception("File " . $new_name . " already exist !!");
			}
		} else {
			send_json("File not found !!", null);
			throw new Exception("File not found !!");
		}
	}
}
function copy_file($name, $from, $to) {
	if (!empty($name) && !empty($from) && !empty($to)) {
		if (file_exists($from . $name)) {
			if (!file_exists($to . $name)) {
				try {
					if (is_file($form . $name)) {
						copy($from . $name, $to . $name);
					} else {
						mkdir($to . $name);
						$list_folder = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($from . $name));
						foreach ($list_folder as $file) {
							if ($file->isDir()) {
								continue;
							}
							$exploded = explode("/", substr($file->getPathname(), strlen($from . $name)));
							$path_after_name = "";
							for ($i = 0; $i < count($exploded) - 1; $i++) {
								if (!empty($exploded[$i])) {
									$path_after_name = $path_after_name . "/" . $exploded[$i];
								}
								if ($i === count($exploded) - 2) {
									if (!file_exists($to . $name . $path_after_name)) {
										mkdir($to . $name . $path_after_name, 0777, true);
									}
									copy($from . $name . $path_after_name . "/" . $exploded[count($exploded) - 1], $to . $name . $path_after_name . "/" . $exploded[count($exploded) - 1]);
								}
							}
						}
					}
					send_json(null, $to . $name);
				} catch (Exception $e) {
					send_json($e->getMessage(), null);
					throw new Exception($e->getMessage());
				}
			} else {
				send_json("File " . $name . " already exist !!", null);
				throw new Exception("File " . $name . " already exist !!");
			}
		} else {
			send_json("File not found !!", null);
			throw new Exception("File not found !!");
		}
	}
}
function copy_multiple_file ($array_file, $array_folder, $folder_name, $from, $to) {
	if (!empty($folder_name) && !empty($from) && !empty($to)) {
		mkdir($to . $folder_name);
		if (!empty($array_file)) {
			foreach ($array_file as $file) {
				try {
					if (is_readable($from . $file)) {
						copy($from . $file, $to . $folder_name . "/" . $file);
					}
				} catch (Exception $e) {
					send_json($e->getMessage(), null);
					throw new Exception($e->getMessage());
				}
			}
		}
		if (!empty($array_folder)) {
			foreach ($array_folder as $folder) {
				mkdir($to . $folder_name . "/" . $folder);
				$list_folder = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($from . $folder));
				foreach ($list_folder as $file) {
					if ($file->isDir()) {
						continue;
					}
					$exploded = explode("/", substr($file->getPathname(), strlen($from . $folder)));
					$path_after_name = "";
					for ($i = 0; $i < count($exploded) - 1; $i++) {
						if (!empty($exploded[$i])) {
							$path_after_name = $path_after_name . "/" . $exploded[$i];
						}
						if ($i === count($exploded) - 2) {
							if (!file_exists($to . $folder_name . "/" . $folder . $path_after_name)) {
								mkdir($to . $folder_name . "/" . $folder . $path_after_name, 0777, true);
							}
							copy($from . $folder . $path_after_name . "/" . $exploded[count($exploded) - 1], $to . $folder_name . "/" . $folder . $path_after_name . "/" . $exploded[count($exploded) - 1]);
						}
					}
				}
			}
		}
		send_json(null, $to . $folder_name);
	}
}
function recursive_delete_folder($directory) {
	if (is_dir($directory)) {
		$objects = scandir($directory);
		foreach ($objects as $object) {
			if ($object !== "." && $object !== "..") {
				if (filetype($directory . "/" . $object) === "dir") {
					recursive_delete_folder($directory . "/" . $object);
				}
				else {
					unlink($directory . "/" . $object);
				}
			}
		}
		reset($objects);
		rmdir($directory . "/");
	}
}
function delete_file ($name, $from) {
	if (!empty($name) && !empty($from)) {
		if (file_exists($from . $name)) {
			if (is_file($from . $name)) {
				try {
					unlink($from . $name);
					send_json(null, null);
				} catch (Exception $e) {
					send_json($e->getMessage(), null);
					throw new Exception($e->getMessage());
				}
			} else {
				try {
					recursive_delete_folder($from . $name);
					send_json(null, null);
				} catch (Exception $e) {
					send_json($e->getMessage());
					throw new Exception($e->getMessage());
				}
			}
		} else {
			send_json("File not found !!", null);
			throw new Exception("File not found !!");
		}
	}
}
function get_content_file ($name, $path) {
	if (!empty($name) && !empty($path)) {
		if (file_exists($path . $name)) {
			if (is_file($path . $name)) {
				if (is_readable($path . $name)) {
					try {
						$file_content = file_get_contents($path . $name);
						send_json(null, array("file_content" => $file_content));
					} catch (Exception $e) {
						send_json($e->getMessage(), null);
						throw new Exception($e->getMessage());
						
					}
				} else {
					send_json($name . " can't be readed !!", null);
					throw new Exception($name . " can't be readed !!");
				}
			} else {
				send_json($name . " is not a file !!", null);
				throw new Exception($name . " is not a file !!");
			}
		} else {
			send_json("File not found !!", null);
			throw new Exception("File not found !!");
		}
	}
}
function put_content_file ($name, $path, $content) {
	if (!empty($name) && !empty($path)) {
		if (file_exists($path . $name)) {
			if (is_writable($path . $name)) {
				try {
					file_put_contents($path . $name, $content);
					send_json(null, null);
				} catch (Exception $e) {
					send_json($e->getMessage(), null);
					throw new Exception($e->getMessage());
				}
			} else {
				send_json($name . " can't be writable !!", null);
				throw new Exception($name . " can't be writable !!");
			}
		} else {
			send_json("File " . $name . " not found !!", null);
			throw new Exception("File " . $name . " not found !!");
		}
	}
}
switch ($_POST["action"]) {
	case 'file_get_content':
	get_content_file($_POST['name'], rtrim($_POST['from'], "/") . "/");
	break;
	case 'file_put_content':
	put_content_file($_POST['name'], rtrim($_POST['from'], "/") . "/", $_POST["file_content"]);
	break;
	case 'create_folder':
	create_folder($_POST["name"], rtrim($_POST["to"], '/') . '/');
	break;
	case 'copy':
	copy_file($_POST["file_name"], rtrim($_POST["from"], "/") . "/", rtrim($_POST['to'], "/") . "/");
	break;
	case 'multiple_copy':
	copy_multiple_file($_POST["file"], $_POST["folder"], $_POST["folder_name"], rtrim($_POST["from"], "/") . "/", rtrim($_POST['to'], "/") . "/");
	break;
	case 'rename':
	rename_file($_POST["old_name"], $_POST["new_name"], rtrim($_POST["to"], "/") . '/');
	break;
	case 'remove':
	delete_file($_POST["name"], rtrim($_POST["from"], "/") . "/");
	break;
	case 'create_archive':
	create_archive($_POST["archive_name"], rtrim($_POST["to"], '/') . '/', $_POST["extension"], $_POST["files"]);
	break;
	case 'extract_archive':
	extract_archive($_POST["archive_name"], rtrim($_POST["to"], '/') . '/', $_POST["archive_password"]);
	break;
	case 'properties':
	get_stat($_POST["name"], rtrim($_POST["to"], '/') . '/');
	break;
	default:
	break;
}