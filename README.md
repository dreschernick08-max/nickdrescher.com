# Nick Drescher – Portfolio

Fertige statische Website mit lokalen Bildern, Schriften, CSS und JavaScript. Kein Build und keine Installation nötig. Zum Ansehen die ZIP entpacken und index.html öffnen.

## GitHub Pages: Schritt für Schritt

1. Auf github.com anmelden. Über + → New repository ein öffentliches Repository namens portfolio erstellen. Add README einschalten und Create repository klicken.
2. ZIP lokal entpacken. Den Inhalt hochladen, nicht die ZIP und nicht den darüberliegenden Ordner. index.html muss direkt im Repository liegen.
3. Im Repository Add file → Upload files wählen. Zuerst den gesamten Ordner assets hineinziehen und Commit changes klicken. Danach die übrigen Dateien und Ordner in einem zweiten Upload hochladen und wieder committen. GitHub erlaubt im Browser bis zu 100 Dateien pro Upload; die Ordnerstruktur beibehalten.
4. Wichtige Dateien: index.html, assets/, photo/, projects/, bts/, contact/, impressum/, datenschutz/. editor.html ist nur ein lokales Hilfsmittel und muss nicht veröffentlicht werden. .nojekyll ist enthalten; falls dein Dateimanager versteckte Dateien ausblendet, kannst du sie über Add file → Create new file mit dem Namen .nojekyll anlegen.
5. Settings → Pages → Build and deployment → Source: Deploy from a branch. Branch main und Ordner /(root) wählen, Save klicken.
6. Bis zu zehn Minuten warten. Unter Pages erscheint Visit site. Ohne eigene Domain lautet die Adresse gewöhnlich https://DEIN-NUTZERNAME.github.io/portfolio/.

Alternative: GitHub Desktop verwenden, Repository klonen, alle entpackten Dateien in den geklonten Ordner kopieren, Commit to main und Push origin klicken. Dann ebenfalls Pages wie oben einschalten.

## Eigene Domain

Die Domain muss dir gehören. Die kostenlose Jimdo-Adresse nick-grafik-portfolio.jimdosite.com ist eine Jimdo-Subdomain und lässt sich nicht als eigene Domain zu GitHub mitnehmen.

1. Zuerst die Website auf ihrer GitHub-Adresse prüfen.
2. Unter Settings → Pages → Custom domain deine Domain ohne https:// eintragen und speichern.
3. Beim Domainanbieter die DNS-Einträge setzen. Für die Hauptdomain (Name @): vier A-Einträge mit den Zielen 185.199.108.153, 185.199.109.153, 185.199.110.153 und 185.199.111.153. Für www: einen CNAME auf DEIN-NUTZERNAME.github.io setzen, ohne /portfolio/.
4. Nach erfolgreicher DNS-Prüfung Enforce HTTPS aktivieren. Die DNS-Umstellung kann bis zu 24 Stunden dauern. Die von GitHub angelegte CNAME-Datei bei späteren Updates behalten.

GitHub Pages kauft oder registriert keine Domain. Die bisherige Jimdo-Seite wird nicht automatisch geändert.

Offizielle Anleitung: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
Domain-Anleitung: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Spätere Änderungen

- Geänderte HTML-, CSS-, JavaScript- oder Bilddateien erneut hochladen und committen; GitHub Pages veröffentlicht sie automatisch.
- editor.html lokal öffnen, Bilder per Drag-and-drop ersetzen und Änderungen herunterladen. Die exportierten Bilddateien im Website-Ordner und anschließend im Repository ersetzen. Die Editor-Vorschau allein veröffentlicht nichts.
- Texte direkt in den fertigen HTML-Dateien ändern. Alternativ content.json bearbeiten und lokal python3 build.py ausführen. Der Generator überschreibt die HTML-Dateien; nur einen der beiden Wege verwenden.

## Aktuelle Gestaltung

Schwarzer Startbildschirm, farbig freigestelltes Porträt mit weichem Lichtschein, schwebende Ordner, kurze N/D-Logoanimation beim Erstbesuch oder Neuladen, Glas-Header, About-Text und Software-Laufband. Gerade Foto- und BTS-Galerien ohne Medien-Einblendanimationen. Das Filmplakat ist als Querformatkachel mit schwarzen Seitenflächen in die Fotogalerie integriert; der Thumbnailbereich ist entfernt. Kompakter Footer.

YouTube wird erst nach Klick auf Video ansehen geladen. Video-Einstellungen entfernt geladene Player wieder. Kontakt führt zu den hinterlegten Profilen und zum Telefon; es gibt kein serverseitiges Kontaktformular. Vor Veröffentlichung Impressum und Kontaktdaten auf Vollständigkeit prüfen.
