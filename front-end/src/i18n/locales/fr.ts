const fr = {
  app: {
    name: "SGPBSE",
    subtitle: "Gestion du patrimoine communal",
  },

  header: {
    profile: "Mon profil",
    logout: "Se déconnecter",
    menu: "Ouvrir ou fermer le menu",
    language: "Langue",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    notifications: "Notifications",
  },

  menu: {
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    roles: "Rôles",
    assets: "Biens",
    stock: "Stock",
    lighting: "Éclairage",
    reports: "Rapports",
    notifications: "Notifications",
    profile: "Mon profil",
    settings: "Paramètres",
  },

  auth: {
    welcome: "Bienvenue",

    description:
      "Connectez-vous pour accéder à la plateforme de gestion du patrimoine, des biens, du stock et de l’éclairage public.",

    reservedAccess:
      "Accès réservé aux utilisateurs autorisés.",

    heroTitle:
      "Une gestion centralisée, simple et intelligente",

    heroDescription:
      "Suivez les biens, gérez le stock et organisez les opérations d’éclairage public depuis une plateforme unique.",

    email: "Adresse e-mail",
    emailPlaceholder:
      "Entrez votre adresse e-mail",
    emailRequired:
      "L’adresse e-mail est obligatoire.",
    emailInvalid:
      "Le format de l’adresse e-mail est invalide.",

    password: "Mot de passe",
    passwordPlaceholder:
      "Entrez votre mot de passe",
    passwordRequired:
      "Le mot de passe est obligatoire.",
    passwordMin:
      "Le mot de passe doit contenir au moins 8 caractères.",

    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",

    login: "Se connecter",
    loginLoading: "Connexion...",

    invalidCredentials:
      "Adresse e-mail ou mot de passe incorrect.",

    loginError:
      "Une erreur est survenue pendant la connexion.",

    demoAccounts: "Comptes de démonstration",
    admin: "Admin",
    agent: "Agent",

    forgot: {
      title: "Mot de passe oublié",
      description:
        "Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.",
      emailRequired:
        "Veuillez saisir votre adresse e-mail.",
      emailInvalid:
        "Adresse e-mail invalide.",
      send: "Envoyer le lien",
      sending: "Envoi en cours...",
      sendError:
        "Impossible d’envoyer le lien. Veuillez réessayer.",
      backToLogin:
        "Retour à la connexion",

      successTitle:
        "E-mail envoyé",
      successDescription:
        "Si un compte existe avec cette adresse e-mail, un lien de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.",
    },

    reset: {
      title:
        "Réinitialiser le mot de passe",
      description:
        "Saisissez et confirmez votre nouveau mot de passe.",

      newPassword:
        "Nouveau mot de passe",
      newPasswordPlaceholder:
        "Au moins 8 caractères",

      confirmPassword:
        "Confirmer le mot de passe",
      confirmPasswordPlaceholder:
        "Répétez le mot de passe",

      passwordRequired:
        "Veuillez saisir un nouveau mot de passe.",
      passwordMin:
        "Le mot de passe doit contenir au moins 8 caractères.",
      confirmRequired:
        "Veuillez confirmer le mot de passe.",
      mismatch:
        "Les mots de passe ne correspondent pas.",
      invalidToken:
        "Le lien de réinitialisation est invalide ou incomplet.",

      submit:
        "Réinitialiser le mot de passe",
      loading:
        "Réinitialisation...",

      error:
        "Impossible de réinitialiser le mot de passe. Le lien est peut-être invalide ou expiré.",

      showPassword:
        "Afficher le mot de passe",
      hidePassword:
        "Masquer le mot de passe",
      showConfirmation:
        "Afficher la confirmation",
      hideConfirmation:
        "Masquer la confirmation",

      successTitle:
        "Mot de passe réinitialisé",
      successDescription:
        "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",

      login:
        "Se connecter",
    },
  },

  

  dashboard: {
    welcome: "Bonjour {{name}}",

    description:
      "Vue générale du patrimoine communal, du stock et de l’éclairage public.",

    connectedAs: "Connecté en tant que",

    statistics: {
      assets: "Biens",
      assetsDescription: "Biens enregistrés",

      articles: "Articles",
      articlesDescription: "Références en stock",

      lighting: "Points lumineux",
      lightingDescription: "Équipements suivis",

      users: "Utilisateurs",
      usersDescription: "Comptes enregistrés",
    },

    alerts: {
      stock: "Alertes stock",
      failures: "Pannes signalées",
      maintenance: "Biens en maintenance",
      movements: "Mouvements récents",

      recent: "Alertes récentes",

      recentDescription:
        "Éléments nécessitant une attention",

      lowStock: "Stock faible",
      lightingFailure: "Panne éclairage",
      assetMaintenance: "Bien en maintenance",

      empty: "Aucune alerte pour le moment.",
    },

    stock: {
      title: "Mouvements du stock",
      subtitle: "Entrées et sorties récentes",
      entries: "Entrées",
      exits: "Sorties",
    },

    lighting: {
      title: "État de l’éclairage",
      subtitle:
        "Répartition des points lumineux",
      active: "Actifs",
      damaged: "Pannes",
      maintenance: "Maintenance",
    },

    assets: {
      title: "État du patrimoine",
      subtitle:
        "Répartition des biens selon leur statut",
      inUse: "En service",
      available: "Disponible",
      maintenance: "Maintenance",
      others: "Autres",
    },

  },

  users: {
      title: "Gestion des utilisateurs",
      description: "Consultez et gérez les comptes utilisateurs.",
      add: "Ajouter un utilisateur",
      edit: "Modifier l’utilisateur",
      delete: "Supprimer",
      view: "Voir",
      modify: "Modifier",

      count: "{{count}} utilisateur(s)",
      loading: "Chargement des utilisateurs...",
      loadError: "Impossible de charger les utilisateurs.",

      deleteTitle: "Supprimer l’utilisateur",
      deleteMessage:
        "Voulez-vous vraiment supprimer {{name}} ? Cette action est irréversible.",
      deleteSuccess: "Utilisateur supprimé avec succès.",
      deleteError: "Impossible de supprimer l’utilisateur.",

      searchPlaceholder:
        "Rechercher par nom, e-mail ou CIN...",
      allRoles: "Tous les rôles",

      empty: "Aucun utilisateur trouvé",
      emptyDescription:
        "Modifiez les critères de recherche ou ajoutez un utilisateur.",

      columns: {
        user: "Utilisateur",
        phone: "Téléphone",
        cin: "CIN",
        role: "Rôle",
        actions: "Actions",
      },

      form: {
        firstnameAr: "Prénom en arabe",
        lastnameAr: "Nom en arabe",
        arabicIdentity: "Nom en arabe",
        firstname: "Prénom",
        lastname: "Nom",
        email: "Adresse e-mail",
        phone: "Téléphone",
        cin: "CIN",
        gender: "Genre",
        role: "Rôle",
        password: "Mot de passe",

        male: "Homme",
        female: "Femme",

        passwordPlaceholder: "Minimum 8 caractères",
        passwordHint: "Obligatoire lors de l’ajout.",

        saving: "Enregistrement...",

        required:
          "Tous les champs obligatoires doivent être remplis.",
        firstnameMin:
          "Le prénom doit contenir au moins 3 caractères.",
        lastnameMin:
          "Le nom doit contenir au moins 3 caractères.",
        invalidEmail: "L’adresse e-mail est invalide.",
        invalidPhone:
          "Le numéro de téléphone marocain est invalide.",
        invalidCin: "Le numéro de CIN est invalide.",
        invalidPassword:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      },

      gender: {
        HOMME: "Homme",
        FEMME: "Femme",
      },

      details: {
        fullName: "Nom complet",
        email: "Adresse e-mail",
        phone: "Téléphone",
        cin: "CIN",
        gender: "Genre",
        role: "Rôle",
      },

      pages: {
        back: "Retour aux utilisateurs",

        addTitle: "Ajouter un utilisateur",
        addDescription:
          "Remplissez les informations du nouveau compte.",
        create: "Créer l’utilisateur",

        editTitle: "Modifier l’utilisateur",
        editDescription:
          "Modifiez les informations du compte sélectionné.",
        save: "Enregistrer les modifications",

        detailsLoading:
          "Chargement de l’utilisateur...",
        notFound:
          "Utilisateur introuvable.",

        passwordRequired:
          "Le mot de passe est obligatoire.",

        genericError:
          "Une erreur est survenue.",
      },
    },

    roles: {
      title: "Gestion des rôles",
      description:
        "Gérez les rôles et leurs permissions.",

      add: "Ajouter un rôle",
      edit: "Modifier",
      delete: "Supprimer",
      view: "Voir",

      searchPlaceholder:
        "Rechercher un rôle...",
      count: "{{count}} rôle(s)",

      loading:
        "Chargement des rôles...",
      loadError:
        "Impossible de charger les rôles.",

      empty: "Aucun rôle trouvé",
      emptyDescription:
        "Modifiez les critères de recherche ou ajoutez un rôle.",

      deleteTitle:
        "Supprimer le rôle",
      deleteMessage:
        "Voulez-vous vraiment supprimer le rôle « {{name}} » ? Cette action est irréversible.",
      deleteSuccess:
        "Rôle supprimé avec succès.",
      deleteError:
        "Impossible de supprimer le rôle.",
      adminProtected:
        "Le rôle Administrateur ne peut pas être supprimé.",

      columns: {
        role: "Rôle",
        permissions: "Permissions",
        actions: "Actions",
      },

      names: {
        ADMIN: "Administrateur",
        GESTIONNAIRE: "Gestionnaire",
        RESPONSABLE: "Responsable",
        UTILISATEUR: "Utilisateur",
      },

      permissions: {
        USER_READ:
          "Consulter les utilisateurs",
        USER_CREATE:
          "Ajouter un utilisateur",
        USER_UPDATE:
          "Modifier un utilisateur",
        USER_DELETE:
          "Supprimer un utilisateur",

        ROLE_MANAGE:
          "Gérer les rôles",

        BIEN_MANAGE:
          "Gérer les biens",

        STOCK_MANAGE:
          "Gérer le stock",

        ECLAIRAGE_MANAGE:
          "Gérer l’éclairage public",

        REPORT_GENERATE:
          "Générer les rapports",
      },

      form: {
        name: "Nom technique du rôle",
        namePlaceholder:
          "Exemple : GESTIONNAIRE_STOCK",

        permissions: "Permissions",
        permissionsDescription:
          "Sélectionnez les actions autorisées pour ce rôle.",

        selectAll:
          "Tout sélectionner",
        clearAll:
          "Tout désélectionner",

        nameRequired:
          "Le nom du rôle est obligatoire.",
        permissionRequired:
          "Sélectionnez au moins une permission.",

        saving: "Enregistrement...",
      },

      pages: {
        back: "Retour aux rôles",

        addTitle: "Ajouter un rôle",

        editTitle: "Modifier le rôle",

        loading:
          "Chargement du rôle...",

        notFound:
          "Rôle introuvable.",

        genericError:
          "Une erreur est survenue.",

        create: "Créer le rôle",

        save:
          "Enregistrer les modifications",

        associatedPermissions:
          "Permissions associées",

        permissionsCount:
          "{{count}} permission(s)",
      },
    },

    biens: {
      title: "Gestion des biens",
      description:
        "Consultez et gérez le patrimoine communal.",

      add: "Ajouter un bien",
      edit: "Modifier",
      view: "Voir",
      delete: "Supprimer",

      count: "{{count}} bien(s)",
      loading: "Chargement des biens...",
      loadError: "Impossible de charger les biens.",

      empty: "Aucun bien trouvé",
      emptyDescription:
        "Modifiez les filtres ou ajoutez un nouveau bien.",

      searchPlaceholder:
        "Rechercher par désignation, inventaire ou affectation...",

      allStatuses: "Tous les statuts",
      allTypes: "Tous les types",

      types: {
        VEHICLE: "Véhicule",
        MACHINE: "Machine",
        REAL_ESTATE: "Immobilier",
      },

      statuses: {
        AVAILABLE: "Disponible",
        IN_USE: "En service",
        RENTED: "Loué",
        UNDER_MAINTENANCE: "En maintenance",
        OUT_OF_SERVICE: "Hors service",
        DAMAGED: "Endommagé",
        DISPOSED: "Cédé",
        SOLD: "Vendu",
        ARCHIVED: "Archivé",
      },

      columns: {
        bien: "Bien",
        type: "Type",
        assignment: "Affectation",
        status: "Statut",
        value: "Valeur",
        actions: "Actions",
      },

      form: {
        type: "Type du bien",
        designation: "Désignation",
        designationAr: "Désignation en arabe",
        inventoryId: "Identifiant d’inventaire",
        status: "Statut",
        acquisitionDate: "Date d’acquisition",
        purchaseValue: "Valeur d’acquisition (DH)",
        assignment: "Affectation",
        assignmentAr: "Affectation en arabe",

        documents: "Documents associés",
        addDocument: "Ajouter un document",
        documentName: "Nom du document",
        documentType: "Type de document",
        chooseFile: "Choisir un fichier",

        required:
          "Tous les champs obligatoires doivent être remplis.",

        invalidValue:
          "La valeur d’acquisition doit être supérieure à zéro.",

        saving: "Enregistrement...",

        vehicleSection: "Informations du véhicule",
        machineSection: "Informations de la machine",
        realEstateSection: "Informations du bien immobilier",

        registrationNumber: "Immatriculation",
        brand: "Marque",
        model: "Modèle",
        year: "Année",
        chassisNumber: "Numéro de châssis",

        serialNumber: "Numéro de série",
        technicalReference: "Référence technique",

        address: "Adresse",
        surface: "Superficie (m²)",
        landTitleNumber: "Numéro du titre foncier",
        propertyType: "Type de propriété",

        removeDocument: "Retirer",
        noDocuments: "Aucun document ajouté.",
      },

      documentTypes: {
        INVOICE: "Facture",
        RECEIPT: "Reçu",
        CONTRACT: "Contrat",
        REGISTRATION: "Carte grise",
        INSURANCE: "Assurance",
        CERTIFICATE: "Certificat",
        PHOTO: "Photo",
        OTHER: "Autre",
      },
      pages: {
        back: "Retour aux biens",
        addTitle: "Ajouter un bien",
        editTitle: "Modifier le bien",
        detailsLoading: "Chargement du bien...",
        notFound: "Bien introuvable.",
        create: "Créer le bien",
        save: "Enregistrer les modifications",
        genericError: "Une erreur est survenue.",

        information: "Informations générales",
        specificInformation: "Informations spécifiques",
        noSpecificInformation: "Aucune information spécifique renseignée.",

        documents: "Documents associés",
        noDocuments: "Aucun document associé à ce bien.",
      },
      
      operations: {
        button: "Opérations sur le bien",

        rent: "Mettre en location",
        sell: "Vendre le bien",

        rentTitle: "Location du bien",
        sellTitle: "Vente du bien",

        selectedAsset: "Bien sélectionné",

        partyType: "Type",
        person: "Personne",
        company: "Société",

        tenantName: "Nom du locataire",
        buyerName: "Nom de l’acheteur",

        cin: "CIN",
        ice: "ICE",
        phone: "Téléphone",
        address: "Adresse",

        startDate: "Date de début",
        endDate: "Date de fin",

        monthlyAmount:
          "Montant mensuel (DH)",

        saleDate: "Date de vente",
        salePrice: "Prix de vente (DH)",

        contractReference:
          "Référence du contrat",

        contract:
          "Contrat",

        receipt:
          "Reçu / justificatif",

        notes: "Observations",

        cancel: "Annuler",

        confirmRent:
          "Enregistrer la location",

        confirmSale:
          "Confirmer la vente",

        saving: "Enregistrement...",

        required:
          "Remplissez les informations obligatoires.",

        rentSuccess:
          "Location enregistrée avec succès.",

        saleSuccess:
          "Vente enregistrée avec succès.",

        error:
          "Impossible d’enregistrer l’opération.",

          exit: "Sortir du patrimoine",

          exitTitle:
            "Sortie du patrimoine",

          exitDescription:
            "Enregistrez la sortie définitive de ce bien du patrimoine communal.",

          exitReason:
            "Motif de sortie",

          exitDate:
            "Date de sortie",

          exitReference:
            "Référence",

          exitDocument:
            "Document justificatif",

          exitNotes:
            "Observations",

          confirmExit:
            "Archiver le bien",

          exitSuccess:
            "Le bien a été archivé avec succès.",

          exitWarning:
            "Cette opération retire définitivement le bien de la liste active.",

          exitReasons: {
            DISPOSED: "Cédé",
            DESTROYED: "Détruit",
            TRANSFERRED: "Transféré",
            REFORMED: "Réformé",
            OTHER: "Autre",
          },
      },

      archive: {
        button: "Historique / Archives",
        title: "Historique des biens",
        description:
          "Consultez les biens sortis du patrimoine communal.",

        searchPlaceholder:
          "Rechercher par désignation ou inventaire...",

        allReasons: "Tous les motifs",

        count: "{{count}} bien(s) archivé(s)",

        loading:
          "Chargement de l’historique...",

        empty:
          "Aucun bien archivé",

        emptyDescription:
          "Les biens vendus, cédés ou sortis du patrimoine apparaîtront ici.",

        columns: {
          bien: "Bien",
          type: "Type",
          exitDate: "Date de sortie",
          reason: "Motif",
          value: "Valeur d’acquisition",
          actions: "Actions",
        },

        reasons: {
          SOLD: "Vendu",
          DISPOSED: "Cédé",
          DESTROYED: "Détruit",
          TRANSFERRED: "Transféré",
          REFORMED: "Réformé",
          OTHER: "Autre",
        },

        back: "Retour aux biens",

        archivedBadge: "Archivé",

        notes: "Observations",

        saleInformation:
          "Informations de vente",

        buyer: "Acheteur",
        saleDate: "Date de vente",
        salePrice: "Prix de vente",
      },
    },

    stock: {
      form: {
        generalInformation:
          "Informations générales",

        generalDescription:
          "Renseignez les informations de l’article en français et en arabe.",

        frenchInformation:
          "Informations en français",

        arabicInformation:
          "Informations en arabe",

        stockInformation:
          "Informations du stock",

        reference:
          "Référence",

        unit:
          "Unité",

        designationFr:
          "Désignation en français",

        designationAr:
          "Désignation en arabe",

        categoryFr:
          "Catégorie en français",

        categoryAr:
          "Catégorie en arabe",

        locationFr:
          "Localisation en français",

        locationAr:
          "Localisation en arabe",

        designationFrPlaceholder:
          "Ex. Ramette papier A4",

        designationArPlaceholder:
          "مثال: رزمة ورق A4",

        categoryFrPlaceholder:
          "Ex. Fournitures de bureau",

        categoryArPlaceholder:
          "مثال: لوازم مكتبية",

        locationFrPlaceholder:
          "Ex. Magasin A - Étagère 1",

        locationArPlaceholder:
          "مثال: المخزن أ - الرف 1",

        quantity:
          "Quantité initiale",

        minimumQuantity:
          "Seuil minimum",

        required:
          "Tous les champs sont obligatoires.",

        quantityError:
          "La quantité ne peut pas être négative.",

        minimumQuantityError:
          "Le seuil minimum ne peut pas être négatif.",

        saving:
          "Enregistrement...",
      },

      units: {
        UNITE: "Unité",
        BOITE: "Boîte",
        PAQUET: "Paquet",
        LITRE: "Litre",
        KILOGRAMME: "Kilogramme",
        METRE: "Mètre",
      },

      movement: {
        entryTitle:
          "Enregistrer une entrée",

        exitTitle:
          "Enregistrer une sortie",

        selectedArticle:
          "Article sélectionné",

        quantity:
          "Quantité",

        date:
          "Date",

        supplier:
          "Fournisseur",

        beneficiary:
          "Bénéficiaire / Service destinataire",

        reference:
          "Référence de l’opération",

        reason:
          "Motif",

        documents:
          "Documents justificatifs",

        documentName:
          "Nom du document",

        addDocument:
          "Ajouter",

        noDocuments:
          "Aucun document ajouté.",

        remove:
          "Supprimer",

        cancel:
          "Annuler",

        saving:
          "Enregistrement...",

        confirmEntry:
          "Enregistrer l’entrée",

        confirmExit:
          "Enregistrer la sortie",

        required:
          "Veuillez renseigner tous les champs obligatoires.",

        insufficientStock:
          "La quantité demandée dépasse le stock disponible.",

        entrySuccess:
          "Entrée de stock enregistrée avec succès.",

        exitSuccess:
          "Sortie de stock enregistrée avec succès.",

        error:
          "Impossible d’enregistrer le mouvement.",
      },
      documentTypes: {
        INVOICE: "Facture",
        RECEIPT: "Reçu",
        DELIVERY_NOTE:
          "Bon de livraison",
        EXIT_VOUCHER:
          "Bon de sortie",
        OTHER: "Autre",
      },

      filters: {
        searchPlaceholder:
          "Rechercher par référence, désignation ou catégorie...",
        lowStockOnly:
          "Stock faible uniquement",
      },

      table: {
        article: "Article",
        category: "Catégorie",
        quantity: "Quantité",
        minimumQuantity: "Seuil minimum",
        location: "Localisation",
        actions: "Actions",

        loading:
          "Chargement des articles...",

        empty:
          "Aucun article trouvé.",

        lowStock:
          "Stock faible",

        availableStock:
          "Stock disponible",
      },

      actions: {
        entry:
          "Enregistrer une entrée",

        exit:
          "Enregistrer une sortie",

        details:
          "Voir les détails",

        edit:
          "Modifier",

        delete:
          "Supprimer",
      },
      page: {
        title: "Gestion du stock",
        description:
          "Gérez les articles, les entrées, les sorties et les demandes de fourniture.",

        addArticle:
          "Ajouter un article",

        loadError:
          "Impossible de charger les données du stock.",

        defaultUser:
          "Utilisateur",
      },

      stats: {
        articles:
          "Nombre d’articles",

        totalQuantity:
          "Quantité totale",

        alerts:
          "Alertes de stock",

        pendingRequests:
          "Demandes en attente",
      },

      history: {
        title:
          "Historique récent",

        count:
          "{{count}} mouvement(s)",

        empty:
          "Aucun mouvement enregistré.",

        entry:
          "Entrée de",

        exit:
          "Sortie de",

        reference:
          "Référence",

        viewAll:
          "Voir tout",
      },

      historyPage: {
        title:
          "Historique du stock",

        description:
          "Consultez l’ensemble des entrées et sorties enregistrées dans le stock.",

        back:
          "Retour au stock",

        total:
          "Total des mouvements",

        entries:
          "Entrées",

        exits:
          "Sorties",

        searchPlaceholder:
          "Rechercher par article, motif, référence, fournisseur ou utilisateur...",

        allTypes:
          "Tous les mouvements",

        entry:
          "Entrée",

        exit:
          "Sortie",

        results:
          "{{count}} mouvement(s)",

        loading:
          "Chargement de l’historique...",

        loadError:
          "Impossible de charger l’historique du stock.",

        empty:
          "Aucun mouvement trouvé",

        emptyDescription:
          "Aucun mouvement ne correspond aux critères sélectionnés.",

        quantity:
          "Quantité",

        reason:
          "Motif",

        supplier:
          "Fournisseur",

        beneficiary:
          "Bénéficiaire / Service",

        reference:
          "Référence",
      },

      request: {
        title:
          "Demandes de fourniture",

        create:
          "Créer une demande",

        count:
          "{{count}} demande(s)",

        empty:
          "Aucune demande enregistrée.",

        quantity:
          "Quantité demandée",

        approve:
          "Valider",

        reject:
          "Refuser",

        approved:
          "Validée",

        rejected:
          "Refusée",

        approvedSuccess:
          "Demande validée avec succès.",

        rejectedSuccess:
          "Demande refusée.",

        statusError:
          "Impossible de traiter la demande.",

        createSuccess:
          "Demande de fourniture créée avec succès.",

        createError:
          "Impossible de créer la demande.",

        promptArticle:
          "Saisissez la désignation de l’article demandé :",

        promptQuantity:
          "Saisissez la quantité demandée :",

        promptReason:
          "Saisissez le motif de la demande :",

        invalidQuantity:
          "La quantité demandée doit être supérieure à zéro.",

          modalTitle:
            "Créer une demande de fourniture",

          modalDescription:
            "Nouvelle demande de fourniture",

          modalHint:
            "Sélectionnez un article et précisez la quantité et le motif de la demande.",

          article:
            "Article",

          chooseArticle:
            "Sélectionner un article",

          availableQuantity:
            "Quantité disponible",

          requester:
            "Demandeur / Service",

          reason:
            "Motif de la demande",

          reasonPlaceholder:
            "Précisez le besoin ou la raison de la demande...",

          formRequired:
            "Veuillez remplir tous les champs obligatoires.",

          submit:
            "Envoyer la demande",

          saving:
            "Envoi...",
      },

      delete: {
        title:
          "Supprimer l’article",

        message:
          "Voulez-vous vraiment supprimer « {{name}} » ? Cette action est irréversible.",

        success:
          "Article supprimé avec succès.",

        error:
          "Impossible de supprimer l’article.",
      },

      common: {
        cancel:
          "Annuler",
      },

      pages: {
        back: "Retour au stock",

        addTitle:
          "Ajouter un article",

        addDescription:
          "Remplissez les informations du nouvel article.",

        editTitle:
          "Modifier l’article",

        editDescription:
          "Modifiez les informations de l’article sélectionné.",

        create:
          "Créer l’article",

        save:
          "Enregistrer les modifications",

        loading:
          "Chargement de l’article...",

        notFound:
          "Article introuvable.",

        invalidId:
          "Identifiant d’article invalide.",

        genericError:
          "Une erreur est survenue.",
      },

      details: {
        loading: "Chargement de l’article...",
        invalidId: "Identifiant d’article invalide.",
        notFound: "Article introuvable.",
        back: "Retour au stock",
        edit: "Modifier",

        information: "Informations de l’article",
        reference: "Référence",
        category: "Catégorie",
        quantity: "Quantité disponible",
        minimumQuantity: "Seuil minimum",
        location: "Localisation",
        updatedAt: "Dernière mise à jour",

        lowStock: "Stock faible",
        available: "Stock disponible",

        movements: "Mouvements",
        totalEntries: "Total des entrées",
        totalExits: "Total des sorties",

        history: "Historique de l’article",
        historyDescription:
          "Historique des entrées et sorties de cet article.",
        noMovements:
          "Aucun mouvement enregistré pour cet article.",

        entry: "Entrée",
        exit: "Sortie",

        reason: "Motif",
        supplier: "Fournisseur",
        beneficiary: "Bénéficiaire",
        movementReference: "Référence",
      },
    },

    lighting: {
      statuses: {
        ACTIVE: "Actif",
        INACTIVE: "Inactif",
        DAMAGED: "Endommagé",
        UNDER_MAINTENANCE: "En maintenance",
      },

      form: {
        generalInformation:
          "Informations générales",

        generalDescription:
          "Renseignez les informations du point lumineux en français et en arabe.",

        reference:
          "Référence",

        status:
          "Statut",

        designationFr:
          "Désignation en français",

        designationAr:
          "Désignation en arabe",

        zoneFr:
          "Zone en français",

        zoneAr:
          "Zone en arabe",

        addressFr:
          "Adresse en français",

        addressAr:
          "Adresse en arabe",

        installationDate:
          "Date d’installation",

        power:
          "Puissance",

        locationTitle:
          "Localisation GPS",

        locationDescription:
          "Renseignez les coordonnées géographiques du point lumineux.",

        latitude:
          "Latitude",

        longitude:
          "Longitude",

        required:
          "Tous les champs obligatoires doivent être remplis.",

        invalidPower:
          "La puissance doit être supérieure à zéro.",

        invalidLatitude:
          "La latitude doit être comprise entre -90 et 90.",

        invalidLongitude:
          "La longitude doit être comprise entre -180 et 180.",

        saving:
          "Enregistrement...",
      },

      pages: {
        back:
          "Retour à l’éclairage",

        addTitle:
          "Ajouter un point lumineux",

        addDescription:
          "Enregistrez un nouveau point d’éclairage public.",

        create:
          "Créer le point lumineux",

        editTitle:
          "Modifier le point lumineux",

        editDescription:
          "Modifiez les informations du point lumineux sélectionné.",

        save:
          "Enregistrer les modifications",

        loading:
          "Chargement du point lumineux...",

        invalidId:
          "Identifiant du point lumineux invalide.",

        notFound:
          "Point lumineux introuvable.",

        genericError:
          "Une erreur est survenue.",
      },

      table: {
        equipment:
          "Point lumineux",

        zone:
          "Zone",

        address:
          "Adresse",

        power:
          "Puissance",

        status:
          "Statut",

        actions:
          "Actions",

        loading:
          "Chargement des points lumineux...",

        empty:
          "Aucun point lumineux trouvé.",
      },

      actions: {
        reportFailure:
          "Déclarer une panne",

        failureAlreadyReported:
          "Une panne est déjà en cours de traitement",

        details:
          "Voir les détails",

        edit:
          "Modifier",

        delete:
          "Supprimer",
      },

      page: {
        title: "Gestion de l’éclairage public",
        description:
          "Gérez les points lumineux, les pannes et les interventions.",
        add: "Ajouter un point lumineux",
        count: "{{count}} point(s) lumineux trouvé(s)",
        loadError:
          "Impossible de charger les données de l’éclairage public.",
        defaultUser: "Utilisateur",
        history: "Historique",
      },

      stats: {
        active: "Points actifs",
        damaged: "Points endommagés",
        maintenance: "En maintenance",
        unresolved: "Pannes non résolues",
      },

      filters: {
        search:
          "Rechercher par référence, désignation, zone ou adresse...",
        allStatuses: "Tous les statuts",
      },

      failureStatuses: {
        REPORTED: "Signalée",
        IN_PROGRESS: "En cours",
        RESOLVED: "Résolue",
      },

      failure: {
        modalTitle: "Déclarer une panne",
        selectedLight: "Point lumineux sélectionné",
        description: "Description de la panne",
        descriptionPlaceholder:
          "Décrivez précisément le problème constaté...",
        required:
          "La description de la panne est obligatoire.",
        cancel: "Annuler",
        submit: "Déclarer la panne",
        saving: "Enregistrement...",
        success: "Panne déclarée avec succès.",
        error: "Impossible de déclarer la panne.",
        inProgressSuccess:
          "La panne est maintenant en cours de traitement.",
        resolvedSuccess:
          "La panne a été marquée comme résolue.",
        statusError:
          "Impossible de modifier le statut de la panne.",
      },

      failures: {
        title: "Pannes signalées",
        count: "{{count}} panne(s)",
        empty: "Aucune panne signalée.",
        reportedInfo:
          "Signalée le {{date}} par {{user}}",
        startTreatment:
          "Planifier une intervention",
        resolve:
          "Marquer comme résolue",
      },

      interventions: {
        title: "Interventions",
        count: "{{count}} intervention(s)",
        empty:
          "Aucune intervention enregistrée.",
        number: "Intervention #{{id}}",
        technician: "Technicien",
        date: "Date",
        completed: "Terminée",
        planned: "Planifiée",
        createSuccess:
          "L’intervention a été planifiée avec succès.",

        createError:
          "Impossible de planifier l’intervention.",

          complete:
            "Terminer l’intervention",

          completeSuccess:
            "L’intervention a été terminée avec succès.",

          completeError:
            "Impossible de terminer l’intervention.",
      },

      delete: {
        title: "Supprimer le point lumineux",
        message:
          "Voulez-vous vraiment supprimer « {{name}} » ? Cette action est irréversible.",
        success:
          "Point lumineux supprimé avec succès.",
        error:
          "Impossible de supprimer le point lumineux.",
      },

      common: {
        cancel: "Annuler",
      },

      details: {
        loading:
          "Chargement du point lumineux...",

        invalidId:
          "Identifiant du point lumineux invalide.",

        notFound:
          "Point lumineux introuvable.",

        back:
          "Retour à l’éclairage",

        edit:
          "Modifier",

        information:
          "Informations du point lumineux",

        reference:
          "Référence",

        zone:
          "Zone",

        address:
          "Adresse",

        power:
          "Puissance",

        installationDate:
          "Date d’installation",

        status:
          "Statut",

        latitude:
          "Latitude",

        longitude:
          "Longitude",
      },

      map: {
        title: "Carte des points lumineux",

        description:
          "Visualisez la localisation et l’état des points d’éclairage public.",

        status: "Statut",

        power: "Puissance",

        details: "Voir les détails",
      },

      interventionModal: {
        title: "Planifier une intervention",
        subtitle:
          "Affectez un technicien pour traiter la panne.",

        failure: "Panne concernée",

        technician: "Technicien",
        technicianPlaceholder:
          "Nom du technicien",

        date: "Date d’intervention",

        description: "Description de l’intervention",
        descriptionPlaceholder:
          "Décrivez les travaux à effectuer...",

        cancel: "Annuler",
        submit: "Planifier l’intervention",
        saving: "Planification...",

        errors: {
          technician:
            "Veuillez indiquer le technicien.",
          date:
            "Veuillez sélectionner une date d’intervention.",
          description:
            "Veuillez décrire l’intervention.",
        },
      },

      history: {
        title: "Historique de l’éclairage",
        description:
          "Consultez l’historique des pannes et des interventions.",
        back: "Retour à l’éclairage",

        totalFailures: "Total des pannes",
        totalInterventions: "Total des interventions",
        resolvedFailures: "Pannes résolues",

        search:
          "Rechercher par référence, équipement, technicien...",
        allStatuses: "Tous les statuts",

        associatedInterventions:
          "Interventions associées",
        noIntervention:
          "Aucune intervention associée à cette panne.",

        loading: "Chargement de l’historique...",
        empty: "Aucun résultat trouvé.",
        loadError:
          "Impossible de charger l’historique.",
      },
    },

    reports: {
      page: {
        title: "Rapports",
        description:
          "Générez et exportez les rapports relatifs aux utilisateurs, au patrimoine, au stock et à l’éclairage public.",
      },

      types: {
        USERS: {
          title: "Utilisateurs",
          description:
            "Consultez les utilisateurs, leurs rôles et leurs informations principales.",
        },

        ASSETS: {
          title: "Patrimoine",
          description:
            "Consultez l’état des biens, leurs affectations et leur situation.",
        },

        STOCK: {
          title: "Stock",
          description:
            "Analysez les articles, les mouvements et les demandes de fourniture.",
        },

        LIGHTING: {
          title: "Éclairage public",
          description:
            "Suivez les points lumineux, les pannes et les interventions.",
        },
      },

      generator: {
        title: "Générer un rapport",
        startDate: "Date de début",
        endDate: "Date de fin",
        generate: "Générer le rapport",
        generating: "Génération en cours...",
      },

      preview: {
        title: "Aperçu du rapport",
        period:
          "Période : {{start}} au {{end}}",
        search:
          "Rechercher dans le rapport...",
        empty:
          "Aucune donnée trouvée.",
        results:
          "{{count}} résultat(s)",
      },

      actions: {
        pdf: "Exporter en PDF",
        excel: "Exporter en Excel",
      },

      errors: {
        datesRequired:
          "Veuillez sélectionner une date de début et une date de fin.",

        invalidPeriod:
          "La date de début doit être antérieure ou égale à la date de fin.",

        generate:
          "Une erreur est survenue lors de la génération du rapport.",
      },

      statistics: {
        totalUsers:
          "Total des utilisateurs",

        admins:
          "Administrateurs",

        managers:
          "Gestionnaires",

        responsables:
          "Responsables",

        totalAssets:
          "Total des biens",

        availableAssets:
          "Biens disponibles",

        inUseAssets:
          "Biens en service",

        assetsMaintenance:
          "Biens en maintenance",

        totalValue:
          "Valeur totale",

        articles:
          "Articles",

        totalQuantity:
          "Quantité totale",

        stockAlerts:
          "Alertes de stock",

        pendingRequests:
          "Demandes en attente",

        totalLights:
          "Points lumineux",

        activeLights:
          "Points actifs",

        damagedLights:
          "Points endommagés",

        maintenanceLights:
          "Points en maintenance",

        failures:
          "Pannes signalées",

        interventions:
          "Interventions",
      },

      sections: {
        users:
          "Liste des utilisateurs",

        assets:
          "État du patrimoine",

        stockState:
          "État du stock",

        stockMovements:
          "Mouvements du stock",

        supplyRequests:
          "Demandes de fourniture",

        lights:
          "Points lumineux",

        failures:
          "Pannes signalées",

        interventions:
          "Interventions",
      },

      columns: {
        name:
          "Nom complet",

        email:
          "Adresse e-mail",

        phone:
          "Téléphone",

        cin:
          "CIN",

        gender:
          "Genre",

        role:
          "Rôle",

        inventory:
          "N° inventaire",

        designation:
          "Désignation",

        type:
          "Type",

        assignment:
          "Affectation",

        acquisitionDate:
          "Date d’acquisition",

        value:
          "Valeur",

        status:
          "Statut",

        reference:
          "Référence",

        article:
          "Article",

        category:
          "Catégorie",

        unit:
          "Unité",

        quantity:
          "Quantité",

        minimum:
          "Seuil minimum",

        location:
          "Localisation",

        date:
          "Date",

        movementType:
          "Type de mouvement",

        reason:
          "Motif",

        user:
          "Utilisateur",

        requestedQuantity:
          "Quantité demandée",

        requester:
          "Demandeur",

        zone:
          "Zone",

        address:
          "Adresse",

        power:
          "Puissance",

        installationDate:
          "Date d’installation",

        light:
          "Point lumineux",

        description:
          "Description",

        reportedAt:
          "Date de signalement",

        reportedBy:
          "Signalé par",

        failure:
          "Panne / Point lumineux",

        technician:
          "Technicien",
      },
    },

    notifications: {
      page: {
        title: "Notifications",
        description:
          "Consultez les alertes et les activités importantes de la plateforme.",
        loading:
          "Chargement des notifications...",
      },

      stats: {
        total: "Total",
        unread: "Non lues",
        read: "Lues",
      },

      filters: {
        all: "Toutes",
        unread: "Non lues",
        read: "Lues",
      },

      badges: {
        new: "Nouveau",
      },

      modules: {
        USERS: "Utilisateurs",
        ASSETS: "Patrimoine",
        STOCK: "Stock",
        LIGHTING: "Éclairage",
        SYSTEM: "Système",
      },

      actions: {
        markAllRead:
          "Tout marquer comme lu",
        delete: "Supprimer",
        cancel: "Annuler",
      },

      empty: {
        title:
          "Aucune notification",
        description:
          "Aucune notification ne correspond au filtre sélectionné.",
      },

      delete: {
        title:
          "Supprimer la notification ?",
        message:
          "Voulez-vous vraiment supprimer « {{name}} » ?",
      },

      success: {
        allRead:
          "Toutes les notifications ont été marquées comme lues.",
        deleted:
          "Notification supprimée avec succès.",
      },

      errors: {
        load:
          "Impossible de charger les notifications.",
        update:
          "Impossible de modifier la notification.",
        markAll:
          "Impossible de marquer les notifications comme lues.",
        delete:
          "Impossible de supprimer la notification.",
        notFound:
          "Notification introuvable.",
      },
    },

    settings: {
      page: {
        title: "Paramètres",
        description:
          "Configurez les préférences générales de la plateforme.",
      },

      commune: {
        title:
          "Informations de la commune",
        description:
          "Informations générales utilisées dans la plateforme.",
        name:
          "Nom de la commune",
        city:
          "Ville",
      },

      language: {
        title:
          "Langue",
        description:
          "Configurez la langue de l’interface.",
        label:
          "Langue préférée",
        help:
          "La langue sélectionnée sera appliquée après l’enregistrement des paramètres.",
      },

      notifications: {
        title:
          "Notifications",
        description:
          "Configurez les préférences liées aux notifications.",
        enable:
          "Activer les notifications",
        enableDescription:
          "Recevoir les alertes liées au stock, au patrimoine et à l’éclairage public.",
      },

      actions: {
        save:
          "Enregistrer les paramètres",
        saving:
          "Enregistrement...",
      },

      success: {
        saved:
          "Paramètres enregistrés avec succès.",
      },

      errors: {
        required:
          "Les informations de la commune sont obligatoires.",
        save:
          "Impossible d’enregistrer les paramètres.",
      },
    },

    profile: {
      page: {
        title: "Profil utilisateur",
        description:
          "Consultez vos informations personnelles et gérez votre compte.",
        loading: "Chargement du profil...",
      },

      card: {
        role: "Rôle",
        permissions: "Permissions",
        permissionCount: "permission(s)",
      },

      information: {
        title: "Informations personnelles",
        description:
          "Mettez à jour uniquement les informations que vous êtes autorisé à modifier.",
      },

      account: {
        title: "Informations du compte",
        description:
          "Ces informations sont gérées par l’administrateur et ne peuvent pas être modifiées depuis votre profil.",
      },

      password: {
        title: "Modifier le mot de passe",
        description:
          "Choisissez un nouveau mot de passe sécurisé.",
        minimum: "Minimum 8 caractères.",
      },

      fields: {
        firstNameFr: "Prénom (FR)",
        lastNameFr: "Nom (FR)",
        firstNameAr: "Prénom (AR)",
        lastNameAr: "Nom (AR)",
        phone: "Téléphone",
        email: "Adresse e-mail",
        cin: "CIN",
        gender: "Sexe",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe",
      },

      actions: {
        save: "Enregistrer les modifications",
        saving: "Enregistrement...",
        changePassword: "Modifier le mot de passe",
        changing: "Modification...",
      },

      success: {
        updated: "Profil mis à jour avec succès.",
        passwordChanged: "Mot de passe modifié avec succès.",
      },

      errors: {
        required: "Tous les champs modifiables sont obligatoires.",
        invalidEmail: "Le format de l’adresse e-mail est invalide.",
        update: "Impossible de mettre à jour le profil.",
        passwordLength: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        passwordMismatch: "La confirmation du mot de passe ne correspond pas.",
        samePassword: "Le nouveau mot de passe doit être différent du mot de passe actuel.",
        passwordChange: "Impossible de modifier le mot de passe.",
        load: "Impossible de charger le profil utilisateur.",
      },
    },

    errors: {
      unauthorized: {
        code: "Erreur 403",
        title:
          "Accès non autorisé",
        description:
          "Votre compte ne dispose pas des permissions nécessaires pour accéder à cette ressource.",
      },

      notFound: {
        code: "Erreur 404",
        title:
          "Page introuvable",
        description:
          "La page que vous recherchez n’existe pas ou a été déplacée.",
      },

      actions: {
        dashboard:
          "Retour au tableau de bord",
      },
    },
    footer: {
      rights:
        "Tous droits réservés.",
      developedBy:
        "Conçu et développé par",
      developer1:
        "SARGHINI Fatima-azzahrae",
      and: "&",
      developer2:
        "EL-ANNOUNI Asmae",
    },
};

export default fr;