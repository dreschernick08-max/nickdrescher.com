"""Optional: regenerate static HTML after editing content.json. Python 3, no packages."""
import json
from html import escape as e
from pathlib import Path
ROOT = Path(__file__).resolve().parent
D = json.loads((ROOT / 'content.json').read_text(encoding='utf-8'))
ARROW = '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
NAV = [('Home', ''), ('Photo', 'photo'), ('Projects', 'projects'), ('BTS', 'bts'), ('Contact', 'contact')]

def page(key, title, body):
    prefix = '../' if key else './'
    def url(path): return prefix + path
    nav = ''.join(f'<a href="{url(slug + "/index.html" if slug else "index.html")}"'+(' aria-current="page"' if slug == key else '')+f'>{label}</a>' for label, slug in NAV)
    social_icons = {
        'instagram': '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="17.6" cy="6.5" r="1.15" fill="currentColor"/></svg>',
        'linkedin': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="1.5"/><circle cx="6.8" cy="7" r="1.5" fill="var(--paper)"/><path d="M5.5 10h2.6v8.5H5.5zM10 10h2.5v1.15c.55-.85 1.45-1.4 2.8-1.4 2.7 0 3.2 1.7 3.2 4v4.75h-2.6v-4.2c0-1.25-.02-2.5-1.6-2.5s-1.8 1.2-1.8 2.4v4.3H10z" fill="var(--paper)"/></svg>'
    }
    socials = ''.join(f'<a href="{e(link)}" target="_blank" rel="noopener noreferrer" aria-label="{e(name.capitalize() if name=="instagram" else "LinkedIn")}">{social_icons[name]}</a>' for name,link in D['social'].items())
    body = body.replace('@/', prefix).replace('↗', ARROW)
    html = f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} | Nick Drescher</title><meta name="description" content="Nick Drescher – Portfolio für Film, Fotografie, Motion Design und Content Creation.">
<meta name="theme-color" content="#f3f1e9"><meta property="og:title" content="{e(title)} | Nick Drescher"><meta property="og:description" content="Film, Fotografie und kreative Projekte von Nick Drescher.">
<link rel="icon" href="{url(D['logo'])}"><link rel="stylesheet" href="{url('assets/fonts.css')}"><link rel="stylesheet" href="{url('assets/site.css')}"><link rel="stylesheet" href="{url('assets/motion.css')}"><script src="{url('assets/orbit-layout.js')}" defer></script><script src="{url('assets/site.js')}" defer></script><script src="{url('assets/motion.js')}" defer></script></head>
<body data-page="{key or 'home'}"><a class="skip-link" href="#main">Zum Inhalt</a><div class="scroll-progress" aria-hidden="true"></div>
<header class="site-header"><a class="logo" href="{url('index.html')}" aria-label="Nick Drescher – Home"><img src="{url(D['logo'])}" alt="ND" width="44" height="44"></a>
<button class="menu-toggle" aria-controls="navigation" aria-expanded="false">Menü <span aria-hidden="true">☰</span></button><nav id="navigation" aria-label="Hauptnavigation">{nav}<div class="socials">{socials}</div></nav></header>
<main id="main">{body}</main>
<footer class="site-footer"><div class="footer-bottom"><span class="footer-name">© Nick Drescher</span><nav class="footer-links" aria-label="Rechtliches und Einstellungen"><a href="{url('impressum/index.html')}">Impressum</a><a href="{url('datenschutz/index.html')}">Datenschutz</a><button class="text-button" data-reset-video>Video-Einstellungen</button></nav></div></footer>
<dialog class="lightbox" aria-label="Bildansicht"><button class="lightbox-close" aria-label="Bildansicht schließen">×</button><button class="lightbox-prev" aria-label="Vorheriges Bild">‹</button><figure><div class="lightbox-image-frame"><img alt=""></div><figcaption aria-live="polite"></figcaption></figure><button class="lightbox-next" aria-label="Nächstes Bild">›</button></dialog>
<div class="toast" role="status"></div></body></html>'''
    folder = ROOT / key
    folder.mkdir(exist_ok=True)
    (folder / 'index.html').write_text(html, encoding='utf-8')

def img(path, alt, cls='', eager=False):
    w,h = D.get('image_sizes',{}).get(path,[1600,900])
    markup = f'<img src="@/{e(path)}" alt="{e(alt)}" class="{cls}" width="{w}" height="{h}" loading="{"eager" if eager else "lazy"}" decoding="async"'+(' fetchpriority="high"' if eager else '')+'>'
    if path == D['photo'][1]:
        return '<span class="flower-artwork">'+markup+'</span>'
    if path == D['portrait']:
        return '<span class="poster-artwork">'+markup+'</span>'
    return markup

def gallery(paths, group):
    return '<div class="gallery">'+''.join(f'<button '+('id="three-d" ' if group == 'Photo' and p == D['photo'][13] else '')+f'class="gallery-item reveal" data-gallery="{group}" aria-label="{group} – Bild {i} vergrößern">{img(p, f"{group} – Aufnahme {i}", eager=i<=2)}<span class="gallery-label">{group} / {i:02d} <span aria-hidden="true">↗</span></span></button>' for i,p in enumerate(paths,1))+'</div>'

# A centered transparent portrait with four separate, floating folder layers.
folder_data = [
 ('back-left','Videography','projects/index.html'),
 ('back-right','3D','photo/index.html#three-d'),
 ('front-left','Photography','photo/index.html'),
 ('front-right','Design','photo/index.html#design'),
]
folders = ''.join(f'<a class="desktop-folder folder-{position}" href="@/{link}" aria-label="{label} ansehen"><img src="@/assets/mac-folder.svg" alt="" width="300" height="236"><span>{label}</span></a>' for position,label,link in folder_data)
portrait_hero = f'''<section class="portrait-hero" aria-label="Nick Drescher Portfolio"><div class="portrait-hero-heading"><p class="eyebrow">Nick Drescher / Visual Creative</p><h1>Nick Drescher<br><em>Portfolio</em></h1></div><div class="portrait-scene">{folders}<img class="nick-cutout" src="@/assets/images/nick-color-cutout.png" alt="Nick Drescher, freigestelltes farbiges Porträt" width="1122" height="1402" fetchpriority="high" decoding="async"></div><a class="portrait-scroll" href="#about">Mehr über mich <span aria-hidden="true">↓</span></a></section>'''
about_intro = D['about'][0].replace('<p>', '<p>Hi, ich bin Nick Drescher, ', 1)
software_items = ''.join(f'<li class="software-item"><img src="@/{e(item["icon"])}" alt="" width="48" height="48" loading="eager" decoding="async"><span>{e(item["name"])}</span></li>' for item in D['software'])
software_strip = f'''<section class="software-section" aria-label="Programme, mit denen ich gearbeitet habe"><div class="software-controls"><span class="eyebrow">Tools &amp; Software</span><button class="software-pause" type="button" aria-pressed="false" aria-label="Logoanimation pausieren">Pause</button></div><div class="software-marquee"><div class="software-viewport"><div class="software-track"><ul class="software-group" aria-label="Programme">{software_items}</ul><ul class="software-group" aria-hidden="true">{software_items}</ul></div></div></div></section>'''
page('', 'Portfolio', f'''{portrait_hero}
<section id="about" class="about-section section-pad"><div class="about-top"><span class="eyebrow">03 / About Nick</span><p class="word-reveal">“Making bad art is better than making no art.”</p></div><div class="about-grid"><div class="about-copy reveal">{about_intro}<details class="about-more"><summary>Mehr über mich <span aria-hidden="true">+</span></summary>{''.join(D['about'][1:])}</details></div></div><div class="skill-line"><span>Film &amp; Schnitt</span><span>Motion Design</span><span>Fotografie</span><span>Content Creation</span></div></section>
{software_strip}
<section class="faq section-pad"><div class="section-heading reveal"><span class="eyebrow">Noch ein paar Details</span><h2>Gut zu <em>wissen.</em></h2></div><div class="faq-list reveal">{''.join('<details><summary>'+e(q['question'])+'</summary><div>'+q['answer']+'</div></details>' for q in D['faq'])}</div></section>
''')

def page_intro(number, title, italic, description):
    return f'<section class="page-intro section-pad"><span class="eyebrow">{number} / Nick Drescher</span><h1>{title} <em>{italic}</em></h1><p>{description}</p></section>'

poster_tile = f'<button id="design" class="gallery-item gallery-poster" data-gallery="Photo" aria-label="Filmplakat Das Spiel der Rente vergrößern"><span class="poster-letterbox">{img(D["portrait"],"Filmplakat: Das Spiel der Rente")}</span><span class="gallery-label">Das Spiel der Rente <span aria-hidden="true">↗</span></span></button>'
photo_gallery = gallery(D['photo'],'Photo')
page('photo', 'Photo', photo_gallery[:-6] + poster_tile + '</div>')

projects = '<div class="projects-grid">'
for i,item in enumerate(D['projects'],1):
    projects += f'''<article id="project-{i}" class="project reveal"><div class="video-shell" data-video="{item['id']}">{img(item['image'],item['title'],eager=i<3)}<div class="video-overlay"><button class="video-play" aria-label="{e(item['title'])}: YouTube-Video laden"><span class="play-icon" aria-hidden="true"></span><span>Video ansehen</span></button><p>Mit Klick wird eine Verbindung zu YouTube hergestellt.</p><a href="https://www.youtube.com/watch?v={item['id']}" target="_blank" rel="noopener noreferrer">Auf YouTube öffnen ↗</a></div></div><h2>{e(item['title'])}</h2>{'<p class="award">'+e(item['note'])+'</p>' if item['note'] else ''}</article>'''
page('projects','Projects',projects+'</div>')
page('bts','BTS',gallery(D['bts'],'BTS'))
phone = D['contact']['phone']
email = D['contact'].get('email','')
email_link = f'<a class="button primary" href="mailto:{e(email)}">E-Mail schreiben</a>' if email else ''
page('contact','Contact',f'''<section class="contact section-pad"><span class="eyebrow">Contact / Nick Drescher</span><h1>Gute Ideen<br>beginnen mit<br><em>einem Hallo.</em></h1><div class="contact-content"><p>Ein Projekt, eine Frage oder einfach Lust auf Austausch?</p><div class="contact-links">{email_link}<a class="button" href="{D['social']['instagram']}" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a class="button" href="{D['social']['linkedin']}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div><a class="phone" href="tel:{phone.replace(' ','')}">{phone}</a></div></section>''')
page('impressum','Impressum',f'''<section class="legal section-pad"><h1>Impressum</h1><p>Nick Drescher<br>14552 Michendorf<br><a href="tel:{phone.replace(' ','')}">{phone}</a></p></section>''')
page('datenschutz','Datenschutz','''<section class="legal section-pad"><h1>Datenschutzhinweise</h1><h2>Verantwortlicher</h2><p>Nick Drescher. Kontaktdaten stehen im <a href="@/impressum/index.html">Impressum</a>.</p><h2>Bereitstellung der Website</h2><p>Diese Website ist für GitHub Pages vorbereitet. Beim Abruf erhält der eingesetzte Hostinganbieter technische Verbindungsdaten wie IP-Adresse, angeforderte Datei und Zeitpunkt. Informationen zur Verarbeitung durch GitHub finden sich in der <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub-Datenschutzerklärung</a>.</p><h2>Bilder und Schriften</h2><p>Bilder und Schriften werden mit den Dateien dieser Website bereitgestellt. Es werden keine externen Schriftendienste und keine Analysewerkzeuge eingebunden.</p><h2>YouTube</h2><p>Die Videovorschaubilder liegen lokal. Erst wenn Sie „Video ansehen“ anklicken, wird der YouTube-Player von youtube-nocookie.com geladen. Dabei erhält der Anbieter technische Verbindungsdaten. Die Freigabe gilt nur für das angeklickte Video. Über „Video-Einstellungen“ im Footer können alle geladenen Player wieder entfernt werden.</p><h2>Kontakt und externe Links</h2><p>Externe Profile und Videos werden erst beim Öffnen des jeweiligen Links aufgerufen. Für die Datenverarbeitung dort gelten die Hinweise des jeweiligen Anbieters. Bei einer Kontaktaufnahme werden die übermittelten Angaben zur Bearbeitung der Anfrage verwendet.</p></section>''')

images = sorted(str(p.relative_to(ROOT)) for p in (ROOT/'assets/images').glob('*') if p.is_file())
(ROOT/'assets/image-list.js').write_text('window.PORTFOLIO_IMAGES = '+json.dumps(images)+';',encoding='utf-8')
print('Generated 7 pages and editor image inventory')
