/** Shared SweetAlert2 look — MFU brand, consistent across user + admin */

export const swalPopupClass =
  "rounded-[2rem] p-8 max-w-sm border border-gray-100 shadow-2xl";

export const swalConfirmBtnClass =
  "bg-gradient-to-r from-mfu-red to-mfu-red-dark text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer";

export const swalCancelBtnClass =
  "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer";

export const swalBrandColor = "#ba0b2f";

export const swalDefaultCustomClass = {
  popup: swalPopupClass,
  actions: "flex flex-row gap-3 mt-8 w-full justify-center",
  confirmButton: swalConfirmBtnClass,
  cancelButton: swalCancelBtnClass,
} as const;
