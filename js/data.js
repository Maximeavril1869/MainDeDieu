/* MainDeDieu - données du jeu (contenu 100 % original).
   Format éléments : id|Nom|emoji|groupe|zone (zone : s = ciel, g = sol, w = mer, vide = pas dans la planète)
   Format recettes : a+b=résultat[,résultat2] (commutatif) */
(function (root) {
  const GROUPS = [
    { id: 'prim', name: 'Primordiaux', icon: '✨' },
    { id: 'mat', name: 'Matière', icon: '🪨' },
    { id: 'ciel', name: 'Ciel et météo', icon: '☁️' },
    { id: 'geo', name: 'Terres et eaux', icon: '⛰️' },
    { id: 'vie', name: 'Vie', icon: '🧬' },
    { id: 'plantes', name: 'Plantes', icon: '🌳' },
    { id: 'animaux', name: 'Animaux', icon: '🐾' },
    { id: 'humains', name: 'Humains', icon: '🧑' },
    { id: 'outils', name: 'Outils et savoirs', icon: '🔨' },
    { id: 'cites', name: 'Cités', icon: '🏘️' },
    { id: 'tech', name: 'Technique', icon: '⚙️' },
    { id: 'feerie', name: 'Féerie', icon: '🧚' }
  ];

  const ELEMENTS_TXT = `
feu|Feu|🔥|prim
eau|Eau|💧|prim
terre|Terre|🌍|prim
air|Air|💨|prim
lave|Lave|🟠|mat
poussiere|Poussière|🌫️|mat
vapeur|Vapeur|♨️|mat
boue|Boue|🟤|mat
pierre|Pierre|🪨|mat
sable|Sable|⏳|mat
verre|Verre|🪟|mat
metal|Métal|⛓️|mat
cendre|Cendre|🌑|mat
sel|Sel|🧂|mat
piece|Pièce|🪙|mat
papier|Papier|📄|mat
energie|Énergie|⚡|ciel
nuage|Nuage|☁️|ciel|s
pluie|Pluie|🌧️|ciel
froid|Froid|🥶|ciel
glace|Glace|🧊|ciel
neige|Neige|❄️|ciel
orage|Orage|⛈️|ciel|s
foudre|Foudre|🌩️|ciel
vent|Vent|🍃|ciel
arcenciel|Arc-en-ciel|🌈|ciel|s
ciel|Ciel|🌤️|ciel
soleil|Soleil|☀️|ciel|s
lune|Lune|🌙|ciel|s
etoile|Étoile|⭐|ciel|s
nuit|Nuit|🌌|ciel
lumiere|Lumière|🔆|ciel
mer|Mer|🌊|geo
ocean|Océan|🌏|geo
ile|Île|🏝️|geo|g
montagne|Montagne|⛰️|geo|g
volcan|Volcan|🌋|geo|g
desert|Désert|🏜️|geo|g
riviere|Rivière|🏞️|geo
lac|Lac|🛶|geo
tempete|Tempête|🌪️|geo|s
vie|Vie|🧬|vie
microbe|Microbe|🦠|vie
algue|Algue|🪸|vie
oeuf|Œuf|🥚|vie
graine|Graine|🌰|plantes
plante|Plante|🌱|plantes
arbre|Arbre|🌳|plantes|g
fleur|Fleur|🌸|plantes|g
foret|Forêt|🌲|plantes|g
herbe|Herbe|🌿|plantes
fruit|Fruit|🍎|plantes
champignon|Champignon|🍄|plantes|g
ble|Blé|🌾|plantes|g
jungle|Jungle|🌴|plantes|g
cactus|Cactus|🌵|plantes|g
poisson|Poisson|🐟|animaux|w
grenouille|Grenouille|🐸|animaux|g
oiseau|Oiseau|🐦|animaux|s
lezard|Lézard|🦎|animaux|g
dinosaure|Dinosaure|🦖|animaux|g
dragon|Dragon|🐉|animaux|s
insecte|Insecte|🐛|animaux
abeille|Abeille|🐝|animaux|s
miel|Miel|🍯|animaux
mammifere|Mammifère|🐾|animaux
loup|Loup|🐺|animaux|g
vache|Vache|🐄|animaux|g
cheval|Cheval|🐎|animaux|g
baleine|Baleine|🐋|animaux|w
singe|Singe|🐒|animaux|g
poule|Poule|🐔|animaux|g
aigle|Aigle|🦅|animaux|s
humain|Humain|🧑|humains|g
famille|Famille|👪|humains|g
paysan|Paysan|🧑‍🌾|humains|g
pecheur|Pêcheur|🎣|humains
mage|Mage|🧙|humains|g
chevalier|Chevalier|⚔️|humains|g
roi|Roi|🤴|humains|g
bois|Bois|🪵|outils
outil|Outil|🔨|outils
epee|Épée|🗡️|outils
couronne|Couronne|👑|outils
roue|Roue|🛞|outils
charrette|Charrette|🛻|outils|g
engrenage|Engrenage|⚙️|outils
flute|Flûte|🪈|outils
feucamp|Feu de camp|🏕️|outils|g
farine|Farine|🥣|outils
pain|Pain|🍞|outils
lait|Lait|🥛|outils
remede|Remède|🧪|outils
livre|Livre|📖|outils
musique|Musique|🎵|outils
cabane|Cabane|🛖|cites|g
maison|Maison|🏠|cites|g
village|Village|🏘️|cites|g
ville|Ville|🏙️|cites|g
chateau|Château|🏰|cites|g
pont|Pont|🌉|cites|g
route|Route|🛣️|cites
port|Port|⚓|cites|w
bateau|Bateau|⛵|cites|w
marche|Marché|🏪|cites|g
ecole|École|🏫|cites|g
usine|Usine|🏭|cites|g
electricite|Électricité|🔋|tech
ampoule|Ampoule|💡|tech
puce|Puce|🔲|tech
ordinateur|Ordinateur|💻|tech
internet|Réseau|🌐|tech
train|Train|🚂|tech|g
avion|Avion|✈️|tech|s
fusee|Fusée|🚀|tech|s
voiture|Voiture|🚗|tech|g
telescope|Télescope|🔭|tech
horloge|Horloge|🕰️|tech
fee|Fée|🧚|feerie|s
licorne|Licorne|🦄|feerie|g
fantome|Fantôme|👻|feerie|s
golem|Golem|🗿|feerie|g
`;

  const RECIPES_TXT = `
feu+eau=vapeur
terre+eau=boue
terre+air=poussiere
feu+air=energie
feu+terre=lave
lave+eau=pierre
pierre+air=sable
sable+feu=verre
pierre+feu=metal
feu+poussiere=cendre
sable+vapeur=sel
metal+metal=piece
bois+eau=papier
vapeur+air=nuage
nuage+eau=pluie
air+pluie=froid
eau+froid=glace
glace+nuage=neige
nuage+energie=orage
orage+air=foudre
air+air=vent
pluie+lumiere=arcenciel
nuage+nuage=ciel
ciel+feu=soleil
ciel+pierre=lune
ciel+energie=etoile
lune+ciel=nuit
feu+verre=lumiere
eau+eau=mer
mer+mer=ocean
mer+terre=ile
terre+terre=montagne
lave+montagne=volcan,cendre
sable+sable=desert
eau+montagne=riviere
riviere+boue=lac
orage+mer=tempete
boue+energie=vie
vie+eau=microbe
microbe+lumiere=algue
vie+pierre=oeuf
vie+terre=graine
graine+eau=plante
plante+soleil=arbre
plante+pluie=fleur
arbre+arbre=foret
plante+vent=herbe
arbre+fleur=fruit
boue+plante=champignon
herbe+graine=ble
foret+vapeur=jungle
desert+plante=cactus
mer+vie=poisson
lac+vie=grenouille
oeuf+ciel=oiseau
oeuf+terre=lezard
lezard+lave=dinosaure
dinosaure+feu=dragon
vie+herbe=insecte
insecte+fleur=abeille
abeille+arbre=miel
lezard+froid=mammifere
mammifere+foret=loup
mammifere+herbe=vache
mammifere+vent=cheval
poisson+ocean=baleine
mammifere+arbre=singe
oiseau+ble=poule
oiseau+montagne=aigle
arbre+pierre=bois
bois+pierre=outil
singe+outil=humain
humain+humain=famille
humain+ble=paysan
humain+poisson=pecheur
humain+energie=mage
metal+outil=epee
humain+epee=chevalier
metal+soleil=couronne
humain+couronne=roi
bois+bois=roue
roue+cheval=charrette
metal+roue=engrenage
bois+air=flute
bois+feu=feucamp
ble+outil=farine
farine+feu=pain
vache+humain=lait
champignon+humain=remede
papier+papier=livre
flute+humain=musique
bois+famille=cabane
cabane+pierre=maison
maison+maison=village
village+village=ville
roi+pierre=chateau
riviere+bois=pont
pierre+village=route
village+mer=port
bois+mer=bateau
village+piece=marche
livre+village=ecole
ville+engrenage=usine
foudre+metal=electricite
verre+electricite=ampoule
sable+electricite=puce
puce+verre=ordinateur
ordinateur+ordinateur=internet
engrenage+vapeur=train
metal+oiseau=avion
avion+etoile=fusee
charrette+engrenage=voiture
verre+etoile=telescope
engrenage+lune=horloge
fleur+energie=fee
cheval+arcenciel=licorne
humain+nuit=fantome
pierre+mage=golem
`;

  // Petites phrases affichées à chaque nouvelle création (originales).
  const MESSAGES = [
    'Un monde ne se fait pas en un jour, mais un clic y suffit.',
    'Ce qui se mélange se transforme.',
    'La curiosité est la première des forces.',
    'Chaque essai ouvre une porte.',
    'Rien ne se perd, tout se combine.',
    'Même un dieu commence par essayer.',
    'Le hasard aime les patients.',
    'Un détail de plus, et le monde change.',
    'On crée plus vite quand on s’amuse.',
    'Deux éléments, une idée.',
    'La nature a toujours une longueur d’avance.',
    'Tu avances, la planète aussi.',
    'Une trouvaille en appelle une autre.',
    'Le plus beau est souvent au détour d’une erreur.',
    'Observe, mélange, recommence.',
    'Les grands mondes naissent de petites étincelles.'
  ];

  const START = ['feu', 'eau', 'terre', 'air'];

  function parseElements() {
    return ELEMENTS_TXT.trim().split('\n').map(function (l) {
      const p = l.split('|');
      return { id: p[0], name: p[1], emoji: p[2], group: p[3], zone: p[4] || '' };
    });
  }
  function parseRecipes() {
    return RECIPES_TXT.trim().split('\n').map(function (l) {
      const m = l.split('=');
      const ab = m[0].split('+');
      return { a: ab[0], b: ab[1], out: m[1].split(',') };
    });
  }

  const DATA = { GROUPS: GROUPS, START: START, MESSAGES: MESSAGES, elements: parseElements(), recipes: parseRecipes() };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.MDD_DATA = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
