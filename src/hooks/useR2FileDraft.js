import { useRef } from "react";
import { discardR2File } from "../services/r2Upload";

/**
 * Evita archivos huérfanos en R2 en un formulario que sube el archivo apenas
 * se elige (antes de guardar). Recuerda:
 *  - savedUrl: el archivo que la descarga tiene guardado en la base.
 *  - uploadedUrl: lo subido en este formulario y todavía no guardado.
 * y borra de R2 lo que queda sin usar al reemplazar, guardar o cancelar.
 */
export default function useR2FileDraft() {
  const savedUrl = useRef("");
  const uploadedUrl = useRef("");

  const discardUnsavedUpload = () => {
    if (uploadedUrl.current && uploadedUrl.current !== savedUrl.current) {
      discardR2File(uploadedUrl.current);
    }
  };

  return {
    // Al abrir el formulario: vacío para crear, o con la URL guardada para editar.
    start(url = "") {
      savedUrl.current = url;
      uploadedUrl.current = "";
    },
    // Se subió un archivo nuevo: el anterior sin guardar ya no sirve.
    replaceUpload(url) {
      discardUnsavedUpload();
      uploadedUrl.current = url;
    },
    // Se guardó con `finalUrl`: todo lo demás (el guardado viejo o lo subido y
    // luego reemplazado por un link externo) se borra.
    commit(finalUrl) {
      [savedUrl.current, uploadedUrl.current]
        .filter((url) => url && url !== finalUrl)
        .forEach(discardR2File);
      savedUrl.current = "";
      uploadedUrl.current = "";
    },
    // Se canceló: se borra lo subido que nunca se guardó.
    cancel() {
      discardUnsavedUpload();
      savedUrl.current = "";
      uploadedUrl.current = "";
    },
  };
}
