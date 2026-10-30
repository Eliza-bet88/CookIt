# CookIt

Figma:
https://www.figma.com/design/UYtQmr78U0pDz9rV7upoX2/CookIt?node-id=7-70&t=x4qy5q7NYJRNgDDS-1

## Vietne ar receptēm, kas piedāvā ēdienus, balstoties uz lietotājam pieejamajiem produktiem.

- Lietotājs pievieno savus produktus kas viņam šobrīd ir ledusskapī

- Vietne caur **TheMealDB** API atrod reālas receptes, salīdzina sastāvdaļas ar lietotāja produktiem, aprēķina **atbilstības procentu** un kārto ēdienus no vispiemērotākajiem.

- Parāda, kādu sastāvdaļu pietrūkst.

## Galvenās sadaļas

- **Login / Registration**

- **Home (Dashboard)**

- **My Fridge**

- **Recipes**

- **Recipe Details**

- **Favorites**

- **Profile**

## Tehnoloģijas:

- **Frontend:** React + Vite + JSX + CSS

- **Receptes:** TheMealDB (publiskais API)

- **Backend:** Python + FastAPI + SQLAlchemy

- **Database:** PostgreSQL

## Automatizācija:

Caur **n8n** lietotājs saņem paziņojumus par izmaiņām kontā (produktu pievienošana, izlase u.c.) un admin ziņu par jauna lietotāja reģistrāciju.
