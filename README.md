# display_download
##Display a structured download directory
###For now, only for LAMP !!
####You need to have PHP5.4+
  
Put the project where you want to display  

Plugins and libraries :  
---------------------
* [muicss](https://www.muicss.com/)
* [materialize](http://materializecss.com/)
* [google material icons](https://design.google.com/icons/)
* [jQuery](https://jquery.com/)
* [colorbox](http://www.jacklmoore.com/colorbox/)
* [contextMenu](http://swisnl.github.io/jQuery-contextMenu/)
* [PDFObject](http://pdfobject.com/)
* [CodeMirror](https://codemirror.net/)

Features :  
--------
* display all folders
* display the majority of file (hide or not)
* listen directly the audio file
* listen directly the video file
* display directly the picture file
* directly create a folder
* display directly the properties of a file
* directly zip, tar, tar.gz or tar.bz2 a file or a folder
* directly zip, tar, tar.gz or tar.bz2 multiple files and/or folders
* directly exract zip, tar, tar.gz, tar.bz2 or rar archive
* display directly a pdf
* directly rename a folder or a file
* directly copy a folder or a file in a specified directory
* directly copy multiple files and/or folders in a specified directory
* directly delete a folder or a file
* directly delete multiple files and/or folders
* (experimental) directly edit your code file  

------------------------------------------------------------  

If you want to use rar and zip feature, you must install rar and zip library :  
```
sudo pecl -v install rar
sudo pecl -v install zip
```

After that you must add in your php.ini :  
```
extension = rar.so
extension = zip.so
```

And restart apache2 with :  
```sudo service apache2 restart```

Make sure the data path is writeable to avoid some write problem. For example :  
```chmod -R 0777 /path/to/display_download ```  

Or  

```chown -R www-data:www-data /path/to/display_download ```

(Optional) You can change the display.prod.conf like this :  
```
DocumentRoot path/to/project/
<Directory path/to/project/>
```

After that you can put the .conf file in your apache directory and :  
```
sudo a2ensite display.prod.conf
sudo service apache2 reload
```
  
After that you can go to your favorite web navigator and write :


    http://www.display.prod/