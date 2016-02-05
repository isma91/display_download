<?php
/**
* Get_original_path.php
*
* Get the project path and the parent of the project path
*
* PHP 5.6.17-0+deb8u1 (cli) (built: Jan 13 2016 09:10:12)
*
* @category Controller
* @package  Controller
* @author   isma91 <ismaydogmus@gmail.com>
* @license  http://opensource.org/licenses/gpl-license.php GNU Public License
* @link     https://github.com/isma91/display_download/blob/master/controllers/get_original_path.php
*/
echo json_encode(array('original_path' => dirname(dirname(__DIR__)), 'project_path' => dirname(__DIR__)));