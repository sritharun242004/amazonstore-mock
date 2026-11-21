/* French interface, using the wording Amazon.fr uses. When the visitor picks
   "français - FR", visible interface text is swapped as it appears on screen
   (menus, buttons, basket, checkout, account). Aesop's product stories stay in
   English for the class pitch. Going back to English reloads the page. */
(() => {
  const S = window.STORE;

  const FR = {
    // Amazon header and menus
    'Deliver to': 'Livrer à', 'Hello, guest': 'Bonjour', 'Account & Lists': 'Compte et listes', 'Returns': 'Retours',
    '& Orders': 'et commandes', 'Basket': 'Panier', 'All': 'Toutes', "Today's Deals": 'Ventes Flash', 'Beauty': 'Beauté',
    'Luxury Beauty': 'Beauté de luxe', 'Gift Ideas': 'Idées cadeaux', 'Best Sellers': 'Meilleures ventes',
    'Customer Service': 'Service client', 'Christmas gifts, delivered tomorrow with Prime': 'Cadeaux de Noël, livrés demain avec Prime',
    'Search Amazon.fr': 'Rechercher Amazon.fr', 'Hello, guest ': 'Bonjour ',
    'Aesop store': 'Boutique Aesop', 'Store home': 'Accueil de la boutique', 'Trending': 'Tendances', 'Help & settings': 'Aide et paramètres',
    'Your Account': 'Votre compte', 'Your Orders': 'Vos commandes', 'Your Lists': 'Vos listes', 'Your Basket': 'Votre panier',
    'Your Subscribe & refill': 'Vos abonnements et recharges', 'Your browsing history': 'Votre historique de navigation',
    'Your Addresses': 'Vos adresses', 'Your reviews': 'Vos commentaires', 'Browsing history': 'Historique de navigation',
    'Discover best sellers': 'Découvrir les meilleures ventes', 'Wish List': "Liste d'envies", 'Subscribe & refill': 'Abonnement et recharge',
    'Change language': 'Changer de langue', 'Change currency': 'Changer de devise', 'See all': 'Tout afficher',
    'You are shopping on Amazon.fr': 'Vous achetez sur Amazon.fr', 'Change country/region': 'Changer de pays/région',
    'Choose your location': 'Choisissez votre adresse', 'Apply': 'Appliquer', 'Enter a French postcode': 'Saisissez un code postal français',
    'or enter a French postcode': 'ou saisissez un code postal français', 'Manage address book': "Gérer le carnet d'adresses",
    'Add an address or pick-up point': 'Ajouter une adresse ou un point de retrait', 'Default address': 'Adresse par défaut',
    'Delivery options and delivery speeds may vary for different locations.': 'Les options et délais de livraison peuvent varier selon votre adresse.',
    // store navigation
    'Follow': 'Suivre', 'Following': 'Abonné', 'Gift Guide': 'Guide des cadeaux', 'Hand & Body': 'Mains et corps',
    'Fragrance': 'Parfums', 'For the home': 'Maison', 'Find your ritual': 'Trouvez votre rituel', 'Our values': 'Nos valeurs',
    'Search all Aesop': 'Rechercher dans Aesop', 'All hand & body': 'Tous les soins mains et corps', 'Hands': 'Mains', 'Body': 'Corps',
    'Light aroma': 'Arôme léger', 'Refills & subscribe': 'Recharges et abonnement', 'All eaux de parfum': 'Toutes les eaux de parfum',
    'Order within': 'Commandez dans les', 'FREE delivery': 'Livraison GRATUITE', 'Hand Care': 'Soins des mains', 'Bath & Body': 'Bain et corps',
    'Home Fragrance': 'Parfums d’intérieur', 'Gift Sets': 'Coffrets cadeaux', 'Share': 'Partager', 'Share this page with your team.': 'Partagez cette page avec votre équipe.',
    // product cards and product page
    'Add to basket': 'Ajouter au panier', 'Buy Now': 'Acheter maintenant', 'Add to List': 'Ajouter à la liste',
    "Added to Wish List": "Ajouté à votre liste d'envies", 'In stock': 'En stock', 'Sold by Amazon': 'Vendu par Amazon',
    'aesop.fr price': 'prix aesop.fr', 'Quantity': 'Quantité', 'Ships from': 'Expédié par', 'Sold by': 'Vendu par',
    'Returnable within 30 days': 'Retournable sous 30 jours', 'Packaging': 'Emballage', 'Ships in plain outer box': 'Expédié dans un carton neutre',
    'Add gift options': 'Ajouter des options cadeau', 'About this item': 'À propos de cet article', 'Brand': 'Marque', 'Size': 'Taille',
    'Aroma': 'Arôme', 'Made in': 'Fabriqué en', 'Australia': 'Australie', 'Visit the Aesop Store': 'Visiter la boutique Aesop',
    'Official Aesop store': 'Boutique officielle Aesop', 'Same price as aesop.fr. All prices include VAT.': 'Même prix que sur aesop.fr. Tous les prix incluent la TVA.',
    'Customer reviews': 'Commentaires client', 'Review this product': 'Évaluer ce produit',
    'Share your thoughts with other customers.': 'Partagez votre opinion avec les autres clients.',
    'Write a product review': 'Écrire un commentaire', 'Edit your review': 'Modifier votre commentaire',
    'Top reviews from France': 'Meilleurs commentaires en France', 'Verified Purchase': 'Achat vérifié', 'Edit': 'Modifier', 'Delete': 'Supprimer',
    'Frequently bought together': 'Fréquemment achetés ensemble', 'Compare with similar items': 'Comparer avec des articles similaires',
    'This item': 'Cet article', 'This item:': 'Cet article :', 'Total price:': 'Prix total :', 'Add all three to Basket': 'Ajouter les trois au panier',
    'Add both to Basket': 'Ajouter les deux au panier', 'Add to Basket': 'Ajouter au panier', 'Customer Rating': 'Note client', 'Price': 'Prix',
    'Sold By': 'Vendu par', 'Customers who viewed this item also viewed': 'Les clients ayant consulté cet article ont également regardé',
    'From the brand': 'De la marque', 'View or edit your browsing history': 'Afficher ou modifier votre historique de navigation',
    'Click image to open expanded view': "Cliquez sur l'image pour l'agrandir",
    'Roll over image to zoom in · Click to see full view': "Passez la souris sur l'image pour zoomer · Cliquez pour l'agrandir",
    'Images': 'Images', 'Quick look': 'Aperçu rapide', 'See all details': 'Voir tous les détails', 'Subscribe & Save': 'Prévoyez et Économisez',
    'Share this product': 'Partager ce produit', 'Copy link': 'Copier le lien', 'Email': 'E-mail', 'More options': "Plus d'options",
    // basket and checkout
    'Shopping Basket': 'Panier', 'Save for later': 'Mettre de côté', 'This will be a gift': 'Ceci sera un cadeau',
    'This order contains a gift': 'Cette commande contient un cadeau', 'Proceed to checkout': 'Passer la commande',
    'Select all items': 'Sélectionner tous les articles', 'Deselect all items': 'Désélectionner tous les articles',
    'No items selected': 'Aucun article sélectionné', 'Go to basket': 'Aller au panier', 'Added to basket': 'Ajouté au panier',
    'Your order qualifies for FREE delivery tomorrow.': 'Votre commande est éligible à la livraison GRATUITE demain.',
    'Move to basket': 'Déplacer dans le panier', 'Your Amazon Basket is empty': 'Votre panier Amazon est vide',
    'Customers who bought items in your basket also bought': 'Les clients ayant acheté les articles de votre panier ont également acheté',
    'Place your order': 'Acheter', 'Order Summary': 'Récapitulatif de commande', 'Delivery address': 'Adresse de livraison',
    'Payment method': 'Mode de paiement', 'Review items and delivery': 'Vérifier les articles et la livraison', 'Change': 'Modifier',
    'Pay on delivery (demo)': 'Paiement à la livraison (démo)', 'Items:': 'Articles :', 'Delivery:': 'Livraison :', 'Order Total:': 'Montant total :',
    'Choose a delivery option:': 'Choisissez une option de livraison :', 'FREE Prime Delivery': 'Livraison Prime GRATUITE',
    'Add a gift card or promotion code or voucher': 'Ajouter une carte cadeau, un code promotionnel ou un bon',
    'Enter code': 'Saisir le code', 'Gift message': 'Message cadeau', '(optional)': '(facultatif)',
    'Choose a delivery address': 'Choisissez une adresse de livraison', 'Use this address': 'Utiliser cette adresse',
    '+ Add a new address': '+ Ajouter une nouvelle adresse', 'Order placed, thank you!': 'Commande passée, merci !',
    'View order details': 'Afficher les détails de la commande', 'Review or edit your recent orders': 'Vérifier ou modifier vos commandes récentes',
    // orders and account
    'Track package': 'Suivre votre colis', 'Return or replace items': 'Retourner ou remplacer des articles', 'Cancel order': 'Annuler la commande',
    'Buy it again': 'Acheter à nouveau', 'View your item': 'Afficher votre article', 'Invoice': 'Facture', 'Order placed': 'Commande effectuée',
    'Total': 'Total', 'Dispatch to': 'Livraison à', 'Search Orders': 'Rechercher des commandes', 'Search all orders': 'Rechercher toutes les commandes',
    'Order Details': 'Détails de la commande', 'View or print invoice': 'Afficher ou imprimer la facture', 'Buy again': 'Acheter à nouveau',
    'Login & security': 'Connexion et sécurité', 'Your Wish List': "Votre liste d'envies", 'Add address': 'Ajouter une adresse',
    'Remove': 'Supprimer', 'Set as Default': 'Définir par défaut', 'Default': 'Par défaut', 'Save changes': 'Enregistrer les modifications',
    'Cancel': 'Annuler', 'Submit': 'Envoyer', 'Skip next delivery': 'Sauter la prochaine livraison', 'Cancel subscription': "Annuler l'abonnement",
    'Resubscribe': 'Se réabonner', 'Deliver every': 'Livrer tous les', 'Remove from view': "Retirer de l'affichage",
    'Remove all items from view': "Retirer tous les articles de l'affichage", 'Remove from list': 'Retirer de la liste',
    'Create review': 'Créer un commentaire', 'Overall rating': 'Note globale', 'Add a headline': 'Ajouter un titre',
    'Add a written review': 'Ajouter un commentaire écrit', 'Choose your public name': 'Choisissez votre nom public',
    // search
    'Sort by:': 'Trier par :', 'Featured': 'En vedette', 'Price: Low to High': 'Prix : par ordre croissant', 'Price: High to Low': 'Prix : par ordre décroissant',
    'Avg. Customer Review': 'Moyenne des commentaires client', 'Delivery': 'Livraison', 'Category': 'Catégorie', 'Customer Reviews': 'Commentaires client',
    'Clear all filters': 'Effacer tous les filtres', 'Any price': 'Tous les prix', 'Prime FREE delivery': 'Livraison GRATUITE Prime',
    'Hand care': 'Soins des mains', 'Bath & body': 'Bain et corps', 'Home fragrance': 'Parfums d’intérieur', 'Gift sets': 'Coffrets cadeaux',
    'Woody': 'Boisé', 'Fresh': 'Frais', 'Citrus': 'Agrumes', 'Light': 'Léger', 'Opulent': 'Opulent',
    // footer and settings
    'Back to top': 'Retour en haut de la page', 'About this concept': 'À propos de ce concept', 'Shop the store': 'Parcourir la boutique',
    'Your account': 'Votre compte', 'Let Us Help You': 'Besoin d’aide ?', 'Track Packages or View Orders': 'Suivre vos colis ou vos commandes',
    'Delivery Rates & Policies': 'Tarifs et politiques de livraison', 'Amazon Prime': 'Amazon Prime', 'Returns & Replacements': 'Retours et remplacements',
    'Best sellers': 'Meilleures ventes', "Aesop's values": 'Les valeurs d’Aesop', 'Why there are no deals': 'Pourquoi il n’y a pas de promotions',
    'Student concept – not affiliated with Aesop or Amazon.': 'Concept étudiant – non affilié à Aesop ni à Amazon.',
    'Language settings': 'Paramètres de langue', 'Currency settings': 'Paramètres de devise', 'Translation': 'Traduction',
    'Select the language you prefer for browsing and shopping.': 'Sélectionnez la langue que vous préférez pour naviguer et faire vos achats.',
    'Select the currency you want to shop with.': 'Sélectionnez la devise dans laquelle vous souhaitez acheter.',
    'Concept demo: your order is saved in this browser only. Nothing is shipped or charged.': 'Démo du concept : votre commande est enregistrée dans ce navigateur uniquement. Rien n’est expédié ni débité.',
    'Concept demo: no payment details are collected and nothing is charged.': 'Démo du concept : aucune donnée de paiement n’est collectée et rien n’est débité.',
    'Website (Country/Region)': 'Site web (pays/région)', 'Select your preferred country/region website.': 'Sélectionnez le site de votre pays/région.',
    'Go to website': 'Aller sur le site',
    'Close': 'Fermer', 'Keep it': 'Conserver', 'Got it': 'Compris'
  };

  const WORDS = {
    Monday: 'lundi', Tuesday: 'mardi', Wednesday: 'mercredi', Thursday: 'jeudi', Friday: 'vendredi', Saturday: 'samedi', Sunday: 'dimanche',
    January: 'janvier', February: 'février', March: 'mars', April: 'avril', May: 'mai', June: 'juin', July: 'juillet', August: 'août',
    September: 'septembre', October: 'octobre', November: 'novembre', December: 'décembre', Tomorrow: 'Demain', tomorrow: 'demain'
  };

  // Phrases built from numbers or dates
  const PATTERNS = [
    [/^Subtotal \((\d+) items?\):\s*$/, (m, n) => `Sous-total (${n} article${n > 1 ? 's' : ''}) : `],
    [/^Checkout \((\d+) items?\)$/, (m, n) => `Paiement (${n} article${n > 1 ? 's' : ''})`],
    [/^Basket subtotal \((\d+) items?\):\s*$/, (m, n) => `Sous-total du panier (${n} article${n > 1 ? 's' : ''}) : `],
    [/^Proceed to checkout \((\d+) items?\)$/, (m, n) => `Passer la commande (${n} article${n > 1 ? 's' : ''})`],
    [/^1-(\d+) of (\d+) results$/, (m, a, b) => `1-${a} sur ${b} résultats`],
    [/^ for $/, () => ' pour '],
    [/^(\d+) global ratings$/, (m, n) => `${n} évaluations`],
    [/^([\d.]+) out of 5$/, (m, n) => `${n.replace('.', ',')} sur 5`],
    [/^Arriving (.+)$/, (m, d) => `Livraison prévue ${d}`],
    [/^Image (\d+) of (\d+)$/, (m, a, b) => `Image ${a} sur ${b}`],
    [/^Deliver to (.+)$/, (m, w) => `Livrer à ${w}`],
    [/^FREE delivery\s*$/, () => 'Livraison GRATUITE '],
    [/^ FREE delivery $/, () => ' Livraison GRATUITE ']
  ];

  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const wordRe = new RegExp(`\\b(${Object.keys(WORDS).join('|')})\\b`, 'g');

  function tr(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (FR[trimmed]) return text.replace(trimmed, FR[trimmed]);
    for (const [re, fn] of PATTERNS) { const m = text.match(re); if (m) return fn(...m); }
    if (wordRe.test(trimmed)) { wordRe.lastIndex = 0; return text.replace(wordRe, w => WORDS[w]); }
    return null;
  }

  // Product names, stories and anything the visitor typed are left alone
  const SKIP = 'script, style, textarea, input, .pdp__bullets, .aplus, .campaign__lede, .review__body, .review__head b, .values, .ritual, [data-no-i18n]';

  function translate(root) {
    if (!on()) return;
    const el = root.nodeType === 1 ? root : root.parentElement;
    if (!el || el.closest?.(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (root.nodeType === 3) nodes.push(root);
    nodes.forEach(n => {
      if (n.parentElement?.closest(SKIP)) return;
      const out = tr(n.nodeValue);
      if (out !== null && out !== n.nodeValue) n.nodeValue = out;
    });
    if (root.nodeType === 1) [root, ...root.querySelectorAll('[placeholder], [aria-label], [title]')].forEach(node => {
      ATTRS.forEach(a => { const v = node.getAttribute?.(a); const out = v && FR[v.trim()]; if (out) node.setAttribute(a, out); });
    });
  }

  const on = () => S.shop?.state.lang === 'FR';
  const observer = new MutationObserver(list => {
    if (!on()) return;
    list.forEach(m => m.addedNodes.forEach(n => translate(n)));
  });

  function apply() {
    document.documentElement.lang = 'fr';
    translate(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  S.i18n = { apply };
  if (on()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(apply));
    else apply();
  }
})();
