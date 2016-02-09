# display_download
##Display a structured download directory
###For now, only for LAMP !!
  
Put the project where you want to display  

Here are the plugins and libraries that i use :  
* [muicss](https://www.muicss.com/)
* [materialize](http://materializecss.com/)
* [google material icons](https://design.google.com/icons/)
* [jQuery](https://jquery.com/)
* [colorbox](http://www.jacklmoore.com/colorbox/)
* [contextMenu](http://swisnl.github.io/jQuery-contextMenu/)

For now, you can :  
* display all folders
* display the majority of file (hide or not)
* listen directly the audio file
* listen directly the video file
* display directly the picture file
* directly create a folder
* display directly the properties of a file  

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