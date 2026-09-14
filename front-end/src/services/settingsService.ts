export type AppSettings = {
  communeName: string;
  communeCity: string;
  language: "FR" | "AR";
};

export const SETTINGS_STORAGE_KEY =
  "sgpbse-settings";

export const SETTINGS_CHANGED_EVENT =
  "sgpbse:settings-changed";

export const DEFAULT_SETTINGS: AppSettings = {
  communeName:
    "Commune d’Agadir",

  communeCity:
    "Agadir",

  language:
    "FR",
};

export const settingsService = {
  get(): AppSettings {
    const storedSettings =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY,
      );

    if (!storedSettings) {
      return {
        ...DEFAULT_SETTINGS,
      };
    }

    try {
      const parsed =
        JSON.parse(
          storedSettings,
        ) as Partial<AppSettings>;

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      localStorage.removeItem(
        SETTINGS_STORAGE_KEY,
      );

      return {
        ...DEFAULT_SETTINGS,
      };
    }
  },

  save(
    settings: AppSettings,
  ): void {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(
        settings,
      ),
    );

    window.dispatchEvent(
      new CustomEvent(
        SETTINGS_CHANGED_EVENT,
      ),
    );
  },
};