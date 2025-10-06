# Anking-Prettify-Note-Type
Custom Anking note html + css
I was looking to improve my anking cards look and feel, so I created this note type that combines the official Anking with the functions it has with the prettify anki style cards. I would like to preface I had the help of google gemini to help with combining and adding the effects. There are three styles at the moment material, neumorphic-fluent, and glassmorphism. 
If you would like you should be able to go through and change some of the css values and get different effects and colors. To change between the style you will have to change this line
<div class="prettify-flashcard theme-glassmorphism"> and edit the "theme-glassmorphism" to what ever you would like it is material = "theme", neumorphic is "theme-neumorphic-fluent" and glassmorphism = "theme-glassmorphism" there is also a font family you will need called rubik. Check out pranav link to see how to install it. https://github.com/pranavdeshai/anki-prettify. 
There are still some bugs but it should be usable. Huge shoutout to Pranav and Anking for making this code to begin with.
If you do notice some changes with your cards after an anking sync check out there anking note type addon which should stop it from updating.

## Syncing your local changes with GitHub

This repository currently only contains the local files that ship with the note type. To make sure your latest edits show up on GitHub as well:

1. Create a remote repository on GitHub (or use the one that already exists).
2. Add that repository as a remote from your local clone:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   ```
3. Push your committed changes:
   ```bash
   git push -u origin <branch-name>
   ```

After the first push you can continue updating GitHub with `git push` whenever you commit new changes locally.

Dark Mode
![image](https://github.com/user-attachments/assets/a200991a-872c-49d8-9a8c-7bb0d0d85244)
![image](https://github.com/user-attachments/assets/172d66a4-d857-474f-8cd9-73af267f005c)

Light Mode
![image](https://github.com/user-attachments/assets/64cf4a69-4fea-4ddb-807a-71caaf8ad88a)
![image](https://github.com/user-attachments/assets/ccbcd24c-f7ba-4ca0-946c-392188e46d35)
