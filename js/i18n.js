/* French version of the store, using the wording Amazon.fr uses. When the visitor
   picks "français - FR", products switch to their French listing (the `fr` block in
   data.js) and visible text is swapped as it appears on screen. Going back to
   English reloads the page. */
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
    "Français shows the whole store in French, including product names and descriptions. Where aesop.fr has no French name, the concept provides its own translation.": 'Le français affiche toute la boutique en français, y compris les noms et descriptions des produits. Lorsqu’aesop.fr ne propose pas de nom français, le concept fournit sa propre traduction.',
    'Select the currency you want to shop with.': 'Sélectionnez la devise dans laquelle vous souhaitez acheter.',
    'Concept demo: your order is saved in this browser only. Nothing is shipped or charged.': 'Démo du concept : votre commande est enregistrée dans ce navigateur uniquement. Rien n’est expédié ni débité.',
    'Concept demo: no payment details are collected and nothing is charged.': 'Démo du concept : aucune donnée de paiement n’est collectée et rien n’est débité.',
    'Website (Country/Region)': 'Site web (pays/région)', 'Select your preferred country/region website.': 'Sélectionnez le site de votre pays/région.',
    'Go to website': 'Aller sur le site',
    // store pages and editorial copy
    'Skip to store content': 'Aller au contenu de la boutique', 'Search in': 'Rechercher dans', 'Melbourne · Since 1987': 'Melbourne · Depuis 1987',
    'The 2026 Gift Guide': 'Le Guide des cadeaux 2026', 'Considered gifts at the aesop.fr price, delivered tomorrow with Prime.': 'Des cadeaux choisis avec soin au prix d’aesop.fr, livrés demain avec Prime.',
    'Shop the Gift Guide': 'Découvrir le Guide des cadeaux',
    'Formulations for skin, hair and body, made in Melbourne since 1987. Now sold by Amazon, at the same price as aesop.fr.': 'Des formules pour la peau, les cheveux et le corps, créées à Melbourne depuis 1987. Désormais vendues par Amazon, au même prix que sur aesop.fr.',
    'Ships from and sold by Amazon': 'Expédié et vendu par Amazon', 'No third-party resellers in this store.': 'Aucun revendeur tiers dans cette boutique.',
    'The aesop.fr price': 'Le prix d’aesop.fr', '€39 for the hand wash, not €79.': '39 € pour le gel lavant, pas 79 €.',
    'Authentic, traceable stock': 'Stock authentique et traçable', 'Brand Registry and Transparency codes.': 'Brand Registry et codes Transparency.',
    'Delivered tomorrow': 'Livré demain', 'Free with Prime, gift options at checkout.': 'Gratuit avec Prime, options cadeau lors de la commande.',
    'Three to begin with': 'Trois pour commencer', 'Our most-gifted formulation': 'Notre formule la plus offerte',
    'Subscribe & refill available': 'Abonnement et recharge disponibles', 'Authentic stock, Transparency-coded': 'Stock authentique, code Transparency',
    'A ritual for hard-working hands': 'Un rituel pour les mains qui travaillent dur',
    'Reverence Aromatique Hand Wash, at the aesop.fr price and delivered tomorrow with Prime.': 'Le Gel Lavant Révérence Aromatique pour les Mains, au prix d’aesop.fr et livré demain avec Prime.',
    'Shop Hand & Body': 'Découvrir Mains et corps', 'Explore the store': 'Explorer la boutique', 'Gifts': 'Cadeaux',
    'Not sure where to start?': 'Vous ne savez pas par où commencer ?',
    'Answer four short questions and we will suggest three formulations, the way a consultant would in one of our stores.': 'Répondez à quatre questions et nous vous suggérerons trois formules, comme le ferait un conseiller dans l’une de nos boutiques.',
    'Certified B Corporation since 2020. Leaping Bunny approved, never tested on animals. Refills, not discounts.': 'Certifiée B Corporation depuis 2020. Approuvée Leaping Bunny, jamais testée sur les animaux. Des recharges, pas des promotions.',
    'Read about our values': 'Découvrir nos valeurs',
    "A mock-up made for a Global Digital Marketing class pitch (KEDGE Business School, Group 7). Brand names belong to their owners and are used here only to illustrate the proposal. Product photos are Aesop's own, shown for illustration. Ratings are placeholders. Prices are taken from aesop.fr.": 'Maquette réalisée pour une présentation du cours Global Digital Marketing (KEDGE Business School, groupe 7). Les marques appartiennent à leurs propriétaires et ne servent qu’à illustrer la proposition. Les photos des produits sont celles d’Aesop, montrées à titre d’illustration. Les notes sont fictives. Les prix proviennent d’aesop.fr.',
    'Gentle formulations, quiet aromas and a routine you can actually keep.': 'Des formules douces, des arômes discrets et un rituel facile à tenir.',
    'A routine in three steps': 'Un rituel en trois étapes', 'Cleanse': 'Nettoyer', 'Soften': 'Adoucir', 'Shower': 'Douche',
    'Pumice gently lifts the day off your hands.': 'La pierre ponce efface en douceur la journée de vos mains.', 'A light balm that absorbs in seconds.': 'Un baume léger qui pénètre en quelques secondes.',
    'A gentle Geranium Leaf cleanser for the body.': 'Un gel nettoyant doux à la Feuille de Géranium pour le corps.', 'Never run out of hand wash': 'Ne soyez plus jamais à court de gel lavant',
    'Subscribe to Reverence Aromatique Hand Wash and a 500 mL refill arrives every two months. Skip or cancel any time.': 'Abonnez-vous au Gel Lavant Révérence Aromatique : une recharge de 500 ml arrive tous les deux mois. Sautez une livraison ou annulez à tout moment.',
    'every 2 months': 'tous les 2 mois', 'One-time purchase': 'Achat unique', 'Set up subscription': 'Créer l’abonnement',
    'Same price, delivered before you run out.': 'Même prix, livré avant que vous ne soyez à court.', 'See details': 'Voir les détails',
    'Smoky, grounding, warm. Hwyl and Marrakech Intense.': 'Fumés, enveloppants, chaleureux. Hwyl et Marrakech Intense.', 'Citrus, herbs, sea air. Tacit and Karst.': 'Agrumes, herbes, air marin. Tacit et Karst.',
    'Not sure?': 'Vous hésitez ?', 'Four questions, three suggestions.': 'Quatre questions, trois suggestions.',
    'A few drops in the bowl after you flush. The next visitor will never know.': 'Quelques gouttes dans la cuvette après avoir tiré la chasse. Le prochain visiteur n’en saura rien.',
    'How to use': 'Mode d’emploi', 'Flush, then add a few drops to the bowl.': 'Tirez la chasse, puis versez quelques gouttes dans la cuvette.',
    'Tangerine peel, ylang-ylang and mandarin peel mask what lingers.': 'L’écorce de tangerine, l’ylang-ylang et l’écorce de mandarine masquent ce qui persiste.',
    'The next visitor walks into a bright, citrus-fresh room.': 'Le visiteur suivant entre dans une pièce lumineuse et fraîche aux agrumes.',
    'Delivered tomorrow with Prime': 'Livré demain avec Prime', 'Order by 23:59 tonight and your gift arrives': 'Commandez avant 23 h 59 ce soir et votre cadeau arrive',
    '. Add a message and hide the price at checkout.': '. Ajoutez un message et masquez le prix lors de la commande.', 'Gifts by budget': 'Cadeaux par budget',
    'All gifts': 'Tous les cadeaux', 'Under €50': 'Moins de 50 €', 'Over €100': 'Plus de 100 €', 'Gift wrap': 'Emballage cadeau',
    'Choose gift wrap at checkout. Every Aesop parcel ships in a plain outer box.': 'Choisissez l’emballage cadeau lors de la commande. Chaque colis Aesop est expédié dans un carton neutre.',
    'Gift receipt': 'Ticket cadeau', 'Prices are hidden on the packing slip so the recipient can return or exchange.': 'Les prix sont masqués sur le bordereau pour que le destinataire puisse retourner ou échanger.',
    'Christmas purchases can be returned until the end of January.': 'Les achats de Noël peuvent être retournés jusqu’à fin janvier.',
    'In our stores, a consultant asks a few questions before suggesting anything. This does the same, in under a minute.': 'Dans nos boutiques, un conseiller pose quelques questions avant de suggérer quoi que ce soit. Ce questionnaire fait de même, en moins d’une minute.',
    'Where would you like to begin?': 'Par où souhaitez-vous commencer ?', 'My hands': 'Mes mains', 'Washes and balms': 'Gels lavants et baumes', 'My body': 'Mon corps',
    'Cleansers and balms': 'Nettoyants et baumes', 'My home': 'Ma maison', 'Room sprays, candles, the bathroom': 'Sprays d’intérieur, bougies, la salle de bains',
    'A scent to wear': 'Un parfum à porter',
    'We make formulations for skin, hair and body with the same care we give to the stores that sell them. Joining Amazon.fr changes where you can buy Aesop, not how it is made or what it costs.': 'Nous créons des formules pour la peau, les cheveux et le corps avec le même soin que celui apporté aux boutiques qui les vendent. Rejoindre Amazon.fr change l’endroit où acheter Aesop, pas la façon dont nos produits sont fabriqués ni leur prix.',
    'Certified B Corporation': 'Certifiée B Corporation',
    'Aesop was certified in 2020 and renewed in 2024. The certification measures how a company treats its workers, suppliers, community and the environment, not only its products.': 'Aesop a été certifiée en 2020 et renouvelée en 2024. Cette certification mesure la façon dont une entreprise traite ses salariés, ses fournisseurs, sa communauté et l’environnement, et pas seulement ses produits.',
    'Leaping Bunny approved': 'Approuvée Leaping Bunny',
    "Our formulations are approved and certified cruelty-free under Cruelty Free International's Leaping Bunny programme.": 'Nos formules sont approuvées et certifiées sans cruauté animale par le programme Leaping Bunny de Cruelty Free International.',
    'Refills, not discounts': 'Des recharges, pas des promotions',
    '500 mL refills for our hand washes, and Subscribe & refill so you never buy a new bottle you do not need.': 'Des recharges de 500 ml pour nos gels lavants, et l’abonnement pour ne jamais racheter un flacon inutile.',
    'One price, everywhere': 'Un seul prix, partout',
    'The price on Amazon.fr is the price on aesop.fr. No promotions, no grey market at double the price.': 'Le prix sur Amazon.fr est celui d’aesop.fr. Pas de promotions, pas de marché parallèle à prix double.',
    'Every unit ships from Amazon with a Transparency code, so you know it came from us and was stored properly.': 'Chaque article est expédié par Amazon avec un code Transparency : vous savez qu’il vient de nous et qu’il a été bien conservé.',
    'Climate Active certified': 'Certifiée Climate Active',
    "Since 2018, our Australian operations have been certified carbon-neutral under the government's Climate Active scheme.": 'Depuis 2018, nos activités australiennes sont certifiées neutres en carbone par le programme gouvernemental Climate Active.',
    'Start with the formulation our customers come back to most.': 'Commencez par la formule que nos clients rachètent le plus.',
    'A 500 mL refill every 2 months. Skip or cancel any time.': 'Une recharge de 500 ml tous les 2 mois. Sautez une livraison ou annulez à tout moment.',
    '. Order within': '. Commandez dans les',
    'Star ratings are placeholders for this concept. Reviews written here are saved in this browser only.': 'Les notes sont fictives pour ce concept. Les commentaires écrits ici sont enregistrés dans ce navigateur uniquement.',
    'Best Sellers in Aesop': 'Meilleures ventes Aesop', 'Our most popular formulations, ranked by customer ratings. Updated hourly.': 'Nos formules les plus appréciées, classées selon les avis clients. Mis à jour toutes les heures.',
    "There are no Aesop deals, and there won't be.": 'Il n’y a pas de promotions Aesop, et il n’y en aura pas.',
    'Every formulation in this store is sold by Amazon at the aesop.fr price, every day. Instead of discounts, Aesop offers refills and gift sets that give more for the same price.': 'Chaque formule de cette boutique est vendue par Amazon au prix d’aesop.fr, tous les jours. Plutôt que des remises, Aesop propose des recharges et des coffrets qui offrent davantage pour le même prix.',
    'Refills and gift sets': 'Recharges et coffrets cadeaux', 'FREE delivery tomorrow on every Aesop formulation': 'Livraison GRATUITE demain sur toutes les formules Aesop',
    'Fast, free delivery': 'Livraison rapide et gratuite', 'Order by 23:59 for delivery tomorrow, at no extra cost.': 'Commandez avant 23 h 59 pour être livré demain, sans frais.',
    'Gift-ready': 'Prêt à offrir', 'Add gift options and hide prices on the packing slip.': 'Ajoutez des options cadeau et masquez les prix sur le bordereau.',
    'Easy returns': 'Retours faciles', 'Return any Aesop purchase within 30 days.': 'Retournez tout achat Aesop sous 30 jours.', 'Prime-eligible Aesop formulations': 'Formules Aesop éligibles à Prime',
    'Hello. What can we help you with?': 'Bonjour. Comment pouvons-nous vous aider ?', 'Track packages, return items, buy again': 'Suivre des colis, retourner des articles, racheter',
    'Change quantities, save for later': 'Modifier les quantités, mettre de côté', 'Products you saved for later': 'Les produits que vous avez mis de côté',
    'Frequently asked questions': 'Questions fréquentes', 'Is everything sold here authentic?': 'Tout ce qui est vendu ici est-il authentique ?',
    'Yes. Every unit ships from and is sold by Amazon, with a Transparency code that proves it came from Aesop and was stored correctly.': 'Oui. Chaque article est expédié et vendu par Amazon, avec un code Transparency qui prouve qu’il vient d’Aesop et a été correctement conservé.',
    'Why is the price the same as aesop.fr?': 'Pourquoi le prix est-il le même que sur aesop.fr ?',
    'Aesop sells at one price everywhere. You pay the aesop.fr price here, not the higher prices some resellers charge.': 'Aesop pratique un prix unique partout. Ici, vous payez le prix d’aesop.fr, pas les prix plus élevés de certains revendeurs.',
    'When will my order arrive?': 'Quand ma commande arrivera-t-elle ?',
    'Prime orders placed before 23:59 arrive the next day. You can also choose Amazon Day Delivery at checkout to group your parcels.': 'Les commandes Prime passées avant 23 h 59 arrivent le lendemain. Vous pouvez aussi choisir Amazon Day lors de la commande pour regrouper vos colis.',
    'How does Subscribe & refill work?': 'Comment fonctionne l’abonnement et recharge ?',
    'Choose Subscribe & refill on a hand wash and a 500 mL refill arrives every two months. Skip, change or cancel any time from Your Subscribe & refill.': 'Choisissez l’abonnement sur un gel lavant : une recharge de 500 ml arrive tous les deux mois. Sautez, modifiez ou annulez à tout moment depuis Vos abonnements et recharges.',
    'How do I return an item?': 'Comment retourner un article ?',
    'Go to Your Orders, choose Return or replace items, and follow the steps. Aesop purchases are returnable within 30 days.': 'Allez dans Vos commandes, choisissez Retourner ou remplacer des articles, puis suivez les étapes. Les achats Aesop sont retournables sous 30 jours.',
    'Can I send a gift?': 'Puis-je envoyer un cadeau ?',
    'Yes. Tick "This will be a gift" in your basket to add a message and hide the price on the packing slip.': 'Oui. Cochez « Ceci sera un cadeau » dans votre panier pour ajouter un message et masquer le prix sur le bordereau.',
    'Nothing here yet. Start with the formulations our customers come back to most.': 'Rien pour l’instant. Commencez par les formules que nos clients rachètent le plus.',
    'Shop best sellers': 'Voir les meilleures ventes', 'Best sellers in the Aesop store': 'Meilleures ventes de la boutique Aesop',
    'placed in this browser': 'passée(s) dans ce navigateur', "You haven't placed any orders yet": 'Vous n’avez encore passé aucune commande',
    'Orders you place in this concept appear here, with tracking and returns.': 'Les commandes passées dans ce concept apparaissent ici, avec le suivi et les retours.', 'Start shopping': 'Commencer vos achats',
    'Why this concept has no sign-in': 'Pourquoi ce concept n’a pas de connexion', 'Deliveries, returns and questions': 'Livraisons, retours et questions',
    'Concept demo: this account lives in this browser only. Clearing your browser data resets it.': 'Démo du concept : ce compte existe uniquement dans ce navigateur. Effacer les données du navigateur le réinitialise.',
    'Your Wish List is empty': 'Votre liste d’envies est vide', 'Use': 'Utilisez', 'on any product page to save it here.': 'sur une page produit pour l’enregistrer ici.',
    'Browse best sellers': 'Parcourir les meilleures ventes', 'Browsing history is on': 'Historique de navigation activé', 'Browsing history is off': 'Historique de navigation désactivé',
    'These items were viewed recently. We use them to personalise recommendations.': 'Vous avez consulté ces articles récemment. Nous les utilisons pour personnaliser nos recommandations.',
    'Refills arrive on your schedule with FREE Prime delivery. Skip, change or cancel at any time.': 'Les recharges arrivent selon votre rythme, avec la livraison Prime GRATUITE. Sautez, modifiez ou annulez à tout moment.',
    'You have no active subscriptions': 'Vous n’avez aucun abonnement actif', 'Choose': 'Choisissez',
    'on a hand wash and complete checkout. The subscription appears here.': 'sur un gel lavant et finalisez la commande. L’abonnement apparaît ici.',
    'Shop Subscribe & refill': 'Découvrir l’abonnement et recharge', 'Active subscriptions': 'Abonnements actifs', 'Cancelled': 'Annulés',
    'Next delivery:': 'Prochaine livraison :', 'Subscription cancelled': 'Abonnement annulé',
    'New address': 'Nouvelle adresse', 'Edit address': 'Modifier l’adresse', 'Add a new address': 'Ajouter une nouvelle adresse', 'Edit your address': 'Modifier votre adresse',
    'Country/Region': 'Pays/Région', 'Full name (first and last name)': 'Nom complet (prénom et nom)', 'Address': 'Adresse',
    'Apartment, suite, unit, building, floor': 'Appartement, bâtiment, étage', 'Postcode': 'Code postal', 'Town/City': 'Ville', 'Phone number': 'Numéro de téléphone',
    'Make this my default address': 'Utiliser comme adresse par défaut', 'Street address or P.O. Box': 'Numéro et nom de rue ou boîte postale',
    "You haven't written any reviews yet": 'Vous n’avez encore écrit aucun commentaire', 'Open a product and choose': 'Ouvrez un produit et choisissez',
    'under Customer reviews.': 'sous Commentaires client.', 'Review something you ordered': 'Évaluer un article commandé',
    "This is how you'll appear to other customers": 'C’est ainsi que vous apparaîtrez aux autres clients',
    'Concept demo: your review is saved in this browser only and is not sent anywhere.': 'Démo du concept : votre commentaire est enregistré dans ce navigateur uniquement et n’est envoyé nulle part.',
    "What's most important to know?": 'Qu’est-il le plus important de savoir ?', 'What did you like or dislike? How did you use this product?': 'Qu’avez-vous aimé ou moins aimé ? Comment avez-vous utilisé ce produit ?',
    'Please select a star rating': 'Veuillez sélectionner une note', 'Please enter your headline': 'Veuillez saisir un titre', 'Please add a written review': 'Veuillez ajouter un commentaire écrit',
    'Other currencies use indicative exchange rates. Orders are always charged in euros.': 'Les autres devises utilisent des taux de change indicatifs. Les commandes sont toujours facturées en euros.',
    '€ - EUR - Euro (Default)': '€ - EUR - Euro (par défaut)', '£ - GBP - British Pound': '£ - GBP - Livre sterling', '€ - EUR - Euro': '€ - EUR - Euro',
    'US$ - USD - US Dollar': 'US$ - USD - Dollar américain', 'CHF - Swiss Franc': 'CHF - Franc suisse',
    '€100 & above': '100 € et plus', 'Up to €40': 'Jusqu’à 40 €', '€40 to €100': 'De 40 € à 100 €', 'Lists': 'Listes',
    'Your Wish List is private': 'Votre liste d’envies est privée', 'Track, return or buy things again': 'Suivre, retourner ou racheter',
    'FREE delivery tomorrow on every Aesop formulation ': 'Livraison GRATUITE demain sur toutes les formules Aesop ',
    'Close': 'Fermer', 'Keep it': 'Conserver', 'Got it': 'Compris'
  };

  const WORDS = {
    Monday: 'lundi', Tuesday: 'mardi', Wednesday: 'mercredi', Thursday: 'jeudi', Friday: 'vendredi', Saturday: 'samedi', Sunday: 'dimanche',
    January: 'janvier', February: 'février', March: 'mars', April: 'avril', May: 'mai', June: 'juin', July: 'juillet', August: 'août',
    September: 'septembre', October: 'octobre', November: 'novembre', December: 'décembre', Tomorrow: 'Demain', tomorrow: 'demain',
    Jan: 'janv.', Feb: 'févr.', Mar: 'mars', Apr: 'avr.', Jun: 'juin', Jul: 'juil.', Aug: 'août', Sep: 'sept.', Oct: 'oct.', Nov: 'nov.', Dec: 'déc.'
  };

  // Phrases built from numbers or dates
  const PATTERNS = [
    [/^Subtotal \((\d+) items?\):\s*$/, (m, n) => `Sous-total (${n} article${n > 1 ? 's' : ''}) : `],
    [/^Checkout \((\d+) items?\)$/, (m, n) => `Paiement (${n} article${n > 1 ? 's' : ''})`],
    [/^Basket subtotal \((\d+) items?\):\s*$/, (m, n) => `Sous-total du panier (${n} article${n > 1 ? 's' : ''}) : `],
    [/^Proceed to checkout \((\d+) items?\)$/, (m, n) => `Passer la commande (${n} article${n > 1 ? 's' : ''})`],
    [/^1-(\d+) of (\d+) results( for)?$/, (m, a, b, f) => `1-${a} sur ${b} résultats${f ? ' pour' : ''}`],
    [/^([\d,\s\u202f]+) global ratings$/, (m, n) => `${n.replace(/,/g, '\u202f').trim()} évaluations`],
    [/^(\d) stars?$/, (m, n) => `${n} étoile${n > 1 ? 's' : ''}`],
    [/^(\d+) hrs (\d+) mins$/, (m, h, mn) => `${h} h ${mn} min`],
    [/^Question (\d) of (\d)$/, (m, a, b) => `Question ${a} sur ${b}`],
    [/^(\d+) orders?$/, (m, n) => `${n} commande${n > 1 ? 's' : ''}`],
    [/^(\d+) items? · Private · Kept in this browser$/, (m, n) => `${n} article${n > 1 ? 's' : ''} · Privée · Enregistrée dans ce navigateur`],
    [/^(\d+) products? viewed$/, (m, n) => `${n} produit${n > 1 ? 's' : ''} consulté${n > 1 ? 's' : ''}`],
    [/^Track, return or buy things again · (\d+) orders?$/, (m, n) => `Suivre, retourner ou racheter · ${n} commande${n > 1 ? 's' : ''}`],
    [/^Edit addresses for orders · (\d+) address(es)?$/, (m, n) => `Modifier les adresses de livraison · ${n} adresse${n > 1 ? 's' : ''}`],
    [/^Skip, change or cancel refills · (\d+) active$/, (m, n) => `Sauter, modifier ou annuler les recharges · ${n} actif${n > 1 ? 's' : ''}`],
    [/^Your Wish List · (\d+) items?$/, (m, n) => `Votre liste d’envies · ${n} article${n > 1 ? 's' : ''}`],
    [/^Edit or delete reviews you wrote · (\d+)$/, (m, n) => `Modifier ou supprimer vos commentaires · ${n}`],
    [/^Returns until (.+)$/, (m, d) => `Retours jusqu’au ${d.replace(wordRe, w => WORDS[w])}`],
    [/^Active subscriptions \((\d+)\)$/, (m, n) => `Abonnements actifs (${n})`],
    [/^Delivered tomorrow$/, () => 'Livré demain'],
    [/^› (.+)$/, (m, t) => `› ${FR[t] || t}`],
    [/^ for $/, () => ' pour '],
    [/^(\d+) global ratings$/, (m, n) => `${n} évaluations`],
    [/^([\d.,]+) out of 5$/, (m, n) => `${n.replace('.', ',')} sur 5`],
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
    const lead = text.slice(0, text.indexOf(trimmed)), trail = text.slice(text.indexOf(trimmed) + trimmed.length);
    const key = trimmed.replace(/\u00a0/g, ' ');
    if (FR[key]) return lead + FR[key] + trail;
    for (const [re, fn] of PATTERNS) { const m = key.match(re) || text.match(re); if (m) return lead + fn(...m).trim() + trail; }
    if (wordRe.test(trimmed)) { wordRe.lastIndex = 0; return text.replace(wordRe, w => WORDS[w]); }
    return null;
  }

  // Product names, stories and anything the visitor typed are left alone
  const SKIP = 'script, style, textarea, input, .review__body, .review__head b, .review__who, [data-no-i18n]';

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

  // Products carry their French listing in data.js (p.fr); swap it in, keeping the English name for search
  function localiseProducts() {
    let changed = false;
    S.products.forEach(p => {
      if (p.fr && !p.nameEn) { p.nameEn = p.name; Object.assign(p, p.fr); changed = true; }
      if (p.nameEn) FR[p.nameEn] = p.name;   // product names written into page copy
    });
    return changed;
  }

  function apply() {
    document.documentElement.lang = 'fr';
    if (localiseProducts() && document.readyState !== 'loading') { const y = scrollY; S.render(); scrollTo(0, y); }
    translate(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  S.i18n = { apply };
  if (on()) {
    localiseProducts();   // before the first render, so French names appear straight away
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(apply));
    else apply();
  }
})();
