# JRU Frontend Project 3.3
### Task: Need to make a UI for the CRUD backend using HTML, CSS, JS, jQuery. Implement an admin panel for managing online game accounts.

1. Forked from https://github.com/demologin/project-front
2. Downloaded project.
3. Downloaded/installed Tomcat 9.
4. Added a table in (**my.html**) with columns:

| #   | Name | Title | Race | Profession | Level | Birthday | Banned |
| --- | ---- | ----- | ---- | ---------- | ----- | -------- | ------ |

5. Added a function with a GET request to the URL `"/rest/players"` to get a list of players.
6. Result has been added to the table.
7. Added paging:
    - Section with paging buttons has been added below the table.
    - Added a function that sends a GET request that will return the total number of accounts. URL: `"/rest/players/count"`.
    - Added a drop-down list of 3-4 numeric values, how many accounts to show at a time.
    - Added pages number calculation.
8. Added the parameters **"pageNumber"** and **"pageSize"** to the function for showing the list of accounts.
9. Highlighted current page number.
10. Added 2 more columns to the table: **Edit** and **Delete**. Icons have been added for each row.
11. Added a function that will be responsible for deleting an account. Used a DELETE request to the URL `"/rest/players/{id}"`.
12. Added a function responsible for editing an account. When clicked, hide the **Delete** button, the **Edit** button image is replaced with “Save” image, next fields are made editable:

| ~~#~~ | ***Name*** | ***Title*** | ***Race*** | ***Profession*** | ~~Level~~ | ~~Birthday~~ | ***Banned*** |
| ----- |------------| ----------- | ---------- | ---------------- | --------- | ------------ | ------------ |

13. Added sending changes by clicking on the **Save** button using a POST request to the URL `“/rest/players/{id}”`, the values ​​of all five fields are transferred as the request body, in the JSON format.
14. Added a horizontal line and a form for creating a new player after the paging buttons with input fields:
    - Name – text, 1 to 12 chars.
    - Title – text, 1 to 30 chars.
    - Race – dropdown list.
    - Profession – dropdown list.
    - Level – number from 0 to 100.
    - Birthday – date.
    - Banned – Boolean.
15. Added button to send data using a POST request to the URL `"/rest/players"`.
16. Added styles.