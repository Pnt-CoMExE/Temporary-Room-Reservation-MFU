/** Shared SweetAlert2 look — MFU brand, consistent across user + admin */

export const swalPopupClass =
  "rounded-[2rem] p-8 max-w-sm border border-gray-100 shadow-2xl";

export const swalConfirmBtnClass =
  "bg-gradient-to-r from-mfu-red to-mfu-red-dark text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer";

export const swalCancelBtnClass =
  "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer";

/** Promo / discount actions — gold accent (not primary red) */
export const swalGoldConfirmBtnClass =
  "bg-mfu-gold text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-amber-200/40 hover:bg-yellow-600 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer";

export const swalBrandColor = "#ba0b2f";
export const swalGoldColor = "#d4af37";

export const swalDefaultCustomClass = {
  popup: swalPopupClass,
  actions: "flex flex-row gap-3 mt-8 w-full justify-center",
  confirmButton: swalConfirmBtnClass,
  cancelButton: swalCancelBtnClass,
} as const;

export const swalGoldCustomClass = {
  ...swalDefaultCustomClass,
  confirmButton: swalGoldConfirmBtnClass,
} as const;

type SwalOpts = Record<string, unknown> & {
  customClass?: Record<string, string>;
};

/** Merge shared MFU Swal styling; pass gold:true for promo dialogs */
export function withSwalTheme(
  opts: SwalOpts = {},
  variant: "red" | "gold" = "red"
): SwalOpts {
  const base =
    variant === "gold" ? swalGoldCustomClass : swalDefaultCustomClass;
  return {
    buttonsStyling: false,
    confirmButtonColor: variant === "gold" ? swalGoldColor : swalBrandColor,
    ...opts,
    customClass: {
      ...base,
      ...(opts.customClass || {}),
    },
  };
}
