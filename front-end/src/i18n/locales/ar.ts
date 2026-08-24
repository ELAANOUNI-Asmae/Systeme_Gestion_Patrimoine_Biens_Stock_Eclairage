const ar = {
  app: {
    name: "SGPBSE",
    subtitle: "نظام تدبير الممتلكات الجماعية",
  },

  header: {
    profile: "ملفي الشخصي",
    logout: "تسجيل الخروج",
    menu: "فتح أو إغلاق القائمة",
    language: "اللغة",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    notifications: "الإشعارات",
  },

  menu: {
    dashboard: "لوحة القيادة",
    users: "المستخدمون",
    roles: "الأدوار",
    assets: "الممتلكات",
    stock: "المخزون",
    lighting: "الإنارة العمومية",
    reports: "التقارير",
    notifications: "الإشعارات",
    profile: "ملفي الشخصي",
    settings: "الإعدادات",
  },

  auth: {
    welcome: "مرحباً",

    description:
      "سجّل الدخول للوصول إلى منصة تدبير الممتلكات والمخزون والإنارة العمومية.",

    reservedAccess:
      "الولوج مخصص للمستخدمين المصرح لهم.",

    heroTitle:
      "تدبير مركزي، بسيط وذكي",

    heroDescription:
      "تتبّع الممتلكات، ودبّر المخزون، ونظّم عمليات الإنارة العمومية من خلال منصة موحدة.",

    email: "البريد الإلكتروني",

    emailPlaceholder:
      "أدخل بريدك الإلكتروني",

    emailRequired:
      "البريد الإلكتروني إجباري.",

    emailInvalid:
      "صيغة البريد الإلكتروني غير صحيحة.",

    password: "كلمة المرور",

    passwordPlaceholder:
      "أدخل كلمة المرور",

    passwordRequired:
      "كلمة المرور إجبارية.",

    passwordMin:
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",

    rememberMe: "تذكرني",

    forgotPassword:
      "نسيت كلمة المرور؟",

    login: "تسجيل الدخول",

    loginLoading:
      "جارٍ تسجيل الدخول...",

    invalidCredentials:
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

    loginError:
      "حدث خطأ أثناء تسجيل الدخول.",

    demoAccounts:
      "حسابات تجريبية",

    admin: "المدير",

    agent: "الموظف",

    forgot: {
      title: "نسيت كلمة المرور",
      description:
        "أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور.",
      emailRequired:
        "يرجى إدخال بريدك الإلكتروني.",
      emailInvalid:
        "البريد الإلكتروني غير صالح.",
      send:
        "إرسال الرابط",
      sending:
        "جارٍ الإرسال...",
      sendError:
        "تعذر إرسال الرابط. يرجى المحاولة مرة أخرى.",
      backToLogin:
        "العودة إلى تسجيل الدخول",

      successTitle:
        "تم إرسال البريد الإلكتروني",
      successDescription:
        "إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور. يرجى التحقق من صندوق الوارد.",
    },

    reset: {
      title:
        "إعادة تعيين كلمة المرور",
      description:
        "أدخل كلمة المرور الجديدة وقم بتأكيدها.",

      newPassword:
        "كلمة المرور الجديدة",
      newPasswordPlaceholder:
        "8 أحرف على الأقل",

      confirmPassword:
        "تأكيد كلمة المرور",
      confirmPasswordPlaceholder:
        "أعد إدخال كلمة المرور",

      passwordRequired:
        "يرجى إدخال كلمة مرور جديدة.",
      passwordMin:
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
      confirmRequired:
        "يرجى تأكيد كلمة المرور.",
      mismatch:
        "كلمتا المرور غير متطابقتين.",
      invalidToken:
        "رابط إعادة تعيين كلمة المرور غير صالح أو غير مكتمل.",

      submit:
        "إعادة تعيين كلمة المرور",
      loading:
        "جارٍ إعادة التعيين...",

      error:
        "تعذر إعادة تعيين كلمة المرور. قد يكون الرابط غير صالح أو منتهي الصلاحية.",

      showPassword:
        "إظهار كلمة المرور",
      hidePassword:
        "إخفاء كلمة المرور",
      showConfirmation:
        "إظهار تأكيد كلمة المرور",
      hideConfirmation:
        "إخفاء تأكيد كلمة المرور",

      successTitle:
        "تمت إعادة تعيين كلمة المرور",
      successDescription:
        "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",

      login:
        "تسجيل الدخول",
    },
  },

  

  dashboard: {
    welcome: "مرحباً {{name}}",

    description:
      "نظرة عامة على الممتلكات الجماعية والمخزون والإنارة العمومية.",

    connectedAs:
      "متصل بصفة",

    statistics: {
      assets: "الممتلكات",
      assetsDescription:
        "الممتلكات المسجلة",

      articles: "المواد",
      articlesDescription:
        "مراجع المخزون",

      lighting:
        "نقاط الإنارة",
      lightingDescription:
        "معدات الإنارة المتابعة",

      users: "المستخدمون",
      usersDescription:
        "الحسابات المسجلة",
    },

    alerts: {
      stock:
        "تنبيهات المخزون",

      failures:
        "الأعطاب المبلغ عنها",

      maintenance:
        "ممتلكات قيد الصيانة",

      movements:
        "الحركات الأخيرة",

      recent:
        "التنبيهات الأخيرة",

      recentDescription:
        "العناصر التي تحتاج إلى الانتباه",

      lowStock:
        "مخزون منخفض",

      lightingFailure:
        "عطب في الإنارة",

      assetMaintenance:
        "ممتلك قيد الصيانة",

      empty:
        "لا توجد تنبيهات حالياً.",
    },

    stock: {
      title:
        "حركات المخزون",

      subtitle:
        "عمليات الدخول والخروج الأخيرة",

      entries: "الدخول",
      exits: "الخروج",
    },

    lighting: {
      title:
        "حالة الإنارة",

      subtitle:
        "توزيع نقاط الإنارة",

      active: "تعمل",
      damaged: "معطلة",
      maintenance: "صيانة",
    },

    assets: {
      title:
        "حالة الممتلكات",

      subtitle:
        "توزيع الممتلكات حسب الحالة",

      inUse:
        "قيد الاستعمال",

      available:
        "متاح",

      maintenance:
        "صيانة",

      others:
        "أخرى",
    },


  },

  users: {
      title: "تدبير المستخدمين",
      description: "عرض وتدبير حسابات المستخدمين.",
      add: "إضافة مستخدم",
      edit: "تعديل المستخدم",
      delete: "حذف",
      view: "عرض",
      modify: "تعديل",

      count: "{{count}} مستخدم",
      loading: "جارٍ تحميل المستخدمين...",
      loadError: "تعذر تحميل المستخدمين.",

      deleteTitle: "حذف المستخدم",
      deleteMessage:
        "هل تريد فعلاً حذف {{name}}؟ لا يمكن التراجع عن هذه العملية.",
      deleteSuccess: "تم حذف المستخدم بنجاح.",
      deleteError: "تعذر حذف المستخدم.",

      searchPlaceholder:
        "البحث بالاسم أو البريد الإلكتروني أو CIN...",
      allRoles: "جميع الأدوار",

      empty: "لم يتم العثور على أي مستخدم",
      emptyDescription:
        "غيّر معايير البحث أو أضف مستخدماً جديداً.",

      columns: {
        user: "المستخدم",
        phone: "الهاتف",
        cin: "CIN",
        role: "الدور",
        actions: "الإجراءات",
      },

      form: {
        firstnameAr: "الاسم بالعربية",
        lastnameAr: "النسب بالعربية",
        arabicIdentity: "الاسم باللغة العربية",
        firstname: "الاسم",
        lastname: "النسب",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        cin: "CIN",
        gender: "الجنس",
        role: "الدور",
        password: "كلمة المرور",

        male: "ذكر",
        female: "أنثى",

        passwordPlaceholder: "8 أحرف على الأقل",
        passwordHint: "إجبارية عند إنشاء المستخدم.",

        saving: "جارٍ الحفظ...",

        required:
          "يجب ملء جميع الحقول الإجبارية.",
        firstnameMin:
          "يجب أن يتكون الاسم من 3 أحرف على الأقل.",
        lastnameMin:
          "يجب أن يتكون النسب من 3 أحرف على الأقل.",
        invalidEmail:
          "البريد الإلكتروني غير صالح.",
        invalidPhone:
          "رقم الهاتف المغربي غير صالح.",
        invalidCin: "رقم CIN غير صالح.",
        invalidPassword:
          "يجب أن تتضمن كلمة المرور 8 أحرف على الأقل، وحرفاً كبيراً وصغيراً ورقماً ورمزاً خاصاً.",
      },

      gender: {
        HOMME: "ذكر",
        FEMME: "أنثى",
      },

      details: {
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        cin: "CIN",
        gender: "الجنس",
        role: "الدور",
      },

      pages: {
        back: "العودة إلى المستخدمين",

        addTitle: "إضافة مستخدم",
        addDescription:
          "أدخل معلومات الحساب الجديد.",
        create: "إنشاء المستخدم",

        editTitle: "تعديل المستخدم",
        editDescription:
          "عدّل معلومات الحساب المحدد.",
        save: "حفظ التعديلات",

        detailsLoading:
          "جارٍ تحميل المستخدم...",
        notFound:
          "المستخدم غير موجود.",

        passwordRequired:
          "كلمة المرور إجبارية.",

        genericError:
          "حدث خطأ.",
      },
    },

    roles: {
      title: "تدبير الأدوار",
      description:
        "تدبير الأدوار والصلاحيات المرتبطة بها.",

      add: "إضافة دور",
      edit: "تعديل",
      delete: "حذف",
      view: "عرض",

      searchPlaceholder:
        "البحث عن دور...",
      count: "{{count}} دور",

      loading:
        "جارٍ تحميل الأدوار...",
      loadError:
        "تعذر تحميل الأدوار.",

      empty:
        "لم يتم العثور على أي دور",
      emptyDescription:
        "غيّر معايير البحث أو أضف دوراً جديداً.",

      deleteTitle:
        "حذف الدور",
      deleteMessage:
        "هل تريد فعلاً حذف الدور « {{name}} »؟ لا يمكن التراجع عن هذه العملية.",
      deleteSuccess:
        "تم حذف الدور بنجاح.",
      deleteError:
        "تعذر حذف الدور.",
      adminProtected:
        "لا يمكن حذف دور مدير النظام.",

      columns: {
        role: "الدور",
        permissions: "الصلاحيات",
        actions: "الإجراءات",
      },

      names: {
        ADMIN: "مدير النظام",
        GESTIONNAIRE: "المسيّر",
        RESPONSABLE: "المسؤول",
        UTILISATEUR: "المستخدم",
      },

      permissions: {
        USER_READ:
          "عرض المستخدمين",
        USER_CREATE:
          "إضافة مستخدم",
        USER_UPDATE:
          "تعديل مستخدم",
        USER_DELETE:
          "حذف مستخدم",

        ROLE_MANAGE:
          "تدبير الأدوار",

        BIEN_MANAGE:
          "تدبير الممتلكات",

        STOCK_MANAGE:
          "تدبير المخزون",

        ECLAIRAGE_MANAGE:
          "تدبير الإنارة العمومية",

        REPORT_GENERATE:
          "إنشاء التقارير",
      },

      form: {
        name:
          "الاسم التقني للدور",

        namePlaceholder:
          "مثال: GESTIONNAIRE_STOCK",

        permissions: "الصلاحيات",

        permissionsDescription:
          "حدد العمليات المسموح بها لهذا الدور.",

        selectAll:
          "تحديد الكل",

        clearAll:
          "إلغاء تحديد الكل",

        nameRequired:
          "اسم الدور إجباري.",

        permissionRequired:
          "اختر صلاحية واحدة على الأقل.",

        saving:
          "جارٍ الحفظ...",
      },

      pages: {
        back:
          "العودة إلى الأدوار",

        addTitle:
          "إضافة دور",

        editTitle:
          "تعديل الدور",

        loading:
          "جارٍ تحميل الدور...",

        notFound:
          "الدور غير موجود.",

        genericError:
          "حدث خطأ.",

        create:
          "إنشاء الدور",

        save:
          "حفظ التعديلات",

        associatedPermissions:
          "الصلاحيات المرتبطة",

        permissionsCount:
          "{{count}} صلاحية",
      },
    },

    biens: {
      title: "تدبير الممتلكات",
      description:
        "عرض وتدبير الممتلكات الجماعية.",

      add: "إضافة ممتلك",
      edit: "تعديل",
      view: "عرض",
      delete: "حذف",

      count: "{{count}} ممتلك",
      loading: "جارٍ تحميل الممتلكات...",
      loadError: "تعذر تحميل الممتلكات.",

      empty: "لم يتم العثور على أي ممتلك",
      emptyDescription:
        "غيّر معايير البحث أو أضف ممتلكاً جديداً.",

      searchPlaceholder:
        "البحث بالتسمية أو رقم الجرد أو التخصيص...",

      allStatuses: "جميع الحالات",
      allTypes: "جميع الأنواع",

      types: {
        VEHICLE: "مركبة",
        MACHINE: "آلة",
        REAL_ESTATE: "عقار",
      },

      statuses: {
        AVAILABLE: "متاح",
        IN_USE: "قيد الاستعمال",
        RENTED: "مؤجّر",
        UNDER_MAINTENANCE: "قيد الصيانة",
        OUT_OF_SERVICE: "خارج الخدمة",
        DAMAGED: "متضرر",
        DISPOSED: "مفوّت",
        SOLD: "مباع",
        ARCHIVED: "مؤرشف",
      },

      columns: {
        bien: "الممتلك",
        type: "النوع",
        assignment: "التخصيص",
        status: "الحالة",
        value: "القيمة",
        actions: "الإجراءات",
      },

      form: {
        type: "نوع الممتلك",
        designation: "التسمية",
        designationAr: "التسمية بالعربية",
        inventoryId: "رقم الجرد",
        status: "الحالة",
        acquisitionDate: "تاريخ الاقتناء",
        purchaseValue: "قيمة الاقتناء (درهم)",
        assignment: "التخصيص",
        assignmentAr: "التخصيص بالعربية",

        documents: "الوثائق المرتبطة",
        addDocument: "إضافة وثيقة",
        documentName: "اسم الوثيقة",
        documentType: "نوع الوثيقة",
        chooseFile: "اختيار ملف",

        required:
          "يجب ملء جميع الحقول الإجبارية.",

        invalidValue:
          "يجب أن تكون قيمة الاقتناء أكبر من صفر.",

        saving: "جارٍ الحفظ...",

        vehicleSection: "معلومات المركبة",
        machineSection: "معلومات الآلة",
        realEstateSection: "معلومات العقار",

        registrationNumber: "رقم التسجيل",
        brand: "العلامة",
        model: "الطراز",
        year: "السنة",
        chassisNumber: "رقم الهيكل",

        serialNumber: "الرقم التسلسلي",
        technicalReference: "المرجع التقني",

        address: "العنوان",
        surface: "المساحة (م²)",
        landTitleNumber: "رقم الرسم العقاري",
        propertyType: "نوع العقار",

        removeDocument: "إزالة",
        noDocuments: "لم تتم إضافة أي وثيقة.",
      },

      documentTypes: {
        INVOICE: "فاتورة",
        RECEIPT: "وصل",
        CONTRACT: "عقد",
        REGISTRATION: "البطاقة الرمادية",
        INSURANCE: "التأمين",
        CERTIFICATE: "شهادة",
        PHOTO: "صورة",
        OTHER: "أخرى",
      },

      pages: {
        back: "العودة إلى الممتلكات",
        addTitle: "إضافة ممتلك",
        editTitle: "تعديل الممتلك",
        detailsLoading: "جارٍ تحميل الممتلك...",
        notFound: "الممتلك غير موجود.",
        create: "إنشاء الممتلك",
        save: "حفظ التعديلات",
        genericError: "حدث خطأ.",

        information: "المعلومات العامة",
        specificInformation: "المعلومات الخاصة بالممتلك",
        noSpecificInformation: "لم يتم إدخال معلومات خاصة بهذا الممتلك.",

        documents: "الوثائق المرتبطة",
        noDocuments: "لا توجد وثائق مرتبطة بهذا الممتلك.",
      },

      operations: {
        button: "عمليات على الممتلك",

        rent: "تأجير الممتلك",
        sell: "بيع الممتلك",

        rentTitle: "تأجير الممتلك",
        sellTitle: "بيع الممتلك",

        selectedAsset:
          "الممتلك المحدد",

        partyType: "الصفة",
        person: "شخص",
        company: "شركة",

        tenantName: "اسم المستأجر",
        buyerName: "اسم المشتري",

        cin: "البطاقة الوطنية",
        ice: "ICE",
        phone: "الهاتف",
        address: "العنوان",

        startDate: "تاريخ البداية",
        endDate: "تاريخ النهاية",

        monthlyAmount:
          "مبلغ الإيجار الشهري (درهم)",

        saleDate: "تاريخ البيع",
        salePrice: "ثمن البيع (درهم)",

        contractReference:
          "مرجع العقد",

        contract: "العقد",

        receipt:
          "الوصل / الإثبات",

        notes: "ملاحظات",

        cancel: "إلغاء",

        confirmRent:
          "تسجيل الإيجار",

        confirmSale:
          "تأكيد البيع",

        saving: "جارٍ الحفظ...",

        required:
          "يرجى ملء المعلومات الإجبارية.",

        rentSuccess:
          "تم تسجيل الإيجار بنجاح.",

        saleSuccess:
          "تم تسجيل البيع بنجاح.",

        error:
          "تعذر تسجيل العملية.",

          exit: "إخراج الممتلك من الذمة",

          exitTitle:
            "إخراج الممتلك من الذمة",

          exitDescription:
            "سجّل الخروج النهائي لهذا الممتلك من الملك الجماعي.",

          exitReason:
            "سبب الخروج",

          exitDate:
            "تاريخ الخروج",

          exitReference:
            "المرجع",

          exitDocument:
            "الوثيقة المثبتة",

          exitNotes:
            "ملاحظات",

          confirmExit:
            "أرشفة الممتلك",

          exitSuccess:
            "تمت أرشفة الممتلك بنجاح.",

          exitWarning:
            "هذه العملية ستزيل الممتلك نهائياً من قائمة الممتلكات النشطة.",

          exitReasons: {
            DISPOSED: "مفوّت",
            DESTROYED: "متلف",
            TRANSFERRED: "محول",
            REFORMED: "خارج الاستعمال",
            OTHER: "أخرى",
          },
      },

      archive: {
        button: "السجل / الأرشيف",
        title: "سجل الممتلكات",
        description:
          "عرض الممتلكات التي خرجت من الملك الجماعي.",

        searchPlaceholder:
          "البحث بالتسمية أو رقم الجرد...",

        allReasons: "جميع الأسباب",

        count: "{{count}} ممتلك مؤرشف",

        loading:
          "جارٍ تحميل السجل...",

        empty:
          "لا توجد ممتلكات مؤرشفة",

        emptyDescription:
          "ستظهر هنا الممتلكات المباعة أو المفوتة أو التي خرجت من الملك الجماعي.",

        columns: {
          bien: "الممتلك",
          type: "النوع",
          exitDate: "تاريخ الخروج",
          reason: "السبب",
          value: "قيمة الاقتناء",
          actions: "الإجراءات",
        },

        reasons: {
          SOLD: "مباع",
          DISPOSED: "مفوّت",
          DESTROYED: "متلف",
          TRANSFERRED: "محول",
          REFORMED: "خارج الاستعمال",
          OTHER: "أخرى",
        },

        back: "العودة إلى الممتلكات",

        archivedBadge: "مؤرشف",

        notes: "ملاحظات",

        saleInformation:
          "معلومات البيع",

        buyer: "المشتري",
        saleDate: "تاريخ البيع",
        salePrice: "ثمن البيع",
      },
    },

    stock: {
      form: {
        generalInformation:
          "المعلومات العامة",

        generalDescription:
          "أدخل معلومات المادة بالفرنسية والعربية.",

        frenchInformation:
          "المعلومات بالفرنسية",

        arabicInformation:
          "المعلومات بالعربية",

        stockInformation:
          "معلومات المخزون",

        reference:
          "المرجع",

        unit:
          "الوحدة",

        designationFr:
          "التسمية بالفرنسية",

        designationAr:
          "التسمية بالعربية",

        categoryFr:
          "الفئة بالفرنسية",

        categoryAr:
          "الفئة بالعربية",

        locationFr:
          "الموقع بالفرنسية",

        locationAr:
          "الموقع بالعربية",

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
          "الكمية الأولية",

        minimumQuantity:
          "الحد الأدنى",

        required:
          "جميع الحقول إلزامية.",

        quantityError:
          "لا يمكن أن تكون الكمية سالبة.",

        minimumQuantityError:
          "لا يمكن أن يكون الحد الأدنى سالباً.",

        saving:
          "جارٍ الحفظ...",
      },

      units: {
        UNITE: "وحدة",
        BOITE: "علبة",
        PAQUET: "حزمة",
        LITRE: "لتر",
        KILOGRAMME: "كيلوغرام",
        METRE: "متر",
      },

      movement: {
        entryTitle:
          "تسجيل دخول إلى المخزون",

        exitTitle:
          "تسجيل خروج من المخزون",

        selectedArticle:
          "المادة المحددة",

        quantity:
          "الكمية",

        date:
          "التاريخ",

        supplier:
          "المورد",

        beneficiary:
          "المستفيد / المصلحة المستفيدة",

        reference:
          "مرجع العملية",

        reason:
          "سبب العملية",

        documents:
          "الوثائق المرفقة",

        documentName:
          "اسم الوثيقة",

        addDocument:
          "إضافة",

        noDocuments:
          "لم تتم إضافة أي وثيقة.",

        remove:
          "حذف",

        cancel:
          "إلغاء",

        saving:
          "جارٍ التسجيل...",

        confirmEntry:
          "تسجيل الدخول",

        confirmExit:
          "تسجيل الخروج",

        required:
          "يرجى إدخال جميع المعلومات الإلزامية.",

        insufficientStock:
          "الكمية المطلوبة أكبر من الكمية المتوفرة في المخزون.",

        entrySuccess:
          "تم تسجيل دخول المخزون بنجاح.",

        exitSuccess:
          "تم تسجيل خروج المخزون بنجاح.",

        error:
          "تعذر تسجيل حركة المخزون.",
      },

      documentTypes: {
        INVOICE: "فاتورة",
        RECEIPT: "وصل",
        DELIVERY_NOTE:
          "وصل التسليم",
        EXIT_VOUCHER:
          "إذن الخروج",
        OTHER: "أخرى",
      },
      filters: {
        searchPlaceholder:
          "البحث بالمرجع أو التسمية أو الفئة...",
        lowStockOnly:
          "المخزون المنخفض فقط",
      },

      table: {
        article: "المادة",
        category: "الفئة",
        quantity: "الكمية",
        minimumQuantity: "الحد الأدنى",
        location: "الموقع",
        actions: "الإجراءات",

        loading:
          "جاري تحميل المواد...",

        empty:
          "لم يتم العثور على أي مادة.",

        lowStock:
          "مخزون منخفض",

        availableStock:
          "المخزون متوفر",
      },

      actions: {
        entry:
          "تسجيل دخول للمخزون",

        exit:
          "تسجيل خروج من المخزون",

        details:
          "عرض التفاصيل",

        edit:
          "تعديل",

        delete:
          "حذف",
      },
      page: {
        title:
          "تدبير المخزون",

        description:
          "تدبير المواد وعمليات الدخول والخروج وطلبات التزويد.",

        addArticle:
          "إضافة مادة",

        loadError:
          "تعذر تحميل بيانات المخزون.",

        defaultUser:
          "مستخدم",
      },

      stats: {
        articles:
          "عدد المواد",

        totalQuantity:
          "الكمية الإجمالية",

        alerts:
          "تنبيهات المخزون",

        pendingRequests:
          "الطلبات قيد الانتظار",
      },

      history: {
        title:
          "السجل الأخير",

        count:
          "{{count}} حركة",

        empty:
          "لم يتم تسجيل أي حركة.",

        entry:
          "دخول",

        exit:
          "خروج",

        reference:
          "المرجع",

        viewAll:
          "عرض الكل",
      },

      historyPage: {
        title:
          "سجل حركات المخزون",

        description:
          "عرض جميع عمليات الدخول والخروج المسجلة في المخزون.",

        back:
          "العودة إلى المخزون",

        total:
          "إجمالي الحركات",

        entries:
          "عمليات الدخول",

        exits:
          "عمليات الخروج",

        searchPlaceholder:
          "البحث بالمادة أو السبب أو المرجع أو المورد أو المستخدم...",

        allTypes:
          "جميع الحركات",

        entry:
          "دخول",

        exit:
          "خروج",

        results:
          "{{count}} حركة",

        loading:
          "جارٍ تحميل السجل...",

        loadError:
          "تعذر تحميل سجل المخزون.",

        empty:
          "لم يتم العثور على أي حركة",

        emptyDescription:
          "لا توجد حركة مطابقة لمعايير البحث المحددة.",

        quantity:
          "الكمية",

        reason:
          "السبب",

        supplier:
          "المورد",

        beneficiary:
          "المستفيد / المصلحة",

        reference:
          "المرجع",
      },

      request: {
        title:
          "طلبات التزويد",

        create:
          "إنشاء طلب",

        count:
          "{{count}} طلب",

        empty:
          "لا توجد أي طلبات مسجلة.",

        quantity:
          "الكمية المطلوبة",

        approve:
          "قبول",

        reject:
          "رفض",

        approved:
          "مقبول",

        rejected:
          "مرفوض",

        approvedSuccess:
          "تم قبول الطلب بنجاح.",

        rejectedSuccess:
          "تم رفض الطلب.",

        statusError:
          "تعذر معالجة الطلب.",

        createSuccess:
          "تم إنشاء طلب التزويد بنجاح.",

        createError:
          "تعذر إنشاء طلب التزويد.",

        promptArticle:
          "أدخل تسمية المادة المطلوبة:",

        promptQuantity:
          "أدخل الكمية المطلوبة:",

        promptReason:
          "أدخل سبب الطلب:",

        invalidQuantity:
          "يجب أن تكون الكمية المطلوبة أكبر من صفر.",
          modalTitle:
            "إنشاء طلب تزويد",

          modalDescription:
            "طلب تزويد جديد",

          modalHint:
            "اختر المادة وحدد الكمية المطلوبة وسبب الطلب.",

          article:
            "المادة",

          chooseArticle:
            "اختر مادة",

          availableQuantity:
            "الكمية المتوفرة",

          requester:
            "الطالب / المصلحة",

          reason:
            "سبب الطلب",

          reasonPlaceholder:
            "أدخل الحاجة أو سبب طلب التزويد...",

          formRequired:
            "يرجى ملء جميع الحقول الإلزامية.",

          submit:
            "إرسال الطلب",

          saving:
            "جارٍ الإرسال...",
      },

      delete: {
        title:
          "حذف المادة",

        message:
          "هل تريد فعلاً حذف « {{name}} »؟ لا يمكن التراجع عن هذه العملية.",

        success:
          "تم حذف المادة بنجاح.",

        error:
          "تعذر حذف المادة.",
      },

      common: {
        cancel:
          "إلغاء",
      },
      pages: {
        back:
          "العودة إلى المخزون",

        addTitle:
          "إضافة مادة",

        addDescription:
          "أدخل معلومات المادة الجديدة.",

        editTitle:
          "تعديل المادة",

        editDescription:
          "عدّل معلومات المادة المحددة.",

        create:
          "إنشاء المادة",

        save:
          "حفظ التعديلات",

        loading:
          "جارٍ تحميل المادة...",

        notFound:
          "المادة غير موجودة.",

        invalidId:
          "معرّف المادة غير صالح.",

        genericError:
          "حدث خطأ.",
      },

      details: {
        loading: "جارٍ تحميل المادة...",
        invalidId: "معرّف المادة غير صالح.",
        notFound: "المادة غير موجودة.",
        back: "العودة إلى المخزون",
        edit: "تعديل",

        information: "معلومات المادة",
        reference: "المرجع",
        category: "الفئة",
        quantity: "الكمية المتوفرة",
        minimumQuantity: "الحد الأدنى",
        location: "الموقع",
        updatedAt: "آخر تحديث",

        lowStock: "مخزون منخفض",
        available: "المخزون متوفر",

        movements: "الحركات",
        totalEntries: "إجمالي الإدخالات",
        totalExits: "إجمالي الإخراجات",

        history: "سجل المادة",
        historyDescription:
          "سجل عمليات إدخال وإخراج هذه المادة.",
        noMovements:
          "لا توجد أي حركة مسجلة لهذه المادة.",

        entry: "إدخال",
        exit: "إخراج",

        reason: "السبب",
        supplier: "المورّد",
        beneficiary: "المستفيد",
        movementReference: "المرجع",
      },
    },

    lighting: {
      statuses: {
        ACTIVE: "يعمل",
        INACTIVE: "غير نشط",
        DAMAGED: "معطل",
        UNDER_MAINTENANCE: "قيد الصيانة",
      },

      form: {
        generalInformation:
          "المعلومات العامة",

        generalDescription:
          "أدخل معلومات نقطة الإنارة بالفرنسية والعربية.",

        reference:
          "المرجع",

        status:
          "الحالة",

        designationFr:
          "التسمية بالفرنسية",

        designationAr:
          "التسمية بالعربية",

        zoneFr:
          "المنطقة بالفرنسية",

        zoneAr:
          "المنطقة بالعربية",

        addressFr:
          "العنوان بالفرنسية",

        addressAr:
          "العنوان بالعربية",

        installationDate:
          "تاريخ التركيب",

        power:
          "القدرة",

        locationTitle:
          "الموقع الجغرافي GPS",

        locationDescription:
          "أدخل الإحداثيات الجغرافية لنقطة الإنارة.",

        latitude:
          "خط العرض",

        longitude:
          "خط الطول",

        required:
          "يجب ملء جميع الحقول الإلزامية.",

        invalidPower:
          "يجب أن تكون القدرة أكبر من صفر.",

        invalidLatitude:
          "يجب أن يكون خط العرض بين -90 و90.",

        invalidLongitude:
          "يجب أن يكون خط الطول بين -180 و180.",

        saving:
          "جارٍ الحفظ...",
      },

      pages: {
        back:
          "العودة إلى الإنارة",

        addTitle:
          "إضافة نقطة إنارة",

        addDescription:
          "سجّل نقطة جديدة للإنارة العمومية.",

        create:
          "إنشاء نقطة الإنارة",

        editTitle:
          "تعديل نقطة الإنارة",

        editDescription:
          "عدّل معلومات نقطة الإنارة المحددة.",

        save:
          "حفظ التعديلات",

        loading:
          "جارٍ تحميل نقطة الإنارة...",

        invalidId:
          "معرّف نقطة الإنارة غير صالح.",

        notFound:
          "نقطة الإنارة غير موجودة.",

        genericError:
          "حدث خطأ.",
      },

      table: {
        equipment:
          "نقطة الإنارة",

        zone:
          "المنطقة",

        address:
          "العنوان",

        power:
          "القدرة",

        status:
          "الحالة",

        actions:
          "الإجراءات",

        loading:
          "جارٍ تحميل نقاط الإنارة...",

        empty:
          "لم يتم العثور على أي نقطة إنارة.",
      },

      actions: {
        reportFailure:
          "التبليغ عن عطب",

        failureAlreadyReported:
          "يوجد عطب قيد المعالجة بالفعل",

        details:
          "عرض التفاصيل",

        edit:
          "تعديل",

        delete:
          "حذف",
      },

      page: {
        title: "تدبير الإنارة العمومية",
        description:
          "تدبير نقاط الإنارة والأعطاب والتدخلات.",
        add: "إضافة نقطة إنارة",
        count: "تم العثور على {{count}} نقطة إنارة",
        loadError:
          "تعذر تحميل بيانات الإنارة العمومية.",
        defaultUser: "مستخدم",
        history: "السجل",
      },

      stats: {
        active: "نقاط تعمل",
        damaged: "نقاط معطلة",
        maintenance: "قيد الصيانة",
        unresolved: "أعطاب غير محلولة",
      },

      filters: {
        search:
          "البحث بالمرجع أو التسمية أو المنطقة أو العنوان...",
        allStatuses: "جميع الحالات",
      },

      failureStatuses: {
        REPORTED: "تم التبليغ",
        IN_PROGRESS: "قيد المعالجة",
        RESOLVED: "تم الحل",
      },

      failure: {
        modalTitle: "التبليغ عن عطب",
        selectedLight: "نقطة الإنارة المحددة",
        description: "وصف العطب",
        descriptionPlaceholder:
          "صف المشكل الذي تمت ملاحظته بدقة...",
        required:
          "وصف العطب إلزامي.",
        cancel: "إلغاء",
        submit: "إرسال التبليغ",
        saving: "جارٍ التسجيل...",
        success: "تم التبليغ عن العطب بنجاح.",
        error: "تعذر التبليغ عن العطب.",
        inProgressSuccess:
          "العطب الآن قيد المعالجة.",
        resolvedSuccess:
          "تم تسجيل العطب كمحلول.",
        statusError:
          "تعذر تغيير حالة العطب.",
      },

      failures: {
        title: "الأعطاب المبلغ عنها",
        count: "{{count}} عطب",
        empty: "لا توجد أعطاب مبلغ عنها.",
        reportedInfo:
          "تم التبليغ بتاريخ {{date}} من طرف {{user}}",
        startTreatment:
          "برمجة تدخل",
        resolve:
          "تسجيل العطب كمحلول",
      },

      interventions: {
        title: "التدخلات",
        count: "{{count}} تدخل",
        empty: "لا توجد تدخلات مسجلة.",
        number: "التدخل رقم {{id}}",
        technician: "التقني",
        date: "التاريخ",
        completed: "مكتمل",
        planned: "مبرمج",
        createSuccess:
          "تمت برمجة التدخل بنجاح.",

        createError:
          "تعذر برمجة التدخل.",

          complete:
            "إنهاء التدخل",

          completeSuccess:
            "تم إنهاء التدخل بنجاح.",

          completeError:
            "تعذر إنهاء التدخل.",
      },

      delete: {
        title: "حذف نقطة الإنارة",
        message:
          "هل تريد فعلاً حذف « {{name}} »؟ لا يمكن التراجع عن هذه العملية.",
        success:
          "تم حذف نقطة الإنارة بنجاح.",
        error:
          "تعذر حذف نقطة الإنارة.",
      },

      common: {
        cancel: "إلغاء",
      },

      details: {
        loading:
          "جارٍ تحميل نقطة الإنارة...",

        invalidId:
          "معرّف نقطة الإنارة غير صالح.",

        notFound:
          "نقطة الإنارة غير موجودة.",

        back:
          "العودة إلى الإنارة",

        edit:
          "تعديل",

        information:
          "معلومات نقطة الإنارة",

        reference:
          "المرجع",

        zone:
          "المنطقة",

        address:
          "العنوان",

        power:
          "القدرة",

        installationDate:
          "تاريخ التركيب",

        status:
          "الحالة",

        latitude:
          "خط العرض",

        longitude:
          "خط الطول",
      },

      map: {
        title: "خريطة نقاط الإنارة",

        description:
          "عرض مواقع وحالة نقاط الإنارة العمومية على الخريطة.",

        status: "الحالة",

        power: "القدرة",

        details: "عرض التفاصيل",
      },

      interventionModal: {
        title: "برمجة تدخل",
        subtitle:
          "قم بتعيين تقني لمعالجة العطل.",

        failure: "العطل المعني",

        technician: "التقني",
        technicianPlaceholder:
          "اسم التقني",

        date: "تاريخ التدخل",

        description: "وصف التدخل",
        descriptionPlaceholder:
          "صف الأشغال التي سيتم تنفيذها...",

        cancel: "إلغاء",
        submit: "برمجة التدخل",
        saving: "جارٍ البرمجة...",

        errors: {
          technician:
            "يرجى إدخال اسم التقني.",
          date:
            "يرجى اختيار تاريخ التدخل.",
          description:
            "يرجى إدخال وصف التدخل.",
        },
      },

      history: {
        title: "سجل الإنارة العمومية",
        description:
          "اطلع على سجل الأعطال والتدخلات.",
        back: "العودة إلى الإنارة",

        totalFailures: "إجمالي الأعطال",
        totalInterventions: "إجمالي التدخلات",
        resolvedFailures: "الأعطال التي تمت معالجتها",

        search:
          "البحث بالمرجع أو التجهيز أو التقني...",
        allStatuses: "جميع الحالات",

        associatedInterventions:
          "التدخلات المرتبطة",
        noIntervention:
          "لا يوجد تدخل مرتبط بهذا العطل.",

        loading: "جارٍ تحميل السجل...",
        empty: "لم يتم العثور على نتائج.",
        loadError:
          "تعذر تحميل سجل الإنارة.",
      },
    },

    reports: {
      page: {
        title: "التقارير",
        description:
          "إنشاء وتصدير التقارير المتعلقة بالمستخدمين والممتلكات والمخزون والإنارة العمومية.",
      },

      types: {
        USERS: {
          title: "المستخدمون",
          description:
            "عرض المستخدمين وأدوارهم ومعلوماتهم الرئيسية.",
        },

        ASSETS: {
          title: "الممتلكات",
          description:
            "عرض حالة الممتلكات وتخصيصاتها ووضعيتها.",
        },

        STOCK: {
          title: "المخزون",
          description:
            "تحليل المواد وحركات المخزون وطلبات التزويد.",
        },

        LIGHTING: {
          title: "الإنارة العمومية",
          description:
            "تتبع نقاط الإنارة والأعطال والتدخلات.",
        },
      },

      generator: {
        title: "إنشاء تقرير",
        startDate: "تاريخ البداية",
        endDate: "تاريخ النهاية",
        generate: "إنشاء التقرير",
        generating: "جاري إنشاء التقرير...",
      },

      preview: {
        title: "معاينة التقرير",
        period:
          "الفترة: من {{start}} إلى {{end}}",
        search:
          "البحث داخل التقرير...",
        empty:
          "لا توجد بيانات.",
        results:
          "{{count}} نتيجة",
      },

      actions: {
        pdf: "تصدير PDF",
        excel: "تصدير Excel",
      },

      errors: {
        datesRequired:
          "يرجى تحديد تاريخ البداية وتاريخ النهاية.",

        invalidPeriod:
          "يجب أن يكون تاريخ البداية قبل أو مساوياً لتاريخ النهاية.",

        generate:
          "حدث خطأ أثناء إنشاء التقرير.",
      },

      statistics: {
        totalUsers:
          "إجمالي المستخدمين",

        admins:
          "المديرون",

        managers:
          "المسيرون",

        responsables:
          "المسؤولون",

        totalAssets:
          "إجمالي الممتلكات",

        availableAssets:
          "الممتلكات المتاحة",

        inUseAssets:
          "الممتلكات قيد الاستعمال",

        assetsMaintenance:
          "الممتلكات قيد الصيانة",

        totalValue:
          "القيمة الإجمالية",

        articles:
          "المواد",

        totalQuantity:
          "الكمية الإجمالية",

        stockAlerts:
          "تنبيهات المخزون",

        pendingRequests:
          "الطلبات المعلقة",

        totalLights:
          "نقاط الإنارة",

        activeLights:
          "النقاط النشطة",

        damagedLights:
          "النقاط المعطلة",

        maintenanceLights:
          "النقاط قيد الصيانة",

        failures:
          "الأعطال المبلغ عنها",

        interventions:
          "التدخلات",
      },

      sections: {
        users:
          "قائمة المستخدمين",

        assets:
          "وضعية الممتلكات",

        stockState:
          "وضعية المخزون",

        stockMovements:
          "حركات المخزون",

        supplyRequests:
          "طلبات التزويد",

        lights:
          "نقاط الإنارة",

        failures:
          "الأعطال المبلغ عنها",

        interventions:
          "التدخلات",
      },

      columns: {
        name:
          "الاسم الكامل",

        email:
          "البريد الإلكتروني",

        phone:
          "الهاتف",

        cin:
          "رقم البطاقة الوطنية",

        gender:
          "الجنس",

        role:
          "الدور",

        inventory:
          "رقم الجرد",

        designation:
          "التسمية",

        type:
          "النوع",

        assignment:
          "التخصيص",

        acquisitionDate:
          "تاريخ الاقتناء",

        value:
          "القيمة",

        status:
          "الحالة",

        reference:
          "المرجع",

        article:
          "المادة",

        category:
          "الفئة",

        unit:
          "الوحدة",

        quantity:
          "الكمية",

        minimum:
          "الحد الأدنى",

        location:
          "الموقع",

        date:
          "التاريخ",

        movementType:
          "نوع الحركة",

        reason:
          "السبب",

        user:
          "المستخدم",

        requestedQuantity:
          "الكمية المطلوبة",

        requester:
          "صاحب الطلب",

        zone:
          "المنطقة",

        address:
          "العنوان",

        power:
          "القدرة",

        installationDate:
          "تاريخ التركيب",

        light:
          "نقطة الإنارة",

        description:
          "الوصف",

        reportedAt:
          "تاريخ التبليغ",

        reportedBy:
          "تم التبليغ من طرف",

        failure:
          "العطل / نقطة الإنارة",

        technician:
          "التقني",
      },
    },

    notifications: {
      page: {
        title: "الإشعارات",
        description:
          "اطلع على التنبيهات والأنشطة المهمة في المنصة.",
        loading:
          "جارٍ تحميل الإشعارات...",
      },

      stats: {
        total: "المجموع",
        unread: "غير مقروءة",
        read: "مقروءة",
      },

      filters: {
        all: "الكل",
        unread: "غير مقروءة",
        read: "مقروءة",
      },

      badges: {
        new: "جديد",
      },

      modules: {
        USERS: "المستخدمون",
        ASSETS: "الممتلكات",
        STOCK: "المخزون",
        LIGHTING: "الإنارة",
        SYSTEM: "النظام",
      },

      actions: {
        markAllRead:
          "تعليم الكل كمقروء",
        delete: "حذف",
        cancel: "إلغاء",
      },

      empty: {
        title:
          "لا توجد إشعارات",
        description:
          "لا توجد إشعارات مطابقة للفلتر المحدد.",
      },

      delete: {
        title:
          "حذف الإشعار؟",
        message:
          "هل تريد فعلاً حذف « {{name}} »؟",
      },

      success: {
        allRead:
          "تم تعليم جميع الإشعارات كمقروءة.",
        deleted:
          "تم حذف الإشعار بنجاح.",
      },

      errors: {
        load:
          "تعذر تحميل الإشعارات.",
        update:
          "تعذر تعديل الإشعار.",
        markAll:
          "تعذر تعليم الإشعارات كمقروءة.",
        delete:
          "تعذر حذف الإشعار.",
        notFound:
          "الإشعار غير موجود.",
      },
    },

    settings: {
      page: {
        title: "الإعدادات",
        description:
          "قم بضبط الإعدادات العامة للمنصة.",
      },

      commune: {
        title:
          "معلومات الجماعة",
        description:
          "المعلومات العامة المستخدمة داخل المنصة.",
        name:
          "اسم الجماعة",
        city:
          "المدينة",
      },

      language: {
        title:
          "اللغة",
        description:
          "قم باختيار لغة واجهة المنصة.",
        label:
          "اللغة المفضلة",
        help:
          "سيتم تطبيق اللغة المختارة بعد حفظ الإعدادات.",
      },

      notifications: {
        title:
          "الإشعارات",
        description:
          "قم بضبط الإعدادات المتعلقة بالإشعارات.",
        enable:
          "تفعيل الإشعارات",
        enableDescription:
          "تلقي التنبيهات المتعلقة بالمخزون والممتلكات والإنارة العمومية.",
      },

      actions: {
        save:
          "حفظ الإعدادات",
        saving:
          "جارٍ الحفظ...",
      },

      success: {
        saved:
          "تم حفظ الإعدادات بنجاح.",
      },

      errors: {
        required:
          "معلومات الجماعة إلزامية.",
        save:
          "تعذر حفظ الإعدادات.",
      },
    },

    profile: {
      page: {
        title: "الملف الشخصي",
        description: "اطلع على معلوماتك الشخصية وقم بإدارة حسابك.",
        loading: "جارٍ تحميل الملف الشخصي...",
      },

      card: {
        role: "الدور",
        permissions: "الصلاحيات",
        permissionCount: "صلاحية",
      },

      information: {
        title: "المعلومات الشخصية",
        description: "قم بتحديث المعلومات التي يسمح لك بتعديلها فقط.",
      },

      account: {
        title: "معلومات الحساب",
        description: "تتم إدارة هذه المعلومات من طرف المسؤول ولا يمكن تعديلها من الملف الشخصي.",
      },

      password: {
        title: "تغيير كلمة المرور",
        description: "اختر كلمة مرور جديدة وآمنة.",
        minimum: "8 أحرف على الأقل.",
      },

      fields: {
        firstNameFr: "الاسم بالفرنسية",
        lastNameFr: "النسب بالفرنسية",
        firstNameAr: "الاسم بالعربية",
        lastNameAr: "النسب بالعربية",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        cin: "رقم البطاقة الوطنية",
        gender: "الجنس",
        currentPassword: "كلمة المرور الحالية",
        newPassword: "كلمة المرور الجديدة",
        confirmPassword: "تأكيد كلمة المرور الجديدة",
      },

      actions: {
        save: "حفظ التعديلات",
        saving: "جارٍ الحفظ...",
        changePassword: "تغيير كلمة المرور",
        changing: "جارٍ التغيير...",
      },

      success: {
        updated: "تم تحديث الملف الشخصي بنجاح.",
        passwordChanged: "تم تغيير كلمة المرور بنجاح.",
      },

      errors: {
        required: "جميع المعلومات القابلة للتعديل إلزامية.",
        invalidEmail: "صيغة البريد الإلكتروني غير صحيحة.",
        update: "تعذر تحديث الملف الشخصي.",
        passwordLength: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
        passwordMismatch: "تأكيد كلمة المرور غير مطابق.",
        samePassword: "يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور الحالية.",
        passwordChange: "تعذر تغيير كلمة المرور.",
        load: "تعذر تحميل الملف الشخصي للمستخدم.",
      },
    },

    errors: {
      unauthorized: {
        code: "خطأ 403",
        title:
          "غير مسموح بالوصول",
        description:
          "لا يتوفر حسابك على الصلاحيات اللازمة للوصول إلى هذا المورد.",
      },

      notFound: {
        code: "خطأ 404",
        title:
          "الصفحة غير موجودة",
        description:
          "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      },

      actions: {
        dashboard:
          "العودة إلى لوحة القيادة",
      },
    },

    footer: {
  rights:
    "جميع الحقوق محفوظة.",
  developedBy:
    "تصميم وتطوير",
  developer1:
    "فاطمة الزهراء السرغيني",
  and: "و",
  developer2:
    "أسماء العنوني",
},
};

export default ar;