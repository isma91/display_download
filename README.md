# display_download
##Display a structured download directory
###For now, only for LAMP !!
  
Put the project where you want to display  

For now, you can display all folders and the majority of file (hide or not) and the posibility of :  
-listen directly the audio file (im' using the html5 ```<audio>``` element)

You can take some right to this project if you don't want to have problem :  
``` chmod 0744 -R /path/to/display_download ```  

You must change the display.prod.conf like this :  
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