"""Test de bout en bout : python3 tests/e2e.py  (nécessite playwright + chromium)."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', root], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(cond, label):
    print(('ok   ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 780}, device_scale_factor=2, has_touch=True)
        pg = ctx.new_page()
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto('http://localhost:8765/index.html')
        os.makedirs(root + '/replica/clone-screens', exist_ok=True)
        shot = lambda n: pg.screenshot(path=f'{root}/replica/clone-screens/{n}.png')
        check(pg.locator('h1', has_text='MainDeDieu').count() == 1, 'S01 accueil affiché')
        shot('S01-accueil')

        # Genèse
        pg.click('[data-mode=classique]')
        check(pg.locator('.tile').count() == 4, 'S02 : 4 éléments de départ')
        shot('S02-atelier-vide')
        pg.click('.tile[data-id=feu]'); pg.click('.tile[data-id=eau]')
        pg.wait_for_timeout(700)
        check(pg.locator('.tile[data-id=vapeur]').count() == 1, 'feu + eau crée la vapeur')
        check('Nouveau' in pg.inner_text('.msg'), 'message de nouveauté')
        shot('S02-atelier-nouveau')
        pg.click('.tile[data-id=air]'); pg.click('.tile[data-id=eau]')
        pg.wait_for_timeout(500)
        check('Rien' in pg.inner_text('.msg'), 'combinaison ratée : message')
        pg.wait_for_timeout(500)
        pg.click('.tile[data-id=air]'); pg.click('.tile[data-id=air]'); pg.wait_for_timeout(700)
        check(pg.locator('.tile[data-id=vent]').count() == 1, 'air + air crée le vent')
        pg.click('.tile[data-id=feu]'); pg.click('.tile[data-id=eau]'); pg.wait_for_timeout(700)
        check('Déjà' in pg.inner_text('.msg'), 'combinaison déjà connue')
        pg.click('[data-act=hint]')
        check(pg.locator('.slot.full').count() == 1, 'indice : un élément est placé')
        pg.click('.slot.full')
        check(pg.locator('.slot.full').count() == 0, 'toucher un emplacement le vide')

        # Livre
        pg.click('.tabbar [data-to=livre]')
        check(pg.locator('details.el').count() == 122, 'livre : 122 éléments listés')
        shot('S04-livre')

        # Persistance
        pg.reload()
        pg.click('[data-mode=classique]')
        check(pg.locator('.tile[data-id=vapeur]').count() == 1, 'sauvegarde conservée après rechargement')

        # Planète
        pg.click('.tabbar [data-to=home]')
        pg.click('[data-mode=planete]')
        check(pg.locator('#scene svg').count() == 1, 'S06 : scène Planète affichée')
        check(pg.locator('.tile').count() == 4, 'progression Planète séparée de Genèse')
        for a, c in [('terre', 'eau'), ('terre', 'terre'), ('feu', 'terre'), ('eau', 'eau')]:
            pg.click(f'.tile[data-id={a}]'); pg.click(f'.tile[data-id={c}]'); pg.wait_for_timeout(600)
        shot('S06-planete-ronde')
        pg.click('[data-act=view]')
        check('Ton monde' in pg.get_attribute('#scene svg', 'aria-label'), 'bascule vers la vue paysage')
        shot('S06-planete-paysage')

        # Réglages / réinitialisation
        pg.click('.tabbar [data-to=reglages]')
        pg.click('[data-act=reset][data-mode=planete]')
        check(pg.locator('.modal').count() == 1, 'confirmation avant réinitialisation')
        shot('S07-reglages-modale')
        pg.click('[data-act=doreset]')
        pg.click('.tabbar [data-to=atelier]')
        check(pg.locator('.tile').count() == 4, 'réinitialisation : retour à 4 éléments')

        # iPad
        pg.set_viewport_size({'width': 834, 'height': 1194})
        pg.click('.tabbar [data-to=home]'); pg.click('[data-mode=planete]'); shot('S06-ipad')
        b.close()
finally:
    srv.terminate()

real = [e for e in errors if 'favicon' not in e]
check(not real, 'aucune erreur console' + (': ' + '; '.join(real) if real else ''))
print('\n%d échec(s)' % len(fails)); sys.exit(1 if fails else 0)
